// const socketIo = require("socket.io");
// const { getSpotifyPlaybackState, forceSyncPlayback } = require("../utils/spotifyService");
// const { generateVibeMap } = require("../utils/vibeEngine"); 
// const User = require("../models/User");
// const Room = require("../models/Room");


// module.exports = (server) => {
//   const io = socketIo(server, {
//     cors: {
//       origin: process.env.CLIENT_URL || "http://127.0.0.1:5173",
//       methods: ["GET", "POST"],
//       credentials: true
//     }
//   });

//   // Global State Containers
//   if (!global.roomState) global.roomState = {};
//   if (!global.roomTimers) global.roomTimers = {};
//   if (!global.roomMembers) global.roomMembers = {}; // ✅ PHASE 5: THE GUEST LIST

//   io.on("connection", (socket) => {
//     console.log("🔌 Client Connected:", socket.id);
//     let currentRoomId = null;
//     let currentUserId = null;

//     // --- 1. JOIN LOGIC (GREEN ZONE) ---
//     socket.on("join-room", async ({ roomId, userId, name, image }) => {
//       try {
//         const room = await Room.findOne({ roomId });
//         if (!room) {
//           socket.emit("error", { message: "Room not found" });
//           return;
//         }

//         socket.join(roomId);
//         currentRoomId = roomId;
//         currentUserId = userId;

//         // Initialize member list for room if empty
//         if (!global.roomMembers[roomId]) {
//           global.roomMembers[roomId] = [];
//         }

//         // Add user to the list if not already present
//         const exists = global.roomMembers[roomId].find(m => m.userId === userId);
//         if (!exists) {
//           global.roomMembers[roomId].push({ 
//             userId, 
//             name, 
//             image, 
//             socketId: socket.id // Track socket for precise cleanup
//           });
//         }

//         // BROADCAST updated list to everyone in the room
//         io.to(roomId).emit("room-users-update", global.roomMembers[roomId]);
        
//         // If a song is already playing, catch the new user up immediately
//         if (global.roomState[roomId]?.lastTrackData) {
//             socket.emit("track-update", global.roomState[roomId].lastTrackData);
//         }

//         console.log(`👤 User ${name} joined ${roomId}`);
//       } catch (err) {
//         console.error("Join Error:", err.message);
//       }
//     });

//     // --- 2. CHAT LOGIC (RED ZONE) ---
//     socket.on("chat-message", (msgData) => {
//         // Broadcast incoming message to everyone in the room
//         if (currentRoomId) {
//             io.to(currentRoomId).emit("chat-message", msgData);
//         }
//     });

//     // --- 3. STREAMING LOGIC ---
//     socket.on("start-stream", async ({ roomId, hostId }) => {
//       if (!global.roomState[roomId]) {
//         global.roomState[roomId] = {
//           lastTrackUri: null,
//           vibeMap: null,
//           lastTrackData: null,
//           hostId: hostId 
//         };
//       }

//       if (global.roomTimers[roomId]) return; // Avoid duplicate timers

//       global.roomTimers[roomId] = setInterval(async () => {
//         try {
//           const host = await User.findById(hostId).select("+accessToken +refreshToken");
//           if (!host) return;

//           const data = await getSpotifyPlaybackState(host);
//           if (!data || !data.isPlaying) return;

//           const state = global.roomState[roomId];

//           if (data.uri !== state.lastTrackUri) {
//             state.lastTrackUri = data.uri;
//             try {
//               state.vibeMap = await generateVibeMap({
//                 title: data.title,
//                 artist: data.artist
//               });
//             } catch (e) {
//               state.vibeMap = null; 
//             }
//           }

//           const updatePayload = { ...data, vibeMap: state.vibeMap };
//           state.lastTrackData = updatePayload; // Store for late joiners

//           io.to(roomId).emit("track-update", updatePayload);

//         } catch (err) {
//           if (err.message === "429_RATE_LIMIT") {
//              clearInterval(global.roomTimers[roomId]); 
//              delete global.roomTimers[roomId];
//              io.to(roomId).emit("error", { message: "Stream Paused: Rate Limit" });
//           }
//         }
//       }, 5000);
//     });

//     // ✅ FIXED: Manual sync request with Exact Latency Compensation
//     socket.on("sync-listener", async ({ uri, positionMs }) => {
//       if (!currentUserId || !currentRoomId) return; 

//       // 1. Start with the position we got from the frontend
//       let exactPosition = positionMs;

//       // 2. Calculate exactly how many milliseconds have passed since we last asked Spotify for the Host's time
//       if (global.roomState[currentRoomId] && global.roomState[currentRoomId].lastTrackData) {
//          const lastData = global.roomState[currentRoomId].lastTrackData;
//          const timeSinceFetch = Date.now() - lastData.timestamp; 
         
//          // 3. Add that exact time delay to the song position!
//          exactPosition = lastData.progressMs + timeSinceFetch;
         
//          console.log(`⏱️ Latency Compensated: Added ${timeSinceFetch}ms to sync!`);
//       }

//       // 4. Send the perfectly calculated timestamp to the listener's Spotify
//       const result = await forceSyncPlayback(currentUserId, uri, exactPosition);
      
//       if (!result.success && result.message === "NO_DEVICE") {
//         socket.emit("error", { message: "Please open the Spotify app on your phone or PC first!" });
//       }
//     });

//     // --- 4. DISCONNECT (CLEANUP) ---
//     socket.on("disconnect", () => {
//       console.log(`❌ Client Disconnected: ${socket.id}`);
      
//       if (currentRoomId && global.roomMembers[currentRoomId]) {
//         // Remove specifically this socket session from the guest list
//         global.roomMembers[currentRoomId] = global.roomMembers[currentRoomId].filter(
//             m => m.socketId !== socket.id
//         );

