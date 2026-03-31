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

        if (!global.roomMembers[roomId]) global.roomMembers[roomId] = [];

        const exists = global.roomMembers[roomId].find(m => m.userId === userId);
        if (!exists) {
          global.roomMembers[roomId].push({ 
            userId, name, image, socketId: socket.id, isHost 
          });
        }

        io.to(roomId).emit("room-users-update", global.roomMembers[roomId]);
        
        if (global.roomState[roomId]?.lastTrackData) {
            socket.emit("track-update", global.roomState[roomId].lastTrackData);
        }

        if (global.roomQueues[roomId]) {
            socket.emit("queue_update", global.roomQueues[roomId]);
        }
      } catch (err) {
        console.error("Join Error:", err.message);
      }
    });

    socket.on("chat-message", (msgData) => {
        if (currentRoomId) io.to(currentRoomId).emit("chat-message", msgData);
    });

    socket.on("start-stream", async ({ roomId, hostId }) => {
      if (!global.roomState[roomId]) {
        global.roomState[roomId] = { lastTrackUri: null, vibeMap: null, lastTrackData: null, hostId };
      }
      if (global.roomTimers[roomId]) return;

      global.roomTimers[roomId] = setInterval(async () => {
        try {
          const host = await User.findById(hostId).select("+accessToken +refreshToken");
          if (!host) return;

          const data = await getSpotifyPlaybackState(host);
          if (!data) return;

          const state = global.roomState[roomId];

          // ====================================================================
          // 🚀 DEMOCRATIC QUEUE AUTO-PLAY INTERCEPTOR
          // ====================================================================
          // We check if the track changed (naturally finished or skipped) 
          // OR if Spotify paused because the host's playlist ran out.
          const trackChanged = state.lastTrackUri && data.uri !== state.lastTrackUri;
          const playbackStopped = state.lastTrackUri && !data.isPlaying;

          if (trackChanged || playbackStopped) {
            if (global.roomQueues[roomId] && global.roomQueues[roomId].length > 0) {
              console.log(`🎧 Auto-DJ: Intercepting stream to play queued track in ${roomId}`);
              
              // 1. Pop the top voted track from the queue
              const nextTrack = global.roomQueues[roomId].shift(); 
              
              // 2. Broadcast the updated queue to all users immediately (so it vanishes from UI)
              io.to(roomId).emit('queue_update', global.roomQueues[roomId]);

              // 3. Force the Host's Spotify to play this top track!
              await forceSyncPlayback(hostId, nextTrack.uri, 0);

              // 4. Update the server state to expect this new track
              state.lastTrackUri = nextTrack.uri;
              
              try {
                state.vibeMap = await generateVibeMap({ title: nextTrack.title, artist: nextTrack.artist });
              } catch (e) {
                state.vibeMap = null; 
              }

              // Return early to skip standard broadcast. The next 5s poll will catch the officially playing track.
              return; 
            }
          }
          // ====================================================================

          // If no queue override happened, and it's simply paused, we do nothing.
          if (!data.isPlaying) return;

          // Normal track change logic (first song, or no queue exists)
          if (data.uri !== state.lastTrackUri) {
            state.lastTrackUri = data.uri;
            try {
              state.vibeMap = await generateVibeMap({ title: data.title, artist: data.artist });
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
      }, 5000); // 5-second polling interval
    });

    socket.on("sync-listener", async ({ uri, positionMs }) => {
      if (!currentUserId || !currentRoomId) return; 
      let exactPosition = positionMs;
      if (global.roomState[currentRoomId] && global.roomState[currentRoomId].lastTrackData) {
         const lastData = global.roomState[currentRoomId].lastTrackData;
         const timeSinceFetch = Date.now() - lastData.timestamp; 
         exactPosition = lastData.progressMs + timeSinceFetch + 1000;
      }
      await forceSyncPlayback(currentUserId, uri, exactPosition);
    });

    socket.on('suggest_track', ({ roomId, track }) => {
      if (!global.roomQueues[roomId]) global.roomQueues[roomId] = [];

      if (global.roomQueues[roomId].length >= 8) {
        socket.emit("error", { message: "The queue is full! Upvote a song instead." });
        return;
      }

      const trackExists = global.roomQueues[roomId].find(t => t.id === track.id);
      
      if (!trackExists) {
        const newTrack = { ...track, votes: 1, voters: [currentUserId] };
        global.roomQueues[roomId].push(newTrack);
        global.roomQueues[roomId].sort((a, b) => b.votes - a.votes);
        io.to(roomId).emit('queue_update', global.roomQueues[roomId]);
      }
    });

    socket.on('toggle_vote', ({ roomId, trackId }) => {
      if (global.roomQueues[roomId]) {
        const trackIndex = global.roomQueues[roomId].findIndex(t => t.id === trackId);
        
        if (trackIndex !== -1) {
          const track = global.roomQueues[roomId][trackIndex];
          const hasVoted = track.voters.includes(currentUserId);
          
          if (hasVoted) {
            track.votes -= 1;
            track.voters = track.voters.filter(id => id !== currentUserId);
            
            if (track.votes <= 0) {
              global.roomQueues[roomId].splice(trackIndex, 1);
            }
          } else {
            track.votes += 1;
            track.voters.push(currentUserId);
          }
          
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