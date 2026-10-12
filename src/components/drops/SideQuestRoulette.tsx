'use client';

import React, { useState } from 'react';
import { useSideQuestStore } from '@/lib/store';
import { 
  Dices, Sparkles, Flame, Clock, MapPin, Zap, ArrowRight, Check, RotateCw, ShieldCheck 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playDiceRoll, playCheckInChime, playRadarBlip } from '@/lib/audio';
import { trackEvent } from '@/lib/analytics';

interface MicroQuestTemplate {
  title: string;
  emoji: string;
  category: 'CHAI_FOOD' | 'SPORTS' | 'COWORK_DEV' | 'GIGS_CULTURE';
  vibeTag: string;
  venueName: string;
  hotspotName: string;
  durationMinutes: number;
  xpReward: number;
  dareRule: string;
  description: string;
}

const CITY_QUEST_TEMPLATES: Record<string, MicroQuestTemplate[]> = {
  bengaluru: [
    {
      title: 'Sanjay Chai Speedrun & Lore Session',
      emoji: '🧋',
      category: 'CHAI_FOOD',
      vibeTag: '🧋 3am Chai Runs',
      venueName: 'Sanjay Tea Stall, Koramangala 5th',
      hotspotName: 'Koramangala 5th Block',
      durationMinutes: 45,
      xpReward: 15,
      dareRule: 'Challenge the host to rock-paper-scissors for the second cutting chai.',
      description: 'Late night hot kulhad chai, butter bun maska, and debating startup ideas under the streetlight.'
    },
    {
      title: 'Indiranagar 2v2 Badminton Turf Clash',
      emoji: '🏸',
      category: 'SPORTS',
      vibeTag: '🎾 Turf Badminton 2v2',
      venueName: 'Play Arena Indoor Court 2',
      hotspotName: 'Indiranagar 100ft Road',
      durationMinutes: 60,
      xpReward: 20,
      dareRule: 'Loser buys the first round of tender coconut water for the squad.',
      description: 'Fast-paced 21-point rally under the indoor turf floodlights. Racquets provided on spot!'
    },
    {
      title: 'Rooftop Vibe Coding & Shipping Jam',
      emoji: '💻',
      category: 'COWORK_DEV',
      vibeTag: '💻 Vibe Coding & Shippers',
      venueName: 'Third Wave Rooftop, 12th Main',
      hotspotName: 'Indiranagar 100ft Road',
      durationMinutes: 90,
      xpReward: 25,
      dareRule: 'Push at least 1 git commit or deploy 1 feature before your iced latte melts.',
      description: 'Lofi beats, cold brews, and silent co-working sprint with fellow indie hackers and designers.'
    },
    {
      title: 'Church Street 35mm Film & Vintage Book Hunt',
      emoji: '📸',
      category: 'GIGS_CULTURE',
      vibeTag: '📸 35mm Film Photography',
      venueName: 'Blossom Book House, Church Street',
      hotspotName: 'Church Street',
      durationMinutes: 60,
      xpReward: 20,
      dareRule: 'Find the weirdest 1980s book cover in the basement and take a polaroid snap.',
      description: 'Strolling through Bangalore’s most iconic bookstore labyrinth, followed by street corner coffee.'
    }
  ],
  mumbai: [
    {
      title: 'Carter Road Sunset Sea Walk & Tender Coconut',
      emoji: '🌅',
      category: 'GIGS_CULTURE',
      vibeTag: '📸 35mm Film Photography',
      venueName: 'Carter Road Sea Promenade, Bandra',
      hotspotName: 'Carter Road Bandra',
      durationMinutes: 60,
      xpReward: 15,
      dareRule: 'Capture 1 golden-hour Polaroid of the Arabian Sea breeze.',
      description: 'Breezy evening stroll along Bandra coastline with fresh nariyal paani and music playlist exchange.'
    },
    {
      title: 'Marine Drive 1am Chai & Midnight Skyline',
      emoji: '🧋',
      category: 'CHAI_FOOD',
      vibeTag: '🧋 3am Chai Runs',
      venueName: 'Opposite Pizza By The Bay, Marine Drive',
      hotspotName: 'Marine Drive Promenade',
      durationMinutes: 60,
      xpReward: 20,
      dareRule: 'Strictly zero Slack or email checking while sitting on the sea tetrapods.',
      description: 'Midnight chai run to Queen’s Necklace with sea spray and retro Bollywood indie playlist.'
    },
    {
      title: 'Pali Hill Matcha & Bandra Thrift Stroll',
      emoji: '🍵',
      category: 'GIGS_CULTURE',
      vibeTag: '🍵 Iced Matcha Lattes',
      venueName: 'Subko Coffee Roasters, Bandra West',
      hotspotName: 'Bandra West',
      durationMinutes: 60,
      xpReward: 20,
      dareRule: 'Find the most retro 90s sunglasses in the thrift rack.',
      description: 'Specialty coffee, iced ceremonial matcha, and checking out local designer pop-ups.'
    }
  ],
  delhi: [
    {
      title: 'Hauz Khas Deer Park Sunset Perimeter Stroll',
      emoji: '🦌',
      category: 'GIGS_CULTURE',
      vibeTag: '📸 35mm Film Photography',
      venueName: 'HKV Social Lake View Entry Gate',
      hotspotName: 'Hauz Khas Village',
      durationMinutes: 60,
      xpReward: 15,
      dareRule: 'Walk the full lake perimeter before sunset without stopping.',
      description: 'Exploring ancient 13th-century stone ruins and lake reservoir with sunset golden hour photos.'
    },
    {
      title: 'MKT Spicy Laphing & Steamed Momo Rally',
      emoji: '🥟',
      category: 'CHAI_FOOD',
      vibeTag: '🧋 3am Chai Runs',
      venueName: 'Tibetan Monastery Square, Majnu Ka Tilla',
      hotspotName: 'Majnu Ka Tilla',
      durationMinutes: 60,
      xpReward: 20,
      dareRule: 'Order the spiciest chili oil laphing on the street without flinching.',
      description: 'Authentic yellow laphing, tingmo, and butter tea tasting through MKT’s cozy alleyways.'
    }
  ],
  pune: [
    {
      title: 'FC Road Bun Maska & Cold Coffee Crawl',
      emoji: '☕',
      category: 'CHAI_FOOD',
      vibeTag: '🧋 3am Chai Runs',
      venueName: 'Vaishali Cafe, FC Road',
      hotspotName: 'FC Road',
      durationMinutes: 45,
      xpReward: 15,
      dareRule: 'Must request extra thick chocolate sauce on the cold coffee.',
      description: 'Pune’s legendary student strip staple: piping hot filter kaapi and crisp butter dosas.'
    },
    {
      title: 'ARAI Sunset Tekdi Hilltop Breeze Walk',
      emoji: '🌄',
      category: 'SPORTS',
      vibeTag: '📸 35mm Film Photography',
      venueName: 'ARAI Hilltop Viewpoint, Kothrud',
      hotspotName: 'Kothrud Tekdi',
      durationMinutes: 60,
      xpReward: 20,
      dareRule: 'Identify 3 prominent Pune landmarks from the hill summit.',
      description: 'Short 15-min uphill walk for fresh greenery, hilltop breeze, and sweeping 360° city horizon views.'
    }
  ],
  hyderabad: [
    {
      title: 'Nimrah Irani Chai & Osmania Biscuit Ritual',
      emoji: '🧋',
      category: 'CHAI_FOOD',
      vibeTag: '🧋 3am Chai Runs',
      venueName: 'Nimrah Cafe & Bakery, Charminar',
      hotspotName: 'Charminar Heritage Plaza',
      durationMinutes: 45,
      xpReward: 15,
      dareRule: 'Dip the Osmania biscuit twice into hot Irani chai without it crumbling.',
      description: 'Rich creamy Irani chai right in front of the illuminated Charminar arches.'
    },
    {
      title: 'Cable Bridge Midnight Breeze Stroll',
      emoji: '🌉',
      category: 'GIGS_CULTURE',
      vibeTag: '📸 35mm Film Photography',
      venueName: 'Durgam Cheruvu Cable Bridge Pedestrian Walk',
      hotspotName: 'Jubilee Hills / Hitec City',
      durationMinutes: 60,
      xpReward: 15,
      dareRule: 'Count 5 neon IT tower logos gleaming across the lake basin.',
      description: 'Spectacular suspension bridge walk with illuminated neon cables and lake breeze.'
    }
  ],
  chennai: [
    {
      title: 'Bessie Beach Sunrise Filter Kaapi Run',
      emoji: '☕',
      category: 'CHAI_FOOD',
      vibeTag: '🧋 3am Chai Runs',
      venueName: 'Elliot’s Beach Promenade, Besant Nagar',
      hotspotName: 'Besant Nagar Beach',
      durationMinutes: 60,
      xpReward: 15,
      dareRule: 'Walk barefoot on the sand for 15 minutes while watching the sunrise.',
      description: 'Fresh foaming brass-davarah filter coffee paired with cool Bay of Bengal morning winds.'
    }
  ],
  kolkata: [
    {
      title: 'Princep Ghat Monumental Chai & River Ferry',
      emoji: '⛵',
      category: 'CHAI_FOOD',
      vibeTag: '🧋 3am Chai Runs',
      venueName: 'Princep Ghat Memorial Pavilion',
      hotspotName: 'Princep Ghat Strand Road',
      durationMinutes: 60,
      xpReward: 20,
      dareRule: 'Wave at the river country boat passing beneath Vidyasagar Setu.',
      description: 'Heritage Corinthian columns, clay cup earthen cha, and watching evening river lights.'
    }
  ]
};

