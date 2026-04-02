// import React, { useEffect, useState } from "react";
// import { useParams, useLocation } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import socket from "../services/socket";
// import { useAuth } from "../hooks/useAuth";
// import { updateVibe, updateProgress, updateMembers } from "../store/vibeSlice";
// import { addMessage } from "../store/chatSlice"; 
// import ActiveListeners from "../components/ActiveListeners"; 
// import VibeChat from "../components/VibeChat"; 
// import SpotifySearch from "../components/SpotifySearch"; 
// import SongQueue from "../components/SongQueue"; 

// function Room() {
//   const { roomId } = useParams();
//   const location = useLocation(); 
//   const isHost = location.state?.isHost || false; 

//   const dispatch = useDispatch();
//   const { user } = useAuth();
  
//   const [track, setTrack] = useState(null);
//   const [isSyncing, setIsSyncing] = useState(false);
//   const progress = useSelector((state) => state.vibe.progress);

//   const handleManualSync = () => {
//     if (!track) return;
//     setIsSyncing(true); 
//     socket.emit("sync-listener", { uri: track.uri, positionMs: track.progressMs });
//     setTimeout(() => setIsSyncing(false), 1000);
//   };

//   useEffect(() => {
//     if (!user || !roomId) return;
//     socket.emit("join-room", { 
//       roomId, userId: user._id, name: user.displayName, 
//       image: user.images?.[0]?.url || "", isHost 
//     });
//     if (isHost) socket.emit("start-stream", { roomId, hostId: user._id });

//     socket.on("track-update", (data) => {
//       setTrack(data);
//       if (data.vibeMap) dispatch(updateVibe(data.vibeMap));
//     });
//     socket.on("room-users-update", (m) => dispatch(updateMembers(m)));
//     socket.on("chat-message", (m) => dispatch(addMessage(m)));

//     return () => {
//       socket.off("track-update");
//       socket.off("room-users-update");
//       socket.off("chat-message");
//     };
//   }, [roomId, user, dispatch, isHost]);

//   useEffect(() => {
//     if (track) dispatch(updateProgress((track.progressMs / track.duration_ms) * 100));
//   }, [track, dispatch]);

  

//   return (
//     <div className="flex flex-col items-center justify-start w-full gap-6 scale-[0.85] origin-top -mb-10 -mt-8">
//       {/* TOP ROW */}
//       <div className="flex flex-row items-center justify-center gap-10 w-full">
//         <ActiveListeners />
        
//         {/* MAIN PLAYER CARD */}
//         <div className={`relative z-20 bg-white/5 backdrop-blur-2xl rounded-[32px] border border-white/10 w-[320px] text-center shadow-2xl shrink-0 ${isHost ? 'px-8 py-10' : 'p-6'}`}>
          
//           {/* ALWAYS SHOW ROOM ID AT THE TOP */}
//           <p className={`text-white/30 text-[9px] tracking-widest uppercase ${isHost ? 'mb-4' : 'mb-3'}`}>
//             Room: {roomId}
//           </p>

//           {!track ? (
//             // WAITING STATE
//             <div className={`flex flex-col items-center justify-center ${isHost ? 'py-20' : 'py-16'}`}>
//               <p className="text-white/60 text-sm animate-pulse">Waiting for Vibe...</p>
//             </div>
//           ) : (
//             // PLAYING STATE
//             <div>
//               <img src={track.albumArt} className={`rounded-2xl shadow-xl w-full aspect-square object-cover ${isHost ? 'mb-6' : 'mb-3'}`} alt="art" />
              
//               <h2 className={`text-lg font-bold text-white truncate ${isHost ? 'mb-1' : 'mb-0.5'}`}>{track.title}</h2>
//               <p className={`text-white/50 text-[13px] truncate ${isHost ? 'mb-6' : 'mb-4'}`}>{track.artist}</p>
              
//               <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
//                 <div className="h-full bg-white transition-all duration-1000" style={{ width: `${progress}%` }} />
//               </div>
              
//               {!isHost && (
//                 <button onClick={handleManualSync} disabled={isSyncing} className="mt-4 w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold tracking-widest uppercase transition-all shadow-lg active:scale-95 border border-white/10">
//                   {isSyncing ? "Syncing..." : "Sync to Host"}
//                 </button>
//               )}
//             </div>
//           )}
//         </div>

//         <VibeChat roomId={roomId} />
//       </div>

//       {/* BOTTOM ROW - Queue Section */}
//       <div className="flex flex-row items-stretch justify-center gap-6 w-[1120px] h-[300px]">
//         {/* Search */}
//         <div className="w-[280px] shrink-0 bg-white/5 backdrop-blur-2xl p-5 rounded-[32px] border border-white/10 shadow-2xl flex flex-col overflow-hidden">
//           <SpotifySearch roomId={roomId} />
//         </div>

//         {/* Queue */}
//         <div className="flex-1 bg-white/5 backdrop-blur-2xl p-6 rounded-[32px] border border-white/10 shadow-2xl flex flex-col overflow-hidden">
//           <div className="flex justify-between items-center mb-4 px-2">
//             <h3 className="text-white/80 font-bold uppercase tracking-widest text-xs">Democratic Queue</h3>
//             <div className="flex items-center gap-2">
//               <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
//               <span className="text-cyan-400 text-[10px] font-bold tracking-widest">LIVE SYNC</span>
//             </div>
//           </div>
//           <SongQueue roomId={roomId} />
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Room;

