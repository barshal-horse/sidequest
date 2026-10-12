'use client';

import React, { useState } from 'react';
import { useSideQuestStore } from '@/lib/store';
import { 
  X, ShieldCheck, Music, Award, Sparkles, Zap, MessageSquare, CheckCircle2, Flame 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playRadarBlip, playCheckInChime } from '@/lib/audio';

export default function MemberProfileModal() {
  const { 
    inspectedMember, 
    setInspectedMember, 
    currentUser, 
    setActiveDropId,
    setCreateSheetOpen,
    setActiveTab,
    drops 
  } = useSideQuestStore();

  const [pingSent, setPingSent] = useState(false);

  if (!inspectedMember) return null;

  // Calculate taste compatibility
  const sharedArtists = inspectedMember.spotifyTopArtists?.filter(a => 
    currentUser.spotifyTopArtists?.some(ca => ca.toLowerCase().includes(a.toLowerCase()) || a.toLowerCase().includes(ca.toLowerCase()))
  ) || [];

  const compatibility = inspectedMember.city === currentUser.city 
    ? (sharedArtists.length > 0 ? 98 : 94) 
    : 88;

  const handleStartQuestWithMember = () => {
    confetti({
      particleCount: 50,
      spread: 70,
      colors: ['#CCFF00', '#00F0FF']
    });
    playRadarBlip();
    setInspectedMember(null);
    setActiveTab('radar');
    setCreateSheetOpen(true);
  };

  const handleSendPing = () => {
    setPingSent(true);
    confetti({
      particleCount: 40,
      spread: 60,
      colors: ['#00F0FF', '#CCFF00']
    });
    playCheckInChime();
    setTimeout(() => {
      setInspectedMember(null);
      setPingSent(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-[#0E0E12] border border-[#24242B] shadow-2xl p-5 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#24242B]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] animate-pulse" />
            <h3 className="text-xs font-mono font-bold text-[#8E8E9F] uppercase tracking-wider">
              SQUAD MEMBER TASTE GRAPH
            </h3>
          </div>
          <button 
            onClick={() => setInspectedMember(null)}
            className="p-1 rounded-lg text-[#8E8E9F] hover:text-[#F4F4F6] hover:bg-[#1B1B22] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Member Profile Card */}
        <div className="p-4 rounded-2xl bg-[#141418] border border-[#24242B] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src={inspectedMember.avatarUrl} 
                alt={inspectedMember.fullName}
                className="w-14 h-14 rounded-full object-cover border-2 border-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.4)]"
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#00F0FF] border-2 border-[#0A0A0C]" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-bold text-[#F4F4F6] font-mono">@{inspectedMember.handle}</h2>
                <ShieldCheck className="w-4 h-4 text-[#00F0FF]" />
              </div>
              <p className="text-xs font-mono text-[#8E8E9F]">{inspectedMember.fullName} • {inspectedMember.city}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 font-bold">
                  VERIFIED SQUAD
                </span>
                <span className="text-[10px] font-mono text-[#8E8E9F]">
                  {inspectedMember.questsCompleted} Cleared
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-xl font-bold font-mono text-[#00F0FF]">{inspectedMember.karmaScore}</span>
            <span className="text-[9px] font-mono text-[#8E8E9F]">SHOW-UP KARMA</span>
            <span className="text-[9px] font-mono text-[#CCFF00] mt-0.5">0% FLAKE RATE</span>
          </div>
        </div>

        {/* Live IRL Availability */}
        {inspectedMember.liveStatus && (
          <div className="p-3 rounded-xl bg-[#141418] border border-[#24242B] flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#CCFF00] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#CCFF00]"></span>
            </span>
            <span className="text-xs font-mono text-[#8E8E9F]">STATUS:</span>
            <span className="text-xs font-mono font-bold text-[#F4F4F6]">{inspectedMember.liveStatus}</span>
          </div>
        )}

        {/* Hyperfixations & Vibe Tags */}
        {inspectedMember.vibeTags && inspectedMember.vibeTags.length > 0 && (
          <div className="p-3.5 rounded-xl bg-[#141418] border border-[#24242B] space-y-2">
            <span className="text-xs font-mono font-bold text-[#8E8E9F] uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#CCFF00]" /> CURRENT HYPERFIXATIONS
            </span>
            <div className="flex flex-wrap gap-1.5">
              {inspectedMember.vibeTags.map((tag, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg bg-[#1B1B22] border border-[#24242B] text-xs font-mono text-[#CCFF00]">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Compatibility Bar */}
        <div className="p-3 rounded-xl bg-[#141418] border border-[#00F0FF]/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#CCFF00]" />
            <span className="text-xs font-mono text-[#F4F4F6] font-bold">
              {compatibility}% Vibe Match with You
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#8E8E9F]">
            High Cultural Overlap
          </span>
        </div>

        {/* Audio Aura // Spotify */}
        <div className="p-4 rounded-xl bg-[#141418] border border-[#24242B] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#8E8E9F] flex items-center gap-1.5 font-bold">
              <Music className="w-3.5 h-3.5 text-[#1DB954]" /> AUDIO AURA
            </span>
            <span className="text-[#1DB954] text-[10px] font-bold">LIVE ON SPOTIFY</span>
          </div>

          <div className="text-xs font-mono text-[#F4F4F6] font-bold">
            {inspectedMember.currentRotation || 'Listening to underground electronics'}
          </div>

          {inspectedMember.spotifyTopArtists && (
            <div className="text-[11px] font-mono text-[#8E8E9F]">
              Top Artists: {inspectedMember.spotifyTopArtists.join(', ')}
            </div>
          )}

          {inspectedMember.audioAura && (
            <div className="inline-block px-2 py-0.5 rounded bg-[#1B1B22] border border-[#24242B] text-[10px] font-mono text-[#CCFF00]">
              {inspectedMember.audioAura}
            </div>
          )}
        </div>

        {/* Street Cred Badges */}
        {inspectedMember.badges && inspectedMember.badges.length > 0 && (
          <div className="p-4 rounded-xl bg-[#141418] border border-[#24242B] space-y-2">
            <span className="text-xs font-mono font-bold text-[#8E8E9F] uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#CCFF00]" /> STREET CRED BADGES
            </span>
            <div className="flex flex-wrap gap-1.5">
              {inspectedMember.badges.map((b, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg bg-[#1B1B22] border border-[#24242B] text-xs font-mono text-[#F4F4F6]">
                  {b}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Bio Manifesto */}
        {inspectedMember.bioManifesto && (
          <div className="p-4 rounded-xl bg-[#141418] border border-[#24242B]">
            <span className="text-[11px] font-mono text-[#8E8E9F] block mb-1">BIO / MANIFESTO</span>
            <p className="text-xs font-mono text-[#F4F4F6] leading-relaxed">
              "{inspectedMember.bioManifesto}"
            </p>
          </div>
        )}

        {/* Action CTAs */}
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={handleStartQuestWithMember}
            className="py-2.5 px-3 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A0A0C] font-mono font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_16px_rgba(204,255,0,0.3)] transition-all"
          >
            <Flame className="w-4 h-4 fill-current text-[#0A0A0C]" />
            <span>Drop Flare with @{inspectedMember.handle}</span>
          </button>

          <button
            onClick={handleSendPing}
            className={`py-2.5 px-3 rounded-xl font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              pingSent 
                ? 'bg-[#00F0FF] text-[#0A0A0C]' 
                : 'bg-[#141418] hover:bg-[#1B1B22] border border-[#00F0FF]/50 text-[#00F0FF]'
            }`}
          >
            {pingSent ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Vibe Wave Sent!</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Send Vibe Wave 👋</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
