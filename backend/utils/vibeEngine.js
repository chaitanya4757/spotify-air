const axios = require("axios");

const vibeCache = {}; // In-memory cache

exports.generateVibeMap = async (track) => {
  try {
    if (!track || !track.title || !track.artist) {
      console.log("⚠️ Invalid track passed to vibe engine.");
      return null;
    }

    const cacheKey = `${track.title}-${track.artist}`;

    // Return cached version if exists
    if (vibeCache[cacheKey]) {
      console.log("⚡ Returning cached vibe map");
      return vibeCache[cacheKey];
    }

    const prompt = `
You are a music structure analysis engine.

Given the song "${track.title}" by "${track.artist}", 
generate a structural vibe map for visual animation.

Return ONLY valid JSON array.

Each segment must include:
- startPercent (number between 0 and 100)
- energy (number between 0 and 1)
- intensity (low, medium, or high)
- moodColor (hex color like #FF3366)
- tempoFeel (slow, medium, or fast)

Generate 4 to 6 segments.
First segment startPercent = 0.
Last segment startPercent < 100.
startPercent values increase progressively.
`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      }
    );

    if (!response.data.candidates?.length) {
      console.log("⚠️ No candidates returned from Gemini.");
      return null;
    }

    let text = response.data.candidates[0].content.parts[0].text;

    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const vibeMap = JSON.parse(text);

    console.log(`✅ Vibe map generated: ${vibeMap.length} segments`);

    vibeCache[cacheKey] = vibeMap; // Cache result

    return vibeMap;

  } catch (err) {
    console.error("❌ Vibe AI error:", err.response?.data || err.message);
    return null;
  }
};
