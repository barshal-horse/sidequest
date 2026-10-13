import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Drop, MetroCity, DropCategory, UserProfile, UserLocation, ChatMessage, ScrapbookMemory } from '@/types';
import { METRO_CITIES, INITIAL_DROPS, INITIAL_DROP_CHATS, DEMO_PROFILES, generateRandomPersona, DEFAULT_SCRAPBOOK_MEMORIES } from './constants';
import { toggleMuteSound } from './audio';

const DEFAULT_NEW_EXPLORER: UserProfile = {
  id: 'user-pilot',
  handle: 'radar.explorer',
  fullName: 'New Explorer',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  city: 'Bengaluru',
  karmaScore: 100,
  questsCompleted: 0,
  flakeRate: 0,
  isVerified: true,
  gender: 'OTHER',
  isSpotifyConnected: false,
  spotifyTopArtists: [],
  currentRotation: undefined,
  audioAura: undefined,
  badges: ['⚡ New Explorer', '🔥 100% Show-Up'],
  bioManifesto: 'Spontaneous sidequest explorer. Tap "Edit Profile" to claim your unique identity!',
  isProfileCustomized: false,
  vibeTags: ['🧋 3am Chai Runs', '🎧 UK Garage', '🎾 Turf Badminton', '📸 Film Camera', '🍵 Iced Matcha'],
  liveStatus: 'Down for Chai right now 🧋',
  scrapbookMemories: DEFAULT_SCRAPBOOK_MEMORIES
};

interface SideQuestStore {
  selectedCity: MetroCity;
  selectedCategory: DropCategory | 'ALL';
  isGirlsOnlyFilter: boolean;
  drops: Drop[];
  dropChats: Record<string, ChatMessage[]>;
  currentUser: UserProfile;
  userLocation: UserLocation | null;
  inspectedMember: UserProfile | null;
  soundEnabled: boolean;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalReason: string | null;
  isLocationModalOpen: boolean;
  isScrapbookModalOpen: boolean;
  isSpotifyModalOpen: boolean;
  isInstantCamOpen: boolean;
  activeDropId: string | null;
  isCreateSheetOpen: boolean;
  isShareModalOpen: boolean;
  selectedShareDrop: Drop | null;
  activeTab: 'radar' | 'quests' | 'profile';
  registeredProfiles: UserProfile[];
  recentCreatedDropCoords: { lat: number; lng: number; dropId: string } | null;
  hasCompletedOnboarding: boolean;
  
  // Actions
  setHasCompletedOnboarding: (completed: boolean) => void;
  syncWithServer: () => Promise<void>;
  clearRecentCreatedDropCoords: () => void;
  setSelectedCity: (cityId: string) => void;
  setSelectedCategory: (cat: DropCategory | 'ALL') => void;
  toggleGirlsOnlyFilter: () => void;
  setActiveDropId: (id: string | null) => void;
  sendDropMessage: (dropId: string, text: string) => void;
  setUserLocation: (loc: UserLocation | null) => void;
  setLocationModalOpen: (open: boolean) => void;
  setScrapbookModalOpen: (open: boolean) => void;
  setSpotifyModalOpen: (open: boolean) => void;
  setInstantCamOpen: (open: boolean) => void;
  connectSpotify: (trackAndArtist: string, audioAura?: string) => void;
  disconnectSpotify: () => void;
  addScrapbookMemory: (memory: Omit<ScrapbookMemory, 'id' | 'likes'>) => void;
  likeScrapbookMemory: (memoryId: string) => void;
  setLocationCoords: (lat: number, lng: number, addressName?: string, isLiveGps?: boolean) => void;
  setInspectedMember: (member: UserProfile | null) => void;
  toggleSound: () => boolean;
  setCreateSheetOpen: (open: boolean) => void;
  openShareModal: (drop: Drop) => void;
  closeShareModal: () => void;
  setActiveTab: (tab: 'radar' | 'quests' | 'profile') => void;
  setAuthModalOpen: (open: boolean, reason?: string) => void;
  loginUser: (userData: Partial<UserProfile>) => void;
  logoutUser: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  updateLiveStatus: (status: string) => void;
  switchProfile: (profile: UserProfile) => void;
  resetToNewIndividual: () => void;
  registerProfile: (profile: UserProfile) => void;
  
