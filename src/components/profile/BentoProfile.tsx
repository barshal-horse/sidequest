'use client';

import React, { useState } from 'react';
import { useSideQuestStore } from '@/lib/store';
import { 
  ShieldCheck, Sparkles, Music, Flame, Zap, Award, 
  Share2, Check, ExternalLink, Dices, UserPlus, Users 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DEMO_PROFILES, generateRandomPersona } from '@/lib/constants';
import { playRadarBlip, playCheckInChime } from '@/lib/audio';

export default function BentoProfile() {
  const { 
    currentUser, 
    setCreateSheetOpen, 
    setAuthModalOpen, 
    switchProfile,
    resetToNewIndividual,
    selectedCity
  } = useSideQuestStore();
  const [copied, setCopied] = useState(false);

  const handleShareStory = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      colors: ['#CCFF00', '#00F0FF']
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRandomize = () => {
    playCheckInChime();
    confetti({
      particleCount: 60,
      spread: 70,
      colors: ['#CCFF00', '#00F0FF', '#FF0055']
    });
    resetToNewIndividual();
  };

  const handleSwitch = (profile: typeof DEMO_PROFILES[0]) => {
    playRadarBlip();
    switchProfile(profile);
  };

  return (
    <div className="w-full max-w-lg mx-auto p-4 sm:p-5 space-y-4 pb-24 animate-fade-in">
      
      {/* Persona & Identity Switcher Hub */}
      <div className="p-3.5 rounded-2xl bg-[#141418] border border-[#24242B] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#8E8E9F]">
            <Users className="w-3.5 h-3.5 text-[#CCFF00]" />
            <span>SWITCH IDENTITY / PERSONA</span>
          </div>
          <span className="text-[10px] font-mono text-[#00F0FF] bg-[#00F0FF]/10 px-2 py-0.5 rounded-full border border-[#00F0FF]/30">
            TEST SQUAD PERSPECTIVES
          </span>
        </div>

        {/* Horizontal Persona Avatars */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {DEMO_PROFILES.map((profile) => {
            const isCurrent = currentUser.id === profile.id;
            return (
              <button
                key={profile.id}
                onClick={() => handleSwitch(profile)}
                className={`flex-shrink-0 flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-left transition-all ${
                  isCurrent 
                    ? 'bg-[#CCFF00]/15 border-[#CCFF00] shadow-[0_0_12px_rgba(204,255,0,0.3)]' 
                    : 'bg-[#1B1B22] border-[#24242B] hover:border-[#CCFF00]/60 opacity-70 hover:opacity-100'
                }`}
              >
                <img 
                  src={profile.avatarUrl} 
                  alt={profile.handle} 
                  className={`w-6 h-6 rounded-full object-cover border ${isCurrent ? 'border-[#CCFF00]' : 'border-transparent'}`} 
                />
                <div className="flex flex-col pr-1">
                  <span className={`text-[11px] font-mono font-bold leading-none ${isCurrent ? 'text-[#CCFF00]' : 'text-[#F4F4F6]'}`}>
                    @{profile.handle.split('.')[0]}
                  </span>
                  <span className="text-[9px] font-mono text-[#8E8E9F] mt-0.5">
                    {profile.city}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick Action Buttons for New Personas */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleRandomize}
            className="py-1.5 px-3 rounded-lg bg-[#1B1B22] hover:bg-[#24242B] border border-[#24242B] text-xs font-mono text-[#F4F4F6] hover:text-[#CCFF00] flex items-center justify-center gap-1.5 transition-colors"
            title="Roll random handle, avatar, and vibe"
          >
            <Dices className="w-3.5 h-3.5 text-[#CCFF00]" />
            <span>🎲 Randomize New</span>
          </button>

          <button
            onClick={() => setAuthModalOpen(true, 'create new custom persona')}
            className="py-1.5 px-3 rounded-lg bg-[#CCFF00]/10 hover:bg-[#CCFF00]/20 border border-[#CCFF00]/40 text-xs font-mono text-[#CCFF00] flex items-center justify-center gap-1.5 transition-colors"
            title="Create your own custom name, handle & avatar"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Create Custom</span>
          </button>
        </div>
      </div>

      {/* Top Profile Header */}
      <div className="p-4 rounded-2xl bg-[#141418] border border-[#24242B] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src={currentUser.avatarUrl} 
              alt={currentUser.fullName}
              className="w-14 h-14 rounded-full object-cover border-2 border-[#CCFF00] shadow-[0_0_12px_rgba(204,255,0,0.4)]"
            />
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#CCFF00] border-2 border-[#0A0A0C]" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-bold text-[#F4F4F6] font-mono">@{currentUser.handle}</h2>
              <ShieldCheck className="w-4 h-4 text-[#CCFF00]" />
            </div>
            <p className="text-xs font-mono text-[#8E8E9F]">{currentUser.fullName} • {currentUser.city}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30 font-bold">
                {currentUser.gender === 'F' ? '🌸 VERIFIED FEMALE' : 'LEVEL 07 EXPLORER'}
              </span>
              <span className="text-[10px] font-mono text-[#8E8E9F]">
                {currentUser.questsCompleted} Quests
              </span>
            </div>
          </div>
        </div>

        {/* Karma Badge */}
        <div className="flex flex-col items-end">
          <span className="text-xl font-bold font-mono text-[#CCFF00]">{currentUser.karmaScore}</span>
          <span className="text-[9px] font-mono text-[#8E8E9F]">SHOW-UP KARMA</span>
          <span className="text-[9px] font-mono text-[#00F0FF] mt-0.5">0% FLAKE RATE</span>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        
        {/* Bento 1 (Large - Audio Aura) */}
        <div className="sm:col-span-2 p-4 rounded-2xl bg-[#141418] border border-[#24242B] relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-[#8E8E9F] uppercase tracking-wider flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-[#1DB954]" /> AUDIO AURA // SPOTIFY HI-FI
            </span>
            <div className="flex items-end gap-1 h-3">
              <span className="w-1 bg-[#1DB954] h-full animate-pulse" />
              <span className="w-1 bg-[#1DB954] h-2 animate-pulse delay-75" />
              <span className="w-1 bg-[#1DB954] h-3 animate-pulse delay-150" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-mono text-[#F4F4F6] font-bold">
              {currentUser.currentRotation || 'Fred again.. - adore u'}
            </div>
            <div className="text-[11px] font-mono text-[#8E8E9F]">
              Top Artists: {currentUser.spotifyTopArtists?.join(', ')}
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-3">
            <span className="px-2 py-0.5 rounded bg-[#1B1B22] border border-[#24242B] text-[10px] font-mono text-[#CCFF00]">
              #ELECTRONIC
            </span>
            <span className="px-2 py-0.5 rounded bg-[#1B1B22] border border-[#24242B] text-[10px] font-mono text-[#8E8E9F]">
              #LATE-NIGHT LO-FI
            </span>
            <span className="text-[10px] font-mono text-[#8E8E9F] ml-auto">
              94% VIBE SYNC
            </span>
          </div>
        </div>

        {/* Bento 2 (Medium Left - Street Cred Badges) */}
        <div className="p-4 rounded-2xl bg-[#141418] border border-[#24242B] flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono font-bold text-[#8E8E9F] uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
              <Award className="w-3.5 h-3.5 text-[#CCFF00]" /> STREET CRED BADGES
            </span>
            <div className="space-y-1.5">
              {currentUser.badges?.map((badge, idx) => (
                <div key={idx} className="px-2.5 py-1.5 rounded-lg bg-[#1B1B22] border border-[#24242B] text-xs font-mono text-[#F4F4F6] flex items-center gap-2">
                  <span>{badge}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] font-mono text-[#8E8E9F] mt-3 pt-2 border-t border-[#24242B]">
            {currentUser.questsCompleted} TOTAL QUESTS CLEARED
          </p>
        </div>

        {/* Bento 3 (Medium Right - Recent Scrapbook Polaroid) */}
        <div className="p-4 rounded-2xl bg-[#141418] border border-[#24242B] flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono font-bold text-[#8E8E9F] uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" /> MEMORY SCRAPBOOK
            </span>
            <div className="p-2.5 rounded-xl bg-[#0A0A0C] border border-[#24242B] rotate-1 shadow-md">
              <img 
                src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=300&auto=format&fit=crop&q=80" 
                alt="Memory" 
                className="w-full h-24 object-cover rounded-lg"
              />
              <div className="pt-2 text-center">
                <span className="text-[10px] font-mono font-bold text-[#F4F4F6] block">Midnight Chai @ Gate 2</span>
                <span className="text-[9px] font-mono text-[#8E8E9F]">Verified Squad • 4 Members</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bento 4 (Wide Bottom - Anti Resume Manifesto) */}
        <div className="sm:col-span-2 p-4 rounded-2xl bg-[#141418] border border-[#24242B]">
          <span className="text-xs font-mono font-bold text-[#8E8E9F] uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
            ⚡ CURRENT OBSESSION & STACK
          </span>
          <p className="text-xs font-mono text-[#F4F4F6] leading-relaxed">
            "{currentUser.bioManifesto}"
          </p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {['Next.js', 'PySpark', 'FastAPI', 'High-Entropy Tea Stalls', 'Specialty Coffee'].map(tag => (
              <span key={tag} className="px-2 py-0.5 rounded bg-[#1B1B22] border border-[#24242B] text-[10px] font-mono text-[#8E8E9F]">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action Triggers */}
      <div className="space-y-2 pt-2">
        <button
          onClick={() => setCreateSheetOpen(true)}
          className="w-full py-3 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A0A0C] font-mono font-bold text-xs tracking-wider shadow-[0_0_16px_rgba(204,255,0,0.3)] transition-all flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4 fill-current" /> DROP A FLARE FROM PROFILE
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setAuthModalOpen(true, 'edit taste profile')}
            className="py-2.5 rounded-xl bg-[#1B1B22] hover:bg-[#24242B] border border-[#24242B] text-[#F4F4F6] hover:text-[#CCFF00] font-mono text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#CCFF00]" /> Edit Profile
          </button>

          <button
            onClick={handleShareStory}
            className="py-2.5 rounded-xl bg-[#1B1B22] hover:bg-[#24242B] border border-[#24242B] text-[#F4F4F6] font-mono text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#CCFF00]" /> : <Share2 className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Share Bento'}
          </button>
        </div>
      </div>

    </div>
  );
}