export default function SideQuestRoulette() {
  const { selectedCity, currentUser, createDrop, setActiveDropId } = useSideQuestStore();
  const [isRolling, setIsRolling] = useState(false);
  const [activeQuest, setActiveQuest] = useState<MicroQuestTemplate | null>(null);
  const [hasLaunched, setHasLaunched] = useState(false);

  const cityPool = CITY_QUEST_TEMPLATES[selectedCity.id] || CITY_QUEST_TEMPLATES['bengaluru'];

  const handleRoll = () => {
    setIsRolling(true);
    setHasLaunched(false);
    playDiceRoll();

    // Roll through random items for suspense
    let count = 0;
    const interval = setInterval(() => {
      const randIdx = Math.floor(Math.random() * cityPool.length);
      setActiveQuest(cityPool[randIdx]);
      count++;
      if (count > 7) {
        clearInterval(interval);
        setIsRolling(false);
        playCheckInChime();
        trackEvent('roulette_rolled', {
          city: selectedCity.name
        });
        confetti({
          particleCount: 40,
          spread: 60,
          colors: ['#CCFF00', '#00F0FF', '#FF007A']
        });
      }
    }, 100);
  };

  const handleLaunchFlare = () => {
    if (!activeQuest) return;

    playRadarBlip();
    const expiresAt = new Date(Date.now() + activeQuest.durationMinutes * 60 * 1000).toISOString();

    const targetHotspot = selectedCity.hotspots.find(h => h.name.includes(activeQuest.hotspotName)) || selectedCity.hotspots[0];
    const lat = targetHotspot ? targetHotspot.lat : selectedCity.center[1];
    const lng = targetHotspot ? targetHotspot.lng : selectedCity.center[0];

    createDrop({
      title: `${activeQuest.emoji} ${activeQuest.title}`,
      category: activeQuest.category,
      cityId: selectedCity.id,
      hotspotName: targetHotspot?.name || activeQuest.hotspotName,
      venueName: activeQuest.venueName,
      lat,
      lng,
      expiresAt,
      maxSlots: 4,
      isGirlsOnly: false,
      tags: [activeQuest.vibeTag, '⚡ SideQuest Roulette'],
      aiVibeNote: `Spontaneous SideQuest Roulette Roll! ${activeQuest.dareRule}`,
      host: currentUser
    });

    setHasLaunched(true);
    confetti({
      particleCount: 50,
      spread: 70,
      colors: ['#CCFF00', '#00F0FF']
    });
  };

  return (
    <div className="relative rounded-2xl bg-gradient-to-b from-[#14141A] to-[#0E0E12] border border-[#24242B] p-4 sm:p-5 shadow-xl overflow-hidden group">
      
      {/* Cyber Glow Accent */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#CCFF00]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#00F0FF]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#24242B]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex items-center justify-center text-lg">
            🎲
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold text-[#F4F4F6] uppercase tracking-wider flex items-center gap-1.5">
              <span>SIDEQUEST ROULETTE</span>
              <span className="px-1.5 py-0.2 rounded bg-[#CCFF00] text-[#0A0A0C] text-[9px] font-black">
                IRL
              </span>
            </h3>
            <p className="text-[10px] font-mono text-[#8E8E9F]">
              Bored right now? Roll a spontaneous micro-quest for {selectedCity.name}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRoll}
          disabled={isRolling}
          className={`py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-[#CCFF00] to-[#00F0FF] text-[#0A0A0C] font-mono font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(204,255,0,0.3)] transition-all ${
            isRolling ? 'opacity-50 scale-95' : 'hover:scale-105 active:scale-95'
          }`}
        >
          <Dices className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
          <span>{isRolling ? 'Rolling...' : activeQuest ? 'Roll Again' : 'Roll Quest'}</span>
        </button>
      </div>

      {/* Main Roulette Display */}
      {!activeQuest ? (
        <div 
          onClick={handleRoll}
          className="my-3 p-6 rounded-xl bg-[#0A0A0C]/60 border border-dashed border-[#2E2E38] hover:border-[#CCFF00] cursor-pointer text-center space-y-2 transition-colors"
        >
          <span className="text-3xl block animate-bounce">🎰</span>
          <p className="text-xs font-mono font-bold text-[#F4F4F6]">
            Tap "Roll Quest" to generate a zero-flake micro-adventure
          </p>
          <p className="text-[10px] font-mono text-[#8E8E9F]">
            Curated Chai runs, turf games, rooftop hacking, and thrift strolls in {selectedCity.name}
          </p>
        </div>
      ) : (
        <div className={`mt-3 p-4 rounded-xl bg-[#0A0A0C] border border-[#2E2E38] space-y-3 transition-all ${isRolling ? 'filter blur-[1px] opacity-70' : 'animate-fade-in'}`}>
          
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl p-2 rounded-xl bg-[#141418] border border-[#24242B]">
                {activeQuest.emoji}
              </span>
              <div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/30 font-bold">
                  {activeQuest.vibeTag}
                </span>
                <h4 className="text-sm font-bold text-[#F4F4F6] mt-1 font-mono">
                  {activeQuest.title}
                </h4>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono font-bold text-[#00F0FF] block">
                +{activeQuest.xpReward} XP
              </span>
              <span className="text-[9px] font-mono text-[#8E8E9F] flex items-center justify-end gap-1">
                <Clock className="w-3 h-3" /> {activeQuest.durationMinutes}m window
              </span>
            </div>
          </div>

          <p className="text-xs text-[#A0A0B0] font-mono leading-relaxed">
            {activeQuest.description}
          </p>

          {/* Location & Dare Pill */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="p-2 rounded-lg bg-[#141418] border border-[#24242B] flex items-center gap-1.5 text-[#F4F4F6]">
              <MapPin className="w-3.5 h-3.5 text-[#FF007A] shrink-0" />
              <span className="truncate">{activeQuest.venueName}</span>
            </div>
            <div className="p-2 rounded-lg bg-[#141418] border border-[#24242B] flex items-center gap-1.5 text-[#CCFF00]">
              <Zap className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate font-bold">Rule: {activeQuest.dareRule}</span>
            </div>
          </div>

          {/* 1-Click Action to Convert to Live Flare Drop */}
          <div className="pt-1 flex items-center gap-2">
            {!hasLaunched ? (
              <button
                type="button"
                onClick={handleLaunchFlare}
                className="flex-1 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A0A0C] font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(204,255,0,0.3)] transition-all hover:scale-[1.01] active:scale-95"
              >
                <Flame className="w-4 h-4 fill-current text-[#0A0A0C]" />
                <span>Launch Flare & Open Squad Lobby ({activeQuest.durationMinutes}m)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex-1 py-2.5 rounded-xl bg-green-500/20 border border-green-500/40 text-[#CCFF00] font-mono font-bold text-xs flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                <span>Flare Dropped in Feed! Squad Ready on Radar</span>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
