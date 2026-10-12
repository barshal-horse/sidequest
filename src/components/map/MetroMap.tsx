'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSideQuestStore } from '@/lib/store';
import { Crosshair, Plus, Minus, Radio, Compass, Layers, Navigation, Sparkles } from 'lucide-react';
import { METRO_CITIES } from '@/lib/constants';
import { findClosestMetro } from '@/lib/geo';
import { playRadarBlip, playGlideWhoosh } from '@/lib/audio';
import SonarRadarSweep from '../radar/SonarRadarSweep';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function MetroMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [coordsReadout, setCoordsReadout] = useState<string>('');
  const [is3DMode, setIs3DMode] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsToast, setGpsToast] = useState<string | null>(null);
  const [isSonarOpen, setIsSonarOpen] = useState(false);

  const {
    selectedCity,
    setSelectedCity,
    selectedCategory,
    isGirlsOnlyFilter,
    drops,
    activeDropId,
    setActiveDropId,
    userLocation,
    setUserLocation,
    currentUser,
    recentCreatedDropCoords,
    clearRecentCreatedDropCoords
  } = useSideQuestStore();

  // Initialize MapLibre GL 3D Vector Canvas (OpenFreeMap 100% Free, Zero Keys, Zero Watermarks)
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    let isMounted = true;

    import('maplibre-gl').then(({ Map, setWorkerUrl }) => {
      if (!isMounted || !mapContainer.current) return;

      // Point worker to local public static bundle (solves Turbopack worker issue)
      try {
        setWorkerUrl('/maplibre-gl-worker.mjs');
      } catch (err) {
        console.warn('MapLibre worker setup notice:', err);
      }

      const map = new Map({
        container: mapContainer.current,
        style: 'https://tiles.openfreemap.org/styles/dark',
        center: selectedCity.center, // [lng, lat]
        zoom: selectedCity.zoom,
        pitch: 52, // 3D Cyberpunk tilt
        bearing: -12,
        attributionControl: false,
        maxPitch: 70
      });

      map.on('styleimagemissing', () => {
        // Silently handle optional terrain pattern sprites
      });

      map.on('load', () => {
        if (!isMounted) return;

        // Try adding 3D Buildings extrusion if vector layer exists
        try {
          const layers = map.getStyle().layers;
          const labelLayerId = layers?.find(
            (l: any) => l.type === 'symbol' && l.layout && l.layout['text-field']
          )?.id;

          if (map.getSource('openmaptiles')) {
            map.addLayer(
              {
                id: '3d-buildings-neon',
                source: 'openmaptiles',
                'source-layer': 'building',
                type: 'fill-extrusion',
                minzoom: 13,
                paint: {
                  'fill-extrusion-color': '#111116',
                  'fill-extrusion-height': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    13,
                    0,
                    15.05,
                    ['get', 'render_height']
                  ],
                  'fill-extrusion-base': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    13,
                    0,
                    15.05,
                    ['get', 'render_min_height']
                  ],
                  'fill-extrusion-opacity': 0.75
                }
              },
              labelLayerId
            );
          }
        } catch (e) {
          // Fallback gracefully if style already provides building styling
        }

        mapRef.current = map;
        setMapReady(true);
      });

      map.on('move', () => {
        const center = map.getCenter();
        setCoordsReadout(`${center.lat.toFixed(4)}° N, ${center.lng.toFixed(4)}° E`);
      });
    });

    return () => {
      isMounted = false;
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Handle City Change (Cinematic Camera Fly-Over)
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    mapRef.current.flyTo({
      center: selectedCity.center,
      zoom: selectedCity.zoom,
      pitch: is3DMode ? 52 : 0,
      bearing: is3DMode ? -12 : 0,
      speed: 1.2,
      curve: 1.4,
      essential: true
    });
  }, [selectedCity, mapReady, is3DMode]);

  // Handle Newly Created Flare (Fly Camera & Focus Luminous Node)
  useEffect(() => {
    if (!mapRef.current || !mapReady || !recentCreatedDropCoords) return;

    const { lat, lng } = recentCreatedDropCoords;
    mapRef.current.flyTo({
      center: [lng, lat],
      zoom: 16.5,
      pitch: 58,
      bearing: -10,
      speed: 1.3,
      duration: 1200,
      essential: true
    });

    setGpsToast(`⚡ Flare Ignited on Radar! Broadcasted to all devices.`);
    setTimeout(() => setGpsToast(null), 4500);

    // Clear coords trigger after camera flight
    const timer = setTimeout(() => {
      clearRecentCreatedDropCoords();
    }, 1500);

    return () => clearTimeout(timer);
  }, [recentCreatedDropCoords, mapReady, clearRecentCreatedDropCoords]);

  // Render Dynamic User Position Beacon Marker
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (!userLocation) return;

    import('maplibre-gl').then(({ Marker }) => {
      if (!mapRef.current) return;

      const el = document.createElement('div');
      el.className = 'group cursor-pointer select-none';
      el.style.transform = 'translate(-50%, -50%)';

      el.innerHTML = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          <!-- Pulsing Cyan Radar Sonar Ring -->
          <div style="position: absolute; top: -6px; width: 48px; height: 48px; border-radius: 9999px; border: 2.5px solid #00F0FF; background: rgba(0,240,255,0.18); animation: beacon-ping 1.8s cubic-bezier(0,0,0.2,1) infinite;"></div>
          
          <!-- Luminous Core -->
          <div style="position: relative; z-index: 15; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 9999px; background: #0E0E12; border: 2.5px solid #00F0FF; box-shadow: 0 0 18px rgba(0,240,255,0.85);">
            <img src="${currentUser.avatarUrl}" style="width: 24px; height: 24px; border-radius: 9999px; object-fit: cover;" />
          </div>

          <!-- Glassmorphism Live Tag -->
          <div style="position: relative; z-index: 15; margin-top: 4px; padding: 2px 7px; border-radius: 9999px; background: rgba(14,14,18,0.95); border: 1px solid #00F0FF; display: flex; align-items: center; gap: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.8);">
            <span style="width: 5px; height: 5px; border-radius: 9999px; background: #00F0FF;"></span>
            <span style="font-size: 9px; font-family: monospace; font-weight: 800; color: #00F0FF; white-space: nowrap;">
              YOU ARE HERE (@${currentUser.handle})
            </span>
          </div>
        </div>
      `;

      el.addEventListener('click', () => {
        playRadarBlip();
        mapRef.current?.flyTo({
          center: [userLocation.lng, userLocation.lat],
          zoom: 16.5,
          pitch: 58,
          duration: 900
        });
      });

      const marker = new Marker({ element: el })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(mapRef.current);

      userMarkerRef.current = marker;
    });
  }, [userLocation, mapReady, currentUser]);

  // Handle GPS Locate Me
  const handleLocateMe = () => {
    setIsLocating(true);
    playRadarBlip();

    if (!navigator.geolocation) {
      applySimulatedGps('Geolocation not supported in browser. Dropping simulated GPS in Koramangala.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLocation({ lat, lng });
        playGlideWhoosh();

        const closest = findClosestMetro(lat, lng, METRO_CITIES);
        if (closest.city) {
          if (closest.city.id !== selectedCity.id) {
            setSelectedCity(closest.city.id);
            setGpsToast(`GPS Locked! Auto-switched to closest metro: ${closest.city.name} (${(closest.distanceMeters / 1000).toFixed(0)}km away)`);
          } else {
            setGpsToast(`GPS Locked! You are in ${closest.city.name}`);
          }
          setTimeout(() => setGpsToast(null), 4500);
        }

        mapRef.current?.flyTo({
          center: [lng, lat],
          zoom: 16.2,
          pitch: is3DMode ? 56 : 0,
          bearing: -10,
          duration: 1500
        });
      },
      (err) => {
        setIsLocating(false);
        applySimulatedGps(`GPS unavailable: Pinpointed simulated hotspot in ${selectedCity.name}.`);
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  };

  const applySimulatedGps = (message: string) => {
    setIsLocating(false);
    const hotspot = selectedCity.hotspots[0] || { lat: selectedCity.center[1], lng: selectedCity.center[0], name: selectedCity.name };
    const simLat = hotspot.lat + 0.0012;
    const simLng = hotspot.lng + 0.0015;
    setUserLocation({ lat: simLat, lng: simLng });
    setGpsToast(message);
    setTimeout(() => setGpsToast(null), 4500);
    playGlideWhoosh();

    mapRef.current?.flyTo({
      center: [simLng, simLat],
      zoom: 16.2,
      pitch: is3DMode ? 56 : 0,
      duration: 1200
    });
  };

  // Filter Drops
  const filteredDrops = drops.filter(drop => {
    if (drop.cityId !== selectedCity.id) return false;
    if (selectedCategory !== 'ALL' && drop.category !== selectedCategory) return false;
    if (isGirlsOnlyFilter && !drop.isGirlsOnly) return false;
    return true;
  });

  // Render Futuristic 3D Radar Drop Nodes
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    import('maplibre-gl').then(({ Marker }) => {
      // Clear previous markers
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      // Group overlapping / co-located drops in the same spot so they disperse (spiderfy) gracefully
      const coordCounts: Record<string, number> = {};
      const coordIndices: Record<string, number> = {};

      filteredDrops.forEach(drop => {
        // Round to 4 decimal places (~10m tolerance) to detect same spot
        const key = `${drop.lat.toFixed(4)}_${drop.lng.toFixed(4)}`;
        coordCounts[key] = (coordCounts[key] || 0) + 1;
      });

      filteredDrops.forEach((drop, index) => {
        const isSelected = activeDropId === drop.id;
        const isUrgent = (new Date(drop.expiresAt).getTime() - Date.now()) < 20 * 60 * 1000;

        const themeColor = drop.isGirlsOnly
          ? '#FF007A'
          : isUrgent
          ? '#FF0055'
          : drop.category === 'COWORK_DEV'
          ? '#00F0FF'
          : '#CCFF00';

        const categoryEmoji =
          drop.category === 'CHAI_FOOD' ? '🧋' :
          drop.category === 'SPORTS' ? '🏸' :
          drop.category === 'COWORK_DEV' ? '💻' : '🎭';

        // Spiderfy dispersion: if multiple drops share the same area/hotspot,
        // arrange them in a neat radial cluster so every flare is 100% visible and clickable
        const key = `${drop.lat.toFixed(4)}_${drop.lng.toFixed(4)}`;
        const totalAtSpot = coordCounts[key] || 1;
        const spotIdx = coordIndices[key] || 0;
        coordIndices[key] = spotIdx + 1;

        let displayLat = drop.lat;
        let displayLng = drop.lng;

        if (totalAtSpot > 1) {
          const angle = (2 * Math.PI * spotIdx) / totalAtSpot;
          // ~25 meters displacement radius so nodes fan out cleanly around the venue
          const radiusMeters = 28;
          const latOffset = (radiusMeters / 111320) * Math.sin(angle);
          const lngOffset = (radiusMeters / (111320 * Math.cos((drop.lat * Math.PI) / 180))) * Math.cos(angle);
          displayLat = drop.lat + latOffset;
          displayLng = drop.lng + lngOffset;
        }

        // Custom DOM Marker element
        const el = document.createElement('div');
        el.className = 'group cursor-pointer select-none';
        el.style.transform = 'translate(-50%, -50%)';
        el.style.zIndex = isSelected ? '50' : `${20 + index}`;

        el.innerHTML = `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
            <!-- Outer Sonar Pulse Wave -->
            <div style="position: absolute; top: -4px; width: 44px; height: 44px; border-radius: 9999px; border: 2px solid ${themeColor}; background: ${themeColor}18; animation: beacon-ping 2.2s cubic-bezier(0,0,0.2,1) infinite;"></div>
            
            <!-- Neon Luminous Node Core -->
            <div style="position: relative; z-index: 10; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 9999px; background: #0E0E12; border: 2.5px solid ${themeColor}; box-shadow: 0 0 16px ${themeColor}AA; transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'}; transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);">
              <span style="font-size: 14px; line-height: 1;">${categoryEmoji}</span>
            </div>

            <!-- Sleek Glassmorphism Micro-HUD Pill -->
            <div style="position: relative; z-index: 10; margin-top: 5px; padding: 2px 8px; border-radius: 9999px; background: rgba(14,14,18,0.92); border: 1px solid #24242B; display: flex; align-items: center; gap: 4.5px; box-shadow: 0 4px 16px rgba(0,0,0,0.7); backdrop-filter: blur(8px);">
              <span style="font-size: 10px; font-family: monospace; font-weight: 700; color: #F4F4F6; white-space: nowrap; max-width: 80px; overflow: hidden; text-overflow: ellipsis;">
                ${drop.venueName.split(' ')[0]}
              </span>
              <span style="font-size: 9px; font-family: monospace; font-weight: 800; color: ${themeColor};">
                ${drop.currentSlots}/${drop.maxSlots}
              </span>
              ${drop.isGirlsOnly ? '<span style="font-size: 9px;">🌸</span>' : ''}
            </div>
          </div>
        `;

        el.addEventListener('click', () => {
          setActiveDropId(drop.id);
          mapRef.current?.flyTo({
            center: [displayLng, displayLat],
            zoom: 16.5,
            pitch: 58,
            duration: 900
          });
        });

        const marker = new Marker({ element: el })
          .setLngLat([displayLng, displayLat])
          .addTo(mapRef.current);

        markersRef.current.push(marker);
      });
    });
  }, [filteredDrops, activeDropId, mapReady, selectedCity]);

  // HUD Controls
  const handleRecenter = () => {
    mapRef.current?.flyTo({
      center: selectedCity.center,
      zoom: selectedCity.zoom,
      pitch: is3DMode ? 52 : 0,
      bearing: is3DMode ? -12 : 0,
      duration: 900
    });
  };

  const toggle3D = () => {
    const nextMode = !is3DMode;
    setIs3DMode(nextMode);
    mapRef.current?.easeTo({
      pitch: nextMode ? 52 : 0,
      bearing: nextMode ? -12 : 0,
      duration: 600
    });
  };

  const handleZoom = (delta: number) => {
    if (!mapRef.current) return;
    mapRef.current.easeTo({
      zoom: mapRef.current.getZoom() + delta,
      duration: 300
    });
  };

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#0A0A0C]">
      {/* 3D MapLibre WebGL Canvas Container */}
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }} />

      {/* Cyber Grid Matrix Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 radar-grid-bg opacity-20" />

      {/* Sweeping Sci-Fi Radar Beam */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden flex items-center justify-center">
        <div className="w-[880px] h-[880px] rounded-full border border-[#CCFF00]/10 flex items-center justify-center">
          <div className="w-[580px] h-[580px] rounded-full border border-[#CCFF00]/15 flex items-center justify-center">
            <div className="w-[280px] h-[280px] rounded-full border border-[#CCFF00]/20" />
          </div>
        </div>
        {/* Active Radar Scanner Cone */}
        <div 
          className="absolute w-[880px] h-[880px] rounded-full pointer-events-none radar-sweep-beam"
          style={{
            background: 'conic-gradient(from 0deg at 50% 50%, rgba(204, 255, 0, 0.12) 0deg, rgba(204, 255, 0, 0) 50deg, transparent 360deg)'
          }}
        />
      </div>

      {/* Decorative Dark Vignette */}
      <div className="absolute inset-0 pointer-events-none z-10 opacity-35 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(10,10,12,0.9)_100%)]" />

      {/* Top Center: Hotspot Quick Jumper Pills */}
      <div className="absolute left-4 right-4 top-3 z-20 flex items-center justify-center">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full px-2 py-1 rounded-full bg-[#0E0E12]/85 backdrop-blur-md border border-[#24242B] shadow-xl">
          <span className="text-[10px] font-mono text-[#8E8E9F] pl-1.5 flex items-center gap-1">
            <Radio className="w-3 h-3 text-[#CCFF00] animate-pulse" /> ZONES:
          </span>
          {selectedCity.hotspots.map(h => (
            <button
              key={h.id}
              onClick={() => {
                mapRef.current?.flyTo({
                  center: [h.lng, h.lat],
                  zoom: 15.5,
                  pitch: is3DMode ? 55 : 0,
                  duration: 1000
                });
              }}
              className="flex-shrink-0 px-2.5 py-0.5 rounded-full bg-[#141418] border border-[#24242B] hover:border-[#CCFF00] text-[#F4F4F6] hover:text-[#CCFF00] text-[11px] font-mono transition-all"
            >
              {h.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Top Right: Live Telemetry HUD Readout */}
      <div className="absolute right-4 top-14 z-20 hidden sm:flex items-center gap-2 px-3 py-1 rounded-md bg-[#0E0E12]/85 backdrop-blur-md border border-[#24242B] text-[10px] font-mono text-[#8E8E9F] shadow-lg">
        <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-ping" />
        <span>RADAR: {coordsReadout || `${selectedCity.center[1].toFixed(4)}° N, ${selectedCity.center[0].toFixed(4)}° E`}</span>
        <span className="text-[#CCFF00] pl-1 font-bold">{is3DMode ? '3D' : '2D'}</span>
      </div>

      {/* GPS Status Toast */}
      {gpsToast && (
        <div className="absolute top-14 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-30 p-2.5 rounded-xl bg-[#0E0E12]/95 border border-[#00F0FF]/50 text-xs font-mono text-[#00F0FF] flex items-center gap-2 shadow-2xl backdrop-blur-md animate-fade-in">
          <Sparkles className="w-4 h-4 text-[#CCFF00] flex-shrink-0" />
          <span className="leading-tight">{gpsToast}</span>
        </div>
      )}

      {/* Floating HUD Controls (Right Side) */}
      <div className="absolute right-4 bottom-20 z-20 flex flex-col gap-1.5">
        <button
          onClick={() => {
            playRadarBlip();
            setIsSonarOpen(true);
          }}
          className="w-9 h-9 rounded-lg bg-[#00F0FF]/20 border border-[#00F0FF] text-[#00F0FF] hover:bg-[#00F0FF]/30 backdrop-blur-md flex items-center justify-center transition-all shadow-[0_0_14px_rgba(0,240,255,0.4)]"
          title="2.0km Sonar Radar Acoustic Sweep"
        >
          <Radio className="w-4 h-4 animate-pulse" />
        </button>

        <button
          onClick={handleLocateMe}
          disabled={isLocating}
          className={`w-9 h-9 rounded-lg backdrop-blur-md border flex items-center justify-center transition-all shadow-lg ${
            userLocation
              ? 'bg-[#00F0FF] text-[#0A0A0C] border-[#00F0FF] shadow-[0_0_14px_rgba(0,240,255,0.45)]'
              : 'bg-[#0E0E12]/90 text-[#8E8E9F] border-[#24242B] hover:text-[#00F0FF] hover:border-[#00F0FF]'
          }`}
          title="Locate Me / GPS Radar Beacon"
        >
          <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin text-[#00F0FF]' : ''}`} />
        </button>

        <button
          onClick={toggle3D}
          className={`w-9 h-9 rounded-lg backdrop-blur-md border flex items-center justify-center font-mono text-xs font-bold transition-all shadow-lg ${
            is3DMode 
              ? 'bg-[#CCFF00] text-[#0A0A0C] border-[#CCFF00] shadow-[0_0_12px_rgba(204,255,0,0.35)]' 
              : 'bg-[#0E0E12]/90 text-[#8E8E9F] border-[#24242B] hover:text-[#F4F4F6]'
          }`}
          title="Toggle 3D Perspective"
        >
          {is3DMode ? '3D' : '2D'}
        </button>

        <button
          onClick={handleRecenter}
          className="w-9 h-9 rounded-lg bg-[#0E0E12]/90 backdrop-blur-md border border-[#24242B] flex items-center justify-center text-[#F4F4F6] hover:border-[#CCFF00] hover:text-[#CCFF00] transition-colors shadow-lg"
          title="Recenter City View"
        >
          <Crosshair className="w-4 h-4" />
        </button>

        <button
          onClick={() => handleZoom(1)}
          className="w-9 h-9 rounded-lg bg-[#0E0E12]/90 backdrop-blur-md border border-[#24242B] flex items-center justify-center text-[#F4F4F6] hover:border-[#CCFF00] hover:text-[#CCFF00] transition-colors shadow-lg"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>

        <button
          onClick={() => handleZoom(-1)}
          className="w-9 h-9 rounded-lg bg-[#0E0E12]/90 backdrop-blur-md border border-[#24242B] flex items-center justify-center text-[#F4F4F6] hover:border-[#CCFF00] hover:text-[#CCFF00] transition-colors shadow-lg"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* Sonar Radar Acoustic Sweep HUD Modal */}
      <SonarRadarSweep isOpen={isSonarOpen} onClose={() => setIsSonarOpen(false)} />

    </div>
  );
}