//         // Notify others so the avatar disappears
//         io.to(currentRoomId).emit("room-users-update", global.roomMembers[currentRoomId]);

//         // If the room becomes empty, kill the timer to save resources
//         if (global.roomMembers[currentRoomId].length === 0) {
//             clearInterval(global.roomTimers[currentRoomId]);
//             delete global.roomTimers[currentRoomId];
//             delete global.roomState[currentRoomId];
//             delete global.roomMembers[currentRoomId];
//         }
//       }
//     });
//   });

//   return io;
// };
const socketIo = require("socket.io");
const { getSpotifyPlaybackState, forceSyncPlayback } = require("../utils/spotifyService");
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
  if (!global.roomMembers) global.roomMembers = {};

  io.on("connection", (socket) => {
    console.log("🔌 Client Connected:", socket.id);
    let currentRoomId = null;
    let currentUserId = null;

    // --- 1. JOIN LOGIC (GREEN ZONE) ---
    // Inside socketHandler.js
    // ✅ 1. Add isHost to the destructuring here:
    socket.on("join-room", async ({ roomId, userId, name, image, isHost }) => {
      try {
        const room = await Room.findOne({ roomId });
        if (!room) {
          socket.emit("error", { message: "Room not found" });
          return;
        }

        socket.join(roomId);
        currentRoomId = roomId;
        currentUserId = userId;

        if (!global.roomMembers[roomId]) {
          global.roomMembers[roomId] = [];
        }

        const exists = global.roomMembers[roomId].find(m => m.userId === userId);
        if (!exists) {
          global.roomMembers[roomId].push({ 
            userId, 
            name, 
            image, 
            socketId: socket.id,
            isHost // ✅ 2. SAVE IT HERE!
          });
        }

        io.to(roomId).emit("room-users-update", global.roomMembers[roomId]);
        
        if (global.roomState[roomId]?.lastTrackData) {
            socket.emit("track-update", global.roomState[roomId].lastTrackData);
        }

        console.log(`👤 User ${name} joined ${roomId}`);
      } catch (err) {
        console.error("Join Error:", err.message);
      }
    });

    // --- 2. CHAT LOGIC (RED ZONE) ---
    socket.on("chat-message", (msgData) => {
        if (currentRoomId) {
            io.to(currentRoomId).emit("chat-message", msgData);
        }
    });

    // --- 3. STREAMING LOGIC ---
    socket.on("start-stream", async ({ roomId, hostId }) => {
      if (!global.roomState[roomId]) {
        global.roomState[roomId] = {
          lastTrackUri: null,
          vibeMap: null,
          lastTrackData: null,
          hostId: hostId 
        };
      }

      if (global.roomTimers[roomId]) return;

      global.roomTimers[roomId] = setInterval(async () => {
        try {
          const host = await User.findById(hostId).select("+accessToken +refreshToken");
          if (!host) return;

          const data = await getSpotifyPlaybackState(host);
          if (!data || !data.isPlaying) return;

          const state = global.roomState[roomId];

          if (data.uri !== state.lastTrackUri) {
            state.lastTrackUri = data.uri;
            try {
              state.vibeMap = await generateVibeMap({
                title: data.title,
                artist: data.artist
              });
            } catch (e) {
              state.vibeMap = null; 
            }
          }

          const updatePayload = { ...data, vibeMap: state.vibeMap };
          state.lastTrackData = updatePayload;

          io.to(roomId).emit("track-update", updatePayload);

        } catch (err) {
          if (err.message === "429_RATE_LIMIT") {
             clearInterval(global.roomTimers[roomId]); 
             delete global.roomTimers[roomId];
             io.to(roomId).emit("error", { message: "Stream Paused: Rate Limit" });
          }
        }
      }, 5000);
    });

    // ✅ STATIC 1-SECOND SYNC LOGIC
    socket.on("sync-listener", async ({ uri, positionMs }) => {
      if (!currentUserId || !currentRoomId) return; 

      let exactPosition = positionMs;

      if (global.roomState[currentRoomId] && global.roomState[currentRoomId].lastTrackData) {
         const lastData = global.roomState[currentRoomId].lastTrackData;
         
         // Calculate the delay since the server last checked Spotify
         const timeSinceFetch = Date.now() - lastData.timestamp; 
         
         // Add the delay + 1000ms (1 second) to push the song ahead for the listener
         exactPosition = lastData.progressMs + timeSinceFetch + 1000;
         
         console.log(`⏱️ Syncing: Added ${timeSinceFetch}ms drift + 1000ms static boost`);
      }

      const result = await forceSyncPlayback(currentUserId, uri, exactPosition);
      
      if (!result.success && result.message === "NO_DEVICE") {
        socket.emit("error", { message: "Please open the Spotify app on your phone or PC first!" });
      }
    });

    // --- 4. DISCONNECT (CLEANUP) ---
    socket.on("disconnect", () => {
      console.log(`❌ Client Disconnected: ${socket.id}`);
      
      if (currentRoomId && global.roomMembers[currentRoomId]) {
        global.roomMembers[currentRoomId] = global.roomMembers[currentRoomId].filter(
            m => m.socketId !== socket.id
        );

        io.to(currentRoomId).emit("room-users-update", global.roomMembers[currentRoomId]);

        if (global.roomMembers[currentRoomId].length === 0) {
            clearInterval(global.roomTimers[currentRoomId]);
            delete global.roomTimers[currentRoomId];
            delete global.roomState[currentRoomId];
            delete global.roomMembers[currentRoomId];
        }
      }
    });
  });

  return io;
};