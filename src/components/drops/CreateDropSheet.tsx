'use client';

import React, { useState, useEffect } from 'react';
import { useSideQuestStore } from '@/lib/store';
import { DropCategory } from '@/types';
import { X, Zap, Clock, Users, Shield, MapPin, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playCheckInChime } from '@/lib/audio';

export default function CreateDropSheet() {
  const { 
    isCreateSheetOpen, 
    setCreateSheetOpen, 
    selectedCity, 
    createDrop, 
    currentUser,
    userLocation 
  } = useSideQuestStore();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DropCategory>('CHAI_FOOD');
  const [hotspotId, setHotspotId] = useState(selectedCity.hotspots[0]?.id || '');
  const [venueName, setVenueName] = useState('');
  const [maxSlots, setMaxSlots] = useState(4);
  const [durationMins, setDurationMins] = useState(90);
  const [isGirlsOnly, setIsGirlsOnly] = useState(false);

  useEffect(() => {
    if (selectedCity.hotspots.length > 0 && !selectedCity.hotspots.some(h => h.id === hotspotId) && hotspotId !== 'user_pin') {
      setHotspotId(selectedCity.hotspots[0].id);
    }
  }, [selectedCity, hotspotId]);

  if (!isCreateSheetOpen) return null;

  const isUsingUserPin = hotspotId === 'user_pin' && !!userLocation;
  const currentHotspot = isUsingUserPin 
    ? { id: 'user_pin', name: userLocation.addressName || 'Current Radar Pin', lat: userLocation.lat, lng: userLocation.lng }
    : (selectedCity.hotspots.find(h => h.id === hotspotId) || selectedCity.hotspots[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !venueName.trim()) return;

    createDrop({
      title: title.trim(),
      category,
      cityId: selectedCity.id,
      hotspotName: currentHotspot.name,
      venueName: venueName.trim(),
      lat: currentHotspot.lat,
      lng: currentHotspot.lng,
      host: currentUser,
      maxSlots,
      isGirlsOnly,
      expiresAt: new Date(Date.now() + durationMins * 60 * 1000).toISOString(),
      tags: [category.replace('_', ' '), selectedCity.name],
      aiVibeNote: `High-energy spontaneous squad in ${selectedCity.name}. Gather at ${venueName} before timer expires!`
    });

    playCheckInChime();

    confetti({
      particleCount: 60,
      spread: 60,
      colors: ['#CCFF00', '#FFFFFF']
    });

    // Reset form fields & close sheet cleanly
    setTitle('');
    setVenueName('');
    setCreateSheetOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-t-2xl sm:rounded-2xl bg-[#0E0E12] border border-[#24242B] shadow-2xl p-5 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#24242B]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#CCFF00] animate-ping" />
            <h3 className="text-sm font-mono font-bold text-[#F4F4F6] uppercase tracking-wider">
              ⚡ Drop a Flare ({selectedCity.name})
            </h3>
          </div>
          <button onClick={() => setCreateSheetOpen(false)} className="p-1 text-[#8E8E9F] hover:text-[#F4F4F6]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-mono text-[#8E8E9F] mb-1">
              WHAT'S THE PLAN?
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Midnight Chai & Maggi run / Badminton 2v2"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141418] border border-[#24242B] focus:border-[#CCFF00] text-sm text-[#F4F4F6] outline-none font-mono"
            />
          </div>

          {/* Category Picker */}
          <div>
            <label className="block text-xs font-mono text-[#8E8E9F] mb-1.5">CATEGORY</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCategory('CHAI_FOOD')}
                className={`p-2.5 rounded-xl border text-xs font-mono text-left flex items-center gap-2 transition-all ${
                  category === 'CHAI_FOOD' ? 'border-[#CCFF00] bg-[#CCFF00]/10 text-[#CCFF00]' : 'border-[#24242B] bg-[#141418] text-[#8E8E9F]'
                }`}
              >
                <span>🧋</span> Chai & Food
              </button>
              <button
                type="button"
                onClick={() => setCategory('SPORTS')}
                className={`p-2.5 rounded-xl border text-xs font-mono text-left flex items-center gap-2 transition-all ${
                  category === 'SPORTS' ? 'border-[#CCFF00] bg-[#CCFF00]/10 text-[#CCFF00]' : 'border-[#24242B] bg-[#141418] text-[#8E8E9F]'
                }`}
              >
                <span>🏸</span> Sports & Fitness
              </button>
              <button
                type="button"
                onClick={() => setCategory('COWORK_DEV')}
                className={`p-2.5 rounded-xl border text-xs font-mono text-left flex items-center gap-2 transition-all ${
                  category === 'COWORK_DEV' ? 'border-[#CCFF00] bg-[#CCFF00]/10 text-[#CCFF00]' : 'border-[#24242B] bg-[#141418] text-[#8E8E9F]'
                }`}
              >
                <span>💻</span> Dev & Cowork
              </button>
              <button
                type="button"
                onClick={() => setCategory('GIGS_CULTURE')}
                className={`p-2.5 rounded-xl border text-xs font-mono text-left flex items-center gap-2 transition-all ${
                  category === 'GIGS_CULTURE' ? 'border-[#CCFF00] bg-[#CCFF00]/10 text-[#CCFF00]' : 'border-[#24242B] bg-[#141418] text-[#8E8E9F]'
                }`}
              >
                <span>🎭</span> Gigs & Culture
              </button>
            </div>
          </div>

          {/* Hotspot & Venue Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-[#8E8E9F] mb-1">HOTSPOT ZONE</label>
              <select
                value={hotspotId}
                onChange={e => setHotspotId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#141418] border border-[#24242B] focus:border-[#CCFF00] text-xs text-[#F4F4F6] outline-none font-mono"
              >
                {userLocation && (
                  <option value="user_pin" className="bg-[#141418] text-[#CCFF00]">
                    📍 My Radar Pin ({userLocation.addressName || 'Live GPS'})
                  </option>
                )}
                {selectedCity.hotspots.map(h => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#8E8E9F] mb-1">PUBLIC VENUE / SPOT</label>
              <input
                type="text"
                required
                placeholder="e.g. Third Wave Coffee / Gate 2 Stall"
                value={venueName}
                onChange={e => setVenueName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#141418] border border-[#24242B] focus:border-[#CCFF00] text-xs text-[#F4F4F6] outline-none font-mono"
              />
            </div>
          </div>

          {/* Slots & Timer Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-[#8E8E9F] mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#CCFF00]" /> SQUAD CAPACITY
              </label>
              <div className="flex items-center gap-1.5">
                {[2, 3, 4, 6].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setMaxSlots(num)}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-mono font-bold ${
                      maxSlots === num ? 'border-[#CCFF00] bg-[#CCFF00] text-[#0A0A0C]' : 'border-[#24242B] bg-[#141418] text-[#8E8E9F]'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#8E8E9F] mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#FF0055]" /> WINDOW EXPIRY
              </label>
              <div className="flex items-center gap-1.5">
                {[45, 60, 90, 120].map(mins => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDurationMins(mins)}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-mono font-bold ${
                      durationMins === mins ? 'border-[#FF0055] bg-[#FF0055]/20 text-[#FF0055]' : 'border-[#24242B] bg-[#141418] text-[#8E8E9F]'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Girls Only Toggle */}
          <div className="p-3 rounded-xl bg-[#141418] border border-[#24242B] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">🌸</span>
              <div>
                <span className="text-xs font-mono font-bold text-[#F4F4F6]">Girls-Only Lobby</span>
                <p className="text-[10px] text-[#8E8E9F]">Only verified female profiles can join</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsGirlsOnly(!isGirlsOnly)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                isGirlsOnly ? 'bg-[#FF007A]' : 'bg-[#24242B]'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                isGirlsOnly ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A0A0C] font-mono font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(204,255,0,0.35)] transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 fill-current" /> FIRE THE FLARE (BROADCAST PLAN)
          </button>
        </form>

      </div>
    </div>
  );
}