import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom"; // ✅ Added useNavigate
import { useDispatch, useSelector } from "react-redux";
import socket from "../services/socket";
import { useAuth } from "../hooks/useAuth";
import { updateVibe, updateProgress, updateMembers } from "../store/vibeSlice";
import { addMessage } from "../store/chatSlice"; 
import ActiveListeners from "../components/ActiveListeners"; 
import VibeChat from "../components/VibeChat"; 
import SpotifySearch from "../components/SpotifySearch"; 
import SongQueue from "../components/SongQueue"; 

function Room() {
  const { roomId } = useParams();
  const location = useLocation(); 
  const navigate = useNavigate(); // ✅ Initialize navigate
  const isHost = location.state?.isHost || false; 

  const dispatch = useDispatch();
  const { user } = useAuth();
  
  const [track, setTrack] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const progress = useSelector((state) => state.vibe.progress);

  // ✅ New function to cleanly leave the room
  const handleLeaveRoom = () => {
    socket.emit("leave-room"); 
    navigate("/"); // Change this to "/dashboard" if your main page route is different!
  };

  const handleManualSync = () => {
    if (!track) return;
    setIsSyncing(true); 
    socket.emit("sync-listener", { uri: track.uri, positionMs: track.progressMs });
    setTimeout(() => setIsSyncing(false), 1000);
  };

  useEffect(() => {
    if (!user || !roomId) return;
    socket.emit("join-room", { 
      roomId, userId: user._id, name: user.displayName, 
      image: user.images?.[0]?.url || "", isHost 
    });
    if (isHost) socket.emit("start-stream", { roomId, hostId: user._id });

    socket.on("track-update", (data) => {
      setTrack(data);
      if (data.vibeMap) dispatch(updateVibe(data.vibeMap));
    });
    socket.on("room-users-update", (m) => dispatch(updateMembers(m)));
    socket.on("chat-message", (m) => dispatch(addMessage(m)));

    return () => {
      socket.off("track-update");
      socket.off("room-users-update");
      socket.off("chat-message");
    };
  }, [roomId, user, dispatch, isHost]);

  useEffect(() => {
    if (track) dispatch(updateProgress((track.progressMs / track.duration_ms) * 100));
  }, [track, dispatch]);

  return (
    <div className="flex flex-col items-center justify-start w-full gap-6 scale-[0.85] origin-top -mb-10 -mt-8">
      
      {/* ✅ NEW TOP HEADER (Spotify Air & Leave Room) */}
      <div className="flex justify-between items-center w-[1120px] px-6 mt-6">
        {/* App Title */}
        <h1 className="text-white text-3xl font-black tracking-tighter">
          Spotify Air
        </h1>
        
        {/* Leave Room Button */}
        <button 
          onClick={handleLeaveRoom}
          className="px-6 py-2.5 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/50 rounded-xl text-white/80 hover:text-red-400 text-xs font-bold tracking-widest uppercase transition-all shadow-lg backdrop-blur-md active:scale-95"
        >
          Leave Room
        </button>
      </div>

      {/* TOP ROW */}
      <div className="flex flex-row items-center justify-center gap-10 w-full">
        <ActiveListeners />
        
        {/* MAIN PLAYER CARD */}
        <div className={`relative z-20 bg-white/5 backdrop-blur-2xl rounded-[32px] border border-white/10 w-[320px] text-center shadow-2xl shrink-0 ${isHost ? 'px-8 py-10' : 'p-6'}`}>
          
          {/* ROOM ID AT THE TOP */}
          <p className={`text-white/30 text-[9px] tracking-widest uppercase ${isHost ? 'mb-4' : 'mb-3'}`}>
            Room: {roomId}
          </p>

          {!track ? (
            // WAITING STATE
            <div className={`flex flex-col items-center justify-center ${isHost ? 'py-20' : 'py-16'}`}>
              <p className="text-white/60 text-sm animate-pulse">Waiting for Vibe...</p>
            </div>
          ) : (
            // PLAYING STATE
            <div>
              <img src={track.albumArt} className={`rounded-2xl shadow-xl w-full aspect-square object-cover ${isHost ? 'mb-6' : 'mb-3'}`} alt="art" />
              
              <h2 className={`text-lg font-bold text-white truncate ${isHost ? 'mb-1' : 'mb-0.5'}`}>{track.title}</h2>
              <p className={`text-white/50 text-[13px] truncate ${isHost ? 'mb-6' : 'mb-4'}`}>{track.artist}</p>
              
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-white transition-all duration-1000" style={{ width: `${progress}%` }} />
              </div>
              
              {!isHost && (
                <button onClick={handleManualSync} disabled={isSyncing} className="mt-4 w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold tracking-widest uppercase transition-all shadow-lg active:scale-95 border border-white/10">
                  {isSyncing ? "Syncing..." : "Sync to Host"}
                </button>
              )}
            </div>
          )}
        </div>

        <VibeChat roomId={roomId} />
      </div>

      {/* BOTTOM ROW - Queue Section */}
      <div className="flex flex-row items-stretch justify-center gap-6 w-[1120px] h-[300px]">
        {/* Search */}
        <div className="w-[280px] shrink-0 bg-white/5 backdrop-blur-2xl p-5 rounded-[32px] border border-white/10 shadow-2xl flex flex-col overflow-hidden">
          <SpotifySearch roomId={roomId} />
        </div>

        {/* Queue */}
        <div className="flex-1 bg-white/5 backdrop-blur-2xl p-6 rounded-[32px] border border-white/10 shadow-2xl flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="text-white/80 font-bold uppercase tracking-widest text-xs">Democratic Queue</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
              <span className="text-cyan-400 text-[10px] font-bold tracking-widest">LIVE SYNC</span>
            </div>
          </div>
          <SongQueue roomId={roomId} />
        </div>
      </div>
    </div>
  );
}

export default Room;