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

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api"; 

const Dashboard = () => {
  const [roomInput, setRoomInput] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async () => {
    try {
      setLoading(true);
      const res = await api.post("/api/rooms/create"); 
      // ✅ Pass the secret 'isHost' flag to the Room component
      navigate(`/room/${res.data.roomId}`, { state: { isHost: true } });
    } catch (err) {
      console.error("Room creation failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (roomInput.trim()) {
      // Guests don't get the isHost flag!
      navigate(`/room/${roomInput.trim().toUpperCase()}`);
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

      <form onSubmit={handleJoin} className="flex gap-3">
        <input 
          type="text" 
          placeholder="Enter Room ID (e.g. AIR-JNWKS)"
          value={roomInput}
          onChange={(e) => setRoomInput(e.target.value)}
          className="bg-white/5 border border-white/10 px-6 py-4 rounded-2xl text-white focus:outline-none focus:border-pink-500/50 w-64"
        />
        <button type="submit" className="bg-pink-600 px-6 py-4 rounded-2xl text-white font-bold">
          Join
        </button>
      </form>
    </div>
  );
};

export default Dashboard;