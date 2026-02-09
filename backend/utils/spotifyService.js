const axios = require('axios');
const querystring = require('querystring');
const User = require('../models/User');

const getAuthHeader = () => {
  return {
    headers: {
      Authorization: 'Basic ' + (new Buffer.from(
        process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
      ).toString('base64')),
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };
};

/**
 * 1. REFRESH TOKEN FUNCTION
 * Checks if the user's token is valid. If not, it gets a new one.
 * @param {Object} user - The full MongoDB user object
 * @returns {String} - A valid Access Token
 */

const getValidAccessToken = async (user) => {
  // If token is still fresh, just return it
  if (!user.needsRefresh()) {
    return user.accessToken;
  }

  console.log(`🔄 Refreshing token for ${user.displayName}...`);

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token',
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
 * 2. GET CURRENT TRACK
 * Fetches the currently playing song + Audio Features (Tempo/Energy)
 * @param {Object} user - The host user
 * @returns {Object} - Cleaned data for the frontend
 */

exports.getSpotifyPlaybackState = async (user) => {
  try {
    const accessToken = await getValidAccessToken(user);

    // Call 1: Get Currently Playing Track
    const playerResponse = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!playerResponse.data || !playerResponse.data.item) {
      return null; // Nothing playing
    }

    const track = playerResponse.data.item;
    const isPlaying = playerResponse.data.is_playing;
    const progressMs = playerResponse.data.progress_ms;

    // Call 2: Get Audio Features (Tempo, Energy for the "Visual Engine")
    // We do this in parallel to be fast
    const featuresResponse = await axios.get(`https://api.spotify.com/v1/audio-features/${track.id}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const features = featuresResponse.data;

    return {
      uri: track.uri,
      title: track.name,
      artist: track.artists.map(a => a.name).join(', '),
      albumArt: track.album.images[0]?.url,
      isPlaying: isPlaying,
      progressMs: progressMs,
      timestamp: Date.now(),
      // Visual Engine Data
      audioPhysics: {
        tempo: features.tempo,       // Speed (BPM)
        energy: features.energy,     // Intensity (0.0 - 1.0)
        danceability: features.danceability,
        loudness: features.loudness  // Decibels
      }
    };

  } catch (error) {
    console.error('Error fetching Spotify Data:', error.message);
    return null;
  }
};

