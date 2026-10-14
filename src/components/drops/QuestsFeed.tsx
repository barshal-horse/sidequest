'use client';

import React, { useState } from 'react';
import { useSideQuestStore } from '@/lib/store';
import { 
  Clock, MapPin, Users, Zap, Share2, Sparkles, Navigation, 
  Compass, Radio, MoreVertical, Pencil, Trash2, Flag, Coffee, 
  Dumbbell, Laptop, Ticket, CheckCircle2, Shield
} from 'lucide-react';
import { calculateDistanceInMeters, formatDistance, getGoogleMapsUrl, formatWalkingTime } from '@/lib/geo';
import { playRadarBlip } from '@/lib/audio';
import SideQuestRoulette from './SideQuestRoulette';
import SonarRadarSweep from '../radar/SonarRadarSweep';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/DropdownMenu';
import { DropCategory } from '@/types';

export default function QuestsFeed() {
  const { 
    drops, 
    selectedCity, 
    selectedCategory, 
    setSelectedCategory,
    isGirlsOnlyFilter, 
    setActiveDropId, 
    openShareModal, 
    setCreateSheetOpen,
    userLocation,
    setInspectedMember,
    setLocationModalOpen,
    currentUser,
    setEditingDrop,
    setDeletingDropId,
    reportDrop
  } = useSideQuestStore();

  const [sortBy, setSortBy] = useState<'soon' | 'distance'>('soon');
  const [isSonarOpen, setIsSonarOpen] = useState(false);
  const [reportedToast, setReportedToast] = useState<string | null>(null);

  const getCategoryIcon = (category: DropCategory) => {
    switch (category) {
      case 'CHAI_FOOD':
        return <Coffee className="w-4 h-4 text-[#CCFF00]" />;
      case 'SPORTS':
        return <Dumbbell className="w-4 h-4 text-[#00F0FF]" />;
      case 'COWORK_DEV':
        return <Laptop className="w-4 h-4 text-[#00F0FF]" />;
      case 'GIGS_CULTURE':
        return <Ticket className="w-4 h-4 text-[#FF007A]" />;
      default:
        return <Zap className="w-4 h-4 text-[#CCFF00]" />;
    }
  };

  // Compute distance for each drop
  const dropsWithDistance = drops
    .filter(drop => {
      if (drop.cityId !== selectedCity.id) return false;
      if (selectedCategory !== 'ALL' && drop.category !== selectedCategory) return false;
      if (isGirlsOnlyFilter && !drop.isGirlsOnly) return false;
      return true;
    })
    .map(drop => {
      const originLat = userLocation ? userLocation.lat : selectedCity.center[1];
      const originLng = userLocation ? userLocation.lng : selectedCity.center[0];
      const dist = calculateDistanceInMeters(originLat, originLng, drop.lat, drop.lng);
      return {
        ...drop,
        distanceMeters: dist,
        formattedDistance: formatDistance(dist),
        walkingTime: formatWalkingTime(dist)
      };
    });

  // Sort drops
  const sortedDrops = [...dropsWithDistance].sort((a, b) => {
    if (sortBy === 'distance') {
      return a.distanceMeters - b.distanceMeters;
    }
    return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
  });

  const handleReport = (dropId: string, title: string) => {
    reportDrop(dropId);
    setReportedToast(`Report submitted for "${title}". Thanks for keeping SideQuest safe.`);
    setTimeout(() => setReportedToast(null), 4000);
  };

  return (
    <div className="w-full max-w-lg mx-auto p-4 sm:p-5 space-y-3.5 pb-24 animate-fade-in font-mono">
      
      {/* Toast Notification */}
      {reportedToast && (
        <div className="p-3 rounded-xl bg-[#141418] border border-[#00F0FF]/40 text-[#00F0FF] text-xs flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{reportedToast}</span>
        </div>
      )}

      {/* Feed Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-[#F4F4F6] uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-ping" />
            FLARES // {selectedCity.name.toUpperCase()}
          </h2>
          <p className="text-[11px] text-[#8E8E9F] mt-0.5">
            {sortedDrops.length} Active Squad Lobbies (60–90m Window)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playRadarBlip();
              setIsSonarOpen(true);
            }}
            className="h-9 px-3 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF] font-bold text-xs hover:bg-[#00F0FF]/25 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            title="Scan 2.0km acoustic radar for nearby active explorers"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Sonar</span>
          </button>

          <button
            onClick={() => setCreateSheetOpen(true)}
            className="h-9 px-3.5 rounded-xl bg-[#CCFF00] text-[#0A0A0C] font-bold text-xs hover:bg-[#b8e600] transition-colors flex items-center gap-1.5 shadow-[0_0_12px_rgba(204,255,0,0.3)] active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>+ Drop Flare</span>
          </button>
        </div>
      </div>

      {/* Spontaneous SideQuest Micro-Quest Roulette */}
      <SideQuestRoulette />

      {/* Sorting & Proximity Telemetry Controls */}
      <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#141418] border border-[#24242B] text-xs">
        <button
          onClick={() => setLocationModalOpen(true)}
          className="flex items-center gap-1.5 text-left group transition-colors min-h-[36px]"
          title="Click to set your exact location or request live GPS"
        >
          <Navigation className={`w-3.5 h-3.5 ${userLocation ? 'text-[#00F0FF]' : 'text-[#CCFF00] animate-bounce'}`} />
          <span className="text-[11px] text-[#F4F4F6] group-hover:text-[#00F0FF] underline-offset-2 hover:underline">
            {userLocation 
              ? `${userLocation.addressName || 'GPS Active'} (${userLocation.isLiveGps ? 'Live' : 'Pin'})` 
              : 'Set Location / Live GPS →'}
          </span>
        </button>

        <div className="flex items-center gap-1 bg-[#0E0E12] p-1 rounded-lg border border-[#24242B]">
          <button
            onClick={() => setSortBy('soon')}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all min-h-[28px] ${
              sortBy === 'soon' ? 'bg-[#CCFF00] text-[#0A0A0C]' : 'text-[#8E8E9F] hover:text-[#F4F4F6]'
            }`}
          >
            Expiring
          </button>
          <button
            onClick={() => setSortBy('distance')}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all min-h-[28px] ${
              sortBy === 'distance' ? 'bg-[#00F0FF] text-[#0A0A0C]' : 'text-[#8E8E9F] hover:text-[#F4F4F6]'
            }`}
          >
            Nearest
          </button>
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-3 pt-1">
        {sortedDrops.map(drop => {
          const isUrgent = (new Date(drop.expiresAt).getTime() - Date.now()) < 20 * 60 * 1000;
          const mapsUrl = getGoogleMapsUrl(drop.lat, drop.lng, `${drop.venueName}, ${drop.hotspotName}`);
          const isHost = drop.host.id === currentUser.id || drop.host.handle === currentUser.handle;
          
          return (
            <div
              key={drop.id}
              onClick={() => setActiveDropId(drop.id)}
              className="p-4 rounded-xl bg-[#141418] border border-[#24242B] hover:border-[#CCFF00]/60 transition-all cursor-pointer group space-y-3 shadow-md focus-within:ring-2 focus-within:ring-[#CCFF00]/50"
            >
              {/* Card Top Row */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#0E0E12] border border-[#24242B] flex items-center justify-center flex-shrink-0 mt-0.5">
                    {getCategoryIcon(drop.category)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#F4F4F6] group-hover:text-[#CCFF00] transition-colors leading-snug">
                      {drop.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <p className="text-xs text-[#8E8E9F] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#CCFF00]" /> {drop.venueName}
                      </p>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 font-bold whitespace-nowrap">
                        {drop.formattedDistance} ({drop.walkingTime})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <div className="flex flex-col items-end">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      isUrgent ? 'bg-[#FF0055]/20 text-[#FF0055] border border-[#FF0055]/40 animate-pulse' : 'bg-[#1B1B22] text-[#CCFF00]'
                    }`}>
                      <Clock className="w-2.5 h-2.5 inline mr-1" />
                      {isUrgent ? 'URGENT' : 'OPEN'}
                    </span>
                    <span className="text-[10px] text-[#8E8E9F] mt-1 font-bold">
                      {drop.currentSlots}/{drop.maxSlots} Joined
                    </span>
                  </div>

                  {/* Contextual Action Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="w-8 h-8 rounded-lg border border-transparent hover:border-[#24242B] hover:bg-[#1B1B22] text-[#8E8E9F] hover:text-[#F4F4F6] flex items-center justify-center transition-colors focus:outline-none focus:ring-1 focus:ring-[#CCFF00]"
                        title="Flare Options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      {isHost ? (
                        <>
                          <DropdownMenuItem onClick={() => setEditingDrop(drop)}>
                            <Pencil className="w-3.5 h-3.5 text-[#00F0FF]" />
                            <span>Edit Flare</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="danger"
                            onClick={() => setDeletingDropId(drop.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Extinguish / Delete</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openShareModal(drop)}>
                            <Share2 className="w-3.5 h-3.5 text-[#CCFF00]" />
                            <span>Share Signal</span>
                          </DropdownMenuItem>
                        </>
                      ) : (
                        <>
                          <DropdownMenuItem onClick={() => openShareModal(drop)}>
                            <Share2 className="w-3.5 h-3.5 text-[#CCFF00]" />
                            <span>Share Signal</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="danger"
                            onClick={() => handleReport(drop.id, drop.title)}
                          >
                            <Flag className="w-3.5 h-3.5" />
                            <span>Report Flare</span>
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Tags & Squad Preview */}
              <div className="flex items-center justify-between pt-2 border-t border-[#24242B]/80 text-xs">
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    playRadarBlip();
                    setInspectedMember(drop.host);
                  }}
                  className="flex items-center gap-1.5 group/host cursor-pointer min-h-[32px]"
                  title="Inspect host taste profile"
                >
                  <img 
                    src={drop.host.avatarUrl} 
                    alt={drop.host.handle}
                    className="w-5 h-5 rounded-full object-cover border border-[#CCFF00] group-hover/host:ring-1 group-hover/host:ring-[#00F0FF]"
                  />
                  <span className="text-[11px] text-[#8E8E9F] group-hover/host:text-[#00F0FF] transition-colors">
                    @{drop.host.handle} {isHost && <span className="text-[#CCFF00] font-bold">(You)</span>}
                  </span>
                  {drop.isGirlsOnly && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FF007A]/20 text-[#FF007A] border border-[#FF007A]/30 flex items-center gap-1">
                      <Shield className="w-2.5 h-2.5" /> Girls Only
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="px-2.5 py-1 rounded-lg bg-[#1B1B22] hover:bg-[#24242B] border border-[#24242B] hover:border-[#00F0FF] text-[11px] text-[#00F0FF] flex items-center gap-1 transition-all"
                    title="Open Google Maps for walking directions"
                  >
                    <Compass className="w-3 h-3" />
                    <span>Maps</span>
                  </a>

                  <span className="text-xs text-[#CCFF00] font-bold group-hover:underline">
                    Inspect Lobby →
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Actionable Empty State */}
        {sortedDrops.length === 0 && (
          <div className="p-8 text-center rounded-2xl bg-[#141418] border border-[#24242B] space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#0E0E12] border border-[#24242B] flex items-center justify-center text-[#CCFF00]">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#F4F4F6]">No active flares in this radar zone</h4>
              <p className="text-xs text-[#8E8E9F] mt-1 max-w-xs mx-auto">
                No spontaneous meetups currently match your filters in {selectedCity.name}. Be the one to ignite the first squad!
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
              {selectedCategory !== 'ALL' && (
                <button
                  onClick={() => setSelectedCategory('ALL')}
                  className="px-3 py-1.5 rounded-xl border border-[#24242B] bg-[#0E0E12] text-xs text-[#8E8E9F] hover:text-white transition-colors"
                >
                  Reset Category Filter
                </button>
              )}
              <button
                onClick={() => setCreateSheetOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#CCFF00] text-[#0A0A0C] font-bold text-xs hover:bg-[#b8e600] transition-colors shadow-[0_0_12px_rgba(204,255,0,0.3)]"
              >
                + Drop a Flare Now
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sonar Radar Acoustic Sweep HUD Modal */}
      <SonarRadarSweep isOpen={isSonarOpen} onClose={() => setIsSonarOpen(false)} />

    </div>
  );
}
