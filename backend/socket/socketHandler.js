const socketIo = require("socket.io");
const { getSpotifyPlaybackState, forceSyncPlayback, searchSpotifyTracks } = require("../utils/spotifyService");
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

    socket.on("check-room", async (roomId) => {
      try {
        const room = await Room.findOne({ roomId });
        if (room) {
          socket.emit("room-valid", roomId);
        } else {
          socket.emit("room-invalid");
        }
      } catch (err) {
        console.error("Check Room Error:", err.message);
      }
    });

    socket.on("join-room", async ({ roomId, userId, name, image, isHost }) => {
      try {
        const room = await Room.findOne({ roomId });
        if (!room) return socket.emit("error", { message: "Room not found" });

        socket.join(roomId);
        currentRoomId = roomId;
        currentUserId = userId; 

        // ✅ 1. THE RETURNING KING LOGIC
        let actualIsHost = isHost;
        // If the room has a stream running, and this user's ID matches the host's ID...
        if (global.roomState[roomId] && global.roomState[roomId].hostId === userId) {
            actualIsHost = true; // Give them the crown!
            socket.emit("host-restored"); // Tell their frontend to update the UI
        }

        if (!global.roomMembers[roomId]) global.roomMembers[roomId] = [];

        const existingMember = global.roomMembers[roomId].find(m => m.userId === userId);
        if (!existingMember) {
          global.roomMembers[roomId].push({ userId, name, image, socketId: socket.id, isHost: actualIsHost });
        } else {
          // If they refreshed, update their new socket ID and Host status
          existingMember.socketId = socket.id;
          existingMember.isHost = actualIsHost;
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
          const state = global.roomState[roomId];

          // ====================================================================
          // 🚀 HYBRID AUTO-DJ (The "Fix")
          // ====================================================================
          const trackChanged = state.lastTrackUri && data?.uri && data.uri !== state.lastTrackUri;
          
          let playbackStopped = false;
          let isManualPause = false;

          // ✅ NEW: Check if the song was already paused during the LAST server tick
          const wasPaused = state.lastTrackData && state.lastTrackData.isPlaying === false;

          if (state.lastTrackUri && (!data || !data.isPlaying)) {
              if (!data) {
                  // ✅ THE BUG FIX: If it was already paused, and now data is missing, 
                  // Spotify just went to sleep. Let it sleep!
                  if (wasPaused) {
                      isManualPause = true;
                      console.log(`💤 Spotify device went to sleep while paused. Keeping it paused.`);
                  } else {
                      // If it vanished while actively playing, it probably hit the end of the queue.
                      playbackStopped = true;
                  }
              } else {
                  // Check if we are within the 8-second finish line window
                  const timeLeft = data.duration_ms - data.progressMs;
                  
                  if (data.progressMs === 0 || timeLeft <= 8000) {
                      playbackStopped = true; // Natural end
                  } else {
                      isManualPause = true; // Manual pause in middle of song
                  }
              }
          }

          if (!isManualPause) {
              if (trackChanged || playbackStopped) {
                // 1. Check Democratic Queue
                if (global.roomQueues[roomId] && global.roomQueues[roomId].length > 0) {
                  console.log(`🎧 Auto-DJ: Intercepting stream for queued track in ${roomId}`);
                  const nextTrack = global.roomQueues[roomId].shift(); 
                  io.to(roomId).emit('queue_update', global.roomQueues[roomId]);
                  await forceSyncPlayback(hostId, nextTrack.uri, 0);
                  state.lastTrackUri = nextTrack.uri;
                  try {
                    state.vibeMap = await generateVibeMap({ title: nextTrack.title, artist: nextTrack.artist });
                  } catch (e) { state.vibeMap = null; }
                  return; 
                }
                
                // 2. Fallback to Artist Roulette
                else if (playbackStopped && state.lastTrackData?.artist) {
                    console.log(`🎰 Auto-DJ: Silence detected. Spinning Artist Roulette for: ${state.lastTrackData.artist}...`);
                    const primaryArtist = state.lastTrackData.artist.split(',')[0]; 
                    const searchResults = await searchSpotifyTracks(host, primaryArtist);
                    
                    if (searchResults && searchResults.length > 0) {
                        const availableTracks = searchResults.filter(t => t.uri !== state.lastTrackUri);
                        if (availableTracks.length > 0) {
                            const rouletteTrack = availableTracks[Math.floor(Math.random() * availableTracks.length)];
                            console.log(`🎰 Roulette landed on -> ${rouletteTrack.title}`);
                            await forceSyncPlayback(hostId, rouletteTrack.uri, 0);
                            state.lastTrackUri = rouletteTrack.uri;
                            try {
                              state.vibeMap = await generateVibeMap({ title: rouletteTrack.title, artist: rouletteTrack.artist });
                            } catch (e) { state.vibeMap = null; }
                            return;
                        }
                    }
                }
              }
          }
          // ====================================================================

          if (data) {
            if (data.uri !== state.lastTrackUri) {
              state.lastTrackUri = data.uri;
              try {
                state.vibeMap = await generateVibeMap({ title: data.title, artist: data.artist });
              } catch (e) { state.vibeMap = null; }
            }
            const updatePayload = { ...data, vibeMap: state.vibeMap };
            state.lastTrackData = updatePayload;
            io.to(roomId).emit("track-update", updatePayload);
          }
        } catch (err) {
          console.error("Auto-DJ Error:", err.message);
        }
      }, 5000); 
    });

    // ✅ Restored sync-listener so Listeners can sync to the Host
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
                    if (track.votes <= 0) global.roomQueues[roomId].splice(trackIndex, 1);
                } else {
                    track.votes += 1;
                    track.voters.push(currentUserId);
                }
                global.roomQueues[roomId].sort((a, b) => b.votes - a.votes);
                io.to(roomId).emit('queue_update', global.roomQueues[roomId]);
            }
        }
    });

    // ✅ NEW EVENT: Handle a voluntary room departure
    socket.on("leave-room", () => {
      if (currentRoomId && global.roomMembers[currentRoomId]) {
        const leavingMember = global.roomMembers[currentRoomId].find(m => m.socketId === socket.id);
        
        // PAUSE THE ROOM IF HOST LEAVES
        if (leavingMember && leavingMember.isHost) {
            console.log(`⏸️ Host left room ${currentRoomId}. Pausing auto-DJ.`);
            clearInterval(global.roomTimers[currentRoomId]);
            delete global.roomTimers[currentRoomId];
            io.to(currentRoomId).emit("host-left"); // Warn the listeners!
        }

        // 1. Remove the specific user from the room's member list
        global.roomMembers[currentRoomId] = global.roomMembers[currentRoomId].filter(m => m.socketId !== socket.id);
        
        // 2. Broadcast the updated list to everyone remaining
        io.to(currentRoomId).emit("room-users-update", global.roomMembers[currentRoomId]);
        
        // 3. Force the socket to actually leave the channel
        socket.leave(currentRoomId);
        
        // 4. Memory Cleanup: If the room is now empty, delete it to save server RAM
        if (global.roomMembers[currentRoomId].length === 0) {
            clearInterval(global.roomTimers[currentRoomId]);
            delete global.roomTimers[currentRoomId];
            delete global.roomState[currentRoomId];
            delete global.roomMembers[currentRoomId];
            delete global.roomQueues[currentRoomId];
        }
        
        // 5. Reset the local variable
        currentRoomId = null;
        console.log(`🏃 Client left room: ${socket.id}`);
      }
    });

    socket.on("disconnect", () => {
        if (currentRoomId && global.roomMembers[currentRoomId]) {
            const leavingMember = global.roomMembers[currentRoomId].find(m => m.socketId === socket.id);
        
            // PAUSE THE ROOM IF HOST DISCONNECTS (Tab close/Refresh)
            if (leavingMember && leavingMember.isHost) {
                console.log(`⏸️ Host disconnected from ${currentRoomId}. Pausing auto-DJ.`);
                clearInterval(global.roomTimers[currentRoomId]);
                delete global.roomTimers[currentRoomId];
                io.to(currentRoomId).emit("host-left");
            }

            global.roomMembers[currentRoomId] = global.roomMembers[currentRoomId].filter(m => m.socketId !== socket.id);
            io.to(currentRoomId).emit("room-users-update", global.roomMembers[currentRoomId]);

            // Memory Cleanup
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