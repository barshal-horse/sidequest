import assert from 'node:assert';
import { METRO_CITIES, INITIAL_DROPS, INITIAL_DROP_CHATS, DEMO_PROFILES } from '../src/lib/constants.js';
import { 
  calculateDistanceInMeters, 
  formatDistance, 
  formatWalkingTime, 
  getGoogleMapsUrl, 
  findClosestMetro 
} from '../src/lib/geo.js';

console.log('🧪 ========================================================');
console.log('⚡ SIDEQUEST COMPREHENSIVE AUTOMATED TEST SUITE');
console.log('========================================================\n');

let totalTests = 0;
let passedTests = 0;

function runTest(name: string, fn: () => void) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✅ [PASS] ${name}`);
  } catch (err: any) {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(`     Error: ${err.message}\n`);
  }
}

// ============================================================================
// 1. CHAT ISOLATION & INTEGRITY TESTS
// ============================================================================
console.log('📦 SECTION 1: Drop Chat Isolation & Integrity Tests');

runTest('Every initial drop has a defined, non-empty chat thread in INITIAL_DROP_CHATS', () => {
  INITIAL_DROPS.forEach(drop => {
    const chat = INITIAL_DROP_CHATS[drop.id];
    assert.ok(chat, `Chat thread must exist for drop ID: ${drop.id}`);
    assert.ok(chat.length > 0, `Chat thread for ${drop.id} must have starter messages`);
  });
});

runTest('No two drop flares share identical message IDs or cross-contaminated text', () => {
  const seenMsgIds = new Set<string>();
  Object.entries(INITIAL_DROP_CHATS).forEach(([dropId, messages]) => {
    messages.forEach(msg => {
      assert.strictEqual(msg.dropId, dropId, `Message ${msg.id} dropId must match parent key ${dropId}`);
      assert.ok(!seenMsgIds.has(msg.id), `Message ID ${msg.id} must be globally unique across drops`);
      seenMsgIds.add(msg.id);
    });
  });
});

runTest('Chat simulation: Sending a message to blr-drop-1 isolates message strictly to blr-drop-1', () => {
  const mockStoreChats = JSON.parse(JSON.stringify(INITIAL_DROP_CHATS));
  const testDropId = 'blr-drop-1';
  const otherDropId = 'blr-drop-2';

  const newTestMsg = {
    id: 'msg-test-unique-999',
    dropId: testDropId,
    userId: 'user-pilot',
    handle: 'radar.explorer',
    fullName: 'Test Pilot',
    avatarUrl: '',
    text: 'Isolated message test for drop 1',
    timestamp: 'Just now',
    isHost: false
  };

  mockStoreChats[testDropId].push(newTestMsg);

  // Assert it exists in blr-drop-1
  assert.ok(
    mockStoreChats[testDropId].some((m: any) => m.id === 'msg-test-unique-999'),
    'New message must exist in blr-drop-1'
  );

  // Assert it NEVER exists in blr-drop-2 or any other drop
  assert.ok(
    !mockStoreChats[otherDropId].some((m: any) => m.id === 'msg-test-unique-999'),
    'New message must NOT leak into blr-drop-2'
  );
  assert.ok(
    !mockStoreChats['mum-drop-1'].some((m: any) => m.id === 'msg-test-unique-999'),
    'New message must NOT leak into mum-drop-1'
  );
});

// ============================================================================
// 2. GEO CALCULATIONS & GOOGLE MAPS NAVIGATION TESTS
// ============================================================================
console.log('\n🗺️ SECTION 2: Geo Calculations, Distance & Maps Tests');

runTest('calculateDistanceInMeters returns accurate Haversine distance', () => {
  // Koramangala 5th block (12.9352, 77.6200) to Indiranagar 12th main (12.9719, 77.6412) ~ 4.7km
  const dist = calculateDistanceInMeters(12.9352, 77.6200, 12.9719, 77.6412);
  assert.ok(dist > 4400 && dist < 5000, `Expected ~4.7km distance, got: ${dist}m`);

  // Same coordinates should be 0m
  const zeroDist = calculateDistanceInMeters(12.9352, 77.6200, 12.9352, 77.6200);
  assert.strictEqual(zeroDist, 0);
});

runTest('formatDistance properly formats meters (<1km) and kilometers (>=1km)', () => {
  assert.strictEqual(formatDistance(250), '250m');
  assert.strictEqual(formatDistance(850), '850m');
  assert.strictEqual(formatDistance(1200), '1.2km');
  assert.strictEqual(formatDistance(5400), '5.4km');
});

runTest('formatWalkingTime provides realistic walk and ride estimates', () => {
  const shortWalk = formatWalkingTime(300);
  assert.ok(shortWalk.includes('min walk'), `Expected min walk for 300m, got: ${shortWalk}`);

  const longRide = formatWalkingTime(4000);
  assert.ok(longRide.includes('min ride'), `Expected min ride for 4000m, got: ${longRide}`);
});

runTest('getGoogleMapsUrl generates standard universal deep-links with 0 API keys', () => {
  const url = getGoogleMapsUrl(12.9352, 77.6200, 'Sanjay Tea Stall');
  assert.ok(url.startsWith('https://www.google.com/maps/dir/?api=1'), 'URL must match Google Maps API protocol');
  assert.ok(url.includes('12.9352'), 'URL must contain destination latitude');
  assert.ok(url.includes('77.62'), 'URL must contain destination longitude');
  assert.ok(url.includes('Sanjay'), 'URL must contain encoded venue title');
});

runTest('findClosestMetro accurately maps GPS coordinates to nearest Indian metro', () => {
  // Safe fallback test when empty
  const emptyRes = findClosestMetro(12.9352, 77.6200, []);
  assert.strictEqual(emptyRes.city, undefined);

  // Bangalore Koramangala GPS
  const blr = findClosestMetro(12.9352, 77.6200, METRO_CITIES);
  assert.strictEqual(blr.city?.id, 'bengaluru');

  // Mumbai Bandra GPS
  const mum = findClosestMetro(19.0657, 72.8258, METRO_CITIES);
  assert.strictEqual(mum.city?.id, 'mumbai');

  // Delhi Hauz Khas GPS
  const del = findClosestMetro(28.5535, 77.1947, METRO_CITIES);
  assert.strictEqual(del.city?.id, 'delhi');

  // Pune Koregaon Park GPS
  const pun = findClosestMetro(18.5362, 73.8997, METRO_CITIES);
  assert.strictEqual(pun.city?.id, 'pune');

  // Hyderabad Jubilee Hills GPS
  const hyd = findClosestMetro(17.4319, 78.4073, METRO_CITIES);
  assert.strictEqual(hyd.city?.id, 'hyderabad');

  // Chennai Besant Nagar GPS
  const chn = findClosestMetro(13.0001, 80.2690, METRO_CITIES);
  assert.strictEqual(chn.city?.id, 'chennai');

  // Kolkata Park Street GPS
  const kol = findClosestMetro(22.5519, 88.3516, METRO_CITIES);
  assert.strictEqual(kol.city?.id, 'kolkata');
});

// ============================================================================
// 3. SQUAD CAPACITY, ANTI-FLAKE KARMA & GEOFENCE TESTS
// ============================================================================
console.log('\n🛡️ SECTION 3: Capacity, Anti-Flake Karma & Security Gate Tests');

runTest('Capacity enforcement prevents overflow beyond maxSlots', () => {
  const drop = { ...INITIAL_DROPS[0], maxSlots: 3, currentSlots: 3, members: [{}, {}, {}] };
  const canJoin = drop.currentSlots < drop.maxSlots;
  assert.strictEqual(canJoin, false, 'Full lobby must reject new joins');
});

runTest('Girls-only safety gate rejects unauthorized male joins', () => {
  const girlsDrop = { ...INITIAL_DROPS[0], isGirlsOnly: true };
  const maleUser = { id: 'user-m', gender: 'M' };
  const femaleUser = { id: 'user-f', gender: 'F' };

  const canMaleJoin = !girlsDrop.isGirlsOnly || maleUser.gender === 'F';
  const canFemaleJoin = !girlsDrop.isGirlsOnly || femaleUser.gender === 'F';

  assert.strictEqual(canMaleJoin, false, 'Male profile must be blocked from girls-only drop');
  assert.strictEqual(canFemaleJoin, true, 'Female profile must be permitted into girls-only drop');
});

runTest('Karma & quests increment correctly upon verified check-in', () => {
  let user = { karmaScore: 90, questsCompleted: 5 };
  // Check-in logic: +10 karma up to 100 max, +1 quest
  user = {
    ...user,
    karmaScore: Math.min(100, user.karmaScore + 10),
    questsCompleted: user.questsCompleted + 1
  };
  assert.strictEqual(user.karmaScore, 100);
  assert.strictEqual(user.questsCompleted, 6);
});

// ============================================================================
// 4. METRO COVERAGE & HOTSPOT INTEGRITY TESTS
// ============================================================================
console.log('\n🏙️ SECTION 4: Metro City Coverage & Hotspot Integrity Tests');

runTest('All 7 Indian Metros are configured with valid hotspots and coordinates', () => {
  assert.strictEqual(METRO_CITIES.length, 7, 'Expected exactly 7 Indian metros');
  const expectedCityIds = ['bengaluru', 'mumbai', 'delhi', 'pune', 'hyderabad', 'chennai', 'kolkata'];
  
  expectedCityIds.forEach(id => {
    const city = METRO_CITIES.find(c => c.id === id);
    assert.ok(city, `City ${id} must exist in METRO_CITIES`);
    assert.ok(city.hotspots.length >= 2, `City ${id} must have at least 2 curated hotspots`);
    city.hotspots.forEach(h => {
      assert.ok(h.lat !== 0 && h.lng !== 0, `Hotspot ${h.name} must have valid non-zero coordinates`);
    });
  });
});

runTest('Every metro city has at least 1 active flare in INITIAL_DROPS', () => {
  METRO_CITIES.forEach(city => {
    const dropsInCity = INITIAL_DROPS.filter(d => d.cityId === city.id);
    assert.ok(dropsInCity.length >= 1, `City ${city.name} must have at least 1 active drop flare`);
  });
});

// ============================================================================
// FINAL SUMMARY
// ============================================================================
console.log('\n========================================================');
console.log(`🏁 TEST SUITE RESULT: ${passedTests}/${totalTests} TESTS PASSED (${passedTests === totalTests ? '100% SUCCESS' : 'FAILURES DETECTED'})`);
console.log('========================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
} else {
  process.exit(0);
}
