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

  // Store room state globally
  if (!global.roomState) global.roomState = {};
  if (!global.roomTimers) global.roomTimers = {};

  io.on("connection", (socket) => {
    console.log("🔌 Client Connected:", socket.id);

    // ================================
    // JOIN ROOM
    // ================================
    socket.on("join-room", async ({ roomId, userId }) => {
      try {
        const room = await Room.findOne({ roomId });
        if (!room) {
          socket.emit("error", { message: "Room not found" });
          return;
        }

        socket.join(roomId);
        console.log(`👤 User ${userId} joined ${roomId}`);
      } catch (err) {
        console.error("Join Error:", err.message);
      }
    });

    // ================================
    // START STREAM
    // ================================
    socket.on("start-stream", async ({ roomId, hostId }) => {
      console.log(`🚀 Starting stream for ${roomId}`);

      if (!global.roomState[roomId]) {
        global.roomState[roomId] = {
          lastTrackUri: null,
          vibeMap: null
        };
      }

      if (global.roomTimers[roomId]) {
        clearInterval(global.roomTimers[roomId]);
      }

      global.roomTimers[roomId] = setInterval(async () => {
        try {
          const host = await User.findById(hostId)
            .select("+accessToken +refreshToken +tokenExpiresIn +tokenUpdatedAt");

          if (!host) return;

          const data = await getSpotifyPlaybackState(host);

          if (!data || !data.isPlaying) return;

          const state = global.roomState[roomId];

          // ================================
          // GENERATE VIBE MAP ONLY ON TRACK CHANGE
          // ================================
          if (data.uri !== state.lastTrackUri) {
            console.log("🎵 Track changed — generating vibe map...");

            state.lastTrackUri = data.uri;

            try {
              state.vibeMap = await generateVibeMap({
                title: data.title,
                artist: data.artist
              });

              console.log(
                `✅ Vibe map generated: ${
                  state.vibeMap ? state.vibeMap.length : 0
                } segments`
              );
            } catch (e) {
              console.log("❌ Vibe map generation failed");
              state.vibeMap = null;
            }
          }

          // ================================
          // BROADCAST TRACK + VIBE
          // ================================
          io.to(roomId).emit("track-update", {
            ...data,
            vibeMap: state.vibeMap
          });

        } catch (err) {
          console.error(`Stream Error in ${roomId}:`, err.message);
        }
      }, 1000); // Check playback every second
    });

    socket.on("disconnect", () => {
      console.log("❌ Client Disconnected:", socket.id);
    });
  });

  return io;
};
