const socketIo = require('socket.io');
const { getSpotifyPlaybackState } = require('../utils/spotifyService');
const User = require('../models/User');
const Room = require('../models/Room');

module.exports = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173", // Your Vite Frontend
      methods: ["GET", "POST"]
    }
  });
  
  io.on('connection', (socket) => {
    console.log('🔌 New Client Connected:', socket.id);

    // EVENT: JOIN ROOM
    socket.on('join-room', async ({ roomId, userId }) => {
      try {
        const room = await Room.findOne({ roomId });
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        socket.join(roomId);
        console.log(`👤 User ${userId} joined room ${roomId}`);

        // Notify others in the room
        socket.to(roomId).emit('user-joined', { userId });
      } catch (error) {
        console.error('Join Error:', error);
      }
    });

    // EVENT: START THE "AIR" STREAM (The Heartbeat)
    // This is triggered by the Host when they enter the room
    socket.on('start-stream', async ({ roomId, hostId }) => {
      console.log(`🚀 Starting stream for room: ${roomId}`);

      // We use a specific interval for this room
      // In a production app, you'd use a robust job queue (like Bull), 
      // but for this project, a setInterval map works fine.
      if (!global.roomTimers) global.roomTimers = {};

      if (global.roomTimers[roomId]) clearInterval(global.roomTimers[roomId]);
      global.roomTimers[roomId] = setInterval(async () => {
        try {
          // 1. Fetch Host User (needed for tokens)
          const host = await User.findById(hostId).select('+accessToken +refreshToken +tokenExpiresIn +tokenUpdatedAt');
          if (!host) return;

          // 2. Get Live Data
          const data = await getSpotifyPlaybackState(host);

          if (data && data.isPlaying) {
             // 3. Broadcast to the Room
             io.to(roomId).emit('track-update', data);
             
             // 4. (Future Phase 4) Here is where we will trigger:
             // io.to(roomId).emit('vibe-update', aiColorData);
          }

        } catch (error) {
          console.error(`Stream Error in ${roomId}:`, error.message);
        }
      }, 1000); // Check every 1 second
    });

    // EVENT: LEAVE ROOM
    socket.on('disconnect', () => {
      console.log('❌ Client Disconnected:', socket.id);
      // Optional: Logic to stop the timer if the host leaves
    });
  });

  return io;
};