'use client';

import React, { useState } from 'react';
import { useSideQuestStore } from '@/lib/store';
import { ScrapbookMemory } from '@/types';
import { 
  X, Sparkles, Heart, Plus, Camera, MapPin, Calendar, Users, RotateCw, Share2, Check, Tag 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playCheckInChime, playRadarBlip } from '@/lib/audio';

const PHOTO_PRESETS = [
  {
    name: 'Midnight Chai Stalls',
    url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&auto=format&fit=crop&q=80',
    tag: '🧋 3am Chai Runs'
  },
  {
    name: 'Turf Badminton Smash',
    url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&auto=format&fit=crop&q=80',
    tag: '🎾 Turf Badminton 2v2'
  },
  {
    name: 'Promenade Sunset Walk',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    tag: '📸 35mm Film Photography'
  },
  {
    name: 'Rooftop Vibe Coding',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80',
    tag: '💻 Vibe Coding & Shippers'
  },
  {
    name: 'Matcha & Thrift Stroll',
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
    tag: '🍵 Iced Matcha Lattes'
  }
];

export default function ScrapbookModal() {
  const { 
    isScrapbookModalOpen, 
    setScrapbookModalOpen, 
    currentUser, 
    addScrapbookMemory, 
    likeScrapbookMemory,
    selectedCity 
  } = useSideQuestStore();

  const [activeTab, setActiveTab] = useState<'gallery' | 'add'>('gallery');
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Add Memory Form State
  const [title, setTitle] = useState('');
  const [selectedPresetUrl, setSelectedPresetUrl] = useState(PHOTO_PRESETS[0].url);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [locationName, setLocationName] = useState('');
  const [caption, setCaption] = useState('');
  const [vibeTag, setVibeTag] = useState(PHOTO_PRESETS[0].tag);
  const [notes, setNotes] = useState('');

  if (!isScrapbookModalOpen) return null;

  const memories: ScrapbookMemory[] = currentUser.scrapbookMemories && currentUser.scrapbookMemories.length > 0
    ? currentUser.scrapbookMemories
    : [];

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playRadarBlip();
    likeScrapbookMemory(id);
    confetti({
      particleCount: 25,
      spread: 50,
      colors: ['#FF007A', '#CCFF00', '#00F0FF']
    });
  };

  const handleToggleFlip = (id: string) => {
    playRadarBlip();
    setFlippedCardId(prev => prev === id ? null : id);
  };

  const handleCopyShare = (memory: ScrapbookMemory, e: React.MouseEvent) => {
    e.stopPropagation();
    playRadarBlip();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`Polaroid Memory from SideQuest: "${memory.title}" in ${memory.cityName} with squad @${memory.squadMembers.map(m => m.handle).join(', @')}!`);
      setCopiedId(memory.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !locationName.trim()) return;

    const photoUrl = customPhotoUrl.trim() || selectedPresetUrl;
    
    addScrapbookMemory({
      title: title.trim(),
      photoUrl,
      locationName: locationName.trim(),
      cityName: selectedCity.name,
      date: 'Just now • Verified Meetup',
      squadMembers: [
        { handle: currentUser.handle, avatarUrl: currentUser.avatarUrl }
      ],
      caption: caption.trim() || 'Spontaneous IRL sidequest cleared with the squad!',
      vibeTag,
      notes: notes.trim() ? `Signed: "${notes.trim()}" - @${currentUser.handle}` : undefined
    });

    confetti({
      particleCount: 50,
      spread: 70,
      colors: ['#CCFF00', '#00F0FF', '#FF007A']
    });
    playCheckInChime();

    // Reset Form
    setTitle('');
    setLocationName('');
    setCaption('');
    setNotes('');
    setCustomPhotoUrl('');
    setActiveTab('gallery');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-[#0E0E12] border border-[#24242B] shadow-2xl p-5 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#24242B]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] animate-pulse" />
            <div>
              <h3 className="text-xs font-mono font-bold text-[#F4F4F6] uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#00F0FF]" /> IRL MEMORY SCRAPBOOK
              </h3>
              <p className="text-[10px] font-mono text-[#8E8E9F]">
                Verified Polaroid Roll • {memories.length} Quests Preserved
              </p>
            </div>
          </div>
          <button 
            onClick={() => setScrapbookModalOpen(false)}
            className="p-1 rounded-lg text-[#8E8E9F] hover:text-[#F4F4F6] hover:bg-[#1B1B22] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#141418] border border-[#24242B] text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab('gallery')}
            className={`py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'gallery'
                ? 'bg-[#00F0FF] text-[#0A0A0C] shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                : 'text-[#8E8E9F] hover:text-[#F4F4F6]'
            }`}
          >
            📸 Polaroid Album ({memories.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('add')}
            className={`py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'add'
                ? 'bg-[#CCFF00] text-[#0A0A0C] shadow-[0_0_12px_rgba(204,255,0,0.3)]'
                : 'text-[#8E8E9F] hover:text-[#F4F4F6]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> Add New Memory
          </button>
        </div>

        {/* TAB 1: GALLERY */}
        {activeTab === 'gallery' && (
          <div className="space-y-4">
            {memories.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-[#141418] border border-[#24242B] space-y-2">
                <span className="text-3xl block">📷</span>
                <p className="text-xs font-mono font-bold text-[#F4F4F6]">No memories in your scrapbook yet.</p>
                <p className="text-[11px] font-mono text-[#8E8E9F]">
                  Complete meetups with your squad or add your first polaroid dump now!
                </p>
                <button
                  onClick={() => setActiveTab('add')}
                  className="mt-3 px-3 py-1.5 rounded-xl bg-[#CCFF00] text-[#0A0A0C] text-xs font-mono font-bold inline-flex items-center gap-1 shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" /> Add First Polaroid
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {memories.map((memory, index) => {
                  const isFlipped = flippedCardId === memory.id;
                  const rotationClass = index % 2 === 0 ? '-rotate-1 hover:rotate-0' : 'rotate-1 hover:rotate-0';

                  return (
                    <div 
                      key={memory.id}
                      className={`relative bg-[#FFFFFF] rounded-2xl p-3 sm:p-4 text-[#141418] shadow-2xl transition-all duration-300 transform ${rotationClass} border-4 border-[#FFFFFF]`}
                    >
                      {/* Translucent Washi Tape Effect at Top Center */}
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-16 h-5 bg-[#CCFF00]/60 backdrop-blur-sm border border-[#CCFF00]/40 -rotate-2 rounded-xs shadow-sm z-10 pointer-events-none" />

                      {!isFlipped ? (
                        /* FRONT OF POLAROID */
                        <div className="space-y-2.5">
                          {/* Photo with film sheen */}
                          <div className="relative rounded-xl overflow-hidden bg-[#0A0A0C] aspect-video sm:aspect-[4/3]">
                            <img 
                              src={memory.photoUrl} 
                              alt={memory.title}
                              className="w-full h-full object-cover" 
                            />
                            <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-mono text-[#00F0FF] border border-[#00F0FF]/40">
                              {memory.vibeTag}
                            </div>
                            <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-mono text-[#F4F4F6]">
                              {memory.cityName}
                            </div>
                          </div>

                          {/* Polaroid Bottom Caption Area */}
                          <div className="pt-1 space-y-1.5 font-mono">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-bold text-[#0A0A0C] tracking-tight">
                                {memory.title}
                              </h4>
                              <span className="text-[10px] text-[#606070] flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {memory.date}
                              </span>
                            </div>

                            <p className="text-xs text-[#2A2A35] italic leading-relaxed">
                              "{memory.caption}"
                            </p>

                            <div className="flex items-center justify-between pt-2 border-t border-[#E0E0E6]">
                              {/* Location & Squad Avatars */}
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-[#606070] flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-[#FF007A]" /> {memory.locationName}
                                </span>
                                <div className="flex items-center -space-x-1.5">
                                  {memory.squadMembers.map((m, idx) => (
                                    <img 
                                      key={idx}
                                      src={m.avatarUrl} 
                                      alt={m.handle}
                                      title={`@${m.handle}`}
                                      className="w-5 h-5 rounded-full border border-white object-cover" 
                                    />
                                  ))}
                                </div>
                              </div>

                              {/* Interactive Actions */}
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={(e) => handleLike(memory.id, e)}
                                  className="px-2 py-1 rounded-lg bg-[#F0F0F5] hover:bg-[#FFE5EE] text-[#FF007A] text-xs font-bold flex items-center gap-1 transition-colors"
                                  title="Leave love on polaroid"
                                >
                                  <Heart className="w-3.5 h-3.5 fill-current" />
                                  <span>{memory.likes}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => handleCopyShare(memory, e)}
                                  className="p-1.5 rounded-lg bg-[#F0F0F5] hover:bg-[#E5F9FF] text-[#0A0A0C] transition-colors"
                                  title="Share memory"
                                >
                                  {copiedId === memory.id ? (
                                    <Check className="w-3.5 h-3.5 text-green-600" />
                                  ) : (
                                    <Share2 className="w-3.5 h-3.5" />
                                  )}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleToggleFlip(memory.id)}
                                  className="px-2 py-1 rounded-lg bg-[#0A0A0C] text-[#CCFF00] text-[10px] font-bold flex items-center gap-1 hover:bg-[#202025] transition-colors"
                                  title="Flip to back notes"
                                >
                                  <RotateCw className="w-3 h-3" /> Flip
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* BACK OF POLAROID (Guestbook & Handwritten Notes) */
                        <div className="p-4 bg-[#F8F8FC] rounded-xl min-h-[220px] flex flex-col justify-between font-mono space-y-3">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between border-b border-[#D8D8E0] pb-1.5">
                              <span className="text-[11px] font-bold text-[#0A0A0C] flex items-center gap-1">
                                ✍️ SQUAD SIGNATURES & NOTES
                              </span>
                              <span className="text-[10px] text-[#808090]">{memory.cityName}</span>
                            </div>

                            <p className="text-xs text-[#303040] leading-relaxed italic bg-white/70 p-3 rounded-lg border border-[#E0E0E8]">
                              {memory.notes || `"Verified IRL meetup. Signed off by all ${memory.squadMembers.length} squad members with zero flakes!"`}
                            </p>

                            <div className="pt-2">
                              <span className="text-[10px] text-[#808090] block mb-1">VERIFIED EXPLORERS:</span>
                              <div className="flex flex-wrap gap-1">
                                {memory.squadMembers.map((m, idx) => (
                                  <span key={idx} className="px-2 py-0.5 rounded-full bg-black text-[#CCFF00] text-[10px] font-bold">
                                    @{m.handle}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end pt-2 border-t border-[#D8D8E0]">
                            <button
                              type="button"
                              onClick={() => handleToggleFlip(memory.id)}
                              className="px-2.5 py-1 rounded-lg bg-[#0A0A0C] text-white text-[10px] font-bold flex items-center gap-1 hover:bg-[#252530]"
                            >
                              <RotateCw className="w-3 h-3" /> View Photo
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ADD NEW POLAROID MEMORY */}
        {activeTab === 'add' && (
          <form onSubmit={handleAddMemory} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-mono text-[#8E8E9F] mb-1">
                MEETUP TITLE
              </label>
              <input
                type="text"
                placeholder="e.g. 2v2 Turf Badminton Clash or 3am Chai @ Sanjay"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-[#141418] border border-[#24242B] focus:border-[#00F0FF] text-xs text-[#F4F4F6] font-mono outline-none"
              />
            </div>

            {/* Aesthetic Photo Preset Selector */}
            <div>
              <label className="block text-[11px] font-mono text-[#8E8E9F] mb-1.5 flex items-center justify-between">
                <span>CHOOSE POLAROID PHOTO AESTHETIC</span>
                <span className="text-[10px] text-[#00F0FF]">Film Preset</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PHOTO_PRESETS.map((preset) => {
                  const isSelected = selectedPresetUrl === preset.url && !customPhotoUrl;
                  return (
                    <div
                      key={preset.name}
                      onClick={() => {
                        setSelectedPresetUrl(preset.url);
                        setCustomPhotoUrl('');
                        setVibeTag(preset.tag);
                      }}
                      className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all group ${
                        isSelected 
                          ? 'border-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.3)] scale-[1.02]' 
                          : 'border-[#24242B] hover:border-[#8E8E9F]'
                      }`}
                    >
                      <img 
                        src={preset.url} 
                        alt={preset.name} 
                        className="w-full h-16 object-cover" 
                      />
                      <div className="p-1 bg-[#141418] text-[9px] font-mono text-[#F4F4F6] truncate">
                        {preset.name}
                      </div>
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#00F0FF] text-[#0A0A0C] flex items-center justify-center font-bold text-[10px]">
                          ✓
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Photo URL Input */}
            <div>
              <label className="block text-[11px] font-mono text-[#8E8E9F] mb-1">
                OR PASTE CUSTOM IMAGE URL
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={customPhotoUrl}
                onChange={e => setCustomPhotoUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#141418] border border-[#24242B] focus:border-[#CCFF00] text-xs text-[#F4F4F6] font-mono outline-none"
              />
            </div>

            {/* Venue / Location */}
            <div>
              <label className="block text-[11px] font-mono text-[#8E8E9F] mb-1">
                VENUE & HOTSPOT LOCATION
              </label>
              <input
                type="text"
                placeholder="e.g. Play Arena Court 3, Koramangala 5th Block"
                value={locationName}
                onChange={e => setLocationName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-[#141418] border border-[#24242B] focus:border-[#00F0FF] text-xs text-[#F4F4F6] font-mono outline-none"
              />
            </div>

            {/* Caption */}
            <div>
              <label className="block text-[11px] font-mono text-[#8E8E9F] mb-1">
                MEMORABLE SQUAD CAPTION
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Best chai of the week, discussed side projects till 2am with the squad!"
                value={caption}
                onChange={e => setCaption(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#141418] border border-[#24242B] focus:border-[#00F0FF] text-xs text-[#F4F4F6] font-mono outline-none resize-none"
              />
            </div>

            {/* Handwritten Back Note */}
            <div>
              <label className="block text-[11px] font-mono text-[#8E8E9F] mb-1">
                BACK OF POLAROID GUESTBOOK NOTE (OPTIONAL)
              </label>
              <input
                type="text"
                placeholder="e.g. Next match Sunday • Filter coffee round on Harshal!"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#141418] border border-[#24242B] focus:border-[#CCFF00] text-xs text-[#F4F4F6] font-mono outline-none"
              />
            </div>

            {/* Submit */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A0A0C] font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(204,255,0,0.3)] transition-all"
              >
                <Sparkles className="w-4 h-4 fill-current text-[#0A0A0C]" />
                <span>Preserve Polaroid in Scrapbook</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('gallery')}
                className="py-2.5 px-4 rounded-xl bg-[#141418] hover:bg-[#1B1B22] border border-[#24242B] text-xs font-mono text-[#8E8E9F]"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
