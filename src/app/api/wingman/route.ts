import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { venueName, category, city, memberCount } = await request.json();

    const geminiKey = process.env.GEMINI_API_KEY;

    // 1. If Gemini API Key exists, query Google AI Studio
    if (geminiKey) {
      const prompt = `You are the AI Wingman on 'SideQuest', an IRL meetup app for Gen Z and young founders in Indian metros.
Generate an energetic, witty 2-sentence icebreaker and shared vibe summary for a meetup squad of ${memberCount || 3} people meeting right now at "${venueName}" in ${city || 'Bengaluru'} for track "${category || 'CHAI_FOOD'}".
Include local cultural humor, zero awkwardness, and suggest 2 funny debate topics. Keep it under 60 words.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return NextResponse.json({
            vibeNote: text.trim(),
            source: 'gemini-1.5-flash'
          });
        }
      }
    }

    // 2. High-Entropy Localized Algorithmic Fallback ($0 cost, 0 API keys)
    const localHumor: Record<string, string[]> = {
      bengaluru: [
        `High synergy detected: 94% taste overlap in dark roast coffee & arguing whether Peak Bengaluru is renting a desk at a gym. Starter: Ask what everyone's side project stack is.`,
        `Squad vibe: Surviving Silk Board traffic to drink specialty pour-overs. Starter: Debate whether Claude 3.7 or deep reasoning models will replace junior dev salaries first.`,
        `Indiranagar frequency aligned. High odds that 2 of you share an acoustic Spotify playlist and mutual acquaintances from a hackathon.`
      ],
      mumbai: [
        `Marine Drive / Bandra frequency synced: Zero small-talk protocol active. Starter: Debate whether Carter Road beats Bandstand for midnight conversations.`,
        `Post-work decompression energy: High compatibility in late-night cutting chai and surviving monsoon commute lore.`
      ],
      delhi: [
        `HKV & Cyber Hub frequency active: 100% agreement on winter night drives and hunting the crispest tandoori momos. Starter: Which market has superior coffee?`,
        `Late-night energy high: Zero awkward silence permitted. Starter: Debate whether CP Inner Circle or South Ex is better for walking conversations.`
      ],
      pune: [
        `FC Road & Koregaon Park aesthetic: Calm lofi vibes mixed with rapid startup discussions. Starter: Best misal spot in town vs best cold coffee stall.`
      ]
    };

    const cityKey = (city || 'bengaluru').toLowerCase();
    const cityOptions = localHumor[cityKey] || localHumor['bengaluru'];
    const chosenVibe = cityOptions[Math.floor(Math.random() * cityOptions.length)];

    return NextResponse.json({
      vibeNote: chosenVibe,
      source: 'sidequest-vibe-engine'
    });
  } catch (error) {
    return NextResponse.json({
      vibeNote: `High-entropy spontaneous squad. Gather at the venue before the window self-destructs!`,
      source: 'fallback'
    });
  }
}
