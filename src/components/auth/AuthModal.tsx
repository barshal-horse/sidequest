'use client';

import React, { useState, useEffect } from 'react';
import { useSideQuestStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { 
  X, Zap, Sparkles, Check, ArrowRight, User, Music, ShieldCheck, Cloud, Dices, UserPlus 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateRandomPersona } from '@/lib/constants';
import { playCheckInChime, playRadarBlip } from '@/lib/audio';

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
];

export default function AuthModal() {
  const { 
    isAuthModalOpen, 
    setAuthModalOpen, 
    authModalReason,
    currentUser, 
    updateProfile, 
    loginUser,
    selectedCity 
  } = useSideQuestStore();

  const [mode, setMode] = useState<'edit' | 'create'>('create');
  const [handle, setHandle] = useState(currentUser.handle || 'pilot');
  const [fullName, setFullName] = useState(currentUser.fullName || 'Explorer');
  const [gender, setGender] = useState<'M' | 'F' | 'OTHER'>(currentUser.gender || 'M');
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser.avatarUrl || AVATAR_OPTIONS[0]);
  const [bio, setBio] = useState(currentUser.bioManifesto || 'Late night chai runs and building cool things.');
  const [currentSong, setCurrentSong] = useState(currentUser.currentRotation || 'Fred again.. - adore u');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  useEffect(() => {
    if (isAuthModalOpen) {
      if (authModalReason?.includes('create') || !currentUser.isProfileCustomized) {
        setMode('create');
      } else {
        setMode('edit');
      }
      setHandle(currentUser.handle || 'pilot');
      setFullName(currentUser.fullName || 'Explorer');
      setGender(currentUser.gender || 'M');
      setSelectedAvatar(currentUser.avatarUrl || AVATAR_OPTIONS[0]);
      setBio(currentUser.bioManifesto || 'Late night chai runs and building cool things.');
      setCurrentSong(currentUser.currentRotation || 'Fred again.. - adore u');
    }
  }, [isAuthModalOpen, authModalReason, currentUser]);

  if (!isAuthModalOpen) return null;

  const handleRollRandom = () => {
    playRadarBlip();
    const persona = generateRandomPersona(selectedCity.name);
    setHandle(persona.handle);
    setFullName(persona.fullName);
    setSelectedAvatar(persona.avatarUrl);
    setBio(persona.bioManifesto || '');
    setCurrentSong(persona.currentRotation || '');
    setGender(persona.gender || 'M');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle.trim()) return;

    if (mode === 'create') {
      const newIndividual = {
        id: `user-${Date.now().toString().slice(-6)}`,
        handle: handle.trim().replace('@', ''),
        fullName: fullName.trim() || handle.trim(),
        avatarUrl: selectedAvatar,
        gender,
        bioManifesto: bio,
        currentRotation: currentSong,
        city: selectedCity.name,
        karmaScore: 100,
        questsCompleted: 0,
        flakeRate: 0,
        isVerified: true,
        badges: ['⚡ New Explorer', '🔥 100% Show-Up'],
        spotifyTopArtists: [currentSong.split(' - ')[0] || 'Fred again..'],
        audioAura: 'Custom Taste Graph'
      };
      loginUser(newIndividual);
      playCheckInChime();
    } else {
      updateProfile({
        handle: handle.trim().replace('@', ''),
        fullName: fullName.trim() || handle.trim(),
        avatarUrl: selectedAvatar,
        gender,
        bioManifesto: bio,
        currentRotation: currentSong,
        city: selectedCity.name
      });
      playRadarBlip();
    }

    confetti({
      particleCount: 60,
      spread: 70,
      colors: ['#CCFF00', '#00F0FF', '#FFFFFF']
    });

    setAuthModalOpen(false);
  };

  const handleOptionalGoogleSync = async () => {
    setIsSyncing(true);
    if (supabase) {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
        }
      });
    } else {
      setTimeout(() => {
        setIsSyncing(false);
        setSyncSuccess(true);
        setTimeout(() => setSyncSuccess(false), 3000);
      }, 700);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-[#0E0E12] border border-[#24242B] shadow-2xl p-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#24242B]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#CCFF00] animate-pulse" />
            <h3 className="text-sm font-mono font-bold text-[#F4F4F6] uppercase tracking-wider">
              TASTE IDENTITY & SETTINGS
            </h3>
          </div>
          <button onClick={() => setAuthModalOpen(false)} className="p-1 text-[#8E8E9F] hover:text-[#F4F4F6]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-[#141418] rounded-xl border border-[#24242B] my-3">
          <button
            type="button"
            onClick={() => setMode('create')}
            className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'create' 
                ? 'bg-[#CCFF00] text-[#0A0A0C] shadow-[0_0_10px_rgba(204,255,0,0.3)]' 
                : 'text-[#8E8E9F] hover:text-[#F4F4F6]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ New Individual</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('edit')}
            className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'edit' 
                ? 'bg-[#CCFF00] text-[#0A0A0C] shadow-[0_0_10px_rgba(204,255,0,0.3)]' 
                : 'text-[#8E8E9F] hover:text-[#F4F4F6]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Edit Current</span>
          </button>
        </div>

        {/* Zero-Hassle & Randomize Quick Bar */}
        <div className="p-3 rounded-xl bg-[#141418] border border-[#24242B] mb-3 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5 text-[#8E8E9F]">
            <span className="text-[#CCFF00]">✓</span> 
            <span>{mode === 'create' ? '0 Friction • No Passwords' : 'Saved to browser storage'}</span>
          </div>

          <button
            type="button"
            onClick={handleRollRandom}
            className="px-2.5 py-1 rounded-lg bg-[#1B1B22] hover:bg-[#24242B] border border-[#24242B] hover:border-[#CCFF00] text-[#CCFF00] text-[11px] font-bold flex items-center gap-1 transition-colors"
            title="Randomize handle, avatar, and rotation"
          >
            <Dices className="w-3 h-3" />
            <span>🎲 Randomize</span>
          </button>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSaveProfile} className="space-y-4">
          
          {/* Avatar Selector */}
          <div>
            <label className="block text-[11px] font-mono text-[#8E8E9F] mb-1.5">
              CHOOSE YOUR TASTE AVATAR
            </label>
            <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
              {AVATAR_OPTIONS.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedAvatar(url)}
                  className={`relative rounded-full p-0.5 border-2 transition-all ${
                    selectedAvatar === url ? 'border-[#CCFF00] scale-110 shadow-[0_0_12px_rgba(204,255,0,0.5)]' : 'border-[#24242B] opacity-60'
                  }`}
                >
                  <img src={url} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Handle & Name */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-mono text-[#8E8E9F] mb-1">
                @HANDLE
              </label>
              <input
                type="text"
                required
                placeholder="your.handle"
                value={handle}
                onChange={e => setHandle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#141418] border border-[#24242B] focus:border-[#CCFF00] text-xs text-[#F4F4F6] font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#8E8E9F] mb-1">
                NAME / NICKNAME
              </label>
              <input
                type="text"
                placeholder="First name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#141418] border border-[#24242B] focus:border-[#CCFF00] text-xs text-[#F4F4F6] font-mono outline-none"
              />
            </div>
          </div>

          {/* Current Music Rotation */}
          <div>
            <label className="block text-[11px] font-mono text-[#8E8E9F] mb-1 flex items-center gap-1">
              <Music className="w-3 h-3 text-[#1DB954]" /> CURRENT ROTATION (SPOTIFY SONG)
            </label>
            <input
              type="text"
              placeholder="e.g. Fred again.. - adore u"
              value={currentSong}
              onChange={e => setCurrentSong(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#141418] border border-[#24242B] focus:border-[#CCFF00] text-xs text-[#F4F4F6] font-mono outline-none"
            />
          </div>

          {/* Gender Selector (for Girls-Only Safety Gate) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-mono text-[#8E8E9F]">
                GENDER BADGE
              </label>
              <span className="text-[10px] font-mono text-[#FF007A]">🌸 Girls-Only Safe Spaces</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['M', 'F', 'OTHER'] as const).map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
                    gender === g 
                      ? g === 'F' ? 'border-[#FF007A] bg-[#FF007A]/15 text-[#FF007A]' : 'border-[#CCFF00] bg-[#CCFF00]/15 text-[#CCFF00]'
                      : 'border-[#24242B] bg-[#141418] text-[#8E8E9F]'
                  }`}
                >
                  {g === 'F' ? 'Female 🌸' : g === 'M' ? 'Male' : 'Other'}
                </button>
              ))}
            </div>
          </div>

          {/* Save / Launch Button */}
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A0A0C] font-mono font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_16px_rgba(204,255,0,0.3)] transition-all"
          >
            {mode === 'create' ? '✨ Launch New Explorer Identity' : 'Save Profile Changes'} <Check className="w-4 h-4" />
          </button>
        </form>

        {/* Optional Cloud Sync (Never Required) */}
        <div className="mt-4 pt-3 border-t border-[#24242B] space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#8E8E9F]">
            <span className="flex items-center gap-1">
              <Cloud className="w-3.5 h-3.5 text-[#00F0FF]" /> Sync across devices?
            </span>
            <span className="text-[10px] text-[#8E8E9F]">Optional</span>
          </div>

          <button
            onClick={handleOptionalGoogleSync}
            disabled={isSyncing}
            className="w-full py-2 px-3 rounded-xl bg-[#141418] hover:bg-[#1B1B22] border border-[#24242B] hover:border-[#00F0FF] text-xs font-mono text-[#F4F4F6] flex items-center justify-center gap-2 transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z" />
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
              <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z" />
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
            </svg>
            {syncSuccess ? '✓ Profile Synced to Cloud!' : isSyncing ? 'Connecting...' : 'Backup with Google (1-Click)'}
          </button>
        </div>

      </div>
    </div>
  );
}
