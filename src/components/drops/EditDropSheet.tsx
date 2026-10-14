'use client';

import React, { useState, useEffect } from 'react';
import { useSideQuestStore } from '@/lib/store';
import { DropCategory } from '@/types';
import { X, Sparkles, Users, MapPin, Coffee, Dumbbell, Laptop, Ticket, Clock, Check, Shield } from 'lucide-react';
import { playCheckInChime, playRadarBlip } from '@/lib/audio';
import { trackEvent } from '@/lib/analytics';

export default function EditDropSheet() {
  const {
    editingDrop,
    isEditDialogOpen,
    setEditingDrop,
    updateDrop,
    selectedCity,
    currentUser
  } = useSideQuestStore();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DropCategory>('CHAI_FOOD');
  const [venueName, setVenueName] = useState('');
  const [maxSlots, setMaxSlots] = useState(4);
  const [isGirlsOnly, setIsGirlsOnly] = useState(false);
  const [extendMins, setExtendMins] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingDrop) {
      setTitle(editingDrop.title);
      setCategory(editingDrop.category);
      setVenueName(editingDrop.venueName);
      setMaxSlots(editingDrop.maxSlots);
      setIsGirlsOnly(editingDrop.isGirlsOnly);
      setExtendMins(0);
    }
  }, [editingDrop]);

  if (!isEditDialogOpen || !editingDrop) return null;

  const minSlots = editingDrop.members.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !venueName.trim()) return;

    setIsSubmitting(true);

    let newExpiresAt = editingDrop.expiresAt;
    if (extendMins > 0) {
      const currentExpiry = new Date(editingDrop.expiresAt).getTime();
      const baseTime = Math.max(Date.now(), currentExpiry);
      newExpiresAt = new Date(baseTime + extendMins * 60 * 1000).toISOString();
    }

    const success = updateDrop(editingDrop.id, {
      title: title.trim(),
      category,
      venueName: venueName.trim(),
      maxSlots,
      isGirlsOnly,
      expiresAt: newExpiresAt,
      tags: [category.replace('_', ' '), selectedCity.name]
    });

    setIsSubmitting(false);

    if (success) {
      playCheckInChime();
      trackEvent('flare_created', {
        action: 'edited',
        dropId: editingDrop.id,
        category,
        title: title.trim()
      });
      setEditingDrop(null);
    }
  };

  const categories: { id: DropCategory; label: string; icon: typeof Coffee }[] = [
    { id: 'CHAI_FOOD', label: 'Chai & Food', icon: Coffee },
    { id: 'SPORTS', label: 'Sports & Turf', icon: Dumbbell },
    { id: 'COWORK_DEV', label: 'Cowork / Dev', icon: Laptop },
    { id: 'GIGS_CULTURE', label: 'Gigs & Culture', icon: Ticket }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-t-2xl sm:rounded-2xl bg-[#0E0E12] border border-[#24242B] shadow-2xl p-5 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#24242B] flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] animate-pulse" />
            <h3 className="text-sm font-mono font-bold text-[#F4F4F6] uppercase tracking-wider">
              Edit Flare Details
            </h3>
          </div>
          <button
            onClick={() => setEditingDrop(null)}
            className="p-1.5 text-[#8E8E9F] hover:text-[#F4F4F6] rounded-lg hover:bg-[#1B1B22] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 overflow-y-auto flex-1 pr-1 font-mono">
          
          {/* Title */}
          <div>
            <label className="block text-xs text-[#8E8E9F] mb-1 font-bold">
              PLAN TITLE
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 3am Chai & Chill"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141418] border border-[#24242B] text-sm text-[#F4F4F6] placeholder-[#8E8E9F]/60 focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] transition-all"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs text-[#8E8E9F] mb-1.5 font-bold">
              CATEGORY VIBE
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      playRadarBlip();
                      setCategory(cat.id);
                    }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all text-left ${
                      isSelected
                        ? 'border-[#00F0FF] bg-[#00F0FF]/15 text-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                        : 'border-[#24242B] bg-[#141418] text-[#8E8E9F] hover:text-[#F4F4F6] hover:border-[#8E8E9F]'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Venue Name */}
          <div>
            <label className="block text-xs text-[#8E8E9F] mb-1 font-bold">
              VENUE / MEETUP SPOT
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-[#00F0FF]" />
              <input
                type="text"
                required
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                placeholder="e.g. Chai Point, 5th Block Koramangala"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#141418] border border-[#24242B] text-sm text-[#F4F4F6] focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] transition-all"
              />
            </div>
          </div>

          {/* Max Capacity Slots */}
          <div>
            <div className="flex items-center justify-between mb-1.5 text-xs">
              <span className="text-[#8E8E9F] font-bold">SQUAD CAPACITY</span>
              <span className="text-[#00F0FF] font-bold">{maxSlots} Spots ({minSlots} Joined)</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[2, 3, 4, 6].map((num) => {
                const disabled = num < minSlots;
                const isSelected = maxSlots === num;
                return (
                  <button
                    key={num}
                    type="button"
                    disabled={disabled}
                    onClick={() => setMaxSlots(num)}
                    className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                      disabled
                        ? 'border-[#24242B]/40 bg-[#141418]/40 text-[#8E8E9F]/40 cursor-not-allowed'
                        : isSelected
                        ? 'border-[#00F0FF] bg-[#00F0FF]/15 text-[#00F0FF]'
                        : 'border-[#24242B] bg-[#141418] text-[#8E8E9F] hover:text-[#F4F4F6]'
                    }`}
                  >
                    {num} People
                  </button>
                );
              })}
            </div>
            {minSlots > 2 && (
              <p className="text-[10px] text-[#8E8E9F] mt-1">
                * Cannot reduce capacity below current squad size ({minSlots} members).
              </p>
            )}
          </div>

          {/* Extend Timer */}
          <div>
            <label className="block text-xs text-[#8E8E9F] mb-1.5 font-bold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#00F0FF]" /> EXTEND SELF-DESTRUCT TIMER
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { mins: 0, label: 'No Change' },
                { mins: 30, label: '+30 Mins' },
                { mins: 60, label: '+60 Mins' }
              ].map((opt) => (
                <button
                  key={opt.mins}
                  type="button"
                  onClick={() => setExtendMins(opt.mins)}
                  className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                    extendMins === opt.mins
                      ? 'border-[#00F0FF] bg-[#00F0FF]/15 text-[#00F0FF]'
                      : 'border-[#24242B] bg-[#141418] text-[#8E8E9F] hover:text-[#F4F4F6]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Girls Only Safety Gate (Only if user is female or already girls only) */}
          {(currentUser.gender === 'F' || editingDrop.isGirlsOnly) && (
            <div className="p-3 rounded-xl bg-[#FF007A]/10 border border-[#FF007A]/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#FF007A]" />
                <div>
                  <span className="text-xs font-bold text-[#FF007A] block">Girls-Only Lobby</span>
                  <span className="text-[10px] text-[#8E8E9F] block">Restrict joins exclusively to verified women</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isGirlsOnly}
                onChange={(e) => setIsGirlsOnly(e.target.checked)}
                className="w-4 h-4 accent-[#FF007A] rounded cursor-pointer"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setEditingDrop(null)}
              className="flex-1 py-3 rounded-xl border border-[#24242B] bg-[#141418] text-xs font-bold text-[#8E8E9F] hover:text-white hover:bg-[#1B1B22] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !venueName.trim()}
              className="flex-1 py-3 rounded-xl bg-[#00F0FF] text-[#0A0A0C] text-xs font-bold hover:bg-[#00cbe0] transition-colors flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(0,240,255,0.3)] disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              Save Updates
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
