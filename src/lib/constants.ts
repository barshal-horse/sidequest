import { MetroCity, Drop, UserProfile, ChatMessage, ScrapbookMemory } from '@/types';


export const METRO_CITIES: MetroCity[] = [
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    state: 'Karnataka',
    center: [77.6200, 12.9352], // Koramangala
    zoom: 13,
    hotspots: [
      { id: 'koramangala', name: 'Koramangala (5th Block)', lat: 12.9352, lng: 77.6200, description: 'Chai stalls, cafes & tech night owls' },
      { id: 'indiranagar', name: 'Indiranagar (12th Main)', lat: 12.9719, lng: 77.6412, description: 'Boutique coffee, microbreweries & food' },
      { id: 'hsr', name: 'HSR Layout (27th Main)', lat: 12.9121, lng: 77.6446, description: 'Founder hubs, specialty cafes & late snacks' },
      { id: 'church-st', name: 'Church Street & MG Road', lat: 12.9749, lng: 77.6074, description: 'Bookstores, street music & evening walks' },
      { id: 'bellandur', name: 'Bellandur / EcoWorld', lat: 12.9260, lng: 77.6762, description: 'Post-work turf badminton & dinners' }
    ]
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    center: [72.8258, 19.0657], // Bandra Carter Rd
    zoom: 13,
    hotspots: [
      { id: 'carter-rd', name: 'Bandra (Carter Road Promenade)', lat: 19.0657, lng: 72.8258, description: 'Sunset sea walk, coffee & indie artists' },
      { id: 'lower-parel', name: 'Lower Parel (Kamala Mills)', lat: 18.9986, lng: 72.8311, description: 'High-energy dining & post-work hangouts' },
      { id: 'versova', name: 'Versova & Juhu Circle', lat: 19.1351, lng: 72.8143, description: 'Creative writers, tea stalls & beach strolls' },
      { id: 'marine-drive', name: 'Marine Drive & Fort', lat: 18.9438, lng: 72.8232, description: 'Late-night breeze, conversations & cutting chai' },
      { id: 'powai', name: 'Powai (Hiranandani)', lat: 19.1176, lng: 72.9060, description: 'IIT crowd, lakeside coffee & turf matches' }
    ]
  },
  {
    id: 'delhi',
    name: 'Delhi-NCR',
    state: 'Delhi',
    center: [77.1947, 28.5535], // Hauz Khas
    zoom: 13,
    hotspots: [
      { id: 'hkv', name: 'Hauz Khas Village & Deer Park', lat: 28.5535, lng: 77.1947, description: 'Lake views, acoustic music & cafe culture' },
      { id: 'cyber-hub', name: 'Cyber Hub (Gurgaon)', lat: 28.4952, lng: 77.0890, description: 'Tech mixers, gourmet food & evening beers' },
      { id: 'cp', name: 'Connaught Place (Inner Circle)', lat: 28.6304, lng: 77.2177, description: 'Historic heart, coffee shops & street food' },
      { id: 'majnu-ka-tila', name: 'Majnu Ka Tila (Tibetan Colony)', lat: 28.7018, lng: 77.2285, description: 'Momos, Korean cafes & aesthetic thrift walks' },
      { id: 'noida-104', name: 'Noida (Sector 104 Market)', lat: 28.5410, lng: 77.3620, description: 'Outdoor cafes, dessert runs & late chai' }
    ]
  },
  {
    id: 'pune',
    name: 'Pune',
    state: 'Maharashtra',
    center: [73.8997, 18.5362], // Koregaon Park
    zoom: 13,
    hotspots: [
      { id: 'kp', name: 'Koregaon Park (Lane 5-7)', lat: 18.5362, lng: 73.8997, description: 'Tree-lined cafes, live music & book reading' },
      { id: 'baner', name: 'Baner High Street', lat: 18.5590, lng: 73.7868, description: 'Brewpubs, coworking spots & fitness runs' },
      { id: 'viman-nagar', name: 'Viman Nagar (Phoenix Corridor)', lat: 18.5679, lng: 73.9143, description: 'Student crowd, bubble tea & gaming lounges' }
    ]
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    state: 'Telangana',
    center: [78.4073, 17.4325], // Jubilee Hills
    zoom: 13,
    hotspots: [
      { id: 'jubilee-hills', name: 'Jubilee Hills (Road 36/45)', lat: 17.4325, lng: 78.4073, description: 'Signature cafes, scenic hills & evening drives' },
      { id: 'gachibowli', name: 'Gachibowli (DLF Street Food)', lat: 17.4401, lng: 78.3489, description: 'Late-night Maggi, dosa & tech catchups' },
      { id: 'madhapur', name: 'Madhapur / Durgam Cheruvu', lat: 17.4384, lng: 78.3855, description: 'Cable bridge night walks & specialty brews' }
    ]
  },
  {
    id: 'chennai',
    name: 'Chennai',
    state: 'Tamil Nadu',
    center: [80.2690, 13.0001], // Besant Nagar
    zoom: 13,
    hotspots: [
      { id: 'bessie-beach', name: 'Besant Nagar (Edward Elliot Beach)', lat: 13.0001, lng: 80.2690, description: 'Sea breeze, hot filter coffee & morning runs' },
      { id: 'nungambakkam', name: 'Nungambakkam (Khader Nawaz Khan Rd)', lat: 13.0617, lng: 80.2415, description: 'Boutiques, cafes & weekend book clubs' }
    ]
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    state: 'West Bengal',
    center: [88.3516, 22.5519], // Park Street
    zoom: 13,
    hotspots: [
      { id: 'park-street', name: 'Park Street & Camac Street', lat: 22.5519, lng: 88.3516, description: 'Vintage tea rooms, live acoustic jazz & bistros' },
      { id: 'salt-lake', name: 'Salt Lake (Sector V & City Centre)', lat: 22.5760, lng: 88.4344, description: 'Tech corridor chai, evening snacks & chill' }
    ]
  }
];

