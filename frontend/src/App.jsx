// import React, { useState } from "react";
// import Layout from "./components/Layout";
// import { useAuth } from "./hooks/useAuth";
// import Dashboard from "./components/Dashboard";
// import NeonFlowCanvas from "./components/NeonFlowCanvas";

// function App() {
//   const { user, login, logout, loading } = useAuth();
  
//   // ✅ 1. GLOBAL STATE: Only one set of background data
//   const [vibe, setVibe] = useState(null);
//   const [progress, setProgress] = useState(0);

//   if (loading) return <div className="text-white p-10 text-center">Loading...</div>;

//   return (
//     <div className="relative min-h-screen w-full bg-[#030712] overflow-hidden">
      
//       {/* ✅ 2. GLOBAL BACKGROUND: Sits behind everything */}
//       <div className="fixed inset-0 z-0 pointer-events-none">
//         <NeonFlowCanvas vibeData={vibe} progress={progress} />
//       </div>

//       <div className="relative z-10">
//         <Layout>
//           {!user ? (
//             <div className="flex flex-col items-center justify-center h-[60vh]">
//                <button
//                  onClick={login}
//                  className="bg-pink-600 px-10 py-4 rounded-2xl font-bold text-white shadow-lg"
//                >
//                  Login with Spotify
//                </button>
//             </div>
//           ) : (
//             <div className="flex flex-col h-full">
//               <div className="flex justify-between items-center mb-10">
//                 <h2 className="text-3xl font-bold text-white">Welcome {user.displayName}</h2>
//                 <button
//                   onClick={logout}
//                   className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-white/70"
//                 >
//                   Logout
//                 </button>
//               </div>

//               {/* ✅ 3. PASS PROPS: Dashboard needs these to pass to Room */}
//               <Dashboard 
//                 onVibeChange={setVibe} 
//                 onProgressChange={setProgress} 
//               />
//             </div>
//           )}
//         </Layout>
//       </div>
//     </div>
//   );
// }

// export default App;


import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Layout from "./components/Layout";
import { useAuth } from "./hooks/useAuth";
import Dashboard from "./components/Dashboard";
import Room from "./components/Room";
import NeonFlowCanvas from "./components/NeonFlowCanvas";

function App() {
  const { user, login, logout, loading } = useAuth();
  
  // ✅ Pulling global state from Redux
  const vibe = useSelector((state) => state.vibe.vibeData);
  const progress = useSelector((state) => state.vibe.progress);

  if (loading) return <div className="text-white p-10 text-center font-medium tracking-widest">LOADING AIR...</div>;

  return (
    <Router>
      <div className="relative min-h-screen w-full bg-[#030712] overflow-hidden">
        
        {/* GLOBAL BACKGROUND: Reactive to Redux Vibe */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <NeonFlowCanvas />
        </div>

        <div className="relative z-10">
          <Layout>
            {!user ? (
              <div className="flex flex-col items-center justify-center h-[60vh]">
                <button
                  onClick={login}
                  className="bg-pink-600 hover:bg-pink-700 transition-colors px-10 py-4 rounded-2xl font-bold text-white shadow-lg"
                >
                  Login with Spotify
                </button>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                {/* Header Section */}
                <div className="flex justify-between items-center mb-10 px-4">
                  <h2 className="text-3xl font-bold text-white tracking-tight">Welcome {user.displayName}</h2>
                  <button
                    onClick={logout}
                    className="bg-white/5 border border-white/10 hover:bg-white/10 px-4 py-2 rounded-xl text-white/70 transition-all text-sm"
                  >
                    Logout
                  </button>
                </div>

                {/* ✅ ROUTING SECTION: Handles Dashboard vs Room */}
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/room/:roomId" element={<Room />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </div>
            )}
          </Layout>
        </div>
      </div>
    </Router>
  );
}

export default App;