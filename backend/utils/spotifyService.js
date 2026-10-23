// const axios = require('axios');
// const querystring = require('querystring');
// const User = require('../models/User');

// /**
//  * Helper: Create Spotify Auth Header
//  */
// const getAuthHeader = () => {
//   return {
//     headers: {
//       Authorization:
//         'Basic ' +
//         Buffer.from(
//           process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
//         ).toString('base64'),
//       'Content-Type': 'application/x-www-form-urlencoded'
//     }
//   };
// };

// /**
//  * 1️⃣ REFRESH TOKEN FUNCTION
//  */
// const getValidAccessToken = async (user) => {
//   if (process.env.MOCK_SPOTIFY === "true") {
//     return "mock_access_token";
//   }

//   if (!user.needsRefresh()) {
//     return user.accessToken;
//   }

//   try {
//     const response = await axios.post(
//       'https://accounts.spotify.com/api/token',
//       querystring.stringify({
//         grant_type: 'refresh_token',
//         refresh_token: user.refreshToken
//       }),
//       getAuthHeader()
//     );

//     const { access_token, expires_in } = response.data;
//     user.accessToken = access_token;
//     user.tokenExpiresIn = expires_in;
//     user.tokenUpdatedAt = Date.now();
//     await user.save();
//     return access_token;

//   } catch (error) {
//     console.error('Error refreshing token:', error.response?.data || error.message);
//     throw new Error('Failed to refresh Spotify token');
//   }
// };

// /**
//  * 2️⃣ GET CURRENT TRACK
//  */
// const getSpotifyPlaybackState = async (user) => {

//   // 🔥 FULL MOCK MODE STREAM
//   if (process.env.MOCK_SPOTIFY === "true") {
//     return {
//       uri: "spotify:track:mock",
//       title: "Mock Track",
//       artist: "Mock Artist",
//       albumArt: null,
//       isPlaying: true,
//       progressMs: Math.floor(Math.random() * 200000),
//       duration_ms: 200000, 
//       timestamp: Date.now(),
//       audioPhysics: {
//         tempo: 120,
//         energy: 0.8,
//         danceability: 0.8,
//         loudness: -5
//       }
//     };
//   }

//   // 🔥 REAL SPOTIFY MODE
//   try {
//     const accessToken = await getValidAccessToken(user);

//     // 1. Get Playback
//     const playerResponse = await axios.get(
//       'https://api.spotify.com/v1/me/player', 
//       { headers: { Authorization: `Bearer ${accessToken}` } }
//     );

//     if (!playerResponse.data || !playerResponse.data.item) {
//       return null;
//     }

//     const track = playerResponse.data.item;
//     const isPlaying = playerResponse.data.is_playing;
//     const progressMs = playerResponse.data.progress_ms;

//     // 2. Get Audio Features
//     let audioPhysics = null;
//     try {
//       const featuresResponse = await axios.get(
//         `https://api.spotify.com/v1/audio-features/${track.id}`, 
//         { headers: { Authorization: `Bearer ${accessToken}` } }
//       );
//       const features = featuresResponse.data;
//       audioPhysics = {
//         tempo: features.tempo,
//         energy: features.energy,
//         danceability: features.danceability,
//         loudness: features.loudness
//       };
//     } catch (err) {
//       console.log("⚠️ Audio features failed, continuing without physics.");
//     }

//     return {
//       uri: track.uri,
//       title: track.name,
//       artist: track.artists.map(a => a.name).join(', '),
//       albumArt: track.album.images[0]?.url,
//       isPlaying,
//       progressMs,
//       duration_ms: track.duration_ms, 
//       timestamp: Date.now(),
//       audioPhysics
//     };

//   } catch (error) {
//     if (error.response && error.response.status === 429) {
//         throw new Error("429_RATE_LIMIT");
//     }
//     console.error('Error fetching Spotify Data:', error.message);
//     return null;
//   }
// };

// /**
//  * 3️⃣ FORCE SYNC PLAYBACK
//  */
// const forceSyncPlayback = async (userId, trackUri, positionMs) => {
//   try {
//     const user = await User.findById(userId).select("+accessToken");
//     if (!user) throw new Error("User not found");

//     const headers = { Authorization: `Bearer ${user.accessToken}` };

//     const deviceRes = await axios.get("https://api.spotify.com/v1/me/player/devices", { headers });
//     const devices = deviceRes.data.devices;

