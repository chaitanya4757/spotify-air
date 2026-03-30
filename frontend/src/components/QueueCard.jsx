import React from 'react';

const QueueCard = ({ rank, track, onUpvote }) => {
  return (
    <div className="flex items-center justify-between p-3 bg-[#18181b]/80 backdrop-blur-md rounded-2xl border border-white/5 w-full shadow-lg">
      
      {/* Left Section: Rank, Art, Info */}
      <div className="flex items-center gap-4 overflow-hidden">
        {/* Rank Number */}
        <span className="text-[#facc15] font-black text-lg w-5 text-center shrink-0">
          {rank}
        </span>
        
        {/* Album Art */}
        <img 
          src={track.albumArt || '/default-album.png'} 
          alt={track.title} 
          className="w-12 h-12 rounded-lg object-cover shadow-sm shrink-0" 
        />
        
        {/* Track Info */}
        <div className="flex flex-col truncate pr-2">
          <span className="text-white font-bold text-sm truncate">
            {track.title}
          </span>
          <span className="text-gray-400 text-xs truncate">
            {track.artist}
          </span>
        </div>
      </div>

      {/* Right Section: Upvote Button */}
      <button 
        onClick={() => onUpvote(track.id)}
        className="flex flex-col items-center justify-center bg-[#27272a] rounded-xl px-3 py-2 shrink-0 hover:bg-[#3f3f46] transition-colors cursor-pointer"
      >
        {/* Triangle Up Icon */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-4 h-4 text-[#06b6d4]" 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M12 4l8 16H4z" />
        </svg>
        {/* Vote Count */}
        <span className="text-[#06b6d4] font-bold text-xs mt-1">
          {track.votes || 0}
        </span>
      </button>

    </div>
  );
};

export default QueueCard;