'use client';

import React, { useState, useMemo } from 'react';
import { useSideQuestStore } from '@/lib/store';
import { 
  ShieldCheck, Sparkles, Music, Flame, Zap, Award, 
  Share2, Check, ExternalLink, Dices, UserPlus, Users, Radio, Tag, 
  Search, Shuffle, SlidersHorizontal 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DEMO_PROFILES, generateRandomPersona, GEN_Z_VIBE_TAGS, LIVE_STATUS_OPTIONS } from '@/lib/constants';
import { playRadarBlip, playCheckInChime } from '@/lib/audio';

export default function BentoProfile() {
  const { 
    currentUser, 
    setCreateSheetOpen, 
    setAuthModalOpen, 
    switchProfile,
    resetToNewIndividual,
    selectedCity,
    setInspectedMember,
    updateLiveStatus,
    registeredProfiles
  } = useSideQuestStore();
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCityOnly, setFilterCityOnly] = useState(true);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [pageIndex, setPageIndex] = useState(0);

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

  const handleInspect = (profile: typeof DEMO_PROFILES[0]) => {
    playRadarBlip();
    setInspectedMember(profile);
  };

  const otherProfiles = useMemo(() => {
    const list = registeredProfiles && registeredProfiles.length > 0 ? registeredProfiles : DEMO_PROFILES;
    return list.filter(p => p.id !== currentUser.id && p.handle !== currentUser.handle);
  }, [registeredProfiles, currentUser]);

  const filteredExplorers = useMemo(() => {
    return otherProfiles.filter(p => {
      // 1. City filter
      if (filterCityOnly && p.city.toLowerCase() !== selectedCity.name.toLowerCase()) {
        return false;
      }
      // 2. Status filter
      if (selectedStatusFilter !== 'ALL' && p.liveStatus !== selectedStatusFilter) {
        return false;
      }
      // 3. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesHandle = p.handle.toLowerCase().includes(query);
        const matchesName = p.fullName.toLowerCase().includes(query);
        const matchesTags = p.vibeTags?.some(t => t.toLowerCase().includes(query));
        const matchesStatus = p.liveStatus?.toLowerCase().includes(query);
        if (!matchesHandle && !matchesName && !matchesTags && !matchesStatus) {
          return false;
        }
      }
      return true;
    }).map(profile => {
      // Calculate real Vibe Match %
      let score = 72;
      if (profile.city.toLowerCase() === currentUser.city.toLowerCase()) score += 15;
      const sharedTags = profile.vibeTags?.filter(t => currentUser.vibeTags?.includes(t)) || [];
      score += Math.min(12, sharedTags.length * 4);
      return {
        ...profile,
        matchScore: Math.min(99, score)
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }, [otherProfiles, filterCityOnly, selectedCity.name, selectedStatusFilter, searchQuery, currentUser]);

  const BATCH_SIZE = 6;
  const totalPages = Math.max(1, Math.ceil(filteredExplorers.length / BATCH_SIZE));
  const currentBatch = filteredExplorers.slice(pageIndex * BATCH_SIZE, (pageIndex + 1) * BATCH_SIZE);

  const handleNextBatch = () => {
    playRadarBlip();
    setPageIndex(prev => (prev + 1) % totalPages);
  };

  return (
    <div className="w-full max-w-lg mx-auto p-4 sm:p-5 space-y-4 pb-24 animate-fade-in">
      
      {/* Unique Identity Status / Onboarding Callout */}
      {!currentUser.isProfileCustomized ? (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#CCFF00]/15 via-[#141418] to-[#00F0FF]/10 border border-[#CCFF00]/40 shadow-[0_0_24px_rgba(204,255,0,0.15)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#CCFF00] animate-ping" />
              <span className="text-xs font-mono font-bold text-[#CCFF00] tracking-wider uppercase">
                CLAIM YOUR UNIQUE IDENTITY
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#00F0FF] bg-[#00F0FF]/10 px-2 py-0.5 rounded-full border border-[#00F0FF]/30">
              0 PASSWORDS NEEDED
            </span>
          </div>

          <p className="text-xs font-mono text-[#F4F4F6] leading-relaxed">
            You are browsing with temporary handle <span className="text-[#CCFF00] font-bold">@{currentUser.handle}</span>. Set your unique moniker, avatar, and Spotify music taste so squad members recognize you at meetups!
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => setAuthModalOpen(true, 'claim identity')}
              className="py-2 px-3 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A0A0C] font-mono font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(204,255,0,0.3)] transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Set Up My Profile</span>
            </button>

            <button
              onClick={handleRandomize}
              className="py-2 px-3 rounded-xl bg-[#1B1B22] hover:bg-[#24242B] border border-[#24242B] hover:border-[#CCFF00] text-xs font-mono text-[#CCFF00] flex items-center justify-center gap-1.5 transition-colors"
              title="Generate a cool random moniker and music taste"
            >
              <Dices className="w-4 h-4" />
              <span>🎲 Roll Random</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-[#141418] border border-[#24242B] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#CCFF00]" />
            <span className="text-[11px] font-mono text-[#8E8E9F]">
              YOUR UNIQUE IDENTITY: <span className="text-[#CCFF00] font-bold">@{currentUser.handle}</span>
            </span>
          </div>
          <button
            onClick={() => setAuthModalOpen(true, 'edit identity')}
            className="text-[11px] font-mono text-[#00F0FF] hover:underline flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" /> Edit Profile
          </button>
        </div>
      )}

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

      {/* 1-Tap Live IRL Status Selector Bar */}
      <div className="p-3.5 rounded-2xl bg-[#141418] border border-[#24242B] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-[#8E8E9F] uppercase tracking-wider flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-[#CCFF00] animate-pulse" /> LIVE IRL STATUS
          </span>
          <span className="text-[10px] font-mono text-[#CCFF00] bg-[#CCFF00]/10 px-2 py-0.5 rounded-full border border-[#CCFF00]/30 font-bold">
            1-TAP UPDATE
          </span>
        </div>

        {/* Current Status Callout */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0A0A0C] border border-[#24242B]">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#CCFF00] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#CCFF00]"></span>
          </span>
          <span className="text-xs font-mono font-bold text-[#F4F4F6]">
            {currentUser.liveStatus || LIVE_STATUS_OPTIONS[0]}
          </span>
        </div>

        {/* Fast selector pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1">
          {LIVE_STATUS_OPTIONS.map((status) => {
            const isActive = (currentUser.liveStatus || LIVE_STATUS_OPTIONS[0]) === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => {
                  playRadarBlip();
                  updateLiveStatus(status);
                }}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-[#CCFF00] text-[#0A0A0C] font-bold border-[#CCFF00] shadow-[0_0_10px_rgba(204,255,0,0.3)] scale-[1.02]'
                    : 'bg-[#1B1B22] text-[#8E8E9F] hover:text-[#F4F4F6] border-[#24242B] hover:border-[#CCFF00]/50'
                }`}
              >
                {status}
              </button>
            );
          })}
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

        {/* Bento 2 (Medium Left - Street Cred Lore) */}
        <div className="p-4 rounded-2xl bg-[#141418] border border-[#24242B] flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono font-bold text-[#8E8E9F] uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
              <Award className="w-3.5 h-3.5 text-[#CCFF00]" /> STREET CRED & LORE
            </span>
            <div className="space-y-1.5">
              <div className="px-2.5 py-1.5 rounded-lg bg-[#1B1B22] border border-[#24242B] text-[11px] font-mono flex items-center justify-between">
                <span className="text-[#8E8E9F]">Spontaneity Rank</span>
                <span className="text-[#CCFF00] font-bold">S-Tier ⚡</span>
              </div>
              <div className="px-2.5 py-1.5 rounded-lg bg-[#1B1B22] border border-[#24242B] text-[11px] font-mono flex items-center justify-between">
                <span className="text-[#8E8E9F]">Flake Probability</span>
                <span className="text-[#00F0FF] font-bold">0.0% 🛡️</span>
              </div>
              {currentUser.badges?.map((badge, idx) => (
                <div key={idx} className="px-2.5 py-1.5 rounded-lg bg-[#1B1B22] border border-[#24242B] text-[11px] font-mono text-[#F4F4F6] flex items-center gap-2">
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

        {/* Bento 4 (Wide Bottom - Hyperfixations & Lore) */}
        <div className="sm:col-span-2 p-4 rounded-2xl bg-[#141418] border border-[#24242B]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-mono font-bold text-[#8E8E9F] uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#CCFF00]" /> CURRENT HYPERFIXATIONS & LORE
            </span>
            <button
              onClick={() => setAuthModalOpen(true, 'edit taste profile')}
              className="text-[10px] font-mono text-[#00F0FF] hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" /> Edit Tags
            </button>
          </div>
          <p className="text-xs font-mono text-[#F4F4F6] leading-relaxed italic">
            "{currentUser.bioManifesto || 'Late night chai runs and building cool things.'}"
          </p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {(currentUser.vibeTags && currentUser.vibeTags.length > 0 
              ? currentUser.vibeTags 
              : ['🧋 3am Chai Runs', '🎾 Turf Badminton 2v2', '📸 35mm Film Photography', '🍵 Iced Matcha Lattes']
            ).map(tag => (
              <span 
                key={tag} 
                className="px-2.5 py-1 rounded-lg bg-[#1B1B22] border border-[#24242B] text-xs font-mono text-[#CCFF00] flex items-center gap-1 shadow-sm hover:border-[#CCFF00]/50 transition-colors"
              >
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

      {/* Squad Discovery Hub (Scalable for 100+ Real Profiles) */}
      <div className="p-4 rounded-2xl bg-[#141418] border border-[#24242B] space-y-3">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#8E8E9F]">
            <Users className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>SQUAD RADAR // DISCOVER EXPLORERS</span>
          </div>
          <span className="text-[10px] font-mono text-[#00F0FF] bg-[#00F0FF]/10 px-2 py-0.5 rounded-full border border-[#00F0FF]/30 font-bold">
            {filteredExplorers.length} EXPLORERS
          </span>
        </div>

        {/* Search Bar & City Scope Switcher */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#8E8E9F] absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by @handle, name, or vibe tag (e.g. badminton, chai)..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setPageIndex(0);
              }}
              className="w-full pl-8 pr-12 py-1.5 rounded-xl bg-[#0A0A0C] border border-[#24242B] focus:border-[#00F0FF] text-xs text-[#F4F4F6] font-mono outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-[10px] font-mono text-[#8E8E9F] hover:text-[#F4F4F6]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center justify-between gap-1 text-[11px] font-mono">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setFilterCityOnly(true);
                  setPageIndex(0);
                }}
                className={`px-2 py-0.5 rounded-lg border transition-all ${
                  filterCityOnly 
                    ? 'border-[#CCFF00] bg-[#CCFF00]/15 text-[#CCFF00] font-bold' 
                    : 'border-[#24242B] text-[#8E8E9F] hover:text-[#F4F4F6]'
                }`}
              >
                📍 In {selectedCity.name}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilterCityOnly(false);
                  setPageIndex(0);
                }}
                className={`px-2 py-0.5 rounded-lg border transition-all ${
                  !filterCityOnly 
                    ? 'border-[#00F0FF] bg-[#00F0FF]/15 text-[#00F0FF] font-bold' 
                    : 'border-[#24242B] text-[#8E8E9F] hover:text-[#F4F4F6]'
                }`}
              >
                🌐 All 7 Metros
              </button>
            </div>

            {totalPages > 1 && (
              <button
                type="button"
                onClick={handleNextBatch}
                className="px-2 py-0.5 rounded-lg bg-[#1B1B22] border border-[#24242B] hover:border-[#CCFF00] text-[#CCFF00] text-[10px] font-bold flex items-center gap-1 transition-all"
                title="Shuffle to next squad batch"
              >
                <Shuffle className="w-2.5 h-2.5" />
                <span>Batch ({pageIndex + 1}/{totalPages})</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Status Filter Pills (Horizontal Scroll) */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5 text-[10px] font-mono">
          <button
            type="button"
            onClick={() => {
              setSelectedStatusFilter('ALL');
              setPageIndex(0);
            }}
            className={`px-2 py-0.5 rounded-md border whitespace-nowrap transition-all ${
              selectedStatusFilter === 'ALL'
                ? 'border-[#CCFF00] bg-[#CCFF00] text-[#0A0A0C] font-bold'
                : 'border-[#24242B] bg-[#141418] text-[#8E8E9F] hover:text-[#F4F4F6]'
            }`}
          >
            All Statuses
          </button>
          {LIVE_STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => {
                setSelectedStatusFilter(selectedStatusFilter === status ? 'ALL' : status);
                setPageIndex(0);
              }}
              className={`px-2 py-0.5 rounded-md border whitespace-nowrap transition-all ${
                selectedStatusFilter === status
                  ? 'border-[#00F0FF] bg-[#00F0FF] text-[#0A0A0C] font-bold'
                  : 'border-[#24242B] bg-[#141418] text-[#8E8E9F] hover:text-[#F4F4F6]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Explorers Grid Display */}
        {currentBatch.length === 0 ? (
          <div className="p-6 text-center rounded-xl bg-[#0A0A0C] border border-[#24242B] space-y-1.5">
            <span className="text-xl">🔍</span>
            <p className="text-xs font-mono text-[#F4F4F6]">No squad explorers match this filter.</p>
            <p className="text-[10px] font-mono text-[#8E8E9F]">Try toggling "All 7 Metros" or clear your search query.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setFilterCityOnly(false);
                setSelectedStatusFilter('ALL');
              }}
              className="mt-2 text-[10px] font-mono text-[#CCFF00] underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {currentBatch.map((profile) => (
              <div
                key={profile.id}
                onClick={() => handleInspect(profile)}
                className="p-3 rounded-xl bg-[#0A0A0C] border border-[#24242B] hover:border-[#00F0FF] cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between space-y-2 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="relative shrink-0">
                      <img
                        src={profile.avatarUrl}
                        alt={profile.handle}
                        className="w-9 h-9 rounded-full object-cover border border-[#24242B] group-hover:border-[#00F0FF] transition-colors"
                      />
                      <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#CCFF00] border border-[#0A0A0C]" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-mono font-bold text-[#F4F4F6] truncate group-hover:text-[#00F0FF]">
                          @{profile.handle}
                        </span>
                        {profile.gender === 'F' && <span className="text-[9px]">🌸</span>}
                      </div>
                      <span className="text-[10px] font-mono text-[#8E8E9F] block truncate">
                        {profile.fullName} • {profile.city}
                      </span>
                    </div>
                  </div>

                  <span className="shrink-0 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30">
                    {profile.matchScore}% Match
                  </span>
                </div>

                {/* Live Status Pill */}
                {profile.liveStatus && (
                  <div className="px-2 py-1 rounded-lg bg-[#141418] border border-[#1C1C24] text-[10px] font-mono text-[#CCFF00] truncate flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-pulse shrink-0" />
                    <span className="truncate">{profile.liveStatus}</span>
                  </div>
                )}

                {/* Vibe Tags Snippet */}
                {profile.vibeTags && profile.vibeTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {profile.vibeTags.slice(0, 2).map((tag, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 rounded bg-[#1B1B22] text-[9px] font-mono text-[#8E8E9F] truncate">
                        {tag}
                      </span>
                    ))}
                    {profile.vibeTags.length > 2 && (
                      <span className="text-[9px] font-mono text-[#8E8E9F] self-center">
                        +{profile.vibeTags.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}