// Helper: Calculate expiration ISO timestamp minutes from now
const expiresMinutesFromNow = (mins: number) => new Date(Date.now() + mins * 60 * 1000).toISOString();

export const INITIAL_DROPS: Drop[] = [
  // BENGALURU DROPS
  {
    id: 'blr-drop-1',
    title: 'Midnight Adrak Chai & Bun Maska',
    category: 'CHAI_FOOD',
    cityId: 'bengaluru',
    hotspotName: 'Koramangala (5th Block)',
    venueName: 'Sanjay Famous Tea Stall near Sony Signal',
    lat: 12.9352,
    lng: 77.6200,
    host: {
      id: 'user-aarav',
      handle: 'aarav.dev',
      fullName: 'Aarav Sharma',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      city: 'Bengaluru',
      karmaScore: 94,
      questsCompleted: 18,
      flakeRate: 0,
      isVerified: true,
      spotifyTopArtists: ['Fred again..', 'Cigarettes After Sex', 'Karan Aujla'],
      currentRotation: 'Fred again.. - adore u',
      audioAura: 'Late-Night Lo-Fi / Electronic',
      badges: ['🔥 Night Owl 15x', '⚡ Quest Host LVL 3']
    },
    maxSlots: 4,
    currentSlots: 3,
    members: [
      { userId: 'user-aarav', handle: 'aarav.dev', fullName: 'Aarav Sharma', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', isHost: true, checkedIn: true, joinedAt: '00:10' },
      { userId: 'user-sneha', handle: 'sneha.ui', fullName: 'Sneha Patel', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', isHost: false, checkedIn: false, joinedAt: '00:15' },
      { userId: 'user-rohan', handle: 'rohan.ai', fullName: 'Rohan Verma', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', isHost: false, checkedIn: false, joinedAt: '00:18' }
    ],
    isGirlsOnly: false,
    status: 'OPEN',
    expiresAt: expiresMinutesFromNow(22),
    createdAt: new Date().toISOString(),
    tags: ['Chai', 'Late Night', 'Chill'],
    aiVibeNote: 'High Compatibility: You all listen to electronic chill and play sports in Koramangala. Icebreaker: Ask Aarav about his weekend synth project.'
  },
  {
    id: 'blr-drop-2',
    title: 'Badminton Doubles - Intermediate Smash',
    category: 'SPORTS',
    cityId: 'bengaluru',
    hotspotName: 'HSR Layout (27th Main)',
    venueName: 'Playo Arena Court 3, HSR Sector 2',
    lat: 12.9121,
    lng: 77.6446,
    host: {
      id: 'user-kavya',
      handle: 'kavya.badm',
      fullName: 'Kavya Rao',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      city: 'Bengaluru',
      karmaScore: 98,
      questsCompleted: 24,
      flakeRate: 0,
      isVerified: true,
      badges: ['🏸 Badminton Ace', '⚡ 100% Show-Up']
    },
    maxSlots: 4,
    currentSlots: 2,
    members: [
      { userId: 'user-kavya', handle: 'kavya.badm', fullName: 'Kavya Rao', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', isHost: true, checkedIn: false, joinedAt: '18:00' },
      { userId: 'user-vikram', handle: 'vikram.k', fullName: 'Vikram Joshi', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', isHost: false, checkedIn: false, joinedAt: '18:10' }
    ],
    isGirlsOnly: false,
    status: 'OPEN',
    expiresAt: expiresMinutesFromNow(48),
    createdAt: new Date().toISOString(),
    tags: ['Badminton', 'Fitness', 'Competitive'],
    aiVibeNote: 'Fast-paced friendly match. Bring indoor non-marking shoes and your own racquet.'
  },
  {
    id: 'blr-drop-3',
    title: 'Coffee & Vibe-Coding (Next.js / AI agents)',
    category: 'COWORK_DEV',
    cityId: 'bengaluru',
    hotspotName: 'Indiranagar (12th Main)',
    venueName: 'Third Wave Coffee, 12th Main Rooftop',
    lat: 12.9719,
    lng: 77.6412,
    host: {
      id: 'user-harshal',
      handle: 'harshal.b',
      fullName: 'Harshal Borse',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      city: 'Bengaluru',
      karmaScore: 100,
      questsCompleted: 28,
      flakeRate: 0,
      isVerified: true,
      spotifyTopArtists: ['Fred again..', 'The Weeknd', 'Karan Aujla'],
      badges: ['🔥 Night Owl 15x', '⚡ Quest Host LVL 3']
    },
    maxSlots: 3,
    currentSlots: 2,
    members: [
      { userId: 'user-harshal', handle: 'harshal.b', fullName: 'Harshal Borse', avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80', isHost: true, checkedIn: true, joinedAt: '15:00' },
      { userId: 'user-tanvi', handle: 'tanvi.dev', fullName: 'Tanvi Shah', avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80', isHost: false, checkedIn: false, joinedAt: '15:20' }
    ],
    isGirlsOnly: false,
    status: 'OPEN',
    expiresAt: expiresMinutesFromNow(65),
    createdAt: new Date().toISOString(),
    tags: ['Dev', 'Lo-Fi', 'AI Agents'],
    aiVibeNote: 'Grinding hackathon projects and side products. Wi-Fi + power outlets verified.'
  },

  // MUMBAI DROPS
  {
    id: 'mum-drop-1',
    title: 'Sunset Carter Road Walk & Iced Americano',
    category: 'CHAI_FOOD',
    cityId: 'mumbai',
    hotspotName: 'Bandra (Carter Road Promenade)',
    venueName: 'Carter Road Amphitheatre near CCD',
    lat: 19.0657,
    lng: 72.8258,
    host: {
      id: 'user-ananya',
      handle: 'ananya.m',
      fullName: 'Ananya Mehra',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      city: 'Mumbai',
      karmaScore: 92,
      questsCompleted: 11,
      flakeRate: 0,
      isVerified: true,
      badges: ['🌸 Girls Only Safe Host']
    },
    maxSlots: 3,
    currentSlots: 2,
    members: [
      { userId: 'user-ananya', handle: 'ananya.m', fullName: 'Ananya Mehra', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', isHost: true, checkedIn: false, joinedAt: '17:00' },
      { userId: 'user-riya', handle: 'riya.w', fullName: 'Riya Wadhwa', avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80', isHost: false, checkedIn: false, joinedAt: '17:15' }
    ],
    isGirlsOnly: true,
    status: 'OPEN',
    expiresAt: expiresMinutesFromNow(35),
    createdAt: new Date().toISOString(),
    tags: ['Sunset', 'Walk', 'Girls Only 🌸'],
    aiVibeNote: 'Girls Only Drop 🌸. Casual sunset walk, music talk & fresh iced coffee.'
  },
  {
    id: 'mum-drop-2',
    title: 'Standup Comedy Open Mic & Craft Beer',
    category: 'GIGS_CULTURE',
    cityId: 'mumbai',
    hotspotName: 'Lower Parel (Kamala Mills)',
    venueName: 'The Habitat Comedy Club, Kamala Mills',
    lat: 18.9986,
    lng: 72.8311,
    host: {
      id: 'user-neil',
      handle: 'neil.comedy',
      fullName: 'Neil Fernandez',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      city: 'Mumbai',
      karmaScore: 88,
      questsCompleted: 9,
      flakeRate: 0,
      isVerified: true,
      badges: ['🎭 Culture Scout']
    },
    maxSlots: 4,
    currentSlots: 2,
    members: [
      { userId: 'user-neil', handle: 'neil.comedy', fullName: 'Neil Fernandez', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', isHost: true, checkedIn: false, joinedAt: '20:00' }
    ],
    isGirlsOnly: false,
    status: 'OPEN',
    expiresAt: expiresMinutesFromNow(50),
    createdAt: new Date().toISOString(),
    tags: ['Comedy', 'Drinks', 'Weekend'],
    aiVibeNote: 'Catching unreleased sets from up-and-coming comics.'
  },

  // DELHI-NCR DROPS
  {
    id: 'del-drop-1',
    title: 'Deer Park Evening Run + Cold Brew',
    category: 'SPORTS',
    cityId: 'delhi',
    hotspotName: 'Hauz Khas Village & Deer Park',
    venueName: 'Deer Park Main Entrance Gate',
    lat: 28.5535,
    lng: 77.1947,
    host: {
      id: 'user-kabir',
      handle: 'kabir.run',
      fullName: 'Kabir Bakshi',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      city: 'Delhi-NCR',
      karmaScore: 96,
      questsCompleted: 21,
      flakeRate: 0,
      isVerified: true,
      badges: ['🏃 Run Club Anchor']
    },
    maxSlots: 5,
    currentSlots: 3,
    members: [
      { userId: 'user-kabir', handle: 'kabir.run', fullName: 'Kabir Bakshi', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', isHost: true, checkedIn: false, joinedAt: '17:30' }
    ],
    isGirlsOnly: false,
    status: 'OPEN',
    expiresAt: expiresMinutesFromNow(40),
    createdAt: new Date().toISOString(),
    tags: ['5km Run', 'Fitness', 'Outdoor'],
    aiVibeNote: 'Relaxed 5k pace (6:00 min/km). Followed by iced coffee at Blue Tokai HKV.'
  },

  // PUNE DROPS
  {
    id: 'pun-drop-1',
    title: 'Acoustic Guitar Jam & Filter Chai',
    category: 'GIGS_CULTURE',
    cityId: 'pune',
    hotspotName: 'Koregaon Park (Lane 5-7)',
    venueName: 'The Daily All Day, Lane 7 KP',
    lat: 18.5362,
    lng: 73.8997,
    host: {
      id: 'user-zoya',
      handle: 'zoya.beats',
      fullName: 'Zoya Akhtar',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      city: 'Pune',
      karmaScore: 95,
      questsCompleted: 14,
      flakeRate: 0,
      isVerified: true,
      badges: ['🎸 Jam Leader']
    },
    maxSlots: 4,
    currentSlots: 3,
    members: [
      { userId: 'user-zoya', handle: 'zoya.beats', fullName: 'Zoya Akhtar', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', isHost: true, checkedIn: false, joinedAt: '19:00' }
    ],
    isGirlsOnly: false,
    status: 'OPEN',
    expiresAt: expiresMinutesFromNow(30),
    createdAt: new Date().toISOString(),
    tags: ['Indie Jam', 'Music', 'Chai'],
    aiVibeNote: 'Bring your instrument or just come vibe. Indie folk, acoustic & pop.'
  },

  // HYDERABAD DROPS
  {
    id: 'hyd-drop-1',
    title: 'Cold Brew & Distributed Systems Chat',
    category: 'COWORK_DEV',
    cityId: 'hyderabad',
    hotspotName: 'Jubilee Hills & HITEC City',
    venueName: 'Roastery Coffee House Courtyard, Road 45 Jubilee Hills',
    lat: 17.4319,
    lng: 78.4073,
    host: {
      id: 'user-nikhil',
      handle: 'nikhil.sys',
      fullName: 'Nikhil Reddy',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      city: 'Hyderabad',
      karmaScore: 97,
      questsCompleted: 19,
      flakeRate: 0,
      isVerified: true,
      badges: ['⚡ Backend Architect', '🔥 100% Show-Up']
    },
    maxSlots: 4,
    currentSlots: 2,
    members: [
      { userId: 'user-nikhil', handle: 'nikhil.sys', fullName: 'Nikhil Reddy', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', isHost: true, checkedIn: true, joinedAt: '16:00' },
      { userId: 'user-pranavi', handle: 'pranavi.ai', fullName: 'Pranavi Rao', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', isHost: false, checkedIn: false, joinedAt: '16:15' }
    ],
    isGirlsOnly: false,
    status: 'OPEN',
    expiresAt: expiresMinutesFromNow(55),
    createdAt: new Date().toISOString(),
    tags: ['Dev', 'Cold Brew', 'High Entropy'],
    aiVibeNote: 'Roastery courtyard table reserved. Casual debate on Rust vs Go & late-night biryani lore.'
  },

  // CHENNAI DROPS
  {
    id: 'chn-drop-1',
    title: 'Bessie Beach Sea Breeze & Degree Filter Coffee',
    category: 'CHAI_FOOD',
    cityId: 'chennai',
    hotspotName: 'Besant Nagar (Edward Elliot Beach)',
    venueName: 'Murugan Idli Shop & Beach Promenade Walk',
    lat: 13.0001,
    lng: 80.2690,
    host: {
      id: 'user-karthik',
      handle: 'karthik.sea',
      fullName: 'Karthik Subramanian',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      city: 'Chennai',
      karmaScore: 96,
      questsCompleted: 15,
      flakeRate: 0,
      isVerified: true,
      badges: ['🌊 Beach Cruiser', '⚡ Verified Host']
    },
    maxSlots: 4,
    currentSlots: 2,
    members: [
      { userId: 'user-karthik', handle: 'karthik.sea', fullName: 'Karthik Subramanian', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', isHost: true, checkedIn: true, joinedAt: '06:30' },
      { userId: 'user-swetha', handle: 'swetha.art', fullName: 'Swetha Nathan', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', isHost: false, checkedIn: false, joinedAt: '06:40' }
    ],
    isGirlsOnly: false,
    status: 'OPEN',
    expiresAt: expiresMinutesFromNow(45),
    createdAt: new Date().toISOString(),
    tags: ['Filter Coffee', 'Sunrise', 'Conversations'],
    aiVibeNote: 'Bessie promenade morning cool breeze. Fresh brass degree filter coffee on the go.'
  },

  // KOLKATA DROPS
  {
    id: 'kol-drop-1',
    title: 'Park Street Vintage Tea & Indie Book Swap',
    category: 'GIGS_CULTURE',
    cityId: 'kolkata',
    hotspotName: 'Park Street & Camac Street',
    venueName: 'Flurys Heritage Tea Room, 18 Park Street',
    lat: 22.5519,
    lng: 88.3516,
    host: {
      id: 'user-sourav',
      handle: 'sourav.lit',
      fullName: 'Sourav Banerjee',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      city: 'Kolkata',
      karmaScore: 98,
      questsCompleted: 22,
      flakeRate: 0,
      isVerified: true,
      badges: ['📖 Book Hound', '⚡ Flurys Regular']
    },
    maxSlots: 3,
    currentSlots: 2,
    members: [
      { userId: 'user-sourav', handle: 'sourav.lit', fullName: 'Sourav Banerjee', avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80', isHost: true, checkedIn: false, joinedAt: '16:00' },
      { userId: 'user-ananya-c', handle: 'ananya.kol', fullName: 'Ananya Chatterjee', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', isHost: false, checkedIn: false, joinedAt: '16:10' }
    ],
    isGirlsOnly: false,
    status: 'OPEN',
    expiresAt: expiresMinutesFromNow(40),
    createdAt: new Date().toISOString(),
    tags: ['Flurys', 'Books', 'Tea Room'],
    aiVibeNote: 'Window table at historic Flurys. Bring a paperback you loved or just come for Darjeeling first flush.'
  }
];

// Distinct, authenticated initial chat message threads for every single drop flare
export const INITIAL_DROP_CHATS: Record<string, ChatMessage[]> = {
  'blr-drop-1': [
    {
      id: 'msg-blr1-1',
      dropId: 'blr-drop-1',
      userId: 'user-aarav',
      handle: 'aarav.dev',
      fullName: 'Aarav Sharma',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      text: 'Reached venue! Sanjay tea stall is open and adrak chai is brewing 🧋',
      timestamp: '10m ago',
      isHost: true
    },
    {
      id: 'msg-blr1-2',
      dropId: 'blr-drop-1',
      userId: 'user-sneha',
      handle: 'sneha.ui',
      fullName: 'Sneha Patel',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      text: 'Coming down in 2 mins from 5th Block, save a bun maska for me!',
      timestamp: '6m ago',
      isHost: false
    },
    {
      id: 'msg-blr1-3',
      dropId: 'blr-drop-1',
      userId: 'user-rohan',
      handle: 'rohan.ai',
      fullName: 'Rohan Verma',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      text: 'Parking the scooter near Sony signal right now, see you in 1 min',
      timestamp: '2m ago',
      isHost: false
    }
  ],
  'blr-drop-2': [
    {
      id: 'msg-blr2-1',
      dropId: 'blr-drop-2',
      userId: 'user-kavya',
      handle: 'kavya.badm',
      fullName: 'Kavya Rao',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      text: 'Court 3 confirmed at Playo HSR! Non-marking shoes mandatory 🏸',
      timestamp: '15m ago',
      isHost: true
    },
    {
      id: 'msg-blr2-2',
      dropId: 'blr-drop-2',
      userId: 'user-vikram',
      handle: 'vikram.k',
      fullName: 'Vikram Joshi',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      text: 'Brought an extra Yonex racquet and Mavis 350 nylon shuttles!',
      timestamp: '8m ago',
      isHost: false
    }
  ],
  'blr-drop-3': [
    {
      id: 'msg-blr3-1',
      dropId: 'blr-drop-3',
      userId: 'user-harshal',
      handle: 'harshal.b',
      fullName: 'Harshal Borse',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      text: 'Grabbed corner sofa table on the 12th Main rooftop near the power sockets 💻',
      timestamp: '12m ago',
      isHost: true
    },
    {
      id: 'msg-blr3-2',
      dropId: 'blr-drop-3',
      userId: 'user-tanvi',
      handle: 'tanvi.dev',
      fullName: 'Tanvi Shah',
      avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
      text: 'Ordering an iced americano downstairs, let\'s ship this release!',
      timestamp: '5m ago',
      isHost: false
    }
  ],
  'mum-drop-1': [
    {
      id: 'msg-mum1-1',
      dropId: 'mum-drop-1',
      userId: 'user-ananya',
      handle: 'ananya.m',
      fullName: 'Ananya Mehra',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      text: 'Sitting on the Carter Road amphitheatre steps, sea breeze is perfect today 🌊',
      timestamp: '18m ago',
      isHost: true
    },
    {
      id: 'msg-mum1-2',
      dropId: 'mum-drop-1',
      userId: 'user-riya',
      handle: 'riya.w',
      fullName: 'Riya Wadhwa',
      avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
      text: 'Grabbing iced coffee from CCD near the entrance, see you in 3 mins! 🌸',
      timestamp: '7m ago',
      isHost: false
    }
  ],
  'mum-drop-2': [
    {
      id: 'msg-mum2-1',
      dropId: 'mum-drop-2',
      userId: 'user-neil',
      handle: 'neil.comedy',
      fullName: 'Neil Fernandez',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      text: 'Habitat doors open in 20 mins! 5 new comics testing bits tonight 🎭',
      timestamp: '14m ago',
      isHost: true
    }
  ],
  'del-drop-1': [
    {
      id: 'msg-del1-1',
      dropId: 'del-drop-1',
      userId: 'user-kabir',
      handle: 'kabir.run',
      fullName: 'Kabir Bakshi',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      text: 'Stretching by Deer Park main gate! Pace will be easy 5:45 min/km 🏃',
      timestamp: '9m ago',
      isHost: true
    }
  ],
  'pun-drop-1': [
    {
      id: 'msg-pun1-1',
      dropId: 'pun-drop-1',
      userId: 'user-zoya',
      handle: 'zoya.beats',
      fullName: 'Zoya Akhtar',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      text: 'Patio table at Lane 7! Tuned the acoustic guitar, drop by if you\'re near 🎸',
      timestamp: '11m ago',
      isHost: true
    }
  ],
  'hyd-drop-1': [
    {
      id: 'msg-hyd1-1',
      dropId: 'hyd-drop-1',
      userId: 'user-nikhil',
      handle: 'nikhil.sys',
      fullName: 'Nikhil Reddy',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      text: 'Courtyard table under the mango tree at Roastery! Cold brew ordered ☕',
      timestamp: '16m ago',
      isHost: true
    },
    {
      id: 'msg-hyd1-2',
      dropId: 'hyd-drop-1',
      userId: 'user-pranavi',
      handle: 'pranavi.ai',
      fullName: 'Pranavi Rao',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      text: 'Just pulled into Road 45 parking, walking inside now!',
      timestamp: '6m ago',
      isHost: false
    }
  ],
  'chn-drop-1': [
    {
      id: 'msg-chn1-1',
      dropId: 'chn-drop-1',
      userId: 'user-karthik',
      handle: 'karthik.sea',
      fullName: 'Karthik Subramanian',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      text: 'Bessie beach breeze is hitting! Filter coffee counter is live 🌊',
      timestamp: '15m ago',
      isHost: true
    },
    {
      id: 'msg-chn1-2',
      dropId: 'chn-drop-1',
      userId: 'user-swetha',
      handle: 'swetha.art',
      fullName: 'Swetha Nathan',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      text: 'Heading down the walkway, save a hot tumbler for me!',
      timestamp: '5m ago',
      isHost: false
    }
  ],
  'kol-drop-1': [
    {
      id: 'msg-kol1-1',
      dropId: 'kol-drop-1',
      userId: 'user-sourav',
      handle: 'sourav.lit',
      fullName: 'Sourav Banerjee',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      text: 'Window table at Flurys, rum balls and Darjeeling tea on the table 🍰',
      timestamp: '14m ago',
      isHost: true
    },
    {
      id: 'msg-kol1-2',
      dropId: 'kol-drop-1',
      userId: 'user-ananya-c',
      handle: 'ananya.kol',
      fullName: 'Ananya Chatterjee',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      text: 'Crossing Park Street from Oxford bookstore, see you in 2 mins!',
      timestamp: '4m ago',
      isHost: false
    }
  ]
};

export const GEN_Z_VIBE_TAGS = [
  '🧋 3am Chai Runs',
  '🎧 UK Garage / Lo-Fi',
  '🎾 Turf Badminton 2v2',
  '📸 35mm Film Photography',
  '🍵 Iced Matcha Lattes',
  '💻 Vibe Coding & Shippers',
  '🧥 Vintage & Thrifting',
  '🚲 Midnight Cycling',
  '📚 Indie Book Swaps',
  '🌊 Sunset Sea Walks',
  '⚡ High-Entropy Meetups',
  '🍕 Late-Night Slices',
  '🎬 A24 & Letterboxd Lore'
];

export const LIVE_STATUS_OPTIONS = [
  'Down for Chai right now 🧋',
  'Seeking 4th for Badminton 🏸',
  'Late-Night Lo-Fi Coding 💻',
  'Sunset Promenade Walk 🌊',
  'Hunting Specialty Coffee ☕',
  'Roaming & Sidequesting ⚡'
];

export const POPULAR_SPOTIFY_ROTATIONS = [
  { track: 'Fred again.. - adore u', aura: 'Late-Night Lo-Fi / Electronic', genre: '#ELECTRONIC' },
  { track: 'Seedhe Maut - Nanchaku', aura: 'High-BPM Cardio / Desi Hip-Hop', genre: '#DHH' },
  { track: 'Charli xcx - 360', aura: 'Hyperpop / Brat Energy', genre: '#HYPERPOP' },
  { track: 'Peggy Gou - (It Goes Like) Nanana', aura: 'Summer Club / House', genre: '#HOUSE' },
  { track: 'The Local Train - Choo Lo', aura: 'Indie Rock / Coastal Breeze', genre: '#INDIEROCK' },
  { track: 'Cigarettes After Sex - Apocalypse', aura: 'Dream Pop / Ambient Sunset', genre: '#DREAMPOP' },
  { track: 'AP Dhillon - With You', aura: 'Punjabi Wave / Chill', genre: '#CHILL' },
  { track: 'Overmono - Good Lies', aura: 'High-Tempo UK Garage / Coffee', genre: '#UKGARAGE' }
];

export const DEFAULT_SCRAPBOOK_MEMORIES: ScrapbookMemory[] = [
  {
    id: 'mem-1',
    title: 'Midnight Chai @ Gate 2',
    photoUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&auto=format&fit=crop&q=80',
    locationName: 'Sanjay Tea Stall, Koramangala 5th',
    cityName: 'Bengaluru',
    date: 'Last Friday • 01:15 AM',
    squadMembers: [
      { handle: 'harshal.b', avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150' },
      { handle: 'sneha.ui', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
      { handle: 'aarav.dev', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' }
    ],
    caption: '4 hot ginger chais, discussing startup ideas under streetlights until 2am. Zero flakers!',
    vibeTag: '🧋 3am Chai Runs',
    likes: 18,
    notes: 'Signed: "Next time filter coffee on me!" - Harshal • "Great pitch deck session" - Sneha'
  },
  {
    id: 'mem-2',
    title: 'Turf Badminton 2v2 Smash',
    photoUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&auto=format&fit=crop&q=80',
    locationName: 'Play Arena, Koramangala',
    cityName: 'Bengaluru',
    date: '3 days ago • 07:30 PM',
    squadMembers: [
      { handle: 'kavya.badm', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150' },
      { handle: 'vikram.k', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' }
    ],
    caption: 'Intense 3-set rally. Court 3 champions. Winner bought fresh sugarcane juice after!',
    vibeTag: '🎾 Turf Badminton 2v2',
    likes: 24,
    notes: 'Signed: "Match of the season. 21-19 final set!" - Vikram'
  },
  {
    id: 'mem-3',
    title: 'Carter Road Golden Hour Walk',
    photoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    locationName: 'Carter Road Promenade, Bandra',
    cityName: 'Mumbai',
    date: 'Last Sunday • 06:10 PM',
    squadMembers: [
      { handle: 'zoya.carter', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
      { handle: 'rohan.ai', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' }
    ],
    caption: 'Shot 2 rolls of 35mm film by the Arabian Sea while listening to Peggy Gou on shared AirPods.',
    vibeTag: '📸 35mm Film Photography',
    likes: 31,
    notes: 'Signed: "Film rolls turned out cinematic" - Zoya'
  }
];

export const DEMO_PROFILES: UserProfile[] = [
  {
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
    bioManifesto: 'Proof of work > CGPA. Catch me at Gate 2 or building autonomous trading engines.',
    vibeTags: ['☕ Specialty Pour-Overs', '🎧 Fred again..', '💻 AI Side Projects', '🌙 Late Night Koramangala'],
    liveStatus: 'Coding at 12th Main Rooftop 💻'
  },
  {
    id: 'user-sneha',
    handle: 'sneha.ui',
    fullName: 'Sneha Patel',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    city: 'Bengaluru',
    karmaScore: 98,
    questsCompleted: 22,
    flakeRate: 0,
    isVerified: true,
    gender: 'F',
    spotifyTopArtists: ['Laufey', 'Billie Eilish', 'Taylor Swift', 'Leon Bridges'],
    currentRotation: 'Laufey - From The Start',
    audioAura: 'Matcha Jazz / Acoustic Sunset',
    badges: ['🌸 Girls-Only Host', '🎨 Figma Wizard', '🧋 Boba Scout'],
    bioManifesto: 'Crafting minimalist interfaces by day, hunting rooftop cafes by night.',
    vibeTags: ['🎨 UI / Interaction Design', '🧋 Adrak Bun Maska', '🎾 Badminton Singles', '📚 Indie Zines'],
    liveStatus: 'Down for Chai & Design talk 🧋'
  },
  {
    id: 'user-aarav',
    handle: 'aarav.dev',
    fullName: 'Aarav Sharma',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    city: 'Bengaluru',
    karmaScore: 94,
    questsCompleted: 18,
    flakeRate: 0,
    isVerified: true,
    gender: 'M',
    spotifyTopArtists: ['Peggy Gou', 'Overmono', 'Four Tet', 'Bicep'],
    currentRotation: 'Overmono - Good Lies',
    audioAura: 'High-Tempo UK Garage / Coffee',
    badges: ['🔥 Night Owl 15x', '🏸 Badminton Ace', '⚡ Quest Host LVL 2'],
    bioManifesto: 'Late night commits and 2v2 turf matches in Koramangala.',
    vibeTags: ['🧋 Midnight Tea Lore', '🎹 Analog Synthesizers', '🚲 Night Cycling', '⚡ Hardware Hacking'],
    liveStatus: 'Chilling at Sanjay tea stall 🧋'
  },
  {
    id: 'user-tanvi',
    handle: 'tanvi.film',
    fullName: 'Tanvi Shah',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    city: 'Mumbai',
    karmaScore: 96,
    questsCompleted: 16,
    flakeRate: 0,
    isVerified: true,
    gender: 'F',
    spotifyTopArtists: ['Prateek Kuhad', 'Anuv Jain', 'The Local Train'],
    currentRotation: 'The Local Train - Choona',
    audioAura: 'Indie Rock / Carter Road Breeze',
    badges: ['🌸 Girls-Only Host', '📸 35mm Analog', '🌊 Carter Road Local'],
    bioManifesto: 'Shooting street film on Carter Road promenade and hunting cutting chai.',
    vibeTags: ['🌊 Carter Road Sunsets', '☕ Cold Brew', '📸 35mm Film', '🌸 Girls-Only Safe Spaces'],
    liveStatus: 'Walking Carter Road Promenade 🌊'
  },
  {
    id: 'user-rohan',
    handle: 'rohan.ai',
    fullName: 'Rohan Verma',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    city: 'Delhi-NCR',
    karmaScore: 91,
    questsCompleted: 12,
    flakeRate: 0,
    isVerified: true,
    gender: 'M',
    spotifyTopArtists: ['Hans Zimmer', 'Max Richter', 'Aphex Twin'],
    currentRotation: 'Aphex Twin - #3',
    audioAura: 'Deep Focus Ambient / Coding',
    badges: ['💻 Vibe Coder', '☕ Filter Coffee Fanatic'],
    bioManifesto: 'Reading papers at Cyber Hub cafes. Down for spontaneous code sprints.',
    vibeTags: ['💻 Vibe Coding & Shippers', '📚 Indie Book Swaps', '☕ Specialty Pour-Overs', '🌙 Cyber Hub Nights'],
    liveStatus: 'Hacking late at Cyber Hub 💻'
  },
  {
    id: 'user-kavya',
    handle: 'kavya.badm',
    fullName: 'Kavya Rao',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    city: 'Bengaluru',
    karmaScore: 98,
    questsCompleted: 24,
    flakeRate: 0,
    isVerified: true,
    gender: 'F',
    spotifyTopArtists: ['Dua Lipa', 'Charli xcx', 'Peggy Gou'],
    currentRotation: 'Charli xcx - 360',
    audioAura: 'High-BPM Cardio / Synth Pop',
    badges: ['🏸 Badminton Ace', '⚡ 100% Show-Up', '🔥 Night Owl 15x'],
    bioManifesto: 'Playing court matches across HSR and Koramangala. No flakes allowed.',
    vibeTags: ['🎾 Turf Badminton 2v2', '⚡ High-Entropy Meetups', '🧋 3am Chai Runs', '🎧 Synth Pop'],
    liveStatus: 'Seeking 4th for Badminton 🏸'
  },
  {
    id: 'user-ananya',
    handle: 'ananya.m',
    fullName: 'Ananya Mehra',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    city: 'Mumbai',
    karmaScore: 92,
    questsCompleted: 11,
    flakeRate: 0,
    isVerified: true,
    gender: 'F',
    spotifyTopArtists: ['Laufey', 'Clairo', 'Beabadoobee'],
    currentRotation: 'Clairo - Juna',
    audioAura: 'Matcha Jazz / Coastal Sunset',
    badges: ['🌸 Girls Only Safe Host', '☕ Specialty Brew'],
    bioManifesto: 'Hosting safe chill walks on Carter Road and trying every matcha spot in Bandra.',
    vibeTags: ['🍵 Iced Matcha Lattes', '🌊 Sunset Sea Walks', '🌸 Girls-Only Safe Spaces', '🧥 Vintage & Thrifting'],
    liveStatus: 'Sunset Promenade Walk 🌊'
  },
  {
    id: 'user-zoya',
    handle: 'zoya.beats',
    fullName: 'Zoya Akhtar',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    city: 'Pune',
    karmaScore: 95,
    questsCompleted: 14,
    flakeRate: 0,
    isVerified: true,
    gender: 'F',
    spotifyTopArtists: ['When Chai Met Toast', 'Yellow Diary', 'Prateek Kuhad'],
    currentRotation: 'When Chai Met Toast - Joy of Little Things',
    audioAura: 'Acoustic Indie / Lane 7 KP',
    badges: ['🎸 Jam Leader', '☕ Chai Connoisseur'],
    bioManifesto: 'Acoustic guitarist hunting spontaneous cafe jam lobbies in Koregaon Park.',
    vibeTags: ['🎸 Acoustic Jam', '🧋 3am Chai Runs', '☕ Specialty Brew', '📚 Indie Book Swaps'],
    liveStatus: 'Acoustic Jam at Lane 7 🎸'
  },
  {
    id: 'user-kabir',
    handle: 'kabir.run',
    fullName: 'Kabir Bakshi',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    city: 'Delhi-NCR',
    karmaScore: 97,
    questsCompleted: 19,
    flakeRate: 0,
    isVerified: true,
    gender: 'M',
    spotifyTopArtists: ['Karan Aujla', 'Diljit Dosanjh', 'AP Dhillon'],
    currentRotation: 'Karan Aujla - Winning Speech',
    audioAura: 'High-BPM Punjabi Beats / 5K Sprint',
    badges: ['🏃‍♂️ 5K Pacer', '⚡ 100% Show-Up'],
    bioManifesto: 'Morning pace runs around Hauz Khas Lake followed by Blue Tokai iced brew.',
    vibeTags: ['🏃 5K Pacer', '☕ Cold Brew', '🌲 Deer Park Nature', '⚡ High-Entropy Meetups'],
    liveStatus: 'Pacing 5k around HKV Lake 🏃'
  }
];

// Random Persona Generator for instant zero-friction new users
const RANDOM_HANDLES = [
  'chai.nomad', 'lofi.coder', 'bandra.runner', 'koramangala.pilot', 
  'turf.ace', 'cyber.hustler', 'matcha.scout', 'vinyl.curator',
  'indie.synthesizer', '3am.builder', 'hkv.flaneur', 'filtercoffee.dev'
];

const RANDOM_NAMES = [
  'Aryan Sen', 'Diya Kapoor', 'Meera Nair', 'Kabir Roy', 
  'Ananya Deshmukh', 'Vihaan Joshi', 'Rhea Singhania', 'Aditya Verma'
];

const RANDOM_ROTATIONS = [
  'Fred again.. - adore u', 'Laufey - From The Start', 'Overmono - Good Lies',
  'The Local Train - Choo Lo', 'Peggy Gou - (It Goes Like) Nanana',
  'Charli xcx - 360', 'Karan Aujla - Softly', 'Aphex Twin - #3'
];

const RANDOM_AURAS = [
  'Late-Night Lo-Fi / Electronic', 'Matcha Jazz / Sunset Acoustic',
  'High-Tempo UK Garage / Coffee', 'Deep Focus Ambient / Coding',
  'Indie Rock / Coastal Breeze', 'High-BPM Cardio / Synth Pop'
];

const RANDOM_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80'
];

export function generateRandomPersona(city: string = 'Bengaluru'): UserProfile {
  const rand = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const num = Math.floor(100 + Math.random() * 900);
  const handleBase = rand(RANDOM_HANDLES);
  const handle = `${handleBase}.${num}`;
  const fullName = rand(RANDOM_NAMES);
  const avatarUrl = rand(RANDOM_AVATARS);
  const rotation = rand(RANDOM_ROTATIONS);
  const aura = rand(RANDOM_AURAS);

  // Pick 3-4 random Gen Z tags
  const shuffledTags = [...GEN_Z_VIBE_TAGS].sort(() => 0.5 - Math.random());
  const selectedVibeTags = shuffledTags.slice(0, 4);
  const liveStatus = rand(LIVE_STATUS_OPTIONS);

  return {
    id: `user-${Date.now().toString().slice(-6)}`,
    handle,
    fullName,
    avatarUrl,
    city,
    karmaScore: 100,
    questsCompleted: 0,
    flakeRate: 0,
    isVerified: true,
    gender: 'M',
    isSpotifyConnected: true,
    spotifyTopArtists: [rotation.split(' - ')[0], 'Fred again..', 'The Local Train'],
    currentRotation: rotation,
    audioAura: aura,
    badges: ['⚡ New Explorer', '🔥 100% Show-Up'],
    bioManifesto: 'Spontaneous sidequest explorer. Down for 3am tea stalls, sunset walks, or music jams.',
    vibeTags: selectedVibeTags,
    liveStatus,
    scrapbookMemories: DEFAULT_SCRAPBOOK_MEMORIES
  };
}


