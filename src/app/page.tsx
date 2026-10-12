'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useSideQuestStore } from '@/lib/store';
import { METRO_CITIES } from '@/lib/constants';
import QuestsFeed from '@/components/drops/QuestsFeed';
import BentoProfile from '@/components/profile/BentoProfile';
import DropModal from '@/components/drops/DropModal';
import CreateDropSheet from '@/components/drops/CreateDropSheet';
import ShareModal from '@/components/drops/ShareModal';
import AuthModal from '@/components/auth/AuthModal';
import MemberProfileModal from '@/components/profile/MemberProfileModal';
import LocationPickerModal from '@/components/map/LocationPickerModal';
import SpotifyConnectModal from '@/components/profile/SpotifyConnectModal';
import ScrapbookModal from '@/components/profile/ScrapbookModal';
import InstantPolaroidCamModal from '@/components/profile/InstantPolaroidCamModal';
import { 
  Compass, ListFilter, User, Zap, ChevronDown, Volume2, VolumeX, Navigation, MapPin, Camera 
} from 'lucide-react';
import { playGlideWhoosh, playRadarBlip } from '@/lib/audio';

// Dynamic import with SSR disabled for MapLibre WebGL canvas
const MetroMap = dynamic(() => import('@/components/map/MetroMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[450px] bg-[#0A0A0C] flex flex-col items-center justify-center font-mono text-xs text-[#CCFF00] gap-2">
      <Zap className="w-6 h-6 animate-bounce fill-current" />
      <span className="tracking-widest">LOADING RADAR MESH...</span>
    </div>
  )
});

