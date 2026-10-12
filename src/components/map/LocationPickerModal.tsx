'use client';

import React, { useState } from 'react';
import { useSideQuestStore } from '@/lib/store';
import { 
  X, Navigation, MapPin, Sparkles, Check, AlertCircle, Compass 
} from 'lucide-react';
import { METRO_CITIES } from '@/lib/constants';
import { findClosestMetro } from '@/lib/geo';
import { playRadarBlip, playCheckInChime } from '@/lib/audio';

export default function LocationPickerModal() {
  const { 
    isLocationModalOpen, 
    setLocationModalOpen, 
    userLocation, 
    setLocationCoords, 
    selectedCity, 
    setSelectedCity 
  } = useSideQuestStore();

  const [isLocating, setIsLocating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isLocationModalOpen) return null;

  const handleRequestLiveGps = () => {
    setIsLocating(true);
    setErrorMessage(null);
    playRadarBlip();

    if (!navigator.geolocation) {
      setIsLocating(false);
      setErrorMessage('Geolocation is not supported by your browser. Please select a neighborhood below.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        // Auto-detect closest metro city
        const closest = findClosestMetro(lat, lng, METRO_CITIES);
        if (closest.city && closest.city.id !== selectedCity.id) {
          setSelectedCity(closest.city.id);
        }

        setLocationCoords(lat, lng, `Live GPS (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`, true);
        playCheckInChime();
        setLocationModalOpen(false);
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err);
        setErrorMessage(
          err.code === 1 
            ? 'Location access was blocked. Enable location in browser settings, or select a neighborhood below.'
            : 'Could not obtain GPS lock. Pick a neighborhood below to set your position.'
        );
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 10000 }
    );
  };

  const handleSelectHotspot = (hotspot: typeof selectedCity.hotspots[0]) => {
    playRadarBlip();
    setLocationCoords(hotspot.lat, hotspot.lng, hotspot.name, false);
    setLocationModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-[#0E0E12] border border-[#24242B] shadow-2xl p-5 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#24242B]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] animate-pulse" />
            <h3 className="text-xs font-mono font-bold text-[#F4F4F6] uppercase tracking-wider">
              RADAR TELEMETRY // SET YOUR LOCATION
            </h3>
          </div>
          <button 
            onClick={() => setLocationModalOpen(false)}
            className="p-1 rounded-lg text-[#8E8E9F] hover:text-[#F4F4F6] hover:bg-[#1B1B22] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Location Status */}
        <div className="p-3.5 rounded-xl bg-[#141418] border border-[#24242B] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <MapPin className={`w-4 h-4 ${userLocation ? 'text-[#00F0FF]' : 'text-[#8E8E9F]'}`} />
            <div>
              <div className="text-[10px] text-[#8E8E9F]">CURRENT ACTIVE POSITION</div>
              <div className="font-bold text-[#F4F4F6]">
                {userLocation 
                  ? (userLocation.addressName || `${userLocation.lat.toFixed(4)}°, ${userLocation.lng.toFixed(4)}°`)
                  : `Default: ${selectedCity.name} Center`}
              </div>
            </div>
          </div>
          {userLocation?.isLiveGps && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30">
              LIVE GPS
            </span>
          )}
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-[#FF0055]/10 border border-[#FF0055]/30 text-xs font-mono text-[#FF0055] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Primary Action: Request Live Browser GPS */}
        <div className="space-y-1.5">
          <button
            onClick={handleRequestLiveGps}
            disabled={isLocating}
            className="w-full py-3 px-4 rounded-xl bg-[#00F0FF] hover:bg-[#00d6e6] text-[#0A0A0C] font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(0,240,255,0.4)] transition-all"
          >
            <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Requesting GPS Permission...' : '📡 Request Live Browser GPS'}</span>
          </button>
          <p className="text-[10px] font-mono text-[#8E8E9F] text-center">
            Triggers browser prompt. Calculates walking distance & unlocks 500m geofence check-ins.
          </p>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-2">
          <div className="border-t border-[#24242B] w-full" />
          <span className="bg-[#0E0E12] px-2 text-[10px] font-mono text-[#8E8E9F] absolute">
            OR SELECT NEIGHBORHOOD
          </span>
        </div>

        {/* Hotspots Quick Select for Active City */}
        <div className="space-y-2">
          <div className="text-[11px] font-mono text-[#8E8E9F] flex items-center justify-between">
            <span>POPULAR ZONES IN {selectedCity.name.toUpperCase()}</span>
            <span className="text-[10px] text-[#CCFF00]">1-TAP SET</span>
          </div>

          <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
            {selectedCity.hotspots.map((hotspot) => {
              const isSelected = userLocation?.addressName === hotspot.name;
              return (
                <button
                  key={hotspot.id}
                  onClick={() => handleSelectHotspot(hotspot)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-[#CCFF00]/15 border-[#CCFF00] text-[#CCFF00]'
                      : 'bg-[#141418] border-[#24242B] text-[#F4F4F6] hover:border-[#CCFF00]/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Compass className="w-3.5 h-3.5 text-[#CCFF00]" />
                    <div>
                      <div className="text-xs font-mono font-bold">{hotspot.name}</div>
                      <div className="text-[10px] font-mono text-[#8E8E9F]">{hotspot.description}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#CCFF00]" />}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