//     if (!devices || devices.length === 0) {
//       console.log(`⚠️ No active devices found for listener: ${user.displayName}`);
//       return { success: false, message: "NO_DEVICE" };
//     }

//     let targetDevice = devices.find(d => d.is_active);
//     if (!targetDevice) targetDevice = devices[0]; 

//     console.log(`🎧 Syncing ${user.displayName} on device: ${targetDevice.name}`);

//     await axios.put(
//       `https://api.spotify.com/v1/me/player/play?device_id=${targetDevice.id}`, 
//       {
//         uris: [trackUri],
//         position_ms: positionMs
//       },
//       { headers }
//     );

//     return { success: true };
//   } catch (error) {
//     console.error("Force Sync Error:", error.response?.data || error.message);
//     return { success: false, message: "API_ERROR" };
//   }
// };

// /**
//  * 4️⃣ SEARCH SPOTIFY TRACKS (NEW)
//  */
// const searchSpotifyTracks = async (user, query) => {
//   // 🔥 FULL MOCK MODE
//   if (process.env.MOCK_SPOTIFY === "true") {
//     return [
//       { id: 'mock1', uri: 'spotify:track:mock1', title: `Mock Result 1 for "${query}"`, artist: 'Mock Artist A', albumArt: 'https://i.scdn.co/image/ab67616d00001e029e495fb707973f3390850eea', duration_ms: 180000 },
//       { id: 'mock2', uri: 'spotify:track:mock2', title: `Mock Result 2 for "${query}"`, artist: 'Mock Artist B', albumArt: 'https://i.scdn.co/image/ab67616d00001e024718e2b124f79258be7bc452', duration_ms: 200000 },
//       { id: 'mock3', uri: 'spotify:track:mock3', title: `Mock Result 3 for "${query}"`, artist: 'Mock Artist C', albumArt: 'https://i.scdn.co/image/ab67616d00001e02bd26ede1ae69327010d49946', duration_ms: 210000 }
//     ];
//   }

//   // 🔥 REAL SPOTIFY MODE
//   try {
//     const accessToken = await getValidAccessToken(user);

//     const response = await axios.get('https://api.spotify.com/v1/search', {
//       params: {
//         q: query,
//         type: 'track',
//         limit: 10 // Grab 10 results to keep the payload light
//       },
//       headers: {
//         Authorization: `Bearer ${accessToken}`
//       }
//     });

//     // Map the heavy Spotify object into our clean frontend format
//     return response.data.tracks.items.map(track => ({
//       id: track.id,
//       uri: track.uri,
//       title: track.name,
//       artist: track.artists.map(a => a.name).join(', '),
//       albumArt: track.album.images[0]?.url || '/default-album.png',
//       duration_ms: track.duration_ms
//     }));

//   } catch (error) {
//     console.error("Error searching Spotify tracks:", error.response?.data || error.message);
//     throw new Error("Failed to search Spotify");
//   }
// };

// // ✅ EXPORT ALL FUNCTIONS
// module.exports = {
//   getSpotifyPlaybackState,
//   forceSyncPlayback,
//   searchSpotifyTracks
// };

const axios = require("axios");
const querystring = require("querystring");
const User = require("../models/User");

const getAuthHeader = () => ({
  headers: {
    Authorization:
      "Basic " +
      Buffer.from(process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET).toString("base64"),
    "Content-Type": "application/x-www-form-urlencoded"
  }
});

/**
 * 1) Refresh token if needed
 */
const getValidAccessToken = async (user) => {
  if (process.env.MOCK_SPOTIFY === "true") return "mock_access_token";

  if (!user.needsRefresh()) return user.accessToken;

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        grant_type: "refresh_token",
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
    console.error("Error refreshing token:", error.response?.data || error.message);
    throw new Error("Failed to refresh Spotify token");
  }
};

/**
 * 2) Get current playback state
 */
