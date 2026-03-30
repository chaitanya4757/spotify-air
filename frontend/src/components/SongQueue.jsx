// import React from 'react';
// import QueueCard from './QueueCard'; // Make sure you have this file saved too!

// const SongQueue = ({ roomId }) => {
//   // Placeholder data so you can see the grid layout immediately
//   const mockQueue = [
//     { id: 1, title: 'Heat Waves', artist: 'Glass Animals', albumArt: 'https://i.scdn.co/image/ab67616d00001e029e495fb707973f3390850eea', votes: 11 },
//     { id: 2, title: 'Starboy', artist: 'The Weeknd', albumArt: 'https://i.scdn.co/image/ab67616d00001e024718e2b124f79258be7bc452', votes: 8 },
//     { id: 3, title: 'Levitating', artist: 'Dua Lipa', albumArt: 'https://i.scdn.co/image/ab67616d00001e02bd26ede1ae69327010d49946', votes: 5 },
//   ];

//   const handleUpvote = (trackId) => {
//     console.log(`Upvoting track ${trackId}`);
//     // We will wire this to Socket.IO later
//   };

//   return (
//     <div className="h-full w-full">
//       {/* 4x2 CSS Grid Setup */}
//       <div className="grid grid-cols-4 grid-rows-2 gap-4 h-full auto-rows-fr">
//         {mockQueue.map((track, index) => (
//           <QueueCard 
//             key={track.id} 
//             rank={index + 1} 
//             track={track} 
//             onUpvote={handleUpvote} 
//           />
//         ))}
        
//         {/* Fill the remaining empty spots to keep the grid shape */}
//         {Array.from({ length: Math.max(0, 8 - mockQueue.length) }).map((_, i) => (
//           <div key={`empty-${i}`} className="flex items-center justify-center p-3 bg-black/20 rounded-2xl border border-white/5 border-dashed w-full h-full">
//             <span className="text-white/20 text-xs font-bold uppercase tracking-widest">Empty</span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default SongQueue;

import React from 'react';
import QueueCard from './QueueCard';

const SongQueue = ({ roomId }) => {
  // Keeping the mock data the same for testing
  const mockQueue = [
    { id: 1, title: 'Heat Waves', artist: 'Glass Animals', albumArt: 'https://i.scdn.co/image/ab67616d00001e029e495fb707973f3390850eea', votes: 11 },
    { id: 2, title: 'Starboy', artist: 'The Weeknd', albumArt: 'https://i.scdn.co/image/ab67616d00001e024718e2b124f79258be7bc452', votes: 8 },
    { id: 3, title: 'Levitating', artist: 'Dua Lipa', albumArt: 'https://i.scdn.co/image/ab67616d00001e02bd26ede1ae69327010d49946', votes: 5 },
  ];

  const handleUpvote = (trackId) => {
    console.log(`Upvoting track ${trackId}`);
  };

  return (
    // Parent Container: Critical for respecting layout constraints.
    // Fixed height set by parent, but with y-overflow to handle up to 8 cards gracefully.
    <div className="h-full w-full flex-1 overflow-y-auto pr-3 custom-scrollbar">
      
      {/* LAYOUT CHANGE:
         Removed the grid grid-cols-4 and replaced it with a vertical flex column (space-y-4).
         This ensures the cards look exactly like Image 5 and maximizes readability.
      */}
      <div className="flex flex-col space-y-4 h-full">
        {mockQueue.map((track, index) => (
          <QueueCard 
            key={track.id} 
            rank={index + 1} 
            track={track} 
            onUpvote={handleUpvote} 
          />
        ))}
        
        {/* Placeholder logic for remaining slots */}
        {Array.from({ length: Math.max(0, 8 - mockQueue.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="flex items-center justify-between p-5 bg-black/30 rounded-[28px] border border-white/5 border-dashed w-full h-[100px] shadow-inner shrink-0">
            <span className="text-white/20 text-sm font-bold uppercase tracking-widest pl-10">Empty Slot</span>
            <div className="w-[80px] h-[80px] bg-black/10 rounded-2xl border border-white/5 border-dashed"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SongQueue;