export default function Home() {
  const {
    selectedCity,
    setSelectedCity,
    selectedCategory,
    setSelectedCategory,
    isGirlsOnlyFilter,
    toggleGirlsOnlyFilter,
    activeTab,
    setActiveTab,
    setCreateSheetOpen,
    drops,
    soundEnabled,
    toggleSound,
    userLocation,
    setLocationModalOpen,
    setInstantCamOpen
  } = useSideQuestStore();

  const cityDropsCount = drops.filter(d => d.cityId === selectedCity.id).length;

  // Deep-Linking & Marketing Campaigns Handler (?drop=<id>, ?city=<id>, ?tab=<tab>)
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    
    // 1. City Query Param (e.g. for r/mumbai, r/delhi targeted marketing campaigns)
    const cityParam = params.get('city');
    if (cityParam) {
      const targetCity = METRO_CITIES.find(c => c.id === cityParam.toLowerCase());
      if (targetCity && targetCity.id !== selectedCity.id) {
        setSelectedCity(targetCity.id);
      }
    }

    // 2. Direct Drop Flare Link (e.g. WhatsApp / Instagram invite ?drop=blr-drop-1)
    const dropParam = params.get('drop');
    if (dropParam) {
      const targetDrop = drops.find(d => d.id === dropParam);
      if (targetDrop) {
        if (targetDrop.cityId !== selectedCity.id) {
          setSelectedCity(targetDrop.cityId);
        }
        useSideQuestStore.getState().setActiveDropId(targetDrop.id);
      }
    }

    // 3. Tab Query Param (?tab=radar | quests | profile)
    const tabParam = params.get('tab');
    if (tabParam === 'radar' || tabParam === 'quests' || tabParam === 'profile') {
      setActiveTab(tabParam);
    }
  }, [drops, selectedCity.id, setSelectedCity, setActiveTab]);

  const handleTabChange = (tab: 'radar' | 'quests' | 'profile') => {
    playGlideWhoosh();
    setActiveTab(tab);
  };

  const handleCityChange = (cityId: string) => {
    playRadarBlip();
    setSelectedCity(cityId);
  };

  return (
    <main className="relative flex flex-col h-screen w-screen overflow-hidden bg-[#0A0A0C] text-[#F4F4F6]">
      
      {/* Top Bar Header */}
      <header className="relative z-20 flex flex-col border-b border-[#24242B] bg-[#0E0E12]/95 backdrop-blur-md px-4 py-2.5">
        <div className="flex items-center justify-between">
          
          {/* Logo & Metro City Selector */}
          <div className="flex items-center gap-2">
            <span className="font-mono font-black text-sm text-[#CCFF00] tracking-wider flex items-center gap-1">
              <Zap className="w-4 h-4 fill-current" /> SIDEQUEST
            </span>

            <div className="relative group">
              <select
                value={selectedCity.id}
                onChange={e => handleCityChange(e.target.value)}
                className="appearance-none pl-2.5 pr-6 py-1 rounded-full bg-[#141418] border border-[#24242B] text-xs font-mono text-[#F4F4F6] hover:border-[#CCFF00] transition-colors cursor-pointer outline-none"
              >
                {METRO_CITIES.map(city => (
                  <option key={city.id} value={city.id} className="bg-[#141418] text-[#F4F4F6]">
                    📍 {city.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-[#8E8E9F] absolute right-2 top-2 pointer-events-none" />
            </div>
          </div>

          {/* Right Header Area: Audio Synth Toggle, Instant Snap Cam & Telemetry Pill */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playRadarBlip();
                setInstantCamOpen(true);
              }}
              className="py-1 px-2.5 rounded-full border border-[#00F0FF]/40 bg-[#00F0FF]/15 text-[#00F0FF] hover:bg-[#00F0FF]/25 font-mono text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(0,240,255,0.2)] hover:scale-105"
              title="Snap Instant Polaroid Memory"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Snap</span>
            </button>

            <button
              onClick={toggleSound}
              className={`p-1.5 rounded-full border transition-all flex items-center justify-center ${
                soundEnabled 
                  ? 'border-[#CCFF00]/40 bg-[#CCFF00]/10 text-[#CCFF00] hover:scale-105 shadow-[0_0_8px_rgba(204,255,0,0.2)]' 
                  : 'border-[#24242B] bg-[#141418] text-[#8E8E9F] hover:text-[#F4F4F6]'
              }`}
              title={soundEnabled ? 'Mute Web Audio Synth Sound FX' : 'Enable Web Audio Synth Sound FX'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            <div className="px-2.5 py-0.5 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] font-mono font-bold text-[11px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-ping" />
              🔥 {cityDropsCount} FLARES
            </div>
          </div>
        </div>

        {/* Filter Pills (Horizontal Scroll) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 pb-0.5">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1 rounded-full text-xs font-mono whitespace-nowrap transition-all border ${
              selectedCategory === 'ALL'
                ? 'bg-[#CCFF00] text-[#0A0A0C] border-[#CCFF00] font-bold shadow-[0_0_10px_rgba(204,255,0,0.3)]'
                : 'bg-[#141418] text-[#8E8E9F] border-[#24242B] hover:text-[#F4F4F6]'
            }`}
          >
            ⚡ All Flares
          </button>
          
          <button
            onClick={() => setSelectedCategory('CHAI_FOOD')}
            className={`px-3 py-1 rounded-full text-xs font-mono whitespace-nowrap transition-all border ${
              selectedCategory === 'CHAI_FOOD'
                ? 'bg-[#CCFF00] text-[#0A0A0C] border-[#CCFF00] font-bold'
                : 'bg-[#141418] text-[#8E8E9F] border-[#24242B] hover:text-[#F4F4F6]'
            }`}
          >
            🧋 Chai & Food
          </button>

          <button
            onClick={() => setSelectedCategory('SPORTS')}
            className={`px-3 py-1 rounded-full text-xs font-mono whitespace-nowrap transition-all border ${
              selectedCategory === 'SPORTS'
                ? 'bg-[#CCFF00] text-[#0A0A0C] border-[#CCFF00] font-bold'
                : 'bg-[#141418] text-[#8E8E9F] border-[#24242B] hover:text-[#F4F4F6]'
            }`}
          >
            🏸 Sports & Turf
          </button>

          <button
            onClick={() => setSelectedCategory('COWORK_DEV')}
            className={`px-3 py-1 rounded-full text-xs font-mono whitespace-nowrap transition-all border ${
              selectedCategory === 'COWORK_DEV'
                ? 'bg-[#CCFF00] text-[#0A0A0C] border-[#CCFF00] font-bold'
                : 'bg-[#141418] text-[#8E8E9F] border-[#24242B] hover:text-[#F4F4F6]'
            }`}
          >
            💻 Dev & Cowork
          </button>

          <button
            onClick={() => setSelectedCategory('GIGS_CULTURE')}
            className={`px-3 py-1 rounded-full text-xs font-mono whitespace-nowrap transition-all border ${
              selectedCategory === 'GIGS_CULTURE'
                ? 'bg-[#CCFF00] text-[#0A0A0C] border-[#CCFF00] font-bold'
                : 'bg-[#141418] text-[#8E8E9F] border-[#24242B] hover:text-[#F4F4F6]'
            }`}
          >
            🎭 Gigs & Culture
          </button>

          {/* Girls Only 🌸 Tag */}
          <button
            onClick={toggleGirlsOnlyFilter}
            className={`px-3 py-1 rounded-full text-xs font-mono whitespace-nowrap transition-all border flex items-center gap-1 ${
              isGirlsOnlyFilter
                ? 'bg-[#FF007A] text-white border-[#FF007A] font-bold shadow-[0_0_10px_rgba(255,0,122,0.4)]'
                : 'bg-[#141418] text-[#FF007A] border-[#FF007A]/30 hover:border-[#FF007A]'
            }`}
          >
            🌸 Girls Only
          </button>
        </div>

        {/* Live GPS Telemetry & Neighborhood Radar Bar */}
        <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-[#1C1C24] text-[11px] font-mono">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className={`w-2 h-2 rounded-full shrink-0 ${
              userLocation 
                ? (userLocation.isLiveGps ? 'bg-[#CCFF00] animate-ping' : 'bg-[#00F0FF]') 
                : 'bg-[#FF0055] animate-pulse'
            }`} />
            <span className="text-[#8E8E9F] shrink-0 text-[10px]">RADAR PIN:</span>
            <span className={`truncate text-xs font-bold ${userLocation ? 'text-[#F4F4F6]' : 'text-[#8E8E9F]'}`}>
              {userLocation?.addressName || (userLocation ? `${userLocation.lat.toFixed(4)}°, ${userLocation.lng.toFixed(4)}°` : 'Using Metro Center')}
            </span>
            {userLocation?.isLiveGps && (
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30 font-bold shrink-0">
                LIVE GPS
              </span>
            )}
          </div>

          <button
            onClick={() => setLocationModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1B1B22] hover:bg-[#24242B] border border-[#24242B] hover:border-[#CCFF00] text-xs font-mono text-[#CCFF00] transition-colors shrink-0 ml-2"
            title="Set exact location or request browser GPS"
          >
            <Navigation className="w-3 h-3" />
            <span>{userLocation ? 'Change Pin' : '📡 Enable GPS'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="relative flex-1 w-full min-h-0 overflow-hidden pb-14">
        {activeTab === 'radar' && <MetroMap />}
        {activeTab === 'quests' && (
          <div className="h-full overflow-y-auto">
            <QuestsFeed />
          </div>
        )}
        {activeTab === 'profile' && (
          <div className="h-full overflow-y-auto">
            <BentoProfile />
          </div>
        )}
      </div>

      {/* Persistent Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around px-4 py-2 bg-[#0E0E12]/95 backdrop-blur-md border-t border-[#24242B]">
        
        {/* Radar Tab */}
        <button
          onClick={() => handleTabChange('radar')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-mono transition-colors ${
            activeTab === 'radar' ? 'text-[#CCFF00] font-bold' : 'text-[#8E8E9F] hover:text-[#F4F4F6]'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>Radar</span>
        </button>

        {/* Center Prominent Glowing "Drop Flare" Button */}
        <button
          onClick={() => setCreateSheetOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A0A0C] font-mono font-bold text-xs shadow-[0_0_18px_rgba(204,255,0,0.4)] transition-all hover:scale-105"
        >
          <Zap className="w-4 h-4 fill-current" /> DROP A FLARE
        </button>

        {/* Quests Feed Tab */}
        <button
          onClick={() => handleTabChange('quests')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-mono transition-colors ${
            activeTab === 'quests' ? 'text-[#CCFF00] font-bold' : 'text-[#8E8E9F] hover:text-[#F4F4F6]'
          }`}
        >
          <ListFilter className="w-5 h-5" />
          <span>Feed ({cityDropsCount})</span>
        </button>

        {/* Bento Profile Tab */}
        <button
          onClick={() => handleTabChange('profile')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-mono transition-colors ${
            activeTab === 'profile' ? 'text-[#CCFF00] font-bold' : 'text-[#8E8E9F] hover:text-[#F4F4F6]'
          }`}
        >
          <User className="w-5 h-5" />
          <span>Profile</span>
        </button>
      </nav>

      {/* Modals & Bottom Sheets */}
      <DropModal />
      <CreateDropSheet />
      <ShareModal />
      <AuthModal />
      <MemberProfileModal />
      <LocationPickerModal />
      <SpotifyConnectModal />
      <ScrapbookModal />
      <InstantPolaroidCamModal />
    </main>
  );
}
