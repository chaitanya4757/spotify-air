import React, { useEffect, useState } from "react";
import socket from "../services/socket";
import { useAuth } from "../hooks/useAuth";

function Room({ roomId, onVibeChange, onProgressChange }) {
  const { user } = useAuth();
  const [track, setTrack] = useState(null);

  useEffect(() => {
    if (!user) return;

    socket.emit("join-room", { roomId, userId: user._id });
    socket.emit("start-stream", { roomId, hostId: user._id });

    const handleTrackUpdate = (data) => {
      setTrack(data);
      if (data.vibeMap && onVibeChange) onVibeChange(data.vibeMap);
    };

    socket.on("track-update", handleTrackUpdate);

    return () => {
      socket.off("track-update", handleTrackUpdate);
    };
  }, [roomId, user, onVibeChange]);

  useEffect(() => {
    if (track && onProgressChange) {
      const currentProgress = (track.progressMs / track.duration_ms) * 100;
      onProgressChange(currentProgress);
    }
  }, [track, onProgressChange]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      
      {/* RESIZED PANEL: 
        Width reduced to 320px (from 380px)
        Padding reduced to p-8 (from p-10)
      */}
      <div className="relative z-20 bg-white/5 backdrop-blur-2xl p-8 rounded-[32px] border border-white/10 w-[320px] text-center shadow-2xl">
        {!track ? (
          <p className="text-white/60 text-sm">Waiting for Vibe...</p>
        ) : (
          <div>
            {/* Reduced margins for more whitespace elsewhere */}
            <p className="text-white/30 text-[9px] tracking-widest mb-4 uppercase">Room: {roomId}</p>
            
            <img 
              src={track.albumArt} 
              className="rounded-2xl shadow-xl mb-5 w-full aspect-square object-cover" 
              alt="art" 
            />
            
            {/* Reduced font sizes to fit the smaller container */}
            <h2 className="text-lg font-bold text-white mb-1 truncate">{track.title}</h2>
            <p className="text-white/50 text-sm mb-6 truncate">{track.artist}</p>
            
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-1000" 
                style={{ width: `${(track.progressMs / track.duration_ms) * 100}%` }} 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Room;