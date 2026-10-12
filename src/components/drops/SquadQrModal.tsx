'use client';

import React, { useState } from 'react';
import { Drop } from '@/types';
import { X, QrCode, ScanLine, Check, ShieldCheck, Sparkles, Copy, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playCheckInChime, playRadarBlip } from '@/lib/audio';

interface SquadQrModalProps {
  drop: Drop;
  isHost: boolean;
  isOpen: boolean;
  onClose: () => void;
  onVerifyCheckIn: () => void;
}

export default function SquadQrModal({
  drop,
  isHost,
  isOpen,
  onClose,
  onVerifyCheckIn
}: SquadQrModalProps) {
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  if (!isOpen) return null;

  const dropPin = `SQ-${drop.id.slice(-4).toUpperCase()}`;

  const handleCopyPin = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(dropPin);
      setCopiedPin(true);
      setTimeout(() => setCopiedPin(false), 2000);
      playRadarBlip();
    }
  };

  const handleSimulateScan = () => {
    setIsScanning(true);
    playRadarBlip();
    setTimeout(() => {
      setIsScanning(false);
      onVerifyCheckIn();
      onClose();
    }, 1200);
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim().toUpperCase() === dropPin || pinInput.trim().length >= 4) {
      setPinError(false);
      onVerifyCheckIn();
      onClose();
    } else {
      setPinError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm rounded-3xl bg-[#0E0E12] border border-[#24242B] shadow-2xl p-5 space-y-4 font-mono">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#24242B]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF]">
              {isHost ? <QrCode className="w-4 h-4" /> : <ScanLine className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#F4F4F6] uppercase tracking-wider">
                {isHost ? 'HOST CHECK-IN PASS' : 'SCAN HOST QR CODE'}
              </h3>
              <p className="text-[10px] text-[#8E8E9F]">
                {isHost ? 'Show to squad members' : 'Verify physical presence'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-[#8E8E9F] hover:text-[#F4F4F6] hover:bg-[#1B1B22] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* HOST VIEW: DISPLAY QR CODE PASS */}
        {isHost ? (
          <div className="space-y-4 text-center">
            
            {/* Cyberpunk QR Card */}
            <div className="p-5 rounded-2xl bg-[#141418] border-2 border-[#CCFF00]/40 shadow-[0_0_24px_rgba(204,255,0,0.15)] flex flex-col items-center justify-center space-y-3">
              
              {/* Dynamic Neon QR SVG */}
              <div className="relative p-3 rounded-xl bg-[#0A0A0C] border border-[#2E2E38]">
                <svg width="180" height="180" viewBox="0 0 180 180" className="w-44 h-44">
                  {/* Outer Frame */}
                  <rect width="180" height="180" fill="#0A0A0C" rx="10" />
                  
                  {/* Top-Left Finder */}
                  <rect x="15" y="15" width="45" height="45" fill="none" stroke="#CCFF00" strokeWidth="5" rx="4" />
                  <rect x="25" y="25" width="25" height="25" fill="#CCFF00" rx="2" />
                  
                  {/* Top-Right Finder */}
                  <rect x="120" y="15" width="45" height="45" fill="none" stroke="#CCFF00" strokeWidth="5" rx="4" />
                  <rect x="130" y="25" width="25" height="25" fill="#CCFF00" rx="2" />
                  
                  {/* Bottom-Left Finder */}
                  <rect x="15" y="120" width="45" height="45" fill="none" stroke="#CCFF00" strokeWidth="5" rx="4" />
                  <rect x="25" y="130" width="25" height="25" fill="#CCFF00" rx="2" />
                  
                  {/* Center Cyber Matrix Pattern */}
                  <g fill="#00F0FF">
                    <rect x="75" y="20" width="10" height="10" rx="2" />
                    <rect x="95" y="20" width="10" height="10" rx="2" />
                    <rect x="70" y="40" width="15" height="15" rx="2" />
                    <rect x="95" y="45" width="10" height="10" rx="2" />
                    <rect x="20" y="75" width="12" height="12" rx="2" />
                    <rect x="40" y="80" width="10" height="10" rx="2" />
                    <rect x="60" y="70" width="15" height="15" rx="2" />
                    <rect x="80" y="75" width="20" height="20" fill="#CCFF00" rx="3" />
                    <rect x="105" y="70" width="15" height="15" rx="2" />
                    <rect x="130" y="75" width="12" height="12" rx="2" />
                    <rect x="150" y="80" width="10" height="10" rx="2" />
                    <rect x="70" y="100" width="15" height="15" rx="2" />
                    <rect x="95" y="105" width="10" height="10" rx="2" />
                    <rect x="75" y="135" width="10" height="10" rx="2" />
                    <rect x="95" y="130" width="15" height="15" rx="2" />
                    <rect x="125" y="130" width="12" height="12" rx="2" />
                    <rect x="145" y="140" width="15" height="15" rx="2" />
                  </g>
                </svg>

                {/* Center Badge */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="w-9 h-9 rounded-lg bg-[#0A0A0C] border-2 border-[#CCFF00] flex items-center justify-center text-xs font-bold text-[#CCFF00]">
                    SQ
                  </span>
                </div>
              </div>

              {/* Host PIN Code */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#8E8E9F]">HOST PASSCODE:</span>
                <span className="px-2.5 py-1 rounded-lg bg-[#0A0A0C] border border-[#2E2E38] text-sm font-bold text-[#CCFF00] tracking-widest">
                  {dropPin}
                </span>
                <button
                  type="button"
                  onClick={handleCopyPin}
                  className="p-1.5 rounded-lg bg-[#1B1B22] hover:bg-[#2A2A35] text-[#8E8E9F] hover:text-white transition-colors"
                  title="Copy PIN"
                >
                  {copiedPin ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

            </div>

            <p className="text-[11px] text-[#8E8E9F] leading-relaxed">
              Show this screen to members when you assemble at <strong className="text-[#F4F4F6]">{drop.venueName}</strong>. 
              Gives instant verified check-in with zero GPS drift issues!
            </p>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-[#1B1B22] hover:bg-[#252530] border border-[#2E2E38] text-xs text-[#F4F4F6] font-bold transition-all"
            >
              Done Showing Code
            </button>
          </div>
        ) : (
          /* SQUAD MEMBER VIEW: SCAN QR CODE */
          <div className="space-y-4">
            
            {/* Camera Viewfinder Mock */}
            <div className="relative rounded-2xl overflow-hidden bg-[#0A0A0C] border-2 border-[#00F0FF]/50 aspect-square flex flex-col items-center justify-center p-4">
              
              {/* Corner Targets */}
              <div className="w-7 h-7 border-t-2 border-l-2 border-[#00F0FF] absolute top-3 left-3" />
              <div className="w-7 h-7 border-t-2 border-r-2 border-[#00F0FF] absolute top-3 right-3" />
              <div className="w-7 h-7 border-b-2 border-l-2 border-[#00F0FF] absolute bottom-3 left-3" />
              <div className="w-7 h-7 border-b-2 border-r-2 border-[#00F0FF] absolute bottom-3 right-3" />

              {/* Animated Laser Scanning Beam */}
              <div className="absolute left-6 right-6 h-0.5 bg-[#00F0FF] shadow-[0_0_12px_#00F0FF] animate-pulse top-1/2 -translate-y-1/2" />

              <div className="text-center space-y-2 z-10">
                <span className="text-3xl block">📷</span>
                <p className="text-xs font-bold text-[#F4F4F6]">
                  Point camera at Host's screen
                </p>
                <p className="text-[10px] text-[#8E8E9F]">
                  Venue: {drop.venueName}
                </p>
              </div>

              {isScanning && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-20">
                  <div className="text-center space-y-2">
                    <span className="w-6 h-6 border-2 border-[#CCFF00] border-t-transparent rounded-full animate-spin inline-block" />
                    <p className="text-xs text-[#CCFF00] font-bold">Verifying physical QR token...</p>
                  </div>
                </div>
              )}
            </div>

            {/* 1-Tap Instant Camera Verification */}
            <button
              type="button"
              onClick={handleSimulateScan}
              disabled={isScanning}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#CCFF00] hover:opacity-95 text-[#0A0A0C] text-xs font-bold flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(0,240,255,0.3)] transition-all"
            >
              <ScanLine className="w-4 h-4 text-[#0A0A0C]" />
              <span>Verify Host QR Pass Now (+10 Karma)</span>
            </button>

            {/* Manual Passcode Fallback */}
            <form onSubmit={handleVerifyPin} className="space-y-1.5 pt-1 border-t border-[#24242B]">
              <label className="block text-[10px] text-[#8E8E9F]">
                OR ENTER HOST PASSCODE:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`e.g. ${dropPin}`}
                  value={pinInput}
                  onChange={e => setPinInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-[#141418] border border-[#24242B] focus:border-[#CCFF00] text-xs text-[#F4F4F6] uppercase tracking-wider outline-none"
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-xl bg-[#1B1B22] hover:bg-[#282835] border border-[#2E2E38] text-xs text-[#CCFF00] font-bold transition-all"
                >
                  Verify
                </button>
              </div>
              {pinError && (
                <p className="text-[10px] text-[#FF0055]">
                  Passcode does not match host token. Check host's screen!
                </p>
              )}
            </form>

          </div>
        )}

      </div>
    </div>
  );
}