  createDrop: (newDrop: Omit<Drop, 'id' | 'createdAt' | 'status' | 'currentSlots' | 'members'>) => Drop;
  joinDrop: (dropId: string) => boolean;
  leaveDrop: (dropId: string) => void;
  checkInDrop: (dropId: string) => void;
}

export const useSideQuestStore = create<SideQuestStore>()(
  persist(
    (set, get) => ({
      selectedCity: METRO_CITIES[0], // Default: Bengaluru
      selectedCategory: 'ALL',
      isGirlsOnlyFilter: false,
      drops: INITIAL_DROPS,
      dropChats: INITIAL_DROP_CHATS,
      currentUser: DEFAULT_NEW_EXPLORER,
      registeredProfiles: DEMO_PROFILES,
      userLocation: null,
      inspectedMember: null,
      soundEnabled: true,
      isAuthenticated: true,
      isAuthModalOpen: false,
      authModalReason: null,
      isLocationModalOpen: false,
      isScrapbookModalOpen: false,
      isSpotifyModalOpen: false,
      isInstantCamOpen: false,
      activeDropId: null,
      isCreateSheetOpen: false,
      isShareModalOpen: false,
      selectedShareDrop: null,
      activeTab: 'radar',
      recentCreatedDropCoords: null,
      hasCompletedOnboarding: false,

      setHasCompletedOnboarding: (completed: boolean) => set({ hasCompletedOnboarding: completed }),
      clearRecentCreatedDropCoords: () => set({ recentCreatedDropCoords: null }),

      syncWithServer: async () => {
        try {
          const res = await fetch('/api/drops');
          if (!res.ok) return;
          const data = await res.json();
          if (data.drops && Array.isArray(data.drops)) {
            set(state => {
              // Create lookup of incoming server drops
              const serverDropMap = new Map<string, Drop>(data.drops.map((d: Drop) => [d.id, d]));
              
              // Update existing drops with latest server status, keep local unsynced drops
              const updatedExisting = state.drops.map(d => serverDropMap.get(d.id) || d);
              
              // Find new server drops that client doesn't have yet
              const existingIds = new Set(state.drops.map(d => d.id));
              const brandNewServerDrops = data.drops.filter((d: Drop) => !existingIds.has(d.id));

              const mergedDrops = [...brandNewServerDrops, ...updatedExisting];

              // Merge server dropChats cleanly
              const mergedChats: Record<string, ChatMessage[]> = { ...state.dropChats };
              if (data.dropChats) {
                Object.entries(data.dropChats as Record<string, ChatMessage[]>).forEach(([dropId, msgs]) => {
                  const localMsgs = mergedChats[dropId] || [];
                  const seenMsgIds = new Set(localMsgs.map(m => m.id));
                  const newFromRemote = msgs.filter(m => !seenMsgIds.has(m.id));
                  if (newFromRemote.length > 0) {
                    mergedChats[dropId] = [...localMsgs, ...newFromRemote];
                  }
                });
              }

              return {
                drops: mergedDrops,
                dropChats: mergedChats
              };
            });
          }
        } catch {
          // Ignore network errors in offline/simulated scenarios
        }
      },

      setSelectedCity: (cityId: string) => {
        const city = METRO_CITIES.find(c => c.id === cityId);
        if (city) {
          set({ selectedCity: city });
        }
      },

      setSelectedCategory: (cat) => set({ selectedCategory: cat }),
      
      toggleGirlsOnlyFilter: () => set(state => ({ isGirlsOnlyFilter: !state.isGirlsOnlyFilter })),
      
      setActiveDropId: (id) => set({ activeDropId: id }),

      setUserLocation: (loc) => set({ userLocation: loc }),

      setLocationModalOpen: (open: boolean) => set({ isLocationModalOpen: open }),

      setScrapbookModalOpen: (open: boolean) => set({ isScrapbookModalOpen: open }),

      setSpotifyModalOpen: (open: boolean) => set({ isSpotifyModalOpen: open }),

      setInstantCamOpen: (open: boolean) => set({ isInstantCamOpen: open }),

      connectSpotify: (trackAndArtist: string, audioAura?: string) => {
        const artist = trackAndArtist.includes(' - ') ? trackAndArtist.split(' - ')[0].trim() : trackAndArtist.trim();
        const aura = audioAura || 'Late-Night Lo-Fi / Electronic';
        set(state => {
          const updatedUser: UserProfile = {
            ...state.currentUser,
            isSpotifyConnected: true,
            currentRotation: trackAndArtist.trim(),
            audioAura: aura,
            spotifyTopArtists: [artist, ...(state.currentUser.spotifyTopArtists || [])].slice(0, 4)
          };
          const updatedProfiles = state.registeredProfiles.map(p => 
            (p.id === updatedUser.id || p.handle === updatedUser.handle) ? updatedUser : p
          );
          return {
            currentUser: updatedUser,
            registeredProfiles: updatedProfiles,
            isSpotifyModalOpen: false
          };
        });
      },

      disconnectSpotify: () => {
        set(state => {
          const updatedUser: UserProfile = {
            ...state.currentUser,
            isSpotifyConnected: false,
            currentRotation: undefined,
            audioAura: undefined,
            spotifyTopArtists: []
          };
          const updatedProfiles = state.registeredProfiles.map(p => 
            (p.id === updatedUser.id || p.handle === updatedUser.handle) ? updatedUser : p
          );
          return {
            currentUser: updatedUser,
            registeredProfiles: updatedProfiles,
            isSpotifyModalOpen: false
          };
        });
      },

      addScrapbookMemory: (memoryData) => {
        const newMemory: ScrapbookMemory = {
          ...memoryData,
          id: `mem-${Date.now()}`,
          likes: 1
        };
        set(state => {
          const currentMemories = state.currentUser.scrapbookMemories || DEFAULT_SCRAPBOOK_MEMORIES;
          const updatedUser: UserProfile = {
            ...state.currentUser,
            scrapbookMemories: [newMemory, ...currentMemories]
          };
          const updatedProfiles = state.registeredProfiles.map(p => 
            (p.id === updatedUser.id || p.handle === updatedUser.handle) ? updatedUser : p
          );
          return {
            currentUser: updatedUser,
            registeredProfiles: updatedProfiles
          };
        });
      },

      likeScrapbookMemory: (memoryId: string) => {
        set(state => {
          const currentMemories = state.currentUser.scrapbookMemories || DEFAULT_SCRAPBOOK_MEMORIES;
          const updatedMemories = currentMemories.map(m => 
            m.id === memoryId ? { ...m, likes: m.likes + 1 } : m
          );
          const updatedUser: UserProfile = {
            ...state.currentUser,
            scrapbookMemories: updatedMemories
          };
          const updatedProfiles = state.registeredProfiles.map(p => 
            (p.id === updatedUser.id || p.handle === updatedUser.handle) ? updatedUser : p
          );
          return {
            currentUser: updatedUser,
            registeredProfiles: updatedProfiles
          };
        });
      },

      setLocationCoords: (lat, lng, addressName, isLiveGps = false) => {
        set({
          userLocation: {
            lat,
            lng,
            addressName: addressName || `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`,
            isLiveGps
          }
        });
      },

      setInspectedMember: (member) => set({ inspectedMember: member }),

      toggleSound: () => {
        const isMuted = toggleMuteSound();
        const soundOn = !isMuted;
        set({ soundEnabled: soundOn });
        return soundOn;
      },
      
      setCreateSheetOpen: (open: boolean) => {
        set({ isCreateSheetOpen: open });
      },
      
      openShareModal: (drop) => set({ isShareModalOpen: true, selectedShareDrop: drop }),
      
      closeShareModal: () => set({ isShareModalOpen: false, selectedShareDrop: null }),
      
      setActiveTab: (tab) => set({ activeTab: tab }),

      setAuthModalOpen: (open: boolean, reason?: string) => set({
        isAuthModalOpen: open,
        authModalReason: reason || null
      }),

      switchProfile: (profile: UserProfile) => {
        set({
          currentUser: profile,
          isAuthenticated: true
        });
      },

      resetToNewIndividual: () => {
        const city = get().selectedCity.name;
        const fresh = generateRandomPersona(city);
        set({
          currentUser: {
            ...fresh,
            isProfileCustomized: true
          },
          isAuthenticated: true
        });
      },

      loginUser: (userData: Partial<UserProfile>) => {
        const id = userData.id || `user-${Date.now().toString().slice(-6)}`;
        const handle = userData.handle || `pilot.${id.slice(-4)}`;
        const newUser: UserProfile = {
          ...get().currentUser,
          ...userData,
          id,
          handle,
          isVerified: true,
          isProfileCustomized: true
        };
        set(state => {
          const exists = state.registeredProfiles.some(p => p.id === newUser.id || p.handle === newUser.handle);
          const updated = exists 
            ? state.registeredProfiles.map(p => (p.id === newUser.id || p.handle === newUser.handle) ? newUser : p)
            : [newUser, ...state.registeredProfiles];
          return {
            currentUser: newUser,
            registeredProfiles: updated,
            isAuthenticated: true,
            isAuthModalOpen: false
          };
        });
      },

      logoutUser: () => {
        set({
          isAuthenticated: false,
          currentUser: {
            ...DEFAULT_NEW_EXPLORER,
            id: 'guest',
            handle: 'anonymous',
            fullName: 'Guest Explorer',
            isVerified: false,
            isProfileCustomized: false
          }
        });
      },

      updateProfile: (data: Partial<UserProfile>) => {
        set(state => {
          const updatedUser = {
            ...state.currentUser,
            ...data,
            isProfileCustomized: true
          };
          const updatedProfiles = state.registeredProfiles.map(p => 
            (p.id === updatedUser.id || p.handle === updatedUser.handle) ? updatedUser : p
          );
          return {
            currentUser: updatedUser,
            registeredProfiles: updatedProfiles
          };
        });
      },

      updateLiveStatus: (status: string) => {
        set(state => {
          const updatedUser = {
            ...state.currentUser,
            liveStatus: status
          };
          const updatedProfiles = state.registeredProfiles.map(p => 
            p.id === updatedUser.id ? updatedUser : p
          );
          return {
            currentUser: updatedUser,
            registeredProfiles: updatedProfiles
          };
        });
      },

      registerProfile: (profile: UserProfile) => {
        set(state => {
          const exists = state.registeredProfiles.some(p => p.id === profile.id || p.handle === profile.handle);
          if (exists) {
            return {
              registeredProfiles: state.registeredProfiles.map(p => (p.id === profile.id || p.handle === profile.handle) ? profile : p)
            };
          }
          return {
            registeredProfiles: [profile, ...state.registeredProfiles]
          };
        });
      },

      sendDropMessage: (dropId: string, text: string) => {
        if (!text || !text.trim()) return;
        const user = get().currentUser;
        const drop = get().drops.find(d => d.id === dropId);
        const isHost = drop ? drop.host.id === user.id : false;

        const newMsg: ChatMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          dropId,
          userId: user.id,
          handle: user.handle,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
          text: text.trim(),
          timestamp: 'Just now',
          isSystem: false,
          isHost
        };

        set(state => ({
          dropChats: {
            ...state.dropChats,
            [dropId]: [...(state.dropChats[dropId] || []), newMsg]
          }
        }));

        // Broadcast chat to backend
        fetch('/api/drops', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'chat', message: newMsg })
        }).catch(() => {});
      },

      createDrop: (dropData) => {
        const user = get().currentUser;
        const dropId = `drop-${Date.now()}`;
        const newDrop: Drop = {
          ...dropData,
          id: dropId,
          createdAt: new Date().toISOString(),
          status: 'OPEN',
          currentSlots: 1,
          members: [
            {
              userId: user.id,
              handle: user.handle,
              fullName: user.fullName,
              avatarUrl: user.avatarUrl,
              isHost: true,
              checkedIn: false,
              joinedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]
        };

        const initialHostMsg: ChatMessage = {
          id: `msg-${Date.now()}-init`,
          dropId,
          userId: user.id,
          handle: user.handle,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
          text: `Flare ignited at ${newDrop.venueName}! Heading there now, squad assemble 🚀`,
          timestamp: 'Just now',
          isSystem: false,
          isHost: true
        };

        // Reset any conflicting category/girls-only filters so the host's own radar immediately highlights the flare
        set(state => ({
          drops: [newDrop, ...state.drops],
          dropChats: {
            ...state.dropChats,
            [dropId]: [initialHostMsg]
          },
          isCreateSheetOpen: false,
          activeDropId: null, // Keep map unobstructed so user can see their flare pulse on the radar
          activeTab: 'radar',
          selectedCategory: 'ALL',
          isGirlsOnlyFilter: false,
          recentCreatedDropCoords: { lat: newDrop.lat, lng: newDrop.lng, dropId: newDrop.id }
        }));

        // Broadcast to shared backend API so all other devices see it live
        fetch('/api/drops', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'create', drop: newDrop })
        }).catch(() => {});

        return newDrop;
      },

      joinDrop: (dropId: string) => {
        const user = get().currentUser;
        const drop = get().drops.find(d => d.id === dropId);
        
        if (!drop || drop.currentSlots >= drop.maxSlots) return false;
        
        // Girls only safety gate
        if (drop.isGirlsOnly && user.gender !== 'F') {
          alert('🌸 This lobby is reserved for verified female members.');
          return false;
        }

        // Check if already member
        if (drop.members.some(m => m.userId === user.id)) return true;

        const updatedMembers = [
          ...drop.members,
          {
            userId: user.id,
            handle: user.handle,
            fullName: user.fullName,
            avatarUrl: user.avatarUrl,
            isHost: false,
            checkedIn: false,
            joinedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ];

        const updatedDrop: Drop = {
          ...drop,
          currentSlots: drop.currentSlots + 1,
          members: updatedMembers,
          status: updatedMembers.length >= drop.maxSlots ? 'CONFIRMED' : 'OPEN'
        };

        const joinNotice: ChatMessage = {
          id: `msg-sys-${Date.now()}`,
          dropId,
          userId: user.id,
          handle: user.handle,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
          text: `${user.fullName.split(' ')[0]} joined the party squad! 👋`,
          timestamp: 'Just now',
          isSystem: true
        };

        set(state => ({
          drops: state.drops.map(d => d.id === dropId ? updatedDrop : d),
          dropChats: {
            ...state.dropChats,
            [dropId]: [...(state.dropChats[dropId] || []), joinNotice]
          }
        }));

        // Broadcast join to backend
        fetch('/api/drops', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'join', dropId, user })
        }).catch(() => {});

        return true;
      },

      leaveDrop: (dropId: string) => {
        const user = get().currentUser;
        const drop = get().drops.find(d => d.id === dropId);
        if (!drop) return;

        const updatedMembers = drop.members.filter(m => m.userId !== user.id);
        const updatedDrop: Drop = {
          ...drop,
          currentSlots: Math.max(0, drop.currentSlots - 1),
          members: updatedMembers,
          status: 'OPEN'
        };

        const leaveNotice: ChatMessage = {
          id: `msg-sys-${Date.now()}`,
          dropId,
          userId: user.id,
          handle: user.handle,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
          text: `${user.fullName.split(' ')[0]} stepped out of squad. 1 slot opened up!`,
          timestamp: 'Just now',
          isSystem: true
        };

        set(state => ({
          drops: state.drops.map(d => d.id === dropId ? updatedDrop : d),
          dropChats: {
            ...state.dropChats,
            [dropId]: [...(state.dropChats[dropId] || []), leaveNotice]
          },
          activeDropId: null
        }));

        // Broadcast leave to backend
        fetch('/api/drops', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'leave', dropId, userId: user.id, userFullName: user.fullName })
        }).catch(() => {});
      },

      checkInDrop: (dropId: string) => {
        const user = get().currentUser;
        const drop = get().drops.find(d => d.id === dropId);
        if (!drop) return;

        const updatedMembers = drop.members.map(m => 
          m.userId === user.id ? { ...m, checkedIn: true } : m
        );

        const checkInNotice: ChatMessage = {
          id: `msg-sys-${Date.now()}`,
          dropId,
          userId: user.id,
          handle: user.handle,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
          text: `📍 ${user.fullName.split(' ')[0]} verified live GPS check-in at ${drop.venueName}! (+10 Karma)`,
          timestamp: 'Just now',
          isSystem: true
        };

        set(state => ({
          drops: state.drops.map(d => d.id === dropId ? { ...d, members: updatedMembers } : d),
          dropChats: {
            ...state.dropChats,
            [dropId]: [...(state.dropChats[dropId] || []), checkInNotice]
          },
          currentUser: {
            ...state.currentUser,
            karmaScore: Math.min(100, state.currentUser.karmaScore + 10),
            questsCompleted: state.currentUser.questsCompleted + 1
          }
        }));

        // Broadcast checkin to backend
        fetch('/api/drops', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'checkin', dropId, userId: user.id, userFullName: user.fullName })
        }).catch(() => {});
      }
    }),
    {
      name: 'sidequest_storage_v1',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? window.localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {}
      })),
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        selectedCity: state.selectedCity,
        soundEnabled: state.soundEnabled,
        userLocation: state.userLocation,
        dropChats: state.dropChats,
        registeredProfiles: state.registeredProfiles,
        hasCompletedOnboarding: state.hasCompletedOnboarding
      })
    }
  )
);
