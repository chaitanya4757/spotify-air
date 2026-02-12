import { useState } from "react";
import api from "../services/api";
import Room from "./Room";

function Dashboard() {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(false);

  const createRoom = async () => {
    try {
      setLoading(true);
      const res = await api.post("/api/rooms/create");
      setRoom(res.data);
    } catch (err) {
      console.error("Room creation failed", err);
    } finally {
      setLoading(false);
    }
  };

  if (room) {
    return <Room roomId={room.roomId} />;
  }

  return (
    <div className="flex flex-col items-center justify-center mt-20">
      <button
        onClick={createRoom}
        disabled={loading}
        className="
          px-8 py-4
          bg-white/10
          backdrop-blur-xl
          border border-white/20
          rounded-2xl
          text-white
          text-lg
          hover:bg-white/20
          transition-all duration-300
        "
      >
        {loading ? "Creating..." : "Create Vibe Room"}
      </button>
    </div>
  );
}

export default Dashboard;
