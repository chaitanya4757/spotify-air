import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
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
  const isHost = location.state?.isHost || false; 

  const dispatch = useDispatch();
  const { user } = useAuth();
  
  const [track, setTrack] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const progress = useSelector((state) => state.vibe.progress);

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
      {/* TOP ROW */}
      <div className="flex flex-row items-center justify-center gap-10 w-full">
        <ActiveListeners />
        <div className="relative z-20 bg-white/5 backdrop-blur-2xl p-8 rounded-[32px] border border-white/10 w-[320px] text-center shadow-2xl shrink-0">
          {!track ? <p className="text-white/60 text-sm">Waiting for Vibe...</p> : (
            <div>
              <p className="text-white/30 text-[9px] tracking-widest mb-4 uppercase">Room: {roomId}</p>
              <img src={track.albumArt} className="rounded-2xl shadow-xl mb-5 w-full aspect-square object-cover" alt="art" />
              <h2 className="text-lg font-bold text-white mb-1 truncate">{track.title}</h2>
              <p className="text-white/50 text-sm mb-6 truncate">{track.artist}</p>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-white transition-all duration-1000" style={{ width: `${progress}%` }} />
              </div>
              {!isHost && (
                <button onClick={handleManualSync} disabled={isSyncing} className="mt-6 w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs tracking-widest uppercase transition-all shadow-lg active:scale-95 border border-white/10">
                  {isSyncing ? "Syncing..." : "Sync to Host"}
                </button>
              )}
            </div>
          )}
        </div>
        <VibeChat roomId={roomId} />
      </div>

      {/* BOTTOM ROW - DIALED BACK TO 1120px */}
      <div className="flex flex-row items-stretch justify-center gap-6 w-[1120px] h-[300px]">
        {/* Search */}
        <div className="w-[280px] shrink-0 bg-white/5 backdrop-blur-2xl p-5 rounded-[32px] border border-white/10 shadow-2xl flex flex-col overflow-hidden">
          <SpotifySearch roomId={roomId} />
        </div>

        {/* Queue */}
        <div className="flex-1 bg-white/5 backdrop-blur-2xl p-6 rounded-[32px] border border-white/10 shadow-2xl flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="text-white/80 font-bold uppercase tracking-widest text-xs">Song Queue</h3>
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