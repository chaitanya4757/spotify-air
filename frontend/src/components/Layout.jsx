import React from 'react';

function Layout({ children }) {
  return (
    <div className="relative min-h-screen w-full flex justify-center items-start pt-12 pb-12 px-6">
      
      <main className="
        relative z-10 w-full max-w-5xl min-h-[85vh] flex flex-col rounded-[45px]
        border border-white/[0.08] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)]
        
        /* THE CRYSTAL FIX */
        bg-white/[0.01]      
        backdrop-blur-[2px] 
      ">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none" />
        <div className="relative z-20 p-12 h-full w-full flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
}

export default Layout;