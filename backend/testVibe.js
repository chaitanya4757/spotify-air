require("dotenv").config(); // Load your API Key
const { generateVibeMap } = require("./utils/vibeEngine");

const testSong = {
  title: "Blinding Lights",
  artist: "The Weeknd",
  duration: 200 // seconds
};

console.log("🎵 Testing Vibe Engine for:", testSong.title);
console.log("⏳ Waiting for Gemini...");

async function runTest() {
  try {
    // Manually call the engine
    const vibeData = await generateVibeMap(testSong);

    if (!vibeData) {
      console.log("❌ Failed: Vibe Data is null.");
      return;
    }

    console.log("\n✅ SUCCESS! Received Vibe Segments:");
    console.log(JSON.stringify(vibeData, null, 2));

    // Check if colors are valid hex codes
    const firstSegment = vibeData[0];
    if (firstSegment.moodColor && /^#[0-9A-F]{6}$/i.test(firstSegment.moodColor)) {
      console.log("\n🎨 Color Check: Valid Hex Code Detected (" + firstSegment.moodColor + ")");
    } else {
      console.log("\n⚠️ Color Check: Invalid or Missing Hex Code!");
    }

  } catch (error) {
    console.error("❌ Error running test:", error);
  }
}

runTest();