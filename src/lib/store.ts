import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Drop, MetroCity, DropCategory, UserProfile, UserLocation } from '@/types';
import { METRO_CITIES, INITIAL_DROPS, generateRandomPersona } from './constants';
import { toggleMuteSound } from './audio';

const DEFAULT_USER: UserProfile = {
  id: 'user-harshal',
  handle: 'harshal.b',
  fullName: 'Harshal Borse',
  avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  city: 'Bengaluru',
  karmaScore: 100,
  questsCompleted: 28,
  flakeRate: 0,
  isVerified: true,
  gender: 'M',
  spotifyTopArtists: ['Fred again..', 'The Weeknd', 'Karan Aujla', 'Cigarettes After Sex'],
  currentRotation: 'Fred again.. - adore u',
  audioAura: 'Late-Night Lo-Fi / Electronic',
  badges: ['🔥 Night Owl 15x', '⚡ Quest Host LVL 3', '🏸 Badminton Ace', '☕ Chai Connoisseur'],
  bioManifesto: 'Proof of work > CGPA. Catch me at Gate 2 or building autonomous trading engines.'
};

interface SideQuestStore {
  selectedCity: MetroCity;
  selectedCategory: DropCategory | 'ALL';
  isGirlsOnlyFilter: boolean;
  drops: Drop[];
  currentUser: UserProfile;
  userLocation: UserLocation | null;
  inspectedMember: UserProfile | null;
  soundEnabled: boolean;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalReason: string | null;
  activeDropId: string | null;
  isCreateSheetOpen: boolean;
  isShareModalOpen: boolean;
  selectedShareDrop: Drop | null;
  activeTab: 'radar' | 'quests' | 'profile';
  
  // Actions
  setSelectedCity: (cityId: string) => void;
  setSelectedCategory: (cat: DropCategory | 'ALL') => void;
  toggleGirlsOnlyFilter: () => void;
  setActiveDropId: (id: string | null) => void;
  setUserLocation: (loc: UserLocation | null) => void;
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
  switchProfile: (profile: UserProfile) => void;
  resetToNewIndividual: () => void;
  
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
      currentUser: DEFAULT_USER,
      userLocation: null,
      inspectedMember: null,
      soundEnabled: true,
      isAuthenticated: true, // Pre-authenticated with default explorer profile, can switch anytime
      isAuthModalOpen: false,
      authModalReason: null,
      activeDropId: null,
      isCreateSheetOpen: false,
      isShareModalOpen: false,
      selectedShareDrop: null,
      activeTab: 'radar',

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
          currentUser: fresh,
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
          isVerified: true
        };
        set({
          currentUser: newUser,
          isAuthenticated: true,
          isAuthModalOpen: false
        });
      },

      logoutUser: () => {
        set({
          isAuthenticated: false,
          currentUser: {
            ...DEFAULT_USER,
            id: 'guest',
            handle: 'anonymous',
            fullName: 'Guest Explorer',
            isVerified: false
          }
        });
      },

      updateProfile: (data: Partial<UserProfile>) => {
        set(state => ({
          currentUser: {
            ...state.currentUser,
            ...data
          }
        }));
      },

      createDrop: (dropData) => {
        const user = get().currentUser;
        const newDrop: Drop = {
          ...dropData,
          id: `drop-${Date.now()}`,
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

        set(state => ({
          drops: [newDrop, ...state.drops],
          isCreateSheetOpen: false,
          activeDropId: newDrop.id,
          activeTab: 'radar'
        }));

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

        set(state => ({
          drops: state.drops.map(d => d.id === dropId ? updatedDrop : d)
        }));

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
          members: updatedMembers
        };

        set(state => ({
          drops: state.drops.map(d => d.id === dropId ? updatedDrop : d),
          activeDropId: state.activeDropId === dropId ? null : state.activeDropId
        }));
      },

      checkInDrop: (dropId: string) => {
        const user = get().currentUser;
        const drop = get().drops.find(d => d.id === dropId);
        if (!drop) return;

        const updatedMembers = drop.members.map(m => 
          m.userId === user.id ? { ...m, checkedIn: true } : m
        );

        set(state => ({
          drops: state.drops.map(d => d.id === dropId ? { ...d, members: updatedMembers } : d),
          currentUser: {
            ...state.currentUser,
            karmaScore: Math.min(100, state.currentUser.karmaScore + 10),
            questsCompleted: state.currentUser.questsCompleted + 1
          }
        }));
      }
    }),
    {
      name: 'sidequest_storage_v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        selectedCity: state.selectedCity,
        soundEnabled: state.soundEnabled
      })
    }
  )
);
