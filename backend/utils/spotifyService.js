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
 * Checks if the user's token is valid. If expired, refresh it.
 */
const getValidAccessToken = async (user) => {

  // 🔥 If in mock mode, skip token logic entirely
  if (process.env.MOCK_SPOTIFY === "true") {
    return "mock_access_token";
  }

  if (!user.needsRefresh()) {
    return user.accessToken;
  }

  console.log(`🔄 Refreshing token for ${user.displayName}...`);

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
 * Returns currently playing track + audio physics
 */
exports.getSpotifyPlaybackState = async (user) => {

  // 🔥 FULL MOCK MODE STREAM
  if (process.env.MOCK_SPOTIFY === "true") {
    return {
      uri: "spotify:track:mock",
      title: "Mock Track",
      artist: "Mock Artist",
      albumArt: null,
      isPlaying: true,
      progressMs: Math.floor(Math.random() * 200000),
      timestamp: Date.now(),
      audioPhysics: {
        tempo: 90 + Math.random() * 60,       // Random BPM 90–150
        energy: Math.random(),                // 0–1
        danceability: Math.random(),
        loudness: -5 - Math.random() * 5      // -5 to -10 dB
      }
    };
  }

  // 🔥 REAL SPOTIFY MODE
 // 🔥 REAL SPOTIFY MODE
try {
  const accessToken = await getValidAccessToken(user);

  console.log("🎵 Fetching playback from Spotify...");

  const playerResponse = await axios.get(
    'https://api.spotify.com/v1/me/player/currently-playing',
    {
      headers: { Authorization: `Bearer ${accessToken}` }
    }
  );

  console.log("🎵 Spotify raw response:", playerResponse.data);

  if (!playerResponse.data || !playerResponse.data.item) {
    return null;
  }

  const track = playerResponse.data.item;
  const isPlaying = playerResponse.data.is_playing;
  const progressMs = playerResponse.data.progress_ms;

  // ⚠️ Try audio features separately
  let audioPhysics = null;

  try {
    const featuresResponse = await axios.get(
      `https://api.spotify.com/v1/audio-features/${track.id}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
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
      timestamp: Date.now(),
      audioPhysics
    };

  } catch (error) {
    console.error('Error fetching Spotify Data:', error.message);
    return null;
  }

};
