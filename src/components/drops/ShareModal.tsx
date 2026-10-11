'use client';

import React, { useState, useRef } from 'react';
import { useSideQuestStore } from '@/lib/store';
import { 
  X, Copy, Check, Share2, MessageCircle, ExternalLink, Download, Sparkles 
} from 'lucide-react';

export default function ShareModal() {
  const { isShareModalOpen, selectedShareDrop, closeShareModal, selectedCity } = useSideQuestStore();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedReddit, setCopiedReddit] = useState(false);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);

  if (!isShareModalOpen || !selectedShareDrop) return null;

  const drop = selectedShareDrop;
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}?drop=${drop.id}` : `https://sidequest-app.vercel.app?drop=${drop.id}`;

  // Subreddit mapping by city
  const subredditMap: Record<string, string> = {
    bengaluru: 'r/bangalore',
    mumbai: 'r/mumbai',
    delhi: 'r/delhi',
    pune: 'r/pune',
    hyderabad: 'r/hyderabad',
    chennai: 'r/chennai',
    kolkata: 'r/kolkata'
  };
  const targetSubreddit = subredditMap[drop.cityId] || 'r/bangalore';

  const redditTitle = `[SideQuest] Anyone down for ${drop.title} at ${drop.venueName}? (${drop.maxSlots - drop.currentSlots} open spots, 90m window)`;
  const redditBody = `Hey ${targetSubreddit},

Dropped a spontaneous IRL plan on SideQuest:
📍 Spot: ${drop.venueName} (${drop.hotspotName})
⏳ Window: 90 Minutes (lobby self-destructs if squad doesn't fill)
🛡️ Anti-Flake Karma: On-time GPS check-in required (+10 XP)
${drop.isGirlsOnly ? '🌸 Girls-Only Lobby' : ''}

Looking for ${drop.maxSlots - drop.currentSlots} more people to join the squad. 
Claim a slot here: ${shareUrl}`;

  const shareText = `⚡ ${drop.host.fullName.split(' ')[0]} dropped a Flare: "${drop.title}" at ${drop.venueName}! ${drop.maxSlots - drop.currentSlots} slots open before timer expires. Join the squad: ${shareUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareText);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyReddit = () => {
    navigator.clipboard.writeText(`${redditTitle}\n\n${redditBody}`);
    setCopiedReddit(true);
    setTimeout(() => setCopiedReddit(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleTwitterShare = () => {
    const encoded = encodeURIComponent(`⚡ Dropped a spontaneous plan on SideQuest: "${drop.title}" at ${drop.venueName}! Who's down? ${shareUrl}`);
    window.open(`https://twitter.com/intent/tweet?text=${encoded}`, '_blank');
  };

  const handleOpenReddit = () => {
    const encodedTitle = encodeURIComponent(redditTitle);
    const encodedText = encodeURIComponent(redditBody);
    window.open(`https://www.reddit.com/${targetSubreddit}/submit?title=${encodedTitle}&text=${encodedText}`, '_blank');
  };

  // Generate and Download 9:16 Instagram Story PNG via HTML5 Canvas
  const handleDownloadStoryCard = () => {
    setIsGeneratingImg(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Dark obsidian background
      ctx.fillStyle = '#0A0A0C';
      ctx.fillRect(0, 0, 1080, 1920);

      // Subtle cyber grid
      ctx.strokeStyle = 'rgba(204, 255, 0, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < 1080; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 1920);
        ctx.stroke();
      }
      for (let y = 0; y < 1920; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1080, y);
        ctx.stroke();
      }

      // Neon frame border
      ctx.strokeStyle = '#CCFF00';
      ctx.lineWidth = 8;
      ctx.strokeRect(60, 60, 960, 1800);

      // Header Tag
      ctx.fillStyle = '#CCFF00';
      ctx.font = 'bold 36px monospace';
      ctx.fillText('⚡ SIDEQUEST // ACTIVE FLARE', 120, 160);

      ctx.fillStyle = '#FF0055';
      ctx.font = 'bold 32px monospace';
      ctx.textAlign = 'right';
      ctx.fillText('⏳ 90M WINDOW', 960, 160);
      ctx.textAlign = 'left';

      // Emoji
      const emoji = drop.category === 'CHAI_FOOD' ? '🧋' : drop.category === 'SPORTS' ? '🏸' : drop.category === 'COWORK_DEV' ? '💻' : '🎭';
      ctx.font = '140px sans-serif';
      ctx.fillText(emoji, 120, 420);

      // Title
      ctx.fillStyle = '#F4F4F6';
      ctx.font = 'bold 64px sans-serif';
      const words = drop.title.split(' ');
      let line = '';
      let y = 560;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > 840 && n > 0) {
          ctx.fillText(line, 120, y);
          line = words[n] + ' ';
          y += 85;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 120, y);

      // Venue
      y += 80;
      ctx.fillStyle = '#CCFF00';
      ctx.font = 'bold 44px monospace';
      ctx.fillText(`📍 ${drop.venueName}`, 120, y);

      y += 60;
      ctx.fillStyle = '#8E8E9F';
      ctx.font = '32px monospace';
      ctx.fillText(`ZONE: ${drop.hotspotName.toUpperCase()}`, 120, y);

      // Squad Open Slots
      y += 120;
      ctx.fillStyle = '#141418';
      ctx.fillRect(120, y, 840, 180);
      ctx.strokeStyle = '#24242B';
      ctx.lineWidth = 3;
      ctx.strokeRect(120, y, 840, 180);

      ctx.fillStyle = '#CCFF00';
      ctx.font = 'bold 48px monospace';
      ctx.fillText(`🔥 ${drop.maxSlots - drop.currentSlots} OPEN SLOTS LEFT`, 160, y + 80);

      ctx.fillStyle = '#F4F4F6';
      ctx.font = '30px monospace';
      ctx.fillText(`HOST: @${drop.host.handle} • 100% SHOW-UP RATE`, 160, y + 135);

      // Footer call to action
      ctx.fillStyle = '#F4F4F6';
      ctx.font = 'bold 36px monospace';
      ctx.fillText('CLAIM A SLOT BEFORE TIMER DIES', 120, 1720);

      ctx.fillStyle = '#00F0FF';
      ctx.font = '32px monospace';
      ctx.fillText('ANTISOCIAL MEDIA // ZERO FLAKES', 120, 1780);

      // Trigger download
      const link = document.createElement('a');
      link.download = `sidequest-${drop.id}-story.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingImg(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0E0E12] border border-[#24242B] shadow-2xl p-5">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-mono font-bold text-[#F4F4F6] flex items-center gap-1.5 uppercase">
            <Share2 className="w-4 h-4 text-[#CCFF00]" /> Viral Launch Kit
          </h3>
          <button onClick={closeShareModal} className="p-1 text-[#8E8E9F] hover:text-[#F4F4F6]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 9:16 Instagram Story Preview Card */}
        <div className="relative w-full aspect-[4/5] rounded-xl bg-gradient-to-b from-[#141418] to-[#0A0A0C] border-2 border-[#CCFF00] p-4 flex flex-col justify-between shadow-[0_0_24px_rgba(204,255,0,0.2)] mb-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#CCFF00] text-[#0A0A0C]">
              SIDEQUEST // ACTIVE FLARE
            </span>
            <span className="text-[10px] font-mono text-[#FF0055] animate-pulse font-bold">
              ⏳ 90M WINDOW
            </span>
          </div>

          <div className="space-y-2 text-center my-auto">
            <span className="text-4xl">
              {drop.category === 'CHAI_FOOD' ? '🧋' : drop.category === 'SPORTS' ? '🏸' : drop.category === 'COWORK_DEV' ? '💻' : '🎭'}
            </span>
            <h4 className="text-lg font-bold text-[#F4F4F6] leading-snug">{drop.title}</h4>
            <p className="text-xs font-mono text-[#CCFF00]">📍 {drop.venueName}</p>
            <p className="text-[11px] font-mono text-[#8E8E9F]">
              Hosted by @{drop.host.handle} • {drop.maxSlots - drop.currentSlots} Slots Left
            </p>
          </div>

          <div className="pt-2 border-t border-[#24242B] flex items-center justify-between text-[9px] font-mono text-[#8E8E9F]">
            <span>100% SHOW-UP KARMA</span>
            <span className="text-[#CCFF00]">JOIN @ SIDEQUEST</span>
          </div>
        </div>

        {/* Action Share Buttons */}
        <div className="space-y-2.5">
          {/* Download 9:16 Story Image */}
          <button
            onClick={handleDownloadStoryCard}
            disabled={isGeneratingImg}
            className="w-full py-2.5 px-4 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A0A0C] text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_16px_rgba(204,255,0,0.3)]"
          >
            <Download className="w-4 h-4" />
            {isGeneratingImg ? 'Rendering Card...' : 'Save 9:16 Card for Instagram Story'}
          </button>

          {/* Reddit 1-Click Launch Kit */}
          <div className="p-3 rounded-xl bg-[#FF4500]/10 border border-[#FF4500]/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#FF4500] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Reddit Launch Kit ({targetSubreddit})
              </span>
              <button
                onClick={handleOpenReddit}
                className="text-[11px] font-mono text-[#FF4500] hover:underline flex items-center gap-1"
              >
                Open Reddit <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            <p className="text-[11px] text-[#8E8E9F] font-mono leading-relaxed">
              Targeted for {targetSubreddit} with anti-spam formatting and live window countdown.
            </p>
            <button
              onClick={handleCopyReddit}
              className="w-full py-2 px-3 rounded-lg bg-[#FF4500]/20 hover:bg-[#FF4500]/30 border border-[#FF4500]/40 text-[#FF4500] text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              {copiedReddit ? <Check className="w-3.5 h-3.5 text-[#CCFF00]" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedReddit ? 'Copied Reddit Title & Body!' : 'Copy Formatted Reddit Post'}
            </button>
          </div>

          {/* WhatsApp 1-Click */}
          <button
            onClick={handleWhatsAppShare}
            className="w-full py-2 px-4 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all"
          >
            <MessageCircle className="w-4 h-4" /> Share to WhatsApp Group
          </button>

          {/* Twitter & Direct Link */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleTwitterShare}
              className="py-2 px-3 rounded-xl bg-[#1B1B22] border border-[#24242B] hover:border-[#CCFF00] text-xs font-mono text-[#F4F4F6] flex items-center justify-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#00F0FF]" /> Post on X
            </button>
            <button
              onClick={handleCopyLink}
              className="py-2 px-3 rounded-xl bg-[#1B1B22] border border-[#24242B] hover:border-[#CCFF00] text-xs font-mono text-[#F4F4F6] flex items-center justify-center gap-1.5 transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-[#CCFF00]" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedLink ? 'Copied Link!' : 'Copy Link'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
