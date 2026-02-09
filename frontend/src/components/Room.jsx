import { useEffect, useState } from "react";
import socket from "../services/socket";
import { useAuth } from "../hooks/useAuth";

function Room({ roomId }) {
  const { user } = useAuth();   // 🔥 get real authenticated user
  const [track, setTrack] = useState(null);

  useEffect(() => {
    if (!roomId || !user) return;

    // Join the room
    socket.emit("join-room", {
      roomId,
      userId: user._id   // ✅ real MongoDB ObjectId
    });

    // Start stream (host only for now)
    socket.emit("start-stream", {
      roomId,
      hostId: user._id   // ✅ real MongoDB ObjectId
    });

    socket.on("track-update", (data) => {
    setTrack(data);
    });


    return () => {
      socket.off("track-update");
    };

  }, [roomId, user]);

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2>Room: {roomId}</h2>

      {track ? (
        <div>
          <p><strong>{track.title}</strong></p>
          <p>{track.artist}</p>
          <p>Tempo: {track.audioPhysics?.tempo}</p>
          <p>Energy: {track.audioPhysics?.energy}</p>
        </div>
      ) : (
        <p>Waiting for track updates...</p>
      )}
    </div>
  );
}

export default Room;
