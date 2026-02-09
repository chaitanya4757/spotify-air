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
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const host = await User.findById(req.session.userId);

    if (!host) {
      return res.status(404).json({ message: "Host not found" });
    }

    const roomId = "AIR-" + Math.random().toString(36).substring(2, 7).toUpperCase();

    const room = await Room.create({
      roomId,
      host: host._id,
      members: [host._id]
    });

    res.status(201).json(room);

  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ message: "Server error" });
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