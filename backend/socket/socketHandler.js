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
//   if (!global.roomMembers) global.roomMembers = {};
//   if (!global.roomQueues) global.roomQueues = {}; 

//   io.on("connection", (socket) => {
//     console.log("🔌 Client Connected:", socket.id);
//     let currentRoomId = null;
//     let currentUserId = null;

//     socket.on("join-room", async ({ roomId, userId, name, image, isHost }) => {
//       try {
//         const room = await Room.findOne({ roomId });
//         if (!room) {
//           socket.emit("error", { message: "Room not found" });
//           return;
//         }

//         socket.join(roomId);
//         currentRoomId = roomId;
//         currentUserId = userId;

//         if (!global.roomMembers[roomId]) {
//           global.roomMembers[roomId] = [];
//         }

//         const exists = global.roomMembers[roomId].find(m => m.userId === userId);
//         if (!exists) {
//           global.roomMembers[roomId].push({ 
//             userId, 
//             name, 
//             image, 
//             socketId: socket.id,
//             isHost 
//           });
//         }

//         io.to(roomId).emit("room-users-update", global.roomMembers[roomId]);
        
//         if (global.roomState[roomId]?.lastTrackData) {
//             socket.emit("track-update", global.roomState[roomId].lastTrackData);
//         }

//         // Send current queue if it exists
//         if (global.roomQueues[roomId]) {
//             socket.emit("queue_update", global.roomQueues[roomId]);
//         }

//         console.log(`👤 User ${name} joined ${roomId}`);
//       } catch (err) {
//         console.error("Join Error:", err.message);
//       }
//     });

//     socket.on("chat-message", (msgData) => {
//         if (currentRoomId) {
//             io.to(currentRoomId).emit("chat-message", msgData);
//         }
//     });

//     socket.on("start-stream", async ({ roomId, hostId }) => {
//       if (!global.roomState[roomId]) {
//         global.roomState[roomId] = {
//           lastTrackUri: null,
//           vibeMap: null,
//           lastTrackData: null,
//           hostId: hostId 
//         };
//       }

//       if (global.roomTimers[roomId]) return;

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
//           state.lastTrackData = updatePayload;

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

//     socket.on("sync-listener", async ({ uri, positionMs }) => {
//       if (!currentUserId || !currentRoomId) return; 
//       let exactPosition = positionMs;
//       if (global.roomState[currentRoomId] && global.roomState[currentRoomId].lastTrackData) {
//          const lastData = global.roomState[currentRoomId].lastTrackData;
//          const timeSinceFetch = Date.now() - lastData.timestamp; 
//          exactPosition = lastData.progressMs + timeSinceFetch + 1000;
//       }
//       const result = await forceSyncPlayback(currentUserId, uri, exactPosition);
//     });

//     // --- DEMOCRATIC QUEUE LOGIC ---
//     socket.on('suggest_track', ({ roomId, track }) => {
//       console.log(`🎵 Suggestion received for room ${roomId}: ${track.title}`);
      
//       if (!global.roomQueues[roomId]) {
//         global.roomQueues[roomId] = [];
//       }

//       const trackExists = global.roomQueues[roomId].find(t => t.id === track.id);
      
//       if (!trackExists) {
//         const newTrack = { ...track, votes: 1 };
//         global.roomQueues[roomId].push(newTrack);
//         global.roomQueues[roomId].sort((a, b) => b.votes - a.votes);
        
//         console.log(`✅ Track added. Queue size: ${global.roomQueues[roomId].length}`);
//         io.to(roomId).emit('queue_update', global.roomQueues[roomId]);
//       }
//     });

//     socket.on('upvote_track', ({ roomId, trackId }) => {
//       if (global.roomQueues[roomId]) {
//         const trackToUpvote = global.roomQueues[roomId].find(t => t.id === trackId);
//         if (trackToUpvote) {
//           trackToUpvote.votes += 1;
//           global.roomQueues[roomId].sort((a, b) => b.votes - a.votes);
//           io.to(roomId).emit('queue_update', global.roomQueues[roomId]);
//         }
//       }
//     });

