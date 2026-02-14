import { useEffect, useState } from "react";
import socket from "../services/socket";
import { useAuth } from "../hooks/useAuth";

function Room({ roomId }) {
  const { user } = useAuth();
  const [track, setTrack] = useState(null);

  useEffect(() => {
    if (!user) return;

    socket.emit("join-room", { roomId, userId: user._id });
    socket.emit("start-stream", { roomId, hostId: user._id });

    const handleTrackUpdate = (data) => {
      setTrack(data);
    };

    socket.on("track-update", handleTrackUpdate);

    return () => {
      socket.off("track-update", handleTrackUpdate);
    };
  }, [roomId, user]);

  const progress = (track && track.duration_ms) 
    ? (track.progressMs / track.duration_ms) * 100 
    : 0;

  return (
    /* 1. This Wrapper ensures the Card is centered in the Bigger Glass */
    <div style={{ 
      display: "flex",
      justifyContent: "center", // Centers horizontally
      alignItems: "center",     // Centers vertically
      width: "100%",
      height: "100%",           // Takes full height of the bigger glass
      minHeight: "400px"        // Matches the visual weight of your screenshots
    }}>
      
      {/* 2. The Song Card (Smaller Glass) */}
      <div style={{ 
        position: "relative", 
        zIndex: 10,
        background: "rgba(255, 255, 255, 0.08)", 
        backdropFilter: "blur(16px)",           
        padding: "2.5rem",
        borderRadius: "28px",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        boxShadow: "0 15px 35px rgba(0, 0, 0, 0.4)",
        textAlign: "center",
        width: "340px",
      }}>
        
        <p style={{ opacity: 0.5, fontSize: "0.75rem", marginBottom: "1.2rem", letterSpacing: "1px" }}>
          ROOM: {roomId}
        </p>

        {!track ? (
          <p style={{ opacity: 0.8 }}>Waiting for music...</p>
        ) : (
          <div>
            {track.albumArt && (
              <img
                src={track.albumArt}
                alt="album"
                style={{ 
                  width: "100%", 
                  borderRadius: "18px", 
                  marginBottom: "1.5rem",
                  boxShadow: "0 12px 25px rgba(0,0,0,0.5)" 
                }}
              />
            )}
            
            <h2 style={{ margin: "0 0 0.4rem 0", fontSize: "1.4rem", fontWeight: "600" }}>
              {track.title}
            </h2>
            <p style={{ margin: "0", opacity: 0.7, fontSize: "1rem" }}>
              {track.artist}
            </p>

            {/* Progress Bar */}
            <div style={{ 
              width: "100%", 
              height: "4px", 
              background: "rgba(255,255,255,0.1)", 
              borderRadius: "10px",
              marginTop: "2rem",
              overflow: "hidden"
            }}>
              <div style={{ 
                width: `${progress}%`, 
                height: "100%", 
                background: "#fff",
                transition: "width 1s linear"
              }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Room;