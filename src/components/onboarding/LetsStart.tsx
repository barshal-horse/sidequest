'use client';

import React, { useState } from 'react';
import { useSideQuestStore } from '@/lib/store';
import { METRO_CITIES } from '@/lib/constants';
import { 
  Zap, 
  Flame, 
  MapPin, 
  Users, 
  Compass, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Coffee,
  MessageSquare
} from 'lucide-react';
import { playCheckInChime, playRadarBlip, playGlideWhoosh } from '@/lib/audio';
import { trackEvent } from '@/lib/analytics';
import confetti from 'canvas-confetti';

interface LetsStartProps {
  onStart: () => void;
}

export default function LetsStart({ onStart }: LetsStartProps) {
  const { 
    selectedCity, 
    setSelectedCity, 
    setHasCompletedOnboarding,
    setActiveTab,
    setCreateSheetOpen
  } = useSideQuestStore();

  const [step, setStep] = useState<number>(0);

  const handleCitySelect = (cityId: string) => {
    playRadarBlip();
    setSelectedCity(cityId);
  };

  const handleEnterApp = (intent: 'explore' | 'drop_flare') => {
    playCheckInChime();
    setHasCompletedOnboarding(true);
    
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#CCFF00', '#00F0FF', '#FFFFFF']
    });

    trackEvent('onboarding_completed', {
      city: selectedCity.name,
      intent
    });

    if (intent === 'drop_flare') {
      setActiveTab('radar');
      setCreateSheetOpen(true);
    } else {
      setActiveTab('radar');
    }

    onStart();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070709] text-[#F4F4F6] overflow-y-auto px-4 py-8 select-none">
      
      {/* Background Cyber Ambient Glow & Radar Circles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-30">
        <div className="w-[800px] h-[800px] rounded-full border border-[#CCFF00]/10 animate-pulse" />
        <div className="absolute w-[500px] h-[500px] rounded-full border border-[#00F0FF]/15" />
        <div className="absolute w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle_at_center,rgba(204,255,0,0.12)_0%,transparent_70%)]" />
      </div>

      <div className="relative z-10 w-full max-w-xl bg-[#0E0E12] border border-[#24242B] rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.9)] space-y-6 animate-fade-in backdrop-blur-xl">
        
        {/* Brand Badge */}
        <div className="flex items-center justify-between border-b border-[#1E1E26] pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#CCFF00] animate-ping" />
            <span className="font-mono text-xs font-black tracking-widest text-[#CCFF00] uppercase">
              SIDEQUEST // PROTOCOL v1.0
            </span>
          </div>
          <span className="text-[11px] font-mono text-[#8E8E9F] bg-[#141418] px-2.5 py-1 rounded-full border border-[#24242B]">
            Zero-Bullshit Guide
          </span>
        </div>

        {/* Hero Headline */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#F4F4F6] leading-tight">
            Stop waiting in dead WhatsApp groups. <br />
            <span className="text-[#CCFF00]">Meet up IRL right now.</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#8E8E9F] font-mono leading-relaxed">
            SideQuest is an acoustic radar for spontaneous meetups in Indian metros. No endless texting, no fake plans, no awkward bios.
          </p>
        </div>

        {/* 3 Core Rules (The "How It Works" No-BS Breakdown) */}
        <div className="grid grid-cols-1 gap-3 font-mono">
          
          {/* Card 1: Flares */}
          <div className="p-3.5 rounded-2xl bg-[#141418] border border-[#24242B] hover:border-[#CCFF00]/40 transition-all flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex items-center justify-center shrink-0 text-[#CCFF00]">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#F4F4F6]">1. Flares Expire in 60 Mins</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#FF0055]/15 text-[#FF0055] font-bold">URGENT</span>
              </div>
              <p className="text-[11px] text-[#8E8E9F] leading-snug">
                Someone drops a plan (e.g. <em>"Midnight Chai at Sony Signal"</em> or <em>"Badminton 2v2 at Playo"</em>). It disappears when time runs out.
              </p>
            </div>
          </div>

          {/* Card 2: Micro-Squads */}
          <div className="p-3.5 rounded-2xl bg-[#141418] border border-[#24242B] hover:border-[#00F0FF]/40 transition-all flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center shrink-0 text-[#00F0FF]">
              <Users className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#F4F4F6]">2. Small Squads Only (2 to 4 People)</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#00F0FF]/15 text-[#00F0FF] font-bold">NO CROWDS</span>
              </div>
              <p className="text-[11px] text-[#8E8E9F] leading-snug">
                Capped slots prevent awkward chaotic crowds. Tap <em>"Claim Slot"</em>, jump in the live lobby chat, and assemble.
              </p>
            </div>
          </div>

          {/* Card 3: Anti-Flake Karma */}
          <div className="p-3.5 rounded-2xl bg-[#141418] border border-[#24242B] hover:border-[#FF007A]/40 transition-all flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-[#FF007A]/10 border border-[#FF007A]/30 flex items-center justify-center shrink-0 text-[#FF007A]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#F4F4F6]">3. GPS Check-In & Anti-Flake Karma</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#CCFF00]/15 text-[#CCFF00] font-bold">+10 KARMA</span>
              </div>
              <p className="text-[11px] text-[#8E8E9F] leading-snug">
                Verify live presence within 500m of the venue via GPS or Host QR. Flakers lose score; verified hosts get prioritized.
              </p>
            </div>
          </div>

        </div>

        {/* City Selector */}
        <div className="space-y-2 pt-1">
          <label className="block text-[11px] font-mono text-[#8E8E9F] uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#CCFF00]" /> WHERE ARE YOU RIGHT NOW?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {METRO_CITIES.map(city => {
              const isSelected = selectedCity.id === city.id;
              return (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => handleCitySelect(city.id)}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-mono transition-all text-center ${
                    isSelected
                      ? 'border-[#CCFF00] bg-[#CCFF00]/15 text-[#CCFF00] font-bold shadow-[0_0_12px_rgba(204,255,0,0.25)]'
                      : 'border-[#24242B] bg-[#141418] text-[#8E8E9F] hover:text-[#F4F4F6] hover:border-[#383842]'
                  }`}
                >
                  {city.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* CTA Launch Buttons */}
        <div className="pt-3 space-y-2.5">
          <button
            type="button"
            onClick={() => handleEnterApp('explore')}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A0A0C] font-mono font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(204,255,0,0.35)] transition-all hover:scale-[1.01]"
          >
            <span>ENTER RADAR ({selectedCity.name})</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-between text-[11px] font-mono text-[#8E8E9F] px-1">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#CCFF00]" /> 100% Free • No Sign-Up Barrier
            </span>
            <button
              type="button"
              onClick={() => handleEnterApp('drop_flare')}
              className="text-[#CCFF00] hover:underline font-bold flex items-center gap-1"
            >
              <span>Have a plan right now? Drop a Flare ⚡</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
