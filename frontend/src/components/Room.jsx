import { useEffect, useState } from "react";
import socket from "../services/socket";
import { useAuth } from "../hooks/useAuth";

function Room({ roomId }) {
  const { user } = useAuth();
  const [track, setTrack] = useState(null);

  useEffect(() => {
    if (!user) return;

    // Join room
    socket.emit("join-room", {
      roomId,
      userId: user._id
    });

    // Start stream
    socket.emit("start-stream", {
      roomId,
      hostId: user._id
    });

    const handleTrackUpdate = (data) => {
      console.log("🎧 Track update received:", data);
      setTrack(data);
    };

    socket.on("track-update", handleTrackUpdate);

    return () => {
      socket.off("track-update", handleTrackUpdate);
    };
  }, [roomId, user]);

  return (
    <div style={{ marginTop: "2rem" }}>
      <p><strong>Room:</strong> {roomId}</p>

      {!track ? (
        <p>Waiting for track updates...</p>
      ) : (
        <div>
          <h3>{track.title}</h3>
          <p>{track.artist}</p>

          {track.albumArt && (
            <img
              src={track.albumArt}
              alt="album"
              style={{ width: 200, borderRadius: 10 }}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default Room;
