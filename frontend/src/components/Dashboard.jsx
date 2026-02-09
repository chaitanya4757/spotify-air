import { useState } from "react";
import api from "../services/api";
import Room from "./Room";

function Dashboard() {
  const [room, setRoom] = useState(null);

  const createRoom = async () => {
    try {
      const res = await api.post("/api/rooms/create");
      setRoom(res.data);
    } catch (err) {
      console.error("Room creation failed", err);
    }
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      {!room ? (
        <button onClick={createRoom}>
          Create Vibe Room
        </button>
      ) : (
        <Room roomId={room.roomId} />
      )}
    </div>
  );
}

export default Dashboard;
