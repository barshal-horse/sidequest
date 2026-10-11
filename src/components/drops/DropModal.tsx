'use client';

import React, { useState, useEffect } from 'react';
import { useSideQuestStore } from '@/lib/store';
import { 
  X, MapPin, Clock, Users, Sparkles, Send, Share2, 
  CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, Navigation
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { calculateDistanceInMeters, formatDistance, CHECKIN_GEOFENCE_RADIUS_METERS } from '@/lib/geo';

export default function DropModal() {
  const { 
    drops, 
    activeDropId, 
    setActiveDropId, 
    currentUser, 
    joinDrop, 
    leaveDrop, 
    checkInDrop, 
    openShareModal,
    selectedCity
  } = useSideQuestStore();

  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: string; text: string; time: string; isHost?: boolean }>>([
    { sender: 'Aarav (Host)', text: 'reached venue, stall is open and tea is brewing!!', time: 'Just now', isHost: true },
    { sender: 'Sneha', text: 'coming down in 2 mins, get me a cutting chai 🧋', time: '1m ago' }
  ]);

  const [isVerifyingGps, setIsVerifyingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [distanceReadout, setDistanceReadout] = useState<number | null>(null);
  const [aiVibeText, setAiVibeText] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const drop = drops.find(d => d.id === activeDropId);

  // Time remaining calculation
  const [timeLeft, setTimeLeft] = useState('00:00');
  useEffect(() => {
    if (!drop) return;
    setAiVibeText(drop.aiVibeNote || null);
    const updateCountdown = () => {
      const diff = new Date(drop.expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('EXPIRED');
        return;
      }
      const mins = Math.floor(diff / (1000 * 60));
      const secs = Math.floor((diff / 1000) % 60);
      setTimeLeft(`${mins}m ${secs < 10 ? '0' : ''}${secs}s`);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [drop]);

  if (!drop) return null;

  const isMember = drop.members.some(m => m.userId === currentUser.id);
  const currentMember = drop.members.find(m => m.userId === currentUser.id);
  const isCheckedIn = currentMember?.checkedIn;
  const isHost = drop.host.id === currentUser.id;

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageText.trim()) return;

    setMessages(prev => [
      ...prev,
      {
        sender: currentUser.fullName.split(' ')[0],
        text: messageText,
        time: 'Just now',
        isHost
      }
    ]);
    setMessageText('');
  };

  const handleQuickChip = (text: string) => {
    setMessages(prev => [
      ...prev,
      {
        sender: currentUser.fullName.split(' ')[0],
        text,
        time: 'Just now',
        isHost
      }
    ]);
  };

  // Real GPS Geofence Check-In
  const handleGpsCheckIn = () => {
    setGpsError(null);
    setIsVerifyingGps(true);

    if (!navigator.geolocation) {
      // Fallback if browser doesn't have geolocation
      triggerSuccessfulCheckIn();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsVerifyingGps(false);
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        const dist = calculateDistanceInMeters(userLat, userLng, drop.lat, drop.lng);
        setDistanceReadout(dist);

        if (dist <= CHECKIN_GEOFENCE_RADIUS_METERS) {
          triggerSuccessfulCheckIn();
        } else {
          setGpsError(`You are ${formatDistance(dist)} away. Move within ${CHECKIN_GEOFENCE_RADIUS_METERS}m of ${drop.venueName} to check in.`);
        }
      },
      (err) => {
        setIsVerifyingGps(false);
        // Geolocation denied or unavailable: allow dev test check-in
        setGpsError('GPS permission not granted. Use the Dev Bypass below to test.');
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  };

  const triggerSuccessfulCheckIn = () => {
    checkInDrop(drop.id);
    setGpsError(null);
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#CCFF00', '#00F0FF', '#FFFFFF']
    });
  };

  // AI Wingman Reroll
  const handleRegenerateVibe = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/wingman', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venueName: drop.venueName,
          category: drop.category,
          city: selectedCity.name,
          memberCount: drop.currentSlots
        })
      });
      const data = await res.json();
      if (data.vibeNote) {
        setAiVibeText(data.vibeNote);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      {/* Modal Container */}
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col rounded-t-2xl sm:rounded-2xl bg-[#0E0E12] border border-[#24242B] shadow-2xl overflow-hidden">
        
        {/* Top Header */}
        <div className="relative p-4 sm:p-5 border-b border-[#24242B] bg-[#141418]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#CCFF00] text-[#0A0A0C]">
                  {drop.category}
                </span>
                {drop.isGirlsOnly && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FF007A]/20 text-[#FF007A] border border-[#FF007A]/40 flex items-center gap-1">
                    🌸 Girls Only
                  </span>
                )}
                <span className="flex items-center gap-1 text-[11px] font-mono text-[#FF0055]">
                  <Clock className="w-3 h-3 animate-pulse" /> {timeLeft}
                </span>
              </div>
              <h2 className="text-lg font-bold text-[#F4F4F6] tracking-tight">{drop.title}</h2>
              <p className="flex items-center gap-1 text-xs text-[#8E8E9F] mt-1 font-mono">
                <MapPin className="w-3.5 h-3.5 text-[#CCFF00]" /> {drop.venueName}
              </p>
            </div>
            
            <button
              onClick={() => setActiveDropId(null)}
              className="p-1.5 rounded-lg text-[#8E8E9F] hover:text-[#F4F4F6] hover:bg-[#24242B] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* Party Squad Slots */}
          <div className="p-3.5 rounded-xl bg-[#141418] border border-[#24242B]">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-mono text-[#8E8E9F] uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#CCFF00]" /> Party Squad ({drop.currentSlots}/{drop.maxSlots})
              </span>
              <span className="text-xs font-mono text-[#CCFF00]">
                {drop.maxSlots - drop.currentSlots > 0 ? `${drop.maxSlots - drop.currentSlots} Slots Open` : 'Full Squad'}
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {drop.members.map(member => (
                <div key={member.userId} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1B1B22] border border-[#24242B]">
                  <img src={member.avatarUrl} alt={member.handle} className="w-6 h-6 rounded-full object-cover" />
                  <div className="flex flex-col">
                    <span className="text-xs font-mono text-[#F4F4F6] leading-none">
                      @{member.handle.split('.')[0]} {member.isHost && '👑'}
                    </span>
                    {member.checkedIn && (
                      <span className="text-[9px] font-mono text-[#CCFF00] flex items-center gap-0.5 mt-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Checked In
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {!isMember && drop.currentSlots < drop.maxSlots && (
                <button
                  onClick={() => joinDrop(drop.id)}
                  className="px-3 py-1.5 rounded-lg border border-dashed border-[#CCFF00] text-[#CCFF00] text-xs font-mono hover:bg-[#CCFF00]/10 transition-colors flex items-center gap-1 whitespace-nowrap"
                >
                  + Join Squad
                </button>
              )}
            </div>
          </div>

          {/* AI Wingman Shared Vibe Card */}
          <div className="p-4 rounded-xl bg-[#141418]/80 border border-[#CCFF00]/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#CCFF00]/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#CCFF00]">
                <Sparkles className="w-3.5 h-3.5" /> ✨ AI WINGMAN // SHARED TASTE MATCH
              </div>
              <button 
                onClick={handleRegenerateVibe}
                disabled={isGeneratingAi}
                className="text-[10px] font-mono text-[#8E8E9F] hover:text-[#CCFF00] flex items-center gap-1 transition-colors"
                title="Reroll conversation starters"
              >
                <RefreshCw className={`w-3 h-3 ${isGeneratingAi ? 'animate-spin text-[#CCFF00]' : ''}`} />
                {isGeneratingAi ? 'Synthesizing...' : 'Reroll'}
              </button>
            </div>
            <p className="text-xs text-[#F4F4F6] leading-relaxed">
              {aiVibeText || 'High-energy spontaneous squad. Gather at the venue before the window self-destructs!'}
            </p>
          </div>

          {/* Real-time Ephemeral Chat */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono text-[#8E8E9F]">
              <span>💬 LOBBY CHAT (Self-destructs post-quest)</span>
              <span className="text-[10px] text-[#CCFF00]">🟢 LIVE</span>
            </div>

            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {messages.map((m, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-[#141418] border border-[#24242B] text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-[#CCFF00]">
                      {m.sender} {m.isHost && '👑'}
                    </span>
                    <span className="text-[10px] font-mono text-[#8E8E9F]">{m.time}</span>
                  </div>
                  <p className="text-[#F4F4F6]">{m.text}</p>
                </div>
              ))}
            </div>

            {/* Quick Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button 
                onClick={() => handleQuickChip('🏃 On my way now')}
                className="px-2.5 py-1 rounded-full bg-[#1B1B22] border border-[#24242B] hover:border-[#CCFF00] text-[11px] font-mono text-[#8E8E9F] hover:text-[#F4F4F6] whitespace-nowrap"
              >
                🏃 On my way
              </button>
              <button 
                onClick={() => handleQuickChip('🧋 Order cutting chai for me')}
                className="px-2.5 py-1 rounded-full bg-[#1B1B22] border border-[#24242B] hover:border-[#CCFF00] text-[11px] font-mono text-[#8E8E9F] hover:text-[#F4F4F6] whitespace-nowrap"
              >
                🧋 Order cutting for me
              </button>
              <button 
                onClick={() => handleQuickChip('⏳ 5 mins away')}
                className="px-2.5 py-1 rounded-full bg-[#1B1B22] border border-[#24242B] hover:border-[#CCFF00] text-[11px] font-mono text-[#8E8E9F] hover:text-[#F4F4F6] whitespace-nowrap"
              >
                ⏳ 5 mins away
              </button>
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type a message to squad..."
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-[#141418] border border-[#24242B] focus:border-[#CCFF00] text-xs text-[#F4F4F6] outline-none font-mono"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-lg bg-[#CCFF00] text-[#0A0A0C] hover:bg-[#b8e600] transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* GPS Verification Error / Distance Callout */}
          {gpsError && (
            <div className="p-3 rounded-xl bg-[#FF0055]/10 border border-[#FF0055]/30 text-xs font-mono text-[#FF0055] space-y-2">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{gpsError}</span>
              </div>
              <button
                onClick={triggerSuccessfulCheckIn}
                className="w-full py-1.5 rounded-lg bg-[#FF0055]/20 hover:bg-[#FF0055]/30 border border-[#FF0055]/50 text-white font-mono text-[11px] transition-colors"
              >
                ⚡ Dev Bypass (Simulate Verified Check-In)
              </button>
            </div>
          )}

        </div>

        {/* Sticky Bottom Actions */}
        <div className="p-4 border-t border-[#24242B] bg-[#141418] flex items-center gap-2">
          {isMember ? (
            isCheckedIn ? (
              <div className="flex-1 py-2.5 rounded-lg bg-[#CCFF00]/10 border border-[#CCFF00] text-[#CCFF00] text-center font-mono font-bold text-xs flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> You Are Checked In (+10 Karma)
              </div>
            ) : (
              <button
                onClick={handleGpsCheckIn}
                disabled={isVerifyingGps}
                className="flex-1 py-2.5 rounded-lg bg-[#CCFF00] text-[#0A0A0C] font-mono font-bold text-xs hover:bg-[#b8e600] transition-colors flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(204,255,0,0.3)]"
              >
                <Navigation className={`w-4 h-4 ${isVerifyingGps ? 'animate-spin' : ''}`} />
                {isVerifyingGps ? 'Verifying GPS...' : '📍 Verify GPS & Check-In (+10 Karma)'}
              </button>
            )
          ) : (
            <button
              onClick={() => joinDrop(drop.id)}
              disabled={drop.currentSlots >= drop.maxSlots}
              className="flex-1 py-2.5 rounded-lg bg-[#CCFF00] text-[#0A0A0C] font-mono font-bold text-xs hover:bg-[#b8e600] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {drop.currentSlots >= drop.maxSlots ? 'Squad Full' : '⚡ Claim Open Slot'}
            </button>
          )}

          <button
            onClick={() => openShareModal(drop)}
            className="p-2.5 rounded-lg bg-[#1B1B22] border border-[#24242B] hover:border-[#CCFF00] text-[#F4F4F6] hover:text-[#CCFF00] transition-colors"
            title="Share to Instagram Story or WhatsApp"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
