const { searchSpotifyTracks } = require('../utils/spotifyService');
const User = require('../models/User'); 

exports.searchTracks = async (req, res) => {
  try {
    // Extract both the search term and the userId we sent from the React frontend
    const { q, userId } = req.query; 

    if (!q) {
      return res.status(400).json({ message: "Search query is required" });
    }

    if (!userId) {
       return res.status(401).json({ message: "Unauthorized: User ID required" });
    }

    // 🚨 THE FIX: Explicitly select the hidden token fields so the service can use/refresh them
    const user = await User.findById(userId).select("+accessToken +refreshToken +tokenExpiresIn");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const tracks = await searchSpotifyTracks(user, q);
    res.status(200).json(tracks);

  } catch (error) {
    console.error("Search Route Error:", error.message);
    res.status(500).json({ message: "Search failed", error: error.message });
  }
};