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
      // ✅ 5. UPDATE BACKGROUND: Send data back up to App.jsx
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
      <div className="relative z-20 bg-white/5 backdrop-blur-xl p-10 rounded-[32px] border border-white/10 w-[380px] text-center shadow-2xl">
        {!track ? (
          <p className="text-white/60">Waiting for Vibe...</p>
        ) : (
          <div>
            <img src={track.albumArt} className="rounded-2xl shadow-xl mb-6 w-full" alt="art" />
            <h2 className="text-xl font-bold text-white mb-2">{track.title}</h2>
            <p className="text-white/60 mb-8">{track.artist}</p>
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