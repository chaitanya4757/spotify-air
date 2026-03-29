const axios = require('axios');
const querystring = require('querystring');
const User = require('../models/User');

/**
 * Helper: Create Spotify Auth Header
 */
const getAuthHeader = () => {
  return {
    headers: {
      Authorization:
        'Basic ' +
        Buffer.from(
          process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
        ).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };
};

/**
 * 1️⃣ REFRESH TOKEN FUNCTION
 */
const getValidAccessToken = async (user) => {
  if (process.env.MOCK_SPOTIFY === "true") {
    return "mock_access_token";
  }

  if (!user.needsRefresh()) {
    return user.accessToken;
  }

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      querystring.stringify({
        grant_type: 'refresh_token',
        refresh_token: user.refreshToken
      }),
      getAuthHeader()
    );

    const { access_token, expires_in } = response.data;
    user.accessToken = access_token;
    user.tokenExpiresIn = expires_in;
    user.tokenUpdatedAt = Date.now();
    await user.save();
    return access_token;

  } catch (error) {
    console.error('Error refreshing token:', error.response?.data || error.message);
    throw new Error('Failed to refresh Spotify token');
  }
};

/**
 * 2️⃣ GET CURRENT TRACK
 */
const getSpotifyPlaybackState = async (user) => {

  // 🔥 FULL MOCK MODE STREAM
  if (process.env.MOCK_SPOTIFY === "true") {
    return {
      uri: "spotify:track:mock",
      title: "Mock Track",
      artist: "Mock Artist",
      albumArt: null,
      isPlaying: true,
      progressMs: Math.floor(Math.random() * 200000),
      duration_ms: 200000, 
      timestamp: Date.now(),
      audioPhysics: {
        tempo: 120,
        energy: 0.8,
        danceability: 0.8,
        loudness: -5
      }
    };
  }

  // 🔥 REAL SPOTIFY MODE
  try {
    const accessToken = await getValidAccessToken(user);

    // 1. Get Playback
    const playerResponse = await axios.get(
      'https://api.spotify.com/v1/me/player/currently-playing', 
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!playerResponse.data || !playerResponse.data.item) {
      return null;
    }

    const track = playerResponse.data.item;
    const isPlaying = playerResponse.data.is_playing;
    const progressMs = playerResponse.data.progress_ms;

    // 2. Get Audio Features
    let audioPhysics = null;
    try {
      const featuresResponse = await axios.get(
        `https://api.spotify.com/v1/audio-features/${track.id}`, 
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const features = featuresResponse.data;
      audioPhysics = {
        tempo: features.tempo,
        energy: features.energy,
        danceability: features.danceability,
        loudness: features.loudness
      };
    } catch (err) {
      console.log("⚠️ Audio features failed, continuing without physics.");
    }

    return {
      uri: track.uri,
      title: track.name,
      artist: track.artists.map(a => a.name).join(', '),
      albumArt: track.album.images[0]?.url,
      isPlaying,
      progressMs,
      duration_ms: track.duration_ms, 
      timestamp: Date.now(),
      audioPhysics
    };

  } catch (error) {
    if (error.response && error.response.status === 429) {
        throw new Error("429_RATE_LIMIT");
    }
    console.error('Error fetching Spotify Data:', error.message);
    return null;
  }
};

/**
 * 3️⃣ FORCE SYNC PLAYBACK (The missing function!)
 */
const forceSyncPlayback = async (userId, trackUri, positionMs) => {
  try {
    const user = await User.findById(userId).select("+accessToken");
    if (!user) throw new Error("User not found");

    const headers = { Authorization: `Bearer ${user.accessToken}` };

    // Ask Spotify what devices this user has turned on right now
    const deviceRes = await axios.get("https://api.spotify.com/v1/me/player/devices", { headers });
    const devices = deviceRes.data.devices;

    if (!devices || devices.length === 0) {
      console.log(`⚠️ No active devices found for listener: ${user.displayName}`);
      return { success: false, message: "NO_DEVICE" };
    }

    // Find the currently active device, or just use the first one in the list
    let targetDevice = devices.find(d => d.is_active);
    if (!targetDevice) targetDevice = devices[0]; 

    console.log(`🎧 Syncing ${user.displayName} on device: ${targetDevice.name}`);

    // Send the Remote Control play command!
    await axios.put(
      `https://api.spotify.com/v1/me/player/play?device_id=${targetDevice.id}`, // ✅ Fixed URL and added the missing $ sign!
      {
        uris: [trackUri],
        position_ms: positionMs
      },
      { headers }
    );

    return { success: true };
  } catch (error) {
    console.error("Force Sync Error:", error.response?.data || error.message);
    return { success: false, message: "API_ERROR" };
  }
};

// ✅ EXPORT BOTH FUNCTIONS AT THE BOTTOM
module.exports = {
  getSpotifyPlaybackState,
  forceSyncPlayback
};