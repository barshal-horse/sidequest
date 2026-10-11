import { MetroCity, Drop } from '@/types';

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
  }
];
