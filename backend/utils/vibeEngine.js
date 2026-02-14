const axios = require("axios");

// 1. IN-MEMORY CACHE
// Stores the vibe map so we only hit Gemini once per unique song.
const vibeCache = {}; 

exports.generateVibeMap = async (track) => {
  try {
    if (!track || !track.title || !track.artist) {
      console.log("⚠️ Invalid track passed to vibe engine.");
      return null;
    }

    const cacheKey = `${track.title}-${track.artist}`.toLowerCase().trim();

    // 2. CHECK CACHE FIRST
    if (vibeCache[cacheKey]) {
      console.log(`⚡ Serving cached vibe map for: ${track.title}`);
      return vibeCache[cacheKey];
    }

    console.log(`🚀 Requesting Gemini AI for: ${track.title}`);

    const prompt = `
      Analyze the song "${track.title}" by "${track.artist}".
      Generate a structural vibe map for a visualizer.
      Return a JSON ARRAY of objects. NO markdown. NO explanation.
      Structure:
      [
        {
          "startPercent": 0,
          "energy": 0.5,
          "intensity": "medium",
          "moodColor": "#00FFFF",
          "tempoFeel": "medium"
        }
      ]
      Requirements:
      - 4 to 8 segments.
      - startPercent must strictly increase from 0 to 100.
    `;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      }
    );

    if (!response.data.candidates?.length) {
      throw new Error("No AI candidates returned.");
    }

    const rawText = response.data.candidates[0].content.parts[0].text;
    const vibeMap = JSON.parse(rawText);

    console.log(`✅ Vibe map generated: ${vibeMap.length} segments`);

    // 3. SAVE TO CACHE
    vibeCache[cacheKey] = vibeMap; 

    return vibeMap;

  } catch (err) {
    console.error("❌ Vibe AI error:", err.message);

    // 4. FALLBACK LOGIC
    // If we hit a 429 error, return a default vibe so the visualizer stays active.
    console.log("🛠️ Using fallback vibe map due to API error.");
    return [
      {
        "startPercent": 0,
        "energy": 0.5,
        "intensity": "steady",
        "moodColor": "#00FFFF", // Default Neon Cyan
        "tempoFeel": "medium"
      },
      {
        "startPercent": 50,
        "energy": 0.6,
        "intensity": "steady",
        "moodColor": "#FF00FF", // Default Neon Pink
        "tempoFeel": "medium"
      }
    ];
  }
};