const getSpotifyPlaybackState = async (user) => {
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
      audioPhysics: null
    };
  }

  try {
    const accessToken = await getValidAccessToken(user);

    const playerResponse = await axios.get("https://api.spotify.com/v1/me/player", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!playerResponse.data || !playerResponse.data.item) return null;

    const track = playerResponse.data.item;

    // NOTE: /audio-features was removed. Spotify blocks it for apps created
    // after Nov 2024, so audioPhysics is always null now.
    return {
      uri: track.uri,
      linkedFromUri: track.linked_from?.uri || null,
      title: track.name,
      artist: track.artists.map((a) => a.name).join(", "),
      albumArt: track.album.images[0]?.url,
      isPlaying: playerResponse.data.is_playing,
      progressMs: playerResponse.data.progress_ms,
      duration_ms: track.duration_ms,
      timestamp: Date.now(),
      audioPhysics: null
    };
  } catch (error) {
    if (error.response && error.response.status === 429) {
      throw new Error("429_RATE_LIMIT");
    }
    console.error("Error fetching Spotify Data:", error.response?.status, error.response?.data || error.message);
    return null;
  }
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * 3) Force sync playback (refreshes the token and wakes an idle device)
 */
const forceSyncPlayback = async (userId, trackUri, positionMs) => {
  try {
    const user = await User.findById(userId).select("+accessToken +refreshToken");
    if (!user) throw new Error("User not found");

    const token = await getValidAccessToken(user);
    const headers = { Authorization: `Bearer ${token}` };

    const deviceRes = await axios.get("https://api.spotify.com/v1/me/player/devices", { headers });
    const devices = (deviceRes.data.devices || []).filter((d) => !d.is_restricted);

    if (devices.length === 0) {
      console.log(`⚠️ No usable devices for: ${user.displayName}. Open Spotify and play anything once.`);
      return { success: false, message: "NO_DEVICE" };
    }

    // Prefer the native Spotify app over a browser Web Player when both are
    // available. The active device can belong to a background browser tab,
    // which makes Air appear to ignore the desktop app the host is watching.
    const isBrowserPlayer = (device) => /web player|browser|chrome|chromium|firefox|brave|edge/i.test(device.name || "");
    const targetDevice =
      devices.find((d) => d.is_active && !isBrowserPlayer(d)) ||
      devices.find((d) => !isBrowserPlayer(d)) ||
      devices.find((d) => d.is_active) ||
      devices[0];
    console.log(`🎧 Syncing ${user.displayName} on device: ${targetDevice.name} (active: ${targetDevice.is_active})`);

    // An idle Spotify desktop app accepts a play command (204) but never starts.
    // Transfer playback to it first to wake it up.
    if (!targetDevice.is_active) {
      await axios.put(
        "https://api.spotify.com/v1/me/player",
        { device_ids: [targetDevice.id], play: false },
        { headers }
      );
      await sleep(1500);
    }

    const playOnce = () =>
      axios.put(
        `https://api.spotify.com/v1/me/player/play?device_id=${targetDevice.id}`,
        { uris: [trackUri], position_ms: Math.max(0, Math.floor(positionMs || 0)) },
        { headers }
      );

    let res;
    try {
      res = await playOnce();
    } catch (e) {
      if (e.response?.status === 404) { // device not ready yet, retry once
        await sleep(1500);
        res = await playOnce();
      } else {
        throw e;
      }
    }
    console.log(`▶️ Spotify play status for ${user.displayName}:`, res.status);

    return { success: true };
  } catch (error) {
    console.error("Force Sync Error:", error.response?.status, JSON.stringify(error.response?.data) || error.message);
    return { success: false, message: "API_ERROR" };
  }
};

/**
 * 4) Search tracks
 */
const searchSpotifyTracks = async (user, query) => {
  if (process.env.MOCK_SPOTIFY === "true") {
    return [
      { id: "mock1", uri: "spotify:track:mock1", title: `Mock Result 1 for "${query}"`, artist: "Mock Artist A", albumArt: null, duration_ms: 180000 },
      { id: "mock2", uri: "spotify:track:mock2", title: `Mock Result 2 for "${query}"`, artist: "Mock Artist B", albumArt: null, duration_ms: 200000 }
    ];
  }

  try {
    const accessToken = await getValidAccessToken(user);

    const response = await axios.get("https://api.spotify.com/v1/search", {
      params: { q: query, type: "track", limit: 10 },
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    return response.data.tracks.items.map((track) => ({
      id: track.id,
      uri: track.uri,
      title: track.name,
      artist: track.artists.map((a) => a.name).join(", "),
      albumArt: track.album.images[0]?.url || "/default-album.png",
      duration_ms: track.duration_ms
    }));
  } catch (error) {
    console.error("Error searching Spotify tracks:", error.response?.data || error.message);
    throw new Error("Failed to search Spotify");
  }
};

module.exports = {
  getValidAccessToken,
  getSpotifyPlaybackState,
  forceSyncPlayback,
  searchSpotifyTracks
};
