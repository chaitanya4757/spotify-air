const Room = require('../models/Room');
const User = require('../models/User');
const { getSpotifyPlaybackState } = require('../utils/spotifyService');    //temperary endpoint

const generateRoomId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'AIR-';
  for (let i = 0; i < 3; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

exports.createRoom = async (req, res) => {
  try {
    const { spotifyId } = req.body; // We assume frontend sends this

    // 1. Find the Host User in DB
    const host = await User.findOne({ spotifyId });
    if (!host) {
      return res.status(404).json({ error: 'User not found. Please login again.' });
    }

    // 2. Generate Unique Room ID
    let roomId = generateRoomId();
    // Simple check to ensure uniqueness (rare collision case)
    let existingRoom = await Room.findOne({ roomId });
    while (existingRoom) {
      roomId = generateRoomId();
      existingRoom = await Room.findOne({ roomId });
    }
    const newRoom = await Room.create({
      roomId,
      host: host._id,
      members: [{
        user: host._id,
        socketId: null, // Socket connects later in Phase 2, Step 6
        joinedAt: Date.now()
      }],
      currentVibe: {
        mood: 'Waiting for Music...',
        colorHex: '#555555' // Neutral Grey
      }
    });

    res.status(201).json({
      success: true,
      roomId: newRoom.roomId,
      message: 'Room created successfully',
      room: newRoom
    });

  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Server Error creating room' });
  }
};

exports.getRoom = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId })
      .populate('host', 'displayName images') // Fill in host details
      .populate('members.user', 'displayName images'); // Fill in member details

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ error: 'Server Error fetching room' });
  }
};

// @desc    Test Spotify Connection (Temporary)
// @route   GET /api/rooms/test-spotify/:userId
exports.testSpotify = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('+accessToken +refreshToken');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const playbackData = await getSpotifyPlaybackState(user);
    
    res.json({
      success: true,
      data: playbackData || "Nothing playing right now."
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};