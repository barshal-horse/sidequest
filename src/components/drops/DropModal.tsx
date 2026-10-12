'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSideQuestStore } from '@/lib/store';
import { 
  X, MapPin, Clock, Users, Sparkles, Send, Share2, 
  CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, Navigation, Compass,
  QrCode, ScanLine
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  calculateDistanceInMeters, formatDistance, CHECKIN_GEOFENCE_RADIUS_METERS, 
  getGoogleMapsUrl, formatWalkingTime 
} from '@/lib/geo';
import { DEMO_PROFILES } from '@/lib/constants';
import { playRadarBlip, playCheckInChime } from '@/lib/audio';
import { DropMember } from '@/types';
import SquadQrModal from './SquadQrModal';
import { trackEvent } from '@/lib/analytics';

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
    selectedCity,
    setInspectedMember,
    userLocation,
    setLocationCoords,
    dropChats,
    sendDropMessage
  } = useSideQuestStore();

  const [messageText, setMessageText] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const [isVerifyingGps, setIsVerifyingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [distanceReadout, setDistanceReadout] = useState<number | null>(null);
  const [aiVibeText, setAiVibeText] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const drop = drops.find(d => d.id === activeDropId);
  const currentChat = (drop && dropChats ? dropChats[drop.id] : []) || [];

  // Auto-scroll chat to latest message
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [currentChat.length, activeDropId]);

  // Dynamic contextual quick chips based on activity
  const quickChips = useMemo(() => {
    if (!drop) return ['🏃 On my way', '⏳ 5 mins away', '📍 Just arrived', '⚡ Ready'];
    switch (drop.category) {
      case 'CHAI_FOOD':
        return ['🏃 On my way', '🧋 Order cutting chai for me', '⏳ 5 mins away', '📍 Reached stall'];
      case 'SPORTS':
        return ['🏸 Got racquets ready', '🏃 On court now', '⏳ Tying laces, 3 mins', '💧 Extra water brought'];
      case 'COWORK_DEV':
        return ['💻 Sockets near table?', '☕ Ordering cold brew', '🚀 Ready to ship', '⏳ 5 mins away'];
      case 'GIGS_CULTURE':
        return ['🎟️ At entrance gate', '🎸 Stage side seats', '⏳ Parking now', '🔥 Ready for the set'];
      default:
        return ['🏃 On my way', '⏳ 5 mins away', '📍 Just arrived', '⚡ Ready'];
    }
  }, [drop?.category]);

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
    if (!messageText.trim() || !drop) return;
    sendDropMessage(drop.id, messageText);
    setMessageText('');
  };

  const handleQuickChip = (text: string) => {
    if (!drop) return;
    sendDropMessage(drop.id, text);
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

  const handleMemberClick = (member: DropMember) => {
    const profile = DEMO_PROFILES.find(p => p.id === member.userId || p.handle === member.handle) || {
      id: member.userId,
      handle: member.handle,
      fullName: member.fullName,
      avatarUrl: member.avatarUrl,
      city: selectedCity.name,
      karmaScore: 96,
      questsCompleted: 14,
      flakeRate: 0,
      isVerified: true,
      badges: ['⚡ Squad Member', '🔥 100% Show-Up'],
      currentRotation: 'Fred again.. - adore u',
      audioAura: 'Electronic / Night Owl',
      bioManifesto: 'Lobby verified squad member.'
    };
    playRadarBlip();
    setInspectedMember(profile);
  };

  const handleJoinSquad = () => {
    const success = joinDrop(drop.id);
    if (success) {
      playCheckInChime();
      trackEvent('flare_joined', {
        dropId: drop.id,
        title: drop.title,
        category: drop.category,
        city: selectedCity.name,
        venueName: drop.venueName
      });
    }
  };

  const triggerSuccessfulCheckIn = () => {
    checkInDrop(drop.id);
    playCheckInChime();
    setGpsError(null);
    trackEvent('flare_checkin_verified', {
      dropId: drop.id,
      title: drop.title,
      category: drop.category,
      city: selectedCity.name,
      venueName: drop.venueName
    });
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
          
          {/* Venue Location & Google Maps Navigation */}
          {(() => {
            const userLat = userLocation ? userLocation.lat : selectedCity.center[1];
            const userLng = userLocation ? userLocation.lng : selectedCity.center[0];
            const distanceMeters = calculateDistanceInMeters(userLat, userLng, drop.lat, drop.lng);
            const formattedDist = formatDistance(distanceMeters);
            const walkTime = formatWalkingTime(distanceMeters);
            const mapsUrl = getGoogleMapsUrl(drop.lat, drop.lng, `${drop.venueName}, ${drop.hotspotName}`);

            return (
              <div className="p-3.5 rounded-xl bg-[#141418] border border-[#24242B] space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#8E8E9F] uppercase tracking-wider flex items-center gap-1.5 font-bold">
                    <MapPin className="w-3.5 h-3.5 text-[#CCFF00]" /> VENUE RADAR // {drop.hotspotName}
                  </span>
                  <span className="text-[11px] font-bold text-[#00F0FF] flex items-center gap-1">
                    ⚡ {formattedDist} ({walkTime})
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <div className="text-xs text-[#F4F4F6] font-mono leading-tight">
                    <span className="font-bold text-[#CCFF00]">{drop.venueName}</span>
                    <span className="text-[10px] text-[#8E8E9F] block mt-0.5">
                      GPS: {drop.lat.toFixed(4)}° N, {drop.lng.toFixed(4)}° E
                    </span>
                  </div>

                  {/* 1-Tap Google Maps Directions Link */}
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-[#00F0FF]/15 hover:bg-[#00F0FF]/25 border border-[#00F0FF]/40 text-[#00F0FF] hover:text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                    title="Open exact venue in Google Maps"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>🗺️ Open in Maps</span>
                  </a>
                </div>

                {/* Quick Pin Set */}
                <div className="pt-2 border-t border-[#24242B] flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[#8E8E9F]">
                    {userLocation ? (userLocation.isLiveGps ? '📍 Live GPS Active' : `📍 Pin: ${userLocation.addressName || 'Custom'}`) : '📍 Location not set yet'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setLocationCoords(drop.lat, drop.lng, `At ${drop.venueName.split(' ')[0]}`, false);
                      playRadarBlip();
                    }}
                    className="text-[#CCFF00] hover:underline flex items-center gap-1 font-bold"
                    title="Simulate placing your position directly at this venue"
                  >
                    <span>📍 Set Pin Here (Test Check-In)</span>
                  </button>
                </div>
              </div>
            );
          })()}

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
                <div 
                  key={member.userId} 
                  onClick={() => handleMemberClick(member)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1B1B22] border border-[#24242B] hover:border-[#00F0FF] transition-all cursor-pointer group/member select-none"
                  title="Click to inspect member's taste graph"
                >
                  <img 
                    src={member.avatarUrl} 
                    alt={member.handle} 
                    className="w-6 h-6 rounded-full object-cover group-hover/member:ring-1 group-hover/member:ring-[#00F0FF]" 
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-mono text-[#F4F4F6] group-hover/member:text-[#00F0FF] transition-colors leading-none flex items-center gap-1">
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
                  onClick={handleJoinSquad}
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
              <span className="flex items-center gap-1.5 font-bold">
                <span>💬 LOBBY CHAT</span>
                <span className="text-[10px] text-[#00F0FF] bg-[#00F0FF]/10 px-1.5 py-0.2 rounded border border-[#00F0FF]/30">
                  DROP #{drop.id.toUpperCase()}
                </span>
              </span>
              <span className="text-[10px] font-mono text-[#CCFF00] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-ping" /> LIVE
              </span>
            </div>

            {/* Chat Messages Container with Auto-Scroll */}
            <div 
              ref={chatScrollRef} 
              className="space-y-2 max-h-44 overflow-y-auto pr-1 select-text scroll-smooth"
            >
              {currentChat.length === 0 ? (
                <div className="p-3 text-center rounded-xl bg-[#141418] border border-[#24242B] text-xs font-mono text-[#8E8E9F]">
                  💬 Flare active. Say hi or drop an ETA for the squad!
                </div>
              ) : (
                currentChat.map((m) => {
                  if (m.isSystem) {
                    return (
                      <div 
                        key={m.id} 
                        className="py-1 px-2.5 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[11px] font-mono text-[#00F0FF] flex items-center justify-between"
                      >
                        <span className="truncate">{m.text}</span>
                        <span className="text-[9px] text-[#8E8E9F] ml-2 shrink-0">{m.timestamp}</span>
                      </div>
                    );
                  }

                  const isMe = m.userId === currentUser.id;
                  const isHostMsg = m.isHost || m.userId === drop.host.id;

                  return (
                    <div 
                      key={m.id} 
                      className={`p-2.5 rounded-xl border text-xs transition-all ${
                        isMe 
                          ? 'bg-[#181820] border-[#CCFF00]/40 ml-4 shadow-sm' 
                          : 'bg-[#141418] border-[#24242B] mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1 gap-2">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          {m.avatarUrl ? (
                            <img 
                              src={m.avatarUrl} 
                              alt={m.handle} 
                              className="w-4 h-4 rounded-full object-cover shrink-0 border border-[#24242B]" 
                            />
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-[#24242B] text-[8px] flex items-center justify-center text-white shrink-0">
                              {m.fullName.charAt(0)}
                            </div>
                          )}
                          <span className={`font-mono font-bold truncate text-[11px] ${
                            isMe ? 'text-[#CCFF00]' : isHostMsg ? 'text-[#00F0FF]' : 'text-[#F4F4F6]'
                          }`}>
                            {m.fullName.split(' ')[0]} {isHostMsg && '👑'} {isMe && '(You)'}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-[#8E8E9F] shrink-0">{m.timestamp}</span>
                      </div>
                      <p className="text-[#F4F4F6] text-xs font-mono break-words pl-5">{m.text}</p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Dynamic Activity-Specific Quick Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {quickChips.map((chip, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleQuickChip(chip)}
                  className="px-2.5 py-1 rounded-full bg-[#1B1B22] border border-[#24242B] hover:border-[#CCFF00] text-[11px] font-mono text-[#8E8E9F] hover:text-[#CCFF00] whitespace-nowrap transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                placeholder={`Message @${drop.host.handle.split('.')[0]}'s squad...`}
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-[#141418] border border-[#24242B] focus:border-[#CCFF00] text-xs text-[#F4F4F6] outline-none font-mono"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-lg bg-[#CCFF00] text-[#0A0A0C] hover:bg-[#b8e600] transition-colors"
                title="Send message to squad"
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
              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1 py-2.5 rounded-lg bg-[#CCFF00]/10 border border-[#CCFF00] text-[#CCFF00] text-center font-mono font-bold text-xs flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> You Are Checked In (+10 Karma)
                </div>
                {isHost && (
                  <button
                    type="button"
                    onClick={() => {
                      playRadarBlip();
                      setIsQrModalOpen(true);
                    }}
                    className="py-2.5 px-3 rounded-lg bg-[#00F0FF]/15 border border-[#00F0FF]/50 text-[#00F0FF] font-mono font-bold text-xs flex items-center gap-1.5 hover:bg-[#00F0FF]/25 transition-all"
                    title="Show squad check-in QR code pass"
                  >
                    <QrCode className="w-4 h-4" /> QR Pass
                  </button>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center gap-2">
                <button
                  onClick={handleGpsCheckIn}
                  disabled={isVerifyingGps}
                  className="flex-1 py-2.5 rounded-lg bg-[#CCFF00] text-[#0A0A0C] font-mono font-bold text-xs hover:bg-[#b8e600] transition-colors flex items-center justify-center gap-1.5 shadow-[0_0_16px_rgba(204,255,0,0.3)]"
                >
                  <Navigation className={`w-4 h-4 ${isVerifyingGps ? 'animate-spin' : ''}`} />
                  {isVerifyingGps ? 'Verifying...' : '📍 GPS Check-In'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playRadarBlip();
                    setIsQrModalOpen(true);
                  }}
                  className="py-2.5 px-3 rounded-lg bg-[#00F0FF]/15 border border-[#00F0FF]/50 text-[#00F0FF] hover:text-white hover:bg-[#00F0FF]/30 font-mono font-bold text-xs flex items-center gap-1.5 transition-all"
                  title={isHost ? 'Display QR Pass for squad' : 'Scan Host QR Code'}
                >
                  {isHost ? (
                    <>
                      <QrCode className="w-4 h-4" />
                      <span>Host QR</span>
                    </>
                  ) : (
                    <>
                      <ScanLine className="w-4 h-4" />
                      <span>Scan QR</span>
                    </>
                  )}
                </button>
                {!isHost && (
                  <button
                    onClick={() => {
                      playRadarBlip();
                      leaveDrop(drop.id);
                    }}
                    className="py-2.5 px-3 rounded-lg bg-[#1B1B22] hover:bg-[#FF0055]/20 border border-[#24242B] hover:border-[#FF0055] text-xs font-mono text-[#8E8E9F] hover:text-[#FF0055] transition-colors whitespace-nowrap"
                    title="Leave squad lobby and free your slot"
                  >
                    Leave
                  </button>
                )}
              </div>
            )
          ) : (
            <button
              onClick={handleJoinSquad}
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

        {/* Squad QR Check-in Pass / Scanner Modal */}
        <SquadQrModal
          drop={drop}
          isHost={isHost}
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          onVerifyCheckIn={triggerSuccessfulCheckIn}
        />

      </div>
    </div>
  );
}
