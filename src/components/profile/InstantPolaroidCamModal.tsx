'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSideQuestStore } from '@/lib/store';
import { 
  X, Camera, RotateCcw, Sparkles, Check, Image as ImageIcon, MapPin, Tag, RefreshCw, Zap, Download, Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playCameraShutter, playFilmEject, playCheckInChime, playRadarBlip } from '@/lib/audio';
import { exportPolaroidStoryCard } from '@/lib/storyExport';
import { trackEvent } from '@/lib/analytics';

const QUICK_FILM_PRESETS = [
  {
    name: '3am Chai Run',
    url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&auto=format&fit=crop&q=80',
    tag: '🧋 3am Chai Runs',
    location: 'Sanjay Tea Stall'
  },
  {
    name: 'Badminton Smash',
    url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&auto=format&fit=crop&q=80',
    tag: '🎾 Turf Badminton 2v2',
    location: 'Play Arena Court 3'
  },
  {
    name: 'Sunset Sea Promenade',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    tag: '📸 35mm Film Photography',
    location: 'Carter Road Promenade'
  },
  {
    name: 'Rooftop Vibe Coding',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80',
    tag: '💻 Vibe Coding & Shippers',
    location: 'Third Wave Rooftop'
  }
];

export default function InstantPolaroidCamModal() {
  const { 
    isInstantCamOpen, 
    setInstantCamOpen, 
    currentUser, 
    addScrapbookMemory, 
    selectedCity 
  } = useSideQuestStore();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [streamActive, setStreamActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [snappedPhotoUrl, setSnappedPhotoUrl] = useState<string | null>(null);
  const [isDeveloping, setIsDeveloping] = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const [caption, setCaption] = useState('');
  const [venueName, setVenueName] = useState('');
  const [vibeTag, setVibeTag] = useState('⚡ Spontaneous Sidequest');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'vintage' | 'noir' | 'neon' | 'none'>('vintage');

  // Start / Stop Camera Stream
  useEffect(() => {
    let currentStream: MediaStream | null = null;

    if (isInstantCamOpen && !snappedPhotoUrl) {
      setCameraError(null);
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({
          video: {
            facingMode,
            width: { ideal: 1080 },
            height: { ideal: 1080 }
          },
          audio: false
        })
        .then((stream) => {
          currentStream = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
            setStreamActive(true);
          }
        })
        .catch((err) => {
          console.warn('Camera access denied or unavailable:', err);
          setCameraError('Camera access not available. Pick from camera roll or use film preset below!');
          setStreamActive(false);
        });
      } else {
        setCameraError('Camera not supported in this browser. Use instant upload or presets!');
      }
    }

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
      setStreamActive(false);
    };
  }, [isInstantCamOpen, facingMode, snappedPhotoUrl]);

  if (!isInstantCamOpen) return null;

  // Take Instant Snap from Live Camera
  const handleSnapPhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    // 1. Shutter sound and flash
    playCameraShutter();
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 200);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = Math.min(video.videoWidth || 640, video.videoHeight || 640);
    canvas.width = size;
    canvas.height = size;

    // Draw square cropped video frame
    const startX = ((video.videoWidth || size) - size) / 2;
    const startY = ((video.videoHeight || size) - size) / 2;
    ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);

    // Apply Vintage Filter
    if (selectedFilter === 'vintage') {
      ctx.fillStyle = 'rgba(255, 220, 160, 0.12)';
      ctx.fillRect(0, 0, size, size);
    } else if (selectedFilter === 'noir') {
      const imgData = ctx.getImageData(0, 0, size, size);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg;
        data[i + 1] = avg;
        data[i + 2] = avg;
      }
      ctx.putImageData(imgData, 0, 0);
    } else if (selectedFilter === 'neon') {
      ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
      ctx.fillRect(0, 0, size, size);
    }

    // Authentic Retro Orange 90s Timestamp Stamp
    const now = new Date();
    const dateStamp = `'${now.getFullYear().toString().slice(-2)} ${String(now.getMonth() + 1).padStart(2, '0')} ${String(now.getDate()).padStart(2, '0')}`;
    const timeStamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    ctx.font = `bold ${Math.round(size * 0.045)}px monospace`;
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillText(`${dateStamp} ${timeStamp}`, size * 0.04 + 2, size * 0.94 + 2);
    ctx.fillStyle = '#FF7A00'; // Vintage LCD Orange
    ctx.fillText(`${dateStamp} ${timeStamp}`, size * 0.04, size * 0.94);

    const base64 = canvas.toDataURL('image/jpeg', 0.88);
    setSnappedPhotoUrl(base64);

    // Stop video tracks
    if (video.srcObject) {
      (video.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
    setStreamActive(false);

    // Polaroid developing animation and motor sound
    playFilmEject();
    setIsDeveloping(true);
    setTimeout(() => setIsDeveloping(false), 1400);

    // Auto default caption
    if (!venueName) setVenueName(selectedCity.hotspots[0]?.name || selectedCity.name);
    if (!caption) setCaption('Instant IRL snap with the squad!');

    trackEvent('polaroid_snapped', {
      source: 'live_viewfinder',
      filter: selectedFilter,
      city: selectedCity.name
    });
  };

  // Upload/Snap directly from Device Camera Roll
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    playCameraShutter();
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setSnappedPhotoUrl(result);
        playFilmEject();
        setIsDeveloping(true);
        setTimeout(() => setIsDeveloping(false), 1200);

        if (!venueName) setVenueName(selectedCity.hotspots[0]?.name || selectedCity.name);
        if (!caption) setCaption('Snapped from roll • Verified Meetup');

        trackEvent('polaroid_snapped', {
          source: 'camera_roll',
          city: selectedCity.name
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Select Quick Preset
  const handleSelectPreset = (preset: typeof QUICK_FILM_PRESETS[0]) => {
    playRadarBlip();
    setSnappedPhotoUrl(preset.url);
    setVenueName(preset.location);
    setCaption(preset.name);
    setVibeTag(preset.tag);
    setIsDeveloping(true);
    setTimeout(() => setIsDeveloping(false), 1000);
  };

  // Retake
  const handleRetake = () => {
    playRadarBlip();
    setSnappedPhotoUrl(null);
    setIsDeveloping(false);
  };

  // Save to Scrapbook
  const handleSaveToScrapbook = () => {
    if (!snappedPhotoUrl) return;

    addScrapbookMemory({
      title: caption.trim() || 'Instant Polaroid Snap',
      photoUrl: snappedPhotoUrl,
      locationName: venueName.trim() || selectedCity.hotspots[0]?.name || selectedCity.name,
      cityName: selectedCity.name,
      date: 'Just now • Verified Meetup',
      squadMembers: [
        { handle: currentUser.handle, avatarUrl: currentUser.avatarUrl }
      ],
      caption: caption.trim() || 'Instant Polaroid snap preserved in SideQuest scrapbook.',
      vibeTag: vibeTag || '⚡ Spontaneous Sidequest',
      notes: `Signed: "Instant snap cleared at ${venueName || selectedCity.name}" - @${currentUser.handle}`
    });

    confetti({
      particleCount: 50,
      spread: 70,
      colors: ['#CCFF00', '#00F0FF', '#FF007A']
    });
    playCheckInChime();

    // Close Modal
    setInstantCamOpen(false);
  };

  // 1-Tap 9:16 Instagram / WhatsApp Story Card Export
  const handleExportStory = async () => {
    if (!snappedPhotoUrl) return;
    playRadarBlip();
    await exportPolaroidStoryCard({
      title: caption.trim() || 'Instant Polaroid Snap',
      photoUrl: snappedPhotoUrl,
      locationName: venueName.trim() || selectedCity.hotspots[0]?.name || selectedCity.name,
      cityName: selectedCity.name,
      squadMembers: [{ handle: currentUser.handle }],
      caption: caption.trim() || 'Instant Polaroid snap preserved in SideQuest.',
      vibeTag: vibeTag || '⚡ Spontaneous Sidequest'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      
      {/* Full-Screen Camera Flash Animation */}
      {flashActive && (
        <div className="fixed inset-0 z-50 bg-white opacity-95 transition-opacity duration-200 pointer-events-none" />
      )}

      {/* Hidden Off-Screen Canvas for Image Processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden File Input for Native Camera Roll Capture */}
      <input 
        ref={fileInputRef} 
        type="file" 
        accept="image/*" 
        capture="environment" 
        onChange={handleFileUpload} 
        className="hidden" 
      />

      <div className="relative w-full max-w-md max-h-[95vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[#0E0E12] border border-[#24242B] shadow-2xl p-4 sm:p-5 space-y-4">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#24242B]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#CCFF00] animate-pulse" />
            <div>
              <h3 className="text-xs font-mono font-bold text-[#F4F4F6] uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#CCFF00]" /> INSTANT POLAROID SNAP CAM
              </h3>
              <p className="text-[10px] font-mono text-[#8E8E9F]">
                {snappedPhotoUrl ? '✨ Polaroid Developed' : 'Live Viewfinder • Zero Links Needed'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setInstantCamOpen(false)}
            className="p-1 rounded-lg text-[#8E8E9F] hover:text-[#F4F4F6] hover:bg-[#1B1B22] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* VIEW 1: LIVE VIEWFINDER & SHUTTER (When no photo snapped yet) */}
        {!snappedPhotoUrl && (
          <div className="space-y-3.5">
            {/* Vintage Polaroid Camera Body Container */}
            <div className="relative rounded-2xl overflow-hidden bg-[#141418] border-2 border-[#24242B] shadow-inner aspect-square flex items-center justify-center">
              
              {/* Rainbow Polaroid Accent Stripe */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF007A] via-[#FF7A00] via-[#CCFF00] to-[#00F0FF] z-10" />

              {/* Live Video Stream */}
              <video 
                ref={videoRef} 
                playsInline 
                muted 
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />

              {/* Viewfinder Target Reticle */}
              <div className="absolute inset-8 border border-white/20 rounded-xl pointer-events-none flex items-center justify-center">
                <div className="w-6 h-6 border-t-2 border-l-2 border-[#CCFF00] absolute top-2 left-2" />
                <div className="w-6 h-6 border-t-2 border-r-2 border-[#CCFF00] absolute top-2 right-2" />
                <div className="w-6 h-6 border-b-2 border-l-2 border-[#CCFF00] absolute bottom-2 left-2" />
                <div className="w-6 h-6 border-b-2 border-r-2 border-[#CCFF00] absolute bottom-2 right-2" />
                <span className="text-[10px] font-mono text-[#CCFF00] bg-black/60 px-2 py-0.5 rounded-full border border-[#CCFF00]/40">
                  {selectedCity.name.toUpperCase()} RADAR
                </span>
              </div>

              {/* Camera Error / Fallback State */}
              {cameraError && (
                <div className="absolute inset-0 bg-[#0E0E12]/95 backdrop-blur-sm p-4 flex flex-col items-center justify-center text-center space-y-3 z-20">
                  <div className="w-12 h-12 rounded-full bg-[#1B1B22] border border-[#24242B] flex items-center justify-center text-xl">
                    📸
                  </div>
                  <p className="text-xs font-mono text-[#F4F4F6] max-w-xs">{cameraError}</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="py-2 px-4 rounded-xl bg-[#CCFF00] text-[#0A0A0C] font-mono font-bold text-xs flex items-center gap-1.5 shadow-lg"
                  >
                    <ImageIcon className="w-4 h-4" /> Pick / Snap from Camera Roll
                  </button>
                </div>
              )}

              {/* Viewfinder Filter Overlay Badge */}
              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] font-mono text-[#00F0FF] border border-[#00F0FF]/30">
                FILTER: {selectedFilter.toUpperCase()}
              </div>

              {/* Camera Flip Button */}
              {streamActive && (
                <button
                  type="button"
                  onClick={() => setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')}
                  className="absolute bottom-3 right-3 p-2 rounded-full bg-black/75 hover:bg-black text-white border border-white/30 backdrop-blur-md transition-all shadow-md"
                  title="Flip camera"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Vintage Filter Chips */}
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[10px] text-[#8E8E9F]">FILM LOOK:</span>
              <div className="flex items-center gap-1">
                {(['vintage', 'noir', 'neon', 'none'] as const).map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setSelectedFilter(f)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${
                      selectedFilter === f
                        ? 'bg-[#CCFF00] text-[#0A0A0C] border-[#CCFF00]'
                        : 'bg-[#141418] text-[#8E8E9F] border-[#24242B]'
                    }`}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Shutter Controls */}
            <div className="flex items-center justify-center gap-4 pt-1">
              {/* Native Roll Picker Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 rounded-2xl bg-[#141418] hover:bg-[#1B1B22] border border-[#24242B] text-[#8E8E9F] hover:text-[#F4F4F6] transition-all flex flex-col items-center gap-1 shadow-md"
                title="Upload from Camera Roll"
              >
                <ImageIcon className="w-5 h-5 text-[#00F0FF]" />
                <span className="text-[9px] font-mono">Roll</span>
              </button>

              {/* Big Iconic Shutter Button (Snap) */}
              <button
                type="button"
                onClick={handleSnapPhoto}
                className="w-18 h-18 rounded-full bg-gradient-to-tr from-[#CCFF00] to-[#00F0FF] p-1.5 shadow-[0_0_24px_rgba(204,255,0,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center group"
                title="Snap instant polaroid"
              >
                <div className="w-full h-full rounded-full bg-[#0E0E12] border-2 border-white/80 group-hover:bg-[#141418] flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white group-hover:bg-[#CCFF00] transition-colors" />
                </div>
              </button>

              {/* Quick Preset Opener */}
              <button
                type="button"
                onClick={() => handleSelectPreset(QUICK_FILM_PRESETS[0])}
                className="p-3 rounded-2xl bg-[#141418] hover:bg-[#1B1B22] border border-[#24242B] text-[#8E8E9F] hover:text-[#F4F4F6] transition-all flex flex-col items-center gap-1 shadow-md"
                title="Instant Meetup Preset"
              >
                <Sparkles className="w-5 h-5 text-[#CCFF00]" />
                <span className="text-[9px] font-mono">Preset</span>
              </button>
            </div>

            {/* 1-Tap Quick Film Presets Bar */}
            <div className="pt-2 border-t border-[#24242B]">
              <span className="text-[10px] font-mono text-[#8E8E9F] block mb-1.5">
                OR 1-TAP INSTANT MEETUP PRESET:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {QUICK_FILM_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className="p-1.5 rounded-xl bg-[#141418] hover:bg-[#1B1B22] border border-[#24242B] hover:border-[#CCFF00] text-left transition-all flex items-center gap-2 group"
                  >
                    <img 
                      src={preset.url} 
                      alt={preset.name} 
                      className="w-8 h-8 rounded-lg object-cover" 
                    />
                    <div className="overflow-hidden">
                      <div className="text-[10px] font-mono font-bold text-[#F4F4F6] group-hover:text-[#CCFF00] truncate">
                        {preset.name}
                      </div>
                      <div className="text-[8px] font-mono text-[#8E8E9F] truncate">
                        {preset.location}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: DEVELOPED POLAROID FILM & SCRIBBLE (When photo is snapped) */}
        {snappedPhotoUrl && (
          <div className="space-y-4 animate-fade-in">
            {/* The Authentic Physical Polaroid Print */}
            <div className="relative bg-[#FFFFFF] rounded-2xl p-3 sm:p-4 text-[#141418] shadow-2xl border-4 border-[#FFFFFF] transition-all duration-500">
              
              {/* Translucent Washi Tape at Top */}
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-16 h-5 bg-[#CCFF00]/70 backdrop-blur-sm border border-[#CCFF00]/50 -rotate-2 rounded-xs shadow-sm z-10 pointer-events-none" />

              {/* Film Area */}
              <div className="relative rounded-xl overflow-hidden bg-[#1E1E24] aspect-square">
                <img 
                  src={snappedPhotoUrl} 
                  alt="Polaroid" 
                  className={`w-full h-full object-cover transition-all duration-1000 ${
                    isDeveloping 
                      ? 'filter contrast-150 brightness-50 blur-[2px] opacity-60' 
                      : 'filter contrast-105 brightness-100 opacity-100'
                  }`}
                />

                {/* Developing Film Badge Indicator */}
                {isDeveloping && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center">
                    <div className="px-3 py-1.5 rounded-full bg-black/80 text-[#CCFF00] font-mono text-xs font-bold border border-[#CCFF00] animate-pulse">
                      ⏳ DEVELOPING FILM EMULSION...
                    </div>
                  </div>
                )}
              </div>

              {/* Physical Polaroid Chin Area (Scribble Bottom) */}
              <div className="pt-3 font-mono space-y-1 text-center">
                <input
                  type="text"
                  placeholder="✍️ Scribble handwritten caption on Polaroid..."
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  className="w-full text-center text-xs font-bold text-[#0A0A0C] bg-transparent border-b border-dashed border-[#B0B0C0] focus:border-[#0A0A0C] outline-none pb-1"
                />
                <div className="flex items-center justify-between text-[9px] text-[#606070] pt-1">
                  <span>📍 {venueName || selectedCity.name}</span>
                  <span>{selectedCity.name}</span>
                </div>
              </div>
            </div>

            {/* Additional Scrapbook Meta Inputs */}
            <div className="space-y-2 p-3 rounded-2xl bg-[#141418] border border-[#24242B] font-mono">
              <div className="flex items-center justify-between text-[11px] text-[#8E8E9F]">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#00F0FF]" /> Hotspot / Venue:
                </span>
                <input
                  type="text"
                  value={venueName}
                  onChange={e => setVenueName(e.target.value)}
                  placeholder="e.g. Sanjay Tea Stall"
                  className="px-2 py-1 rounded-lg bg-[#0E0E12] border border-[#24242B] text-xs text-[#F4F4F6] text-right outline-none w-48"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#8E8E9F]">
                <span className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-[#CCFF00]" /> Vibe Tag:
                </span>
                <select
                  value={vibeTag}
                  onChange={e => setVibeTag(e.target.value)}
                  className="px-2 py-1 rounded-lg bg-[#0E0E12] border border-[#24242B] text-[10px] text-[#CCFF00] outline-none cursor-pointer"
                >
                  <option value="🧋 3am Chai Runs">🧋 3am Chai Runs</option>
                  <option value="🎾 Turf Badminton 2v2">🎾 Turf Badminton 2v2</option>
                  <option value="📸 35mm Film Photography">📸 35mm Film Photography</option>
                  <option value="💻 Vibe Coding & Shippers">💻 Vibe Coding & Shippers</option>
                  <option value="🍵 Iced Matcha Lattes">🍵 Iced Matcha Lattes</option>
                  <option value="⚡ Spontaneous Sidequest">⚡ Spontaneous Sidequest</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="py-2.5 px-3 rounded-xl bg-[#141418] hover:bg-[#1B1B22] border border-[#24242B] text-xs font-mono text-[#8E8E9F] flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retake
                </button>

                <button
                  type="button"
                  onClick={handleExportStory}
                  disabled={isDeveloping}
                  className="py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-[#FF007A] to-[#FF7A00] hover:opacity-90 text-white font-mono font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(255,0,122,0.3)] transition-all disabled:opacity-50"
                  title="Export 9:16 Story Card for Instagram or WhatsApp"
                >
                  <Share2 className="w-3.5 h-3.5" /> 📲 Story Export
                </button>
              </div>

              <button
                type="button"
                onClick={handleSaveToScrapbook}
                disabled={isDeveloping}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A0A0C] font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_18px_rgba(204,255,0,0.4)] transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 fill-current text-[#0A0A0C]" />
                <span>Save to Scrapbook</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
