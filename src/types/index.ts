export type DropCategory = 'CHAI_FOOD' | 'SPORTS' | 'COWORK_DEV' | 'GIGS_CULTURE';

export interface Hotspot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description: string;
}

export interface MetroCity {
  id: string;
  name: string;
  state: string;
  center: [number, number]; // [lng, lat] for MapLibre
  zoom: number;
  hotspots: Hotspot[];
}

export interface UserLocation {
  lat: number;
  lng: number;
}

export interface UserProfile {
  id: string;
  handle: string;
  fullName: string;
  avatarUrl: string;
  city: string;
  karmaScore: number; // 0 - 100
  questsCompleted: number;
  flakeRate: number; // percentage (e.g. 0% = perfect)
  isVerified: boolean;
  gender?: 'M' | 'F' | 'OTHER';
  spotifyTopArtists?: string[];
  currentRotation?: string;
  audioAura?: string;
  badges?: string[];
  bioManifesto?: string;
}

export interface DropMember {
  userId: string;
  handle: string;
  fullName: string;
  avatarUrl: string;
  isHost: boolean;
  checkedIn: boolean;
  joinedAt: string;
}

export interface Drop {
  id: string;
  title: string;
  category: DropCategory;
  cityId: string;
  hotspotName: string;
  venueName: string;
  lat: number;
  lng: number;
  host: UserProfile;
  maxSlots: number;
  currentSlots: number;
  members: DropMember[];
  isGirlsOnly: boolean;
  status: 'OPEN' | 'CONFIRMED' | 'COMPLETED' | 'EXPIRED';
  expiresAt: string; // ISO string
  createdAt: string;
  tags: string[];
  aiVibeNote?: string;
}

export interface ChatMessage {
  id: string;
  dropId: string;
  userId: string;
  handle: string;
  fullName: string;
  avatarUrl: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
}
