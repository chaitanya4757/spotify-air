import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom"; // ✅ Added useLocation
import Layout from "./components/Layout";
import { useAuth } from "./hooks/useAuth";
import Dashboard from "./components/Dashboard";
import Room from "./components/Room";
import NeonFlowCanvas from "./components/NeonFlowCanvas";

// ✅ 1. Create a tiny Header component that checks the current URL
const AppHeader = ({ user, logout }) => {
  const location = useLocation();
  
  // If the user is inside a room, do NOT render the Welcome text or Logout button!
  if (location.pathname.startsWith("/room")) {
    return null; 
  }

  // Otherwise, render it normally (like on the Dashboard)
  return (
    <div className="flex justify-between items-center mb-10 px-4">
      <h2 className="text-3xl font-bold text-white tracking-tight">Welcome {user.displayName}</h2>
      <button
        onClick={logout}
        className="bg-white/5 border border-white/10 hover:bg-white/10 px-4 py-2 rounded-xl text-white/70 transition-all text-sm"
      >
        Logout
      </button>
    </div>
  );
};

function App() {
  const { user, login, logout, loading } = useAuth();

  if (loading) return <div className="text-white p-10 text-center font-medium tracking-widest">LOADING AIR...</div>;

  return (
    <Router>
      <div className="relative min-h-screen w-full bg-[#030712] overflow-hidden">
        
        {/* GLOBAL BACKGROUND */}
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
                
                {/* ✅ 2. Use the smart Header here! */}
                <AppHeader user={user} logout={logout} />

                {/* ROUTING SECTION */}
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