//     socket.on("disconnect", () => {
//       if (currentRoomId && global.roomMembers[currentRoomId]) {
//         global.roomMembers[currentRoomId] = global.roomMembers[currentRoomId].filter(
//             m => m.socketId !== socket.id
//         );
//         io.to(currentRoomId).emit("room-users-update", global.roomMembers[currentRoomId]);
//         if (global.roomMembers[currentRoomId].length === 0) {
//             clearInterval(global.roomTimers[currentRoomId]);
//             delete global.roomTimers[currentRoomId];
//             delete global.roomState[currentRoomId];
//             delete global.roomMembers[currentRoomId];
//             delete global.roomQueues[currentRoomId];
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

  if (!global.roomState) global.roomState = {};
  if (!global.roomTimers) global.roomTimers = {};
  if (!global.roomMembers) global.roomMembers = {};
  if (!global.roomQueues) global.roomQueues = {}; 

  io.on("connection", (socket) => {
    console.log("🔌 Client Connected:", socket.id);
    let currentRoomId = null;
    let currentUserId = null;

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
            isHost 
          });
        }

        io.to(roomId).emit("room-users-update", global.roomMembers[roomId]);
        
        if (global.roomState[roomId]?.lastTrackData) {
            socket.emit("track-update", global.roomState[roomId].lastTrackData);
        }

        if (global.roomQueues[roomId]) {
            socket.emit("queue_update", global.roomQueues[roomId]);
        }

        console.log(`👤 User ${name} joined ${roomId}`);
      } catch (err) {
        console.error("Join Error:", err.message);
      }
    });

    socket.on("chat-message", (msgData) => {
        if (currentRoomId) {
            io.to(currentRoomId).emit("chat-message", msgData);
        }
    });

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

    socket.on("sync-listener", async ({ uri, positionMs }) => {
      if (!currentUserId || !currentRoomId) return; 
      let exactPosition = positionMs;
      if (global.roomState[currentRoomId] && global.roomState[currentRoomId].lastTrackData) {
         const lastData = global.roomState[currentRoomId].lastTrackData;
         const timeSinceFetch = Date.now() - lastData.timestamp; 
         exactPosition = lastData.progressMs + timeSinceFetch + 1000;
      }
      const result = await forceSyncPlayback(currentUserId, uri, exactPosition);
    });

    // --- DEMOCRATIC QUEUE LOGIC ---
    socket.on('suggest_track', ({ roomId, track }) => {
      if (!global.roomQueues[roomId]) {
        global.roomQueues[roomId] = [];
      }

      // ✅ FIX 2: Check for 8-track limit before adding
      if (global.roomQueues[roomId].length >= 8) {
        socket.emit("error", { message: "The queue is full! Upvote a song instead." });
        return;
      }

      const trackExists = global.roomQueues[roomId].find(t => t.id === track.id);
      
      if (!trackExists) {
        const newTrack = { ...track, votes: 1 };
        global.roomQueues[roomId].push(newTrack);
        global.roomQueues[roomId].sort((a, b) => b.votes - a.votes);
        io.to(roomId).emit('queue_update', global.roomQueues[roomId]);
      }
    });

    socket.on('upvote_track', ({ roomId, trackId }) => {
      if (global.roomQueues[roomId]) {
        const trackToUpvote = global.roomQueues[roomId].find(t => t.id === trackId);
        if (trackToUpvote) {
          trackToUpvote.votes += 1;
          global.roomQueues[roomId].sort((a, b) => b.votes - a.votes);
          io.to(roomId).emit('queue_update', global.roomQueues[roomId]);
        }
      }
    });

    socket.on("disconnect", () => {
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
            delete global.roomQueues[currentRoomId];
        }
      }
    });
  });

  return io;
};