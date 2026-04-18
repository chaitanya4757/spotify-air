import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom"; 
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
  const navigate = useNavigate(); 
  
  const [isHostLocal, setIsHostLocal] = useState(location.state?.isHost || false); 
  const [hostWarning, setHostWarning] = useState(false);

  const dispatch = useDispatch();
  const { user } = useAuth();
  
  const [track, setTrack] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const progress = useSelector((state) => state.vibe.progress);

  const handleLeaveRoom = () => {
    socket.emit("leave-room"); 
    navigate("/"); 
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
      image: user.images?.[0]?.url || "", isHost: isHostLocal 
    });
    
    if (isHostLocal) socket.emit("start-stream", { roomId, hostId: user._id });

    socket.on("host-restored", () => {
        setIsHostLocal(true); 
        setHostWarning(false);
        socket.emit("start-stream", { roomId, hostId: user._id }); 
    });

    socket.on("host-left", () => {
        setHostWarning(true); 
    });

    socket.on("track-update", (data) => {
      setTrack((prevTrack) => {
        if (!isHostLocal && (!prevTrack || prevTrack.uri !== data.uri)) {
          console.log("🎧 New song detected! Auto-syncing Spotify in the background...");
          socket.emit("sync-listener", { uri: data.uri, positionMs: data.progressMs });
        }
        return data; 
      });

      if (data.vibeMap) dispatch(updateVibe(data.vibeMap));
    });
    
    socket.on("room-users-update", (m) => dispatch(updateMembers(m)));
    socket.on("chat-message", (m) => dispatch(addMessage(m)));

    return () => {
      socket.off("track-update");
      socket.off("room-users-update");
      socket.off("chat-message");
      socket.off("host-restored");
      socket.off("host-left");
    };
  }, [roomId, user, dispatch, navigate, isHostLocal]);

  useEffect(() => {
    if (track) dispatch(updateProgress((track.progressMs / track.duration_ms) * 100));
  }, [track, dispatch]);

  return (
    <div className="relative flex flex-col items-center justify-start w-full gap-6 scale-[0.85] origin-top -mb-10 -mt-8">
      
      {hostWarning && (
        <div className="absolute top-2 z-50 flex items-center gap-3 px-6 py-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400 text-[11px] font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(245,158,11,0.15)] backdrop-blur-xl transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>The Host disconnected! Queue is paused until they return.</span>
          <button 
            onClick={() => setHostWarning(false)} 
            className="ml-4 hover:text-amber-100 transition-colors p-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* TOP HEADER */}
      <div className="flex justify-between items-center w-[1120px] px-6 mt-6">
        <h1 className="text-white text-3xl font-black tracking-tighter">Spotify Air</h1>
        <button onClick={handleLeaveRoom} className="px-6 py-2.5 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/50 rounded-xl text-white/80 hover:text-red-400 text-xs font-bold tracking-widest uppercase transition-all shadow-lg backdrop-blur-md active:scale-95">
          Leave Room
        </button>
      </div>

      <div className="flex flex-row items-center justify-center gap-10 w-full">
        <ActiveListeners />
        
        {/* ✅ PLAYER CARD: Tweaked to bg-black/30 */}
        <div className={`relative z-20 bg-black/30 backdrop-blur-2xl rounded-[32px] border border-white/10 w-[320px] text-center shadow-2xl shrink-0 ${isHostLocal ? 'px-8 py-10' : 'p-6'}`}>
          <p className={`text-white/30 text-[9px] tracking-widest uppercase ${isHostLocal ? 'mb-4' : 'mb-3'}`}>Room: {roomId}</p>

          {!track ? (
            <div className={`flex flex-col items-center justify-center ${isHostLocal ? 'py-20' : 'py-16'}`}>
              <p className="text-white/60 text-sm animate-pulse">Waiting for Vibe...</p>
            </div>
          ) : (
            <div>
              <img src={track.albumArt} className={`rounded-2xl shadow-xl w-full aspect-square object-cover ${isHostLocal ? 'mb-6' : 'mb-3'}`} alt="art" />
              <h2 className={`text-lg font-bold text-white truncate ${isHostLocal ? 'mb-1' : 'mb-0.5'}`}>{track.title}</h2>
              <p className={`text-white/50 text-[13px] truncate ${isHostLocal ? 'mb-6' : 'mb-4'}`}>{track.artist}</p>
              
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-white transition-all duration-1000" style={{ width: `${progress}%` }} />
              </div>
              
              {!isHostLocal && (
                <button onClick={handleManualSync} disabled={isSyncing} className="mt-4 w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold tracking-widest uppercase transition-all shadow-lg active:scale-95 border border-white/10">
                  {isSyncing ? "Syncing..." : "Sync to Host"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* CHAT BOX */}
        <VibeChat roomId={roomId} />
      </div>

      <div className="flex flex-row items-stretch justify-center gap-6 w-[1120px] h-[300px]">
        {/* ✅ SEARCH BOX: Tweaked to bg-black/30 */}
        <div className="w-[280px] shrink-0 bg-black/30 backdrop-blur-2xl p-5 rounded-[32px] border border-white/10 shadow-2xl flex flex-col overflow-hidden">
          <SpotifySearch roomId={roomId} />
        </div>
        
        {/* ✅ QUEUE BOX: Tweaked to bg-black/30 */}
        <div className="flex-1 bg-black/30 backdrop-blur-2xl p-6 rounded-[32px] border border-white/10 shadow-2xl flex flex-col overflow-hidden">
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