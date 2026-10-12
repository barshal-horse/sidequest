'use client';

import React, { useState } from 'react';
import { useSideQuestStore } from '@/lib/store';
import { POPULAR_SPOTIFY_ROTATIONS } from '@/lib/constants';
import { X, Music, Check, Trash2, ExternalLink, Sparkles, Radio, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playCheckInChime, playRadarBlip } from '@/lib/audio';

export default function SpotifyConnectModal() {
  const { 
    isSpotifyModalOpen, 
    setSpotifyModalOpen, 
    currentUser, 
    connectSpotify, 
    disconnectSpotify 
  } = useSideQuestStore();

  const [customTrack, setCustomTrack] = useState('');
  const [selectedAura, setSelectedAura] = useState('Late-Night Lo-Fi / Electronic');
  const [activePreset, setActivePreset] = useState<string | null>(null);

  if (!isSpotifyModalOpen) return null;

  const handleSelectPreset = (preset: typeof POPULAR_SPOTIFY_ROTATIONS[0]) => {
    playRadarBlip();
    setActivePreset(preset.track);
    setCustomTrack(preset.track);
    setSelectedAura(preset.aura);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trackToSave = customTrack.trim() || activePreset || 'Fred again.. - adore u';
    connectSpotify(trackToSave, selectedAura);
    confetti({
      particleCount: 40,
      spread: 60,
      colors: ['#1DB954', '#00F0FF', '#CCFF00']
    });
    playCheckInChime();
  };

  const handleDisconnect = () => {
    playRadarBlip();
    disconnectSpotify();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-[#0E0E12] border border-[#24242B] shadow-2xl p-5 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#24242B]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1DB954] animate-pulse" />
            <h3 className="text-xs font-mono font-bold text-[#F4F4F6] uppercase tracking-wider flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-[#1DB954]" /> SPOTIFY AUDIO AURA
            </h3>
          </div>
          <button 
            onClick={() => setSpotifyModalOpen(false)}
            className="p-1 rounded-lg text-[#8E8E9F] hover:text-[#F4F4F6] hover:bg-[#1B1B22] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Optional Tag Banner */}
        <div className="p-3 rounded-xl bg-[#141418] border border-[#1DB954]/30 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-[#1DB954] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-[#1DB954]">100% OPTIONAL FEATURE</span>
              <span className="text-[9px] font-mono bg-[#1DB954]/10 text-[#1DB954] px-1.5 py-0.2 rounded border border-[#1DB954]/30">NO LOGIN REQUIRED</span>
            </div>
            <p className="text-[11px] font-mono text-[#8E8E9F] leading-relaxed">
              Show what you're streaming right now so squad members with similar music taste can vibe check you before meetups.
            </p>
          </div>
        </div>

        {/* Current Status if connected */}
        {currentUser.isSpotifyConnected && currentUser.currentRotation && (
          <div className="p-3.5 rounded-xl bg-[#141418] border border-[#24242B] space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#8E8E9F]">CURRENTLY STREAMING</span>
              <span className="text-[#1DB954] text-[10px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1DB954] animate-ping" /> LIVE
              </span>
            </div>
            <div className="text-xs font-mono font-bold text-[#F4F4F6] flex items-center justify-between">
              <span>{currentUser.currentRotation}</span>
              <a 
                href={`https://open.spotify.com/search/${encodeURIComponent(currentUser.currentRotation)}`}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-[#1DB954] hover:underline flex items-center gap-1"
              >
                <span>Listen</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="text-[10px] font-mono text-[#8E8E9F]">
              Aura: <span className="text-[#CCFF00]">{currentUser.audioAura || 'Late-Night Lo-Fi'}</span>
            </div>
            <button
              type="button"
              onClick={handleDisconnect}
              className="w-full mt-2 py-1.5 rounded-lg bg-[#FF007A]/10 hover:bg-[#FF007A]/20 border border-[#FF007A]/30 text-[#FF007A] text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Disconnect / Remove Music Rotation
            </button>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {/* Quick-Pick Gen Z Presets */}
          <div>
            <label className="block text-[11px] font-mono text-[#8E8E9F] mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Radio className="w-3 h-3 text-[#1DB954]" /> QUICK-PICK GEN Z ROTATIONS
              </span>
              <span className="text-[10px] text-[#8E8E9F]">1-Tap Set</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto p-1">
              {POPULAR_SPOTIFY_ROTATIONS.map((preset) => {
                const isSelected = activePreset === preset.track || customTrack === preset.track;
                return (
                  <button
                    key={preset.track}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2 rounded-xl text-left font-mono transition-all border flex items-center justify-between ${
                      isSelected
                        ? 'border-[#1DB954] bg-[#1DB954]/15 shadow-[0_0_12px_rgba(29,185,84,0.2)]'
                        : 'border-[#24242B] bg-[#141418] hover:border-[#1DB954]/50'
                    }`}
                  >
                    <div className="overflow-hidden pr-2">
                      <div className="text-xs font-bold text-[#F4F4F6] truncate">
                        {preset.track}
                      </div>
                      <div className="text-[9px] text-[#8E8E9F] flex items-center gap-1">
                        <span className="text-[#1DB954] font-bold">{preset.genre}</span>
                        <span>•</span>
                        <span className="truncate">{preset.aura.split(' / ')[0]}</span>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#1DB954] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Track Input */}
          <div>
            <label className="block text-[11px] font-mono text-[#8E8E9F] mb-1">
              OR ENTER ANY SONG / ARTIST / PLAYLIST
            </label>
            <input
              type="text"
              placeholder="e.g. Arijit Singh - Tum Hi Ho, or Arctic Monkeys - 505"
              value={customTrack}
              onChange={(e) => {
                setCustomTrack(e.target.value);
                setActivePreset(null);
              }}
              className="w-full px-3 py-2 rounded-xl bg-[#141418] border border-[#24242B] focus:border-[#1DB954] text-xs text-[#F4F4F6] font-mono outline-none"
            />
          </div>

          {/* Audio Aura Mood Selector */}
          <div>
            <label className="block text-[11px] font-mono text-[#8E8E9F] mb-1.5">
              CHOOSE AUDIO AURA MOOD
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Late-Night Lo-Fi / Electronic',
                'Matcha Jazz / Sunset Acoustic',
                'High-Tempo UK Garage / Coffee',
                'Indie Rock / Coastal Breeze',
                'High-BPM Cardio / Synth Pop',
                'Deep Focus Ambient / Coding'
              ].map((aura) => (
                <button
                  key={aura}
                  type="button"
                  onClick={() => setSelectedAura(aura)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all border ${
                    selectedAura === aura
                      ? 'border-[#CCFF00] bg-[#CCFF00] text-[#0A0A0C] font-bold'
                      : 'border-[#24242B] bg-[#141418] text-[#8E8E9F] hover:text-[#F4F4F6]'
                  }`}
                >
                  {aura}
                </button>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[#1DB954] hover:bg-[#1aa34a] text-[#0A0A0C] font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(29,185,84,0.3)] transition-all"
            >
              <Zap className="w-4 h-4 fill-current text-[#0A0A0C]" />
              <span>Link Spotify Rotation</span>
            </button>
            <button
              type="button"
              onClick={() => setSpotifyModalOpen(false)}
              className="py-2.5 px-4 rounded-xl bg-[#141418] hover:bg-[#1B1B22] border border-[#24242B] text-xs font-mono text-[#8E8E9F] transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
