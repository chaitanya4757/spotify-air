import React, { useState } from "react";
import api from "../services/api";
import Room from "./Room";

function Dashboard({ onVibeChange, onProgressChange }) {
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
    // ✅ 4. PASS PROPS: Handing off the setters to the Room
    return (
      <Room 
        roomId={room.roomId} 
        onVibeChange={onVibeChange} 
        onProgressChange={onProgressChange} 
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center mt-20">
      <button
        onClick={createRoom}
        disabled={loading}
        className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-white font-semibold transition-all"
      >
        {loading ? "Creating..." : "Create Vibe Room"}
      </button>
    </div>
  );
}

export default Dashboard;