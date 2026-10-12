'use client';

import React, { useState } from 'react';
import { useSideQuestStore } from '@/lib/store';
import { Clock, MapPin, Users, Zap, Share2, Sparkles, Navigation, ArrowUpDown } from 'lucide-react';
import { calculateDistanceInMeters, formatDistance } from '@/lib/geo';
import { playRadarBlip } from '@/lib/audio';

export default function QuestsFeed() {
  const { 
    drops, 
    selectedCity, 
    selectedCategory, 
    isGirlsOnlyFilter, 
    setActiveDropId, 
    openShareModal, 
    setCreateSheetOpen,
    userLocation,
    setInspectedMember
  } = useSideQuestStore();

  const [sortBy, setSortBy] = useState<'soon' | 'distance'>('soon');

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
        formattedDistance: formatDistance(dist)
      };
    });

  // Sort drops
  const sortedDrops = [...dropsWithDistance].sort((a, b) => {
    if (sortBy === 'distance') {
      return a.distanceMeters - b.distanceMeters;
    }
    return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
  });

  return (
    <div className="w-full max-w-lg mx-auto p-4 sm:p-5 space-y-3 pb-24 animate-fade-in">
      
      {/* Feed Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#F4F4F6] font-mono">
            ACTIVE FLARES // {selectedCity.name.toUpperCase()}
          </h2>
          <p className="text-xs font-mono text-[#8E8E9F]">
            {sortedDrops.length} Spontaneous Lobbies Active (90m Window)
          </p>
        </div>

        <button
          onClick={() => setCreateSheetOpen(true)}
          className="px-3 py-1.5 rounded-lg bg-[#CCFF00] text-[#0A0A0C] font-mono font-bold text-xs hover:bg-[#b8e600] transition-colors flex items-center gap-1 shadow-[0_0_12px_rgba(204,255,0,0.3)]"
        >
          <Zap className="w-3.5 h-3.5 fill-current" /> + Drop Flare
        </button>
      </div>

      {/* Sorting & Proximity Telemetry Controls */}
      <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#141418] border border-[#24242B] text-xs font-mono">
        <div className="flex items-center gap-1.5 text-[#8E8E9F]">
          <Navigation className={`w-3.5 h-3.5 ${userLocation ? 'text-[#00F0FF]' : 'text-[#8E8E9F]'}`} />
          <span className="text-[11px]">
            {userLocation ? '📍 GPS Proximity: Live' : `Radar: ${selectedCity.name} Hotspots`}
          </span>
        </div>

        <div className="flex items-center gap-1 bg-[#0E0E12] p-0.5 rounded-lg border border-[#24242B]">
          <button
            onClick={() => setSortBy('soon')}
            className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
              sortBy === 'soon' ? 'bg-[#CCFF00] text-[#0A0A0C]' : 'text-[#8E8E9F] hover:text-[#F4F4F6]'
            }`}
          >
            🕒 Expiring
          </button>
          <button
            onClick={() => setSortBy('distance')}
            className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
              sortBy === 'distance' ? 'bg-[#00F0FF] text-[#0A0A0C]' : 'text-[#8E8E9F] hover:text-[#F4F4F6]'
            }`}
          >
            ⚡ Nearest
          </button>
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-3 pt-1">
        {sortedDrops.map(drop => {
          const isUrgent = (new Date(drop.expiresAt).getTime() - Date.now()) < 20 * 60 * 1000;
          
          return (
            <div
              key={drop.id}
              onClick={() => setActiveDropId(drop.id)}
              className="p-4 rounded-xl bg-[#141418] border border-[#24242B] hover:border-[#CCFF00] transition-all cursor-pointer group space-y-3"
            >
              {/* Card Top Row */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">
                    {drop.category === 'CHAI_FOOD' ? '🧋' : drop.category === 'SPORTS' ? '🏸' : drop.category === 'COWORK_DEV' ? '💻' : '🎭'}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#F4F4F6] group-hover:text-[#CCFF00] transition-colors">
                      {drop.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <p className="text-xs font-mono text-[#8E8E9F] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#CCFF00]" /> {drop.venueName}
                      </p>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 font-bold whitespace-nowrap">
                        ⚡ {drop.formattedDistance}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end flex-shrink-0">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    isUrgent ? 'bg-[#FF0055]/20 text-[#FF0055] border border-[#FF0055]/40 animate-pulse' : 'bg-[#1B1B22] text-[#CCFF00]'
                  }`}>
                    <Clock className="w-2.5 h-2.5 inline mr-1" />
                    {isUrgent ? 'URGENT' : 'OPEN'}
                  </span>
                  <span className="text-[10px] font-mono text-[#8E8E9F] mt-1">
                    {drop.currentSlots}/{drop.maxSlots} Joined
                  </span>
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
                  className="flex items-center gap-1.5 group/host cursor-pointer"
                  title="Inspect host taste profile"
                >
                  <img 
                    src={drop.host.avatarUrl} 
                    alt={drop.host.handle}
                    className="w-5 h-5 rounded-full object-cover border border-[#CCFF00] group-hover/host:ring-1 group-hover/host:ring-[#00F0FF]"
                  />
                  <span className="text-[11px] font-mono text-[#8E8E9F] group-hover/host:text-[#00F0FF] transition-colors">
                    by @{drop.host.handle}
                  </span>
                  {drop.isGirlsOnly && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#FF007A]/20 text-[#FF007A]">
                      🌸 Girls Only
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openShareModal(drop);
                    }}
                    className="p-1 rounded text-[#8E8E9F] hover:text-[#CCFF00] transition-colors"
                    title="Share"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-mono text-[#CCFF00] font-bold group-hover:underline">
                    Inspect Lobby →
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {sortedDrops.length === 0 && (
          <div className="p-8 text-center rounded-xl bg-[#141418] border border-[#24242B] space-y-2">
            <span className="text-2xl">⚡</span>
            <p className="text-sm font-mono text-[#F4F4F6]">No active flares in this zone right now.</p>
            <p className="text-xs font-mono text-[#8E8E9F]">Be the first to drop a plan for chai, sports, or coworking!</p>
            <button
              onClick={() => setCreateSheetOpen(true)}
              className="mt-3 px-4 py-2 rounded-xl bg-[#CCFF00] text-[#0A0A0C] font-mono font-bold text-xs"
            >
              + Drop a Flare Now
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
