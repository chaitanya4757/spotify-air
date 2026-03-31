import React from 'react';

const QueueCard = ({ rank, track, onToggleVote, currentUserId }) => {
  const hasVoted = track.voters?.includes(currentUserId);

  return (
    <div className="flex flex-row items-center p-2.5 bg-white/5 backdrop-blur-md rounded-xl border border-white/5 w-full h-[72px] hover:bg-white/10 transition-all shadow-sm overflow-hidden gap-1.5">
      
      <span className="text-[#facc15] font-black text-sm w-3.5 text-center shrink-0 tracking-tighter">
        {rank}
      </span>
      
      <div className="flex flex-row items-center gap-2.5 overflow-hidden flex-grow pr-1">
        <img 
          src={track.albumArt || '/default-album.png'} 
          alt={track.title} 
          className="w-10 h-10 rounded-md object-cover shadow-sm shrink-0" 
        />
        
        <div className="flex flex-col truncate flex-grow">
          <span className="text-white font-bold text-xs truncate leading-tight">
            {track.title}
          </span>
          <span className="text-gray-400 text-[10px] truncate leading-tight mt-0.5 font-medium">
            {track.artist}
          </span>
        </div>
      </div>

      {/* ✅ VOTE BUTTON - Re-enabled clicks and updated hover styles for toggling */}
      <button 
        onClick={() => onToggleVote(track.id)}
        className={`flex flex-col items-center justify-center rounded-lg px-1.5 py-1.5 shrink-0 transition-all border cursor-pointer active:scale-90
          ${hasVoted 
            ? 'bg-cyan-500/20 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)] hover:bg-cyan-500/10 hover:border-cyan-500/30' // Can unvote
            : 'bg-black/40 border-white/5 hover:bg-cyan-500/20' // Can upvote
          }`}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`w-3.5 h-3.5 ${hasVoted ? 'text-cyan-400 drop-shadow-md' : 'text-[#06b6d4]'}`} 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M12 4l8 16H4z" />
        </svg>
        <span className={`${hasVoted ? 'text-cyan-300' : 'text-[#06b6d4]'} font-bold text-[10px] mt-0.5 leading-none`}>
          {track.votes || 0}
        </span>
      </button>

    </div>
  );
};

export default QueueCard;