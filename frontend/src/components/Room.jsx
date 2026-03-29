// import React, { useEffect, useState } from "react";
// import { useParams, useLocation } from "react-router-dom"; // ✅ Added useLocation
// import { useDispatch, useSelector } from "react-redux";
// import socket from "../services/socket";
// import { useAuth } from "../hooks/useAuth";
// import { updateVibe, updateProgress, updateMembers } from "../store/vibeSlice";
// import { addMessage } from "../store/chatSlice"; 
// import ActiveListeners from "../components/ActiveListeners"; 
// import VibeChat from "../components/VibeChat"; 

// function Room() {
//   const { roomId } = useParams();
//   const location = useLocation(); // ✅ Grab the location state
//   const isHost = location.state?.isHost || false; // ✅ Check if this user is the Host

//   const dispatch = useDispatch();
//   const { user } = useAuth();
  
//   const [track, setTrack] = useState(null);
//   const progress = useSelector((state) => state.vibe.progress);

//   // ✅ New manual sync function
//   const handleManualSync = () => {
//     if (track) {
//       socket.emit("sync-listener", { 
//         uri: track.uri, 
//         positionMs: track.progressMs 
//       });
//     }
//   };

//   useEffect(() => {
//     console.log("MY USER DATA FROM BACKEND:", user);
//     if (!user || !roomId) return;

//     socket.emit("join-room", { 
//       roomId, 
//       userId: user._id,
//       name: user.displayName,
//       image: user.images && user.images.length > 0 ? user.images[0].url : "" 
//     });
    
//     // ✅ ONLY trigger the Spotify polling loop if they are the Host
//     if (isHost) {
//       socket.emit("start-stream", { roomId, hostId: user._id });
//     }

//     const handleTrackUpdate = (data) => {
//       setTrack(data);
//       if (data.vibeMap) dispatch(updateVibe(data.vibeMap));
//     };

//     socket.on("track-update", handleTrackUpdate);
//     socket.on("room-users-update", (members) => dispatch(updateMembers(members)));
//     socket.on("chat-message", (msg) => dispatch(addMessage(msg)));

//     return () => {
//       socket.off("track-update", handleTrackUpdate);
//       socket.off("room-users-update");
//       socket.off("chat-message");
//     };
//   }, [roomId, user, dispatch, isHost]);

//   useEffect(() => {
//     if (track) {
//       const currentProgress = (track.progressMs / track.duration_ms) * 100;
//       dispatch(updateProgress(currentProgress));
//     }
//   }, [track, dispatch]);

//   return (
//     <div className="w-full h-full flex flex-row items-center justify-center gap-10">
      
//       <ActiveListeners />

//       <div className="relative z-20 bg-white/5 backdrop-blur-2xl p-8 rounded-[32px] border border-white/10 w-[320px] text-center shadow-2xl">
//         {!track ? (
//           <p className="text-white/60 text-sm">Waiting for Vibe...</p>
//         ) : (
//           <div>
//             <p className="text-white/30 text-[9px] tracking-widest mb-4 uppercase">Room: {roomId}</p>
//             <img src={track.albumArt} className="rounded-2xl shadow-xl mb-5 w-full aspect-square object-cover" alt="art" />
//             <h2 className="text-lg font-bold text-white mb-1 truncate">{track.title}</h2>
//             <p className="text-white/50 text-sm mb-6 truncate">{track.artist}</p>
//             <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
//               <div className="h-full bg-white transition-all duration-1000" style={{ width: `${progress}%` }} />
//             </div>

//             {/* ✅ ONLY render the Sync button for Listeners, NOT the Host */}
//             {!isHost && (
//               <button 
//                 onClick={handleManualSync}
//                 className="mt-6 w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs tracking-widest uppercase transition-all shadow-lg active:scale-95"
//               >
//                 Sync to Host
//               </button>
//             )}

//           </div>
//         )}
//       </div>

//       <VibeChat roomId={roomId} />

//     </div>
//   );
// }

// export default Room;
import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import socket from "../services/socket";
import { useAuth } from "../hooks/useAuth";
import { updateVibe, updateProgress, updateMembers } from "../store/vibeSlice";
import { addMessage } from "../store/chatSlice"; 
import ActiveListeners from "../components/ActiveListeners"; 
import VibeChat from "../components/VibeChat"; 

function Room() {
  const { roomId } = useParams();
  const location = useLocation(); 
  const isHost = location.state?.isHost || false; 

  const dispatch = useDispatch();
  const { user } = useAuth();
  
  const [track, setTrack] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const progress = useSelector((state) => state.vibe.progress);

  // ✅ SIMPLE SYNC DISPATCH
  const handleManualSync = () => {
    if (!track) return;
    setIsSyncing(true); 

    socket.emit("sync-listener", { 
      uri: track.uri, 
      positionMs: track.progressMs
    });

    // Reset button visually after 1 second
    setTimeout(() => setIsSyncing(false), 1000);
  };

  useEffect(() => {
    if (!user || !roomId) return;

    socket.emit("join-room", { 
      roomId, 
      userId: user._id,
      name: user.displayName,
      image: user.images && user.images.length > 0 ? user.images[0].url : "",
      isHost // ✅ ADD THIS ONE LINE!
    });
    
    if (isHost) {
      socket.emit("start-stream", { roomId, hostId: user._id });
    }

    const handleTrackUpdate = (data) => {
      setTrack(data);
      if (data.vibeMap) dispatch(updateVibe(data.vibeMap));
    };

    socket.on("track-update", handleTrackUpdate);
    socket.on("room-users-update", (members) => dispatch(updateMembers(members)));
    socket.on("chat-message", (msg) => dispatch(addMessage(msg)));

    socket.on("error", (err) => {
      console.error("❌ Socket Error:", err.message);
    });

    return () => {
      socket.off("track-update", handleTrackUpdate);
      socket.off("room-users-update");
      socket.off("chat-message");
      socket.off("error");
    };
  }, [roomId, user, dispatch, isHost]);

  useEffect(() => {
    if (track) {
      const currentProgress = (track.progressMs / track.duration_ms) * 100;
      dispatch(updateProgress(currentProgress));
    }
  }, [track, dispatch]);

  return (
    <div className="w-full h-full flex flex-row items-center justify-center gap-10">
      
      <ActiveListeners />

      <div className="relative z-20 bg-white/5 backdrop-blur-2xl p-8 rounded-[32px] border border-white/10 w-[320px] text-center shadow-2xl">
        {!track ? (
          <p className="text-white/60 text-sm">Waiting for Vibe...</p>
        ) : (
          <div>
            <p className="text-white/30 text-[9px] tracking-widest mb-4 uppercase">Room: {roomId}</p>
            <img src={track.albumArt} className="rounded-2xl shadow-xl mb-5 w-full aspect-square object-cover" alt="art" />
            <h2 className="text-lg font-bold text-white mb-1 truncate">{track.title}</h2>
            <p className="text-white/50 text-sm mb-6 truncate">{track.artist}</p>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-white transition-all duration-1000" style={{ width: `${progress}%` }} />
            </div>

            {!isHost && (
              <button 
                onClick={handleManualSync}
                disabled={isSyncing}
                className="mt-6 w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-50 border border-white/10 text-white text-xs tracking-widest uppercase transition-all shadow-lg active:scale-95"
              >
                {isSyncing ? "Syncing..." : "Sync to Host"}
              </button>
            )}

          </div>
        )}
      </div>

      <VibeChat roomId={roomId} />

    </div>
  );
}

export default Room;