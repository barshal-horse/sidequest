'use client';

import React from 'react';
import { useSideQuestStore } from '@/lib/store';
import { Clock, MapPin, Users, Zap, Share2, Sparkles } from 'lucide-react';

export default function QuestsFeed() {
  const { 
    drops, 
    selectedCity, 
    selectedCategory, 
    isGirlsOnlyFilter, 
    setActiveDropId, 
    openShareModal, 
    setCreateSheetOpen 
  } = useSideQuestStore();

  const filteredDrops = drops.filter(drop => {
    if (drop.cityId !== selectedCity.id) return false;
    if (selectedCategory !== 'ALL' && drop.category !== selectedCategory) return false;
    if (isGirlsOnlyFilter && !drop.isGirlsOnly) return false;
    return true;
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
            {filteredDrops.length} Spontaneous Lobbies Active (90m Window)
          </p>
        </div>

        <button
          onClick={() => setCreateSheetOpen(true)}
          className="px-3 py-1.5 rounded-lg bg-[#CCFF00] text-[#0A0A0C] font-mono font-bold text-xs hover:bg-[#b8e600] transition-colors flex items-center gap-1 shadow-[0_0_12px_rgba(204,255,0,0.3)]"
        >
          <Zap className="w-3.5 h-3.5 fill-current" /> + Drop Flare
        </button>
      </div>

      {/* Cards List */}
      <div className="space-y-3 pt-1">
        {filteredDrops.map(drop => {
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
                    <p className="text-xs font-mono text-[#8E8E9F] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#CCFF00]" /> {drop.venueName}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end">
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
                <div className="flex items-center gap-1.5">
                  <img 
                    src={drop.host.avatarUrl} 
                    alt={drop.host.handle}
                    className="w-5 h-5 rounded-full object-cover border border-[#CCFF00]"
                  />
                  <span className="text-[11px] font-mono text-[#8E8E9F]">
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

        {filteredDrops.length === 0 && (
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
