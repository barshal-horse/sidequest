'use client';

import React, { useState } from 'react';
import { useSideQuestStore } from '@/lib/store';
import { Radio, Sparkles, Navigation, X, User, Zap, MessageSquare, Flame } from 'lucide-react';
import { playSonarPing, playRadarBlip, playCheckInChime } from '@/lib/audio';
import { DEMO_PROFILES } from '@/lib/constants';

interface SonarRadarSweepProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SonarRadarSweep({ isOpen, onClose }: SonarRadarSweepProps) {
  const { 
    selectedCity, 
    registeredProfiles, 
    setInspectedMember, 
    currentUser, 
    setCreateSheetOpen 
  } = useSideQuestStore();

  const [isSweeping, setIsSweeping] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [wavedUsers, setWavedUsers] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  // Profiles in current city
  const cityProfiles = registeredProfiles.filter(p => 
    p.city?.toLowerCase() === selectedCity.name.toLowerCase() && p.id !== currentUser.id
  );
  const displayProfiles = cityProfiles.length > 0 ? cityProfiles : DEMO_PROFILES.slice(0, 4);

  const handleSweep = () => {
    setIsSweeping(true);
    playSonarPing();

    setTimeout(() => {
      setIsSweeping(false);
      setHasScanned(true);
      playCheckInChime();
    }, 1200);
  };

  const handleWave = (handle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playRadarBlip();
    setWavedUsers(prev => ({ ...prev, [handle]: true }));
  };

