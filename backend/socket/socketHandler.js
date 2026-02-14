const socketIo = require("socket.io");
const { getSpotifyPlaybackState } = require("../utils/spotifyService");
const { generateVibeMap } = require("../utils/vibeEngine"); 
const User = require("../models/User");
const Room = require("../models/Room");

module.exports = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://127.0.0.1:5173",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Global State Containers
  if (!global.roomState) global.roomState = {};
  if (!global.roomTimers) global.roomTimers = {};

  io.on("connection", (socket) => {
    console.log("🔌 Client Connected:", socket.id);

    // 1. TRACK THE ROOM: We need to know which room this socket belongs to
    // so we can clean it up later.
    let currentRoomId = null;

    socket.on("join-room", async ({ roomId, userId }) => {
      try {
        const room = await Room.findOne({ roomId });
        if (!room) {
          socket.emit("error", { message: "Room not found" });
          return;
        }

        socket.join(roomId);
        currentRoomId = roomId; // <--- SAVE THIS REFERENCE
        console.log(`👤 User ${userId} joined ${roomId}`);
      } catch (err) {
        console.error("Join Error:", err.message);
      }
    });

    socket.on("start-stream", async ({ roomId, hostId }) => {
      console.log(`🚀 Starting stream for ${roomId}`);
      currentRoomId = roomId; // Ensure we have the ref

      // Initialize State if missing
      if (!global.roomState[roomId]) {
        global.roomState[roomId] = {
          lastTrackUri: null,
          vibeMap: null,
          hostId: hostId // Track who the host is
        };
      }

      // 2. SAFETY: Always clear the OLD timer before starting a new one
      if (global.roomTimers[roomId]) {
        console.log(`⚠️ Clearing existing timer for ${roomId}`);
        clearInterval(global.roomTimers[roomId]);
      }

      // Start the Loop (5 Seconds)
      global.roomTimers[roomId] = setInterval(async () => {
        try {
          const host = await User.findById(hostId).select("+accessToken +refreshToken");
          if (!host) return;

          const data = await getSpotifyPlaybackState(host);
          
          // If paused or error, do nothing
          if (!data || !data.isPlaying) return;

          const state = global.roomState[roomId];

          // --- VIBE CHECK ---
          // Only trigger Gemini if the song has ACTUALLY changed
          if (data.uri !== state.lastTrackUri) {
            console.log(`🎵 Track Change Detected: ${data.title}`);
            state.lastTrackUri = data.uri;

            try {
              // Call Gemini
              state.vibeMap = await generateVibeMap({
                title: data.title,
                artist: data.artist
              });
            } catch (e) {
              console.log("⚠️ Vibe Gen Failed (using fallback)");
              state.vibeMap = null; 
            }
          }

          io.to(roomId).emit("track-update", {
            ...data,
            vibeMap: state.vibeMap
          });

        } catch (err) {
          // If we hit the rate limit, KILL THE LOOP immediately
          if (err.message === "429_RATE_LIMIT") {
             console.error(`🛑 API LIMIT HIT! Stopping ${roomId}`);
             clearInterval(global.roomTimers[roomId]); 
             delete global.roomTimers[roomId];
             io.to(roomId).emit("error", { message: "Stream Paused: Rate Limit" });
          }
        }
      }, 5000);
    });

    // 3. THE ZOMBIE KILLER: Clean up on Disconnect
    socket.on("disconnect", () => {
      console.log(`❌ Client Disconnected: ${socket.id}`);
      
      // If this socket was streaming in a room, kill the stream to save quota
      if (currentRoomId && global.roomTimers[currentRoomId]) {
        console.log(`🧹 Cleaning up zombie stream for: ${currentRoomId}`);
        clearInterval(global.roomTimers[currentRoomId]);
        delete global.roomTimers[currentRoomId];
        delete global.roomState[currentRoomId];
      }
    });
  });

  return io;
};