import React from 'react';
import NeonFlowCanvas from './NeonFlowCanvas'; 

function Layout({ children }) {
  const defaultVibe = {
    ai_sentiment: { primary_hex: "#00FFFF", secondary_hex: "#FF00FF" },
    audio_physics: { energy: 0.5, loudness: 0.5 }
  };

  return (
    /* 1. We change items-start to items-center to keep the card centered vertically if desired */
    <div className="relative min-h-screen w-full bg-[#0a0f1c] overflow-hidden flex justify-center items-start pt-10 pb-10 px-6">
      
      {/* BACKGROUND CANVAS LAYER */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <NeonFlowCanvas vibeData={defaultVibe} />
      </div>

      {/* 2. THE STRETCHED CRYSTAL CARD */}
      <main className="
        relative z-10
        w-full max-w-5xl
        /* 👇 INCREASED HEIGHT LOGIC 👇 */
        min-h-[85vh]        /* Card now takes up 85% of the screen height */
        flex flex-col       /* Allows internal elements to stay organized */
        
        rounded-[40px]      /* Softer, more premium corners */
        border border-white/20
        overflow-hidden
        shadow-[0_20px_80px_rgba(0,0,0,0.7)]
      ">
        {/* HIGH-GLOSS SHINE LAYER (NO BLUR) */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none" />
        
        {/* CLEAR CONTENT LAYER */}
        <div className="relative z-20 p-12 h-full w-full">
          {children}
        </div>
      </main>
    </div>
  );
}

export default Layout;