  // Blip relative positions for radial radar
  const blipOffsets = [
    { top: '28%', left: '34%', dist: '350m' },
    { top: '65%', left: '72%', dist: '750m' },
    { top: '32%', left: '78%', dist: '1.2km' },
    { top: '75%', left: '26%', dist: '1.6km' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-md rounded-3xl bg-[#0E0E12] border border-[#24242B] shadow-2xl p-4 sm:p-5 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#24242B]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex items-center justify-center text-[#CCFF00]">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#F4F4F6] uppercase tracking-wider flex items-center gap-1.5">
                <span>SONAR RADAR SWEEP</span>
                <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-ping" />
              </h3>
              <p className="text-[10px] text-[#8E8E9F]">
                {selectedCity.name.toUpperCase()} // 2.0KM REAL-TIME ACOUSTIC SONAR
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-[#8E8E9F] hover:text-[#F4F4F6] hover:bg-[#1B1B22] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Circular Radar HUD Display */}
        <div className="relative w-full aspect-square max-w-[280px] mx-auto rounded-full bg-[#08080B] border-2 border-[#24242B] shadow-inner flex items-center justify-center overflow-hidden">
          
          {/* Subtle Grid Crosshairs */}
          <div className="absolute inset-x-0 top-1/2 h-px bg-[#00F0FF]/20 pointer-events-none" />
          <div className="absolute inset-y-0 left-1/2 w-px bg-[#00F0FF]/20 pointer-events-none" />

          {/* Range Rings */}
          <div className="absolute w-[80%] h-[80%] rounded-full border border-dashed border-[#CCFF00]/25 pointer-events-none" />
          <div className="absolute w-[52%] h-[52%] rounded-full border border-[#00F0FF]/30 pointer-events-none" />
          <div className="absolute w-[24%] h-[24%] rounded-full border border-[#CCFF00]/40 pointer-events-none" />

          {/* Range Labels */}
          <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[8px] text-[#8E8E9F]">2.0km</span>
          <span className="absolute top-[24%] left-1/2 -translate-x-1/2 text-[8px] text-[#00F0FF]">1.0km</span>
          <span className="absolute top-[38%] left-1/2 -translate-x-1/2 text-[8px] text-[#CCFF00]">500m</span>

          {/* Rotating Sonar Beam */}
          <div 
            className={`absolute inset-0 rounded-full pointer-events-none ${
              isSweeping ? 'animate-spin duration-700' : 'animate-[spin_4s_linear_infinite]'
            }`}
            style={{
              background: 'conic-gradient(from 0deg, transparent 0deg, transparent 310deg, rgba(204,255,0,0.1) 330deg, rgba(204,255,0,0.4) 360deg)'
            }}
          />

          {/* Center User Beacon */}
          <div className="relative z-10 w-4 h-4 rounded-full bg-[#00F0FF] border-2 border-white shadow-[0_0_12px_#00F0FF] flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0A0A0C]" />
          </div>

          {/* Nearby Explorer Blips on Radar */}
          {displayProfiles.slice(0, 4).map((p, idx) => {
            const pos = blipOffsets[idx] || { top: '50%', left: '50%', dist: '1km' };
            const isWaved = wavedUsers[p.handle];

            return (
              <div 
                key={p.id}
                onClick={() => setInspectedMember(p)}
                style={{ top: pos.top, left: pos.left }}
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                title={`@${p.handle} • ${pos.dist} away`}
              >
                <div className={`relative w-4 h-4 rounded-full flex items-center justify-center transition-transform group-hover:scale-125 ${
                  isWaved ? 'bg-[#FF007A] shadow-[0_0_12px_#FF007A]' : 'bg-[#CCFF00] shadow-[0_0_10px_#CCFF00]'
                }`}>
                  <span className="w-1 h-1 rounded-full bg-black" />
                  <span className="absolute inset-0 rounded-full animate-ping opacity-75 bg-[#CCFF00]" />
                </div>
                
                {/* Micro tooltip pill on hover */}
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 border border-[#CCFF00] text-[8px] text-[#CCFF00] px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none z-30">
                  @{p.handle} ({pos.dist})
                </div>
              </div>
            );
          })}

        </div>

        {/* Sweep Trigger Button */}
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={handleSweep}
            disabled={isSweeping}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#CCFF00] to-[#00F0FF] text-[#0A0A0C] font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(204,255,0,0.3)] transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
          >
            <Radio className={`w-4 h-4 ${isSweeping ? 'animate-spin' : ''}`} />
            <span>{isSweeping ? 'EMITTING ACOUSTIC SONAR...' : 'EMIT SONAR RADAR PING (2KM)'}</span>
          </button>
        </div>

        {/* Lock Telemetry Readout */}
        <div className="p-3 rounded-2xl bg-[#141418] border border-[#24242B] space-y-2.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#CCFF00] font-bold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{displayProfiles.length} EXPLORERS IN SONAR RANGE</span>
            </span>
            <span className="text-[10px] text-[#8E8E9F]">
              {selectedCity.name}
            </span>
          </div>

          {/* Explorer List */}
          <div className="space-y-1.5 max-h-40 overflow-y-auto no-scrollbar">
            {displayProfiles.slice(0, 3).map((p, idx) => {
              const pos = blipOffsets[idx] || { dist: '500m' };
              const isWaved = wavedUsers[p.handle];

              return (
                <div
                  key={p.id}
                  onClick={() => setInspectedMember(p)}
                  className="p-2 rounded-xl bg-[#0E0E12] border border-[#24242B] hover:border-[#CCFF00] cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={p.avatarUrl}
                      alt={p.handle}
                      className="w-6 h-6 rounded-full object-cover border border-[#24242B]"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#F4F4F6] truncate">
                          @{p.handle}
                        </span>
                        <span className="text-[9px] text-[#00F0FF]">
                          • {pos.dist}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#8E8E9F] truncate">
                        {p.liveStatus || '🟢 Down for spontaneous sidequest'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleWave(p.handle, e)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all shrink-0 ml-2 ${
                      isWaved 
                        ? 'bg-[#FF007A]/20 border border-[#FF007A] text-[#FF007A]' 
                        : 'bg-[#1B1B22] hover:bg-[#282835] border border-[#2E2E38] text-[#CCFF00]'
                    }`}
                  >
                    {isWaved ? '👋 Waved' : '👋 Ping'}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="pt-1 flex items-center justify-between text-[10px] text-[#8E8E9F] border-t border-[#24242B]">
            <span>Tap any explorer to view bento lore</span>
            <button
              type="button"
              onClick={() => {
                onClose();
                setCreateSheetOpen(true);
              }}
              className="text-[#CCFF00] font-bold hover:underline flex items-center gap-1"
            >
              <Flame className="w-3 h-3 fill-current" /> Drop Flare for Squad
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
