// import React from 'react';

// const QueueCard = ({ rank, track, onUpvote }) => {
//   return (
//     <div className="flex flex-row items-center justify-between p-2.5 bg-white/5 backdrop-blur-md rounded-xl border border-white/5 w-full h-[72px] hover:bg-white/10 transition-all shadow-sm">
      
//       {/* Left Section: Rank, Image, Text */}
//       <div className="flex flex-row items-center gap-2 overflow-hidden w-full">
//         {/* Tiny Rank */}
//         <span className="text-[#facc15] font-black text-sm w-5 text-center shrink-0">
//           {rank}
//         </span>
        
//         {/* Tiny Album Art */}
//         <img 
//           src={track.albumArt || '/default-album.png'} 
//           alt={track.title} 
//           className="w-10 h-10 rounded-md object-cover shadow-sm shrink-0" 
//         />
        
//         {/* Compact Info */}
//         <div className="flex flex-col truncate pr-1 flex-1">
//           <span className="text-white font-bold text-xs truncate leading-tight">
//             {track.title}
//           </span>
//           <span className="text-gray-400 text-[10px] truncate leading-tight mt-0.5">
//             {track.artist}
//           </span>
//         </div>
//       </div>

//       {/* Compact Vote Button */}
//       <button 
//         onClick={() => onUpvote(track.id)}
//         className="flex flex-col items-center justify-center bg-black/40 rounded-lg px-2.5 py-1.5 shrink-0 hover:bg-cyan-500/20 transition-all border border-white/5 active:scale-90 ml-1"
//       >
//         <svg 
//           xmlns="http://www.w3.org/2000/svg" 
//           className="w-3.5 h-3.5 text-[#06b6d4]" 
//           fill="currentColor" 
//           viewBox="0 0 24 24"
//         >
//           <path d="M12 4l8 16H4z" />
//         </svg>
//         <span className="text-[#06b6d4] font-bold text-[10px] mt-0.5 leading-none">
//           {track.votes || 0}
//         </span>
//       </button>

//     </div>
//   );
// };

// export default QueueCard;

import React from 'react';

const QueueCard = ({ rank, track, onUpvote }) => {
  return (
    // Replaced justify-between with a simple flex container to control gaps precisely.
    <div className="flex flex-row items-center p-2.5 bg-white/5 backdrop-blur-md rounded-xl border border-white/5 w-full h-[72px] hover:bg-white/10 transition-all shadow-sm overflow-hidden gap-1.5">
      
      {/* 1. RANK SECTION - Reduced width from w-5 to a tight w-3.5 */}
      <span className="text-[#dddddd] font-black text-sm w-3.5 text-center shrink-0 tracking-tighter">
        {rank}
      </span>
      
      {/* 2. SONG REAL ESTATE SECTION - Expanded Gap between art and text a bit */}
      <div className="flex flex-row items-center gap-2.5 overflow-hidden flex-grow pr-1">
        {/* Album Art */}
        <img 
          src={track.albumArt || '/default-album.png'} 
          alt={track.title} 
          className="w-10 h-10 rounded-md object-cover shadow-sm shrink-0" 
        />
        
        {/* Track/Artist Text - Now has significantly more space to truncate neatly */}
        <div className="flex flex-col truncate flex-grow">
          <span className="text-white font-bold text-xs truncate leading-tight">
            {track.title}
          </span>
          <span className="text-gray-400 text-[10px] truncate leading-tight mt-0.5 font-medium">
            {track.artist}
          </span>
        </div>
      </div>

      {/* 3. VOTE SECTION - Significantly tightened horizontal padding (px-2.5 -> px-1.5) */}
      <button 
        onClick={() => onUpvote(track.id)}
        className="flex flex-col items-center justify-center bg-black/40 rounded-lg px-1.5 py-1.5 shrink-0 hover:bg-cyan-500/20 transition-all border border-white/5 active:scale-90"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-3.5 h-3.5 text-[#06b6d4]" 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M12 4l8 16H4z" />
        </svg>
        <span className="text-[#06b6d4] font-bold text-[10px] mt-0.5 leading-none">
          {track.votes || 0}
        </span>
      </button>

    </div>
  );
};

export default QueueCard;