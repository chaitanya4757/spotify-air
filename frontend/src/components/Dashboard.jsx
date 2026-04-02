// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../services/api"; // ✅ Brought this back!

// const Dashboard = () => {
//   const [roomInput, setRoomInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleCreate = async () => {
//     try {
//       setLoading(true);
//       // ✅ 1. Actually create the room in MongoDB first!
//       const res = await api.post("/api/rooms/create"); 
//       // ✅ 2. Navigate using the real DB roomId
//       navigate(`/room/${res.data.roomId}`);
//     } catch (err) {
//       console.error("Room creation failed", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleJoin = (e) => {
//     e.preventDefault();
//     if (roomInput.trim()) {
//       // Joining doesn't need an API call here, because Account A already created it in the DB!
//       navigate(`/room/${roomInput.trim().toUpperCase()}`);
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center gap-10 py-10 mt-10">
//       <button 
//         onClick={handleCreate} 
//         disabled={loading}
//         className="bg-white/10 px-8 py-4 rounded-2xl text-white font-bold hover:bg-white/20 transition-all border border-white/20"
//       >
//         {loading ? "Creating..." : "Create New Vibe Room"}
//       </button>

//       <div className="text-white/20 text-xs tracking-widest uppercase">OR</div>

//       <form onSubmit={handleJoin} className="flex gap-3">
//         <input 
//           type="text" 
//           placeholder="Enter Room ID (e.g. AIR-JNWKS)"
//           value={roomInput}
//           onChange={(e) => setRoomInput(e.target.value)}
//           className="bg-white/5 border border-white/10 px-6 py-4 rounded-2xl text-white focus:outline-none focus:border-pink-500/50 w-64"
//         />
//         <button type="submit" className="bg-pink-600 px-6 py-4 rounded-2xl text-white font-bold">
//           Join
//         </button>
//       </form>
//     </div>
//   );
// };

// export default Dashboard;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api"; 
import socket from "../services/socket"; // ✅ 1. We need socket here now!

const Dashboard = () => {
  const [roomInput, setRoomInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // ✅ 2. State for our error message
  const navigate = useNavigate();

  // ✅ 3. Listen for the server's answer before we navigate
  useEffect(() => {
    const handleRoomValid = (validRoomId) => {
      // If the server says it exists, THEN we jump
      navigate(`/room/${validRoomId}`); 
    };

    const handleRoomInvalid = () => {
      // If it doesn't exist, we show the error text
      setError("This vibe room does not exist.");
    };

    socket.on("room-valid", handleRoomValid);
    socket.on("room-invalid", handleRoomInvalid);

    return () => {
      socket.off("room-valid", handleRoomValid);
      socket.off("room-invalid", handleRoomInvalid);
    };
  }, [navigate]);

  const handleCreate = async () => {
    try {
      setLoading(true);
      const res = await api.post("/api/rooms/create"); 
      // Pass the secret 'isHost' flag to the Room component
      navigate(`/room/${res.data.roomId}`, { state: { isHost: true } });
    } catch (err) {
      console.error("Room creation failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = (e) => {
    e.preventDefault();
    setError(""); // Clear any old errors

    const trimmedInput = roomInput.trim().toUpperCase();
    
    if (trimmedInput) {
      // ✅ 4. Instead of navigating, we ask the server to check the DB
      socket.emit("check-room", trimmedInput);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-10 py-10 mt-10">
      <button 
        onClick={handleCreate} 
        disabled={loading}
        className="bg-white/10 px-8 py-4 rounded-2xl text-white font-bold hover:bg-white/20 transition-all border border-white/20"
      >
        {loading ? "Creating..." : "Create New Vibe Room"}
      </button>

      <div className="text-white/20 text-xs tracking-widest uppercase">OR</div>

      {/* ✅ 5. Wrapped form and error message in a flex column */}
      <div className="flex flex-col items-center gap-2">
        <form onSubmit={handleJoin} className="flex gap-3">
          <input 
            type="text" 
            placeholder="Enter Room ID (e.g. AIR-JNWKS)"
            value={roomInput}
            onChange={(e) => {
              setRoomInput(e.target.value);
              setError(""); // Clear error when they start typing a new ID
            }}
            className="bg-white/5 border border-white/10 px-6 py-4 rounded-2xl text-white focus:outline-none focus:border-pink-500/50 w-64"
          />
          <button type="submit" className="bg-pink-600 px-6 py-4 rounded-2xl text-white font-bold">
            Join
          </button>
        </form>

        {/* ✅ 6. Sleek, theme-matching error pill */}
        {error && (
          <div className="flex items-center gap-2 mt-2 px-4 py-2 bg-pink-500/10 border border-pink-500/20 rounded-xl text-pink-300 text-[11px] font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(236,72,153,0.1)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;