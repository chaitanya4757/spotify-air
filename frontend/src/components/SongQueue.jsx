// import React from 'react';
// import QueueCard from './QueueCard';

// const SongQueue = ({ roomId }) => {
//   // Keeping the mock data the same for testing
//   const mockQueue = [
//     { id: 1, title: 'Heat Waves', artist: 'Glass Animals', albumArt: 'https://i.scdn.co/image/ab67616d00001e029e495fb707973f3390850eea', votes: 11 },
//     { id: 2, title: 'Starboy', artist: 'The Weeknd', albumArt: 'https://i.scdn.co/image/ab67616d00001e024718e2b124f79258be7bc452', votes: 8 },
//     { id: 3, title: 'Levitating', artist: 'Dua Lipa', albumArt: 'https://i.scdn.co/image/ab67616d00001e02bd26ede1ae69327010d49946', votes: 5 },
//   ];

//   const handleUpvote = (trackId) => {
//     console.log(`Upvoting track ${trackId}`);
//   };

//   return (
//     // Parent Container: Critical for respecting layout constraints.
//     // Fixed height set by parent, but with y-overflow to handle up to 8 cards gracefully.
//     <div className="h-full w-full flex-1 overflow-y-auto pr-3 custom-scrollbar">
      
//       {/* LAYOUT CHANGE:
//          Removed the grid grid-cols-4 and replaced it with a vertical flex column (space-y-4).
//          This ensures the cards look exactly like Image 5 and maximizes readability.
//       */}
//       <div className="flex flex-col space-y-4 h-full">
//         {mockQueue.map((track, index) => (
//           <QueueCard 
//             key={track.id} 
//             rank={index + 1} 
//             track={track} 
//             onUpvote={handleUpvote} 
//           />
//         ))}
        
//         {/* Placeholder logic for remaining slots */}
//         {Array.from({ length: Math.max(0, 8 - mockQueue.length) }).map((_, i) => (
//           <div key={`empty-${i}`} className="flex items-center justify-between p-5 bg-black/30 rounded-[28px] border border-white/5 border-dashed w-full h-[100px] shadow-inner shrink-0">
//             <span className="text-white/20 text-sm font-bold uppercase tracking-widest pl-10">Empty Slot</span>
//             <div className="w-[80px] h-[80px] bg-black/10 rounded-2xl border border-white/5 border-dashed"></div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default SongQueue;

import React, { useState, useEffect } from 'react';
import QueueCard from './QueueCard';
import socket from '../services/socket'; // Import your socket connection

const SongQueue = ({ roomId }) => {
  // Replace mock data with real state, starting empty
  const [queue, setQueue] = useState([]);

  // Listen for real-time queue updates from the server
  useEffect(() => {
    const handleQueueUpdate = (updatedQueue) => {
      setQueue(updatedQueue);
    };

    socket.on('queue_update', handleQueueUpdate);

    // Cleanup listener on unmount
    return () => {
      socket.off('queue_update', handleQueueUpdate);
    };
  }, []);

  // Fire the upvote event to the server
  const handleUpvote = (trackId) => {
    socket.emit('upvote_track', { roomId, trackId });
  };

  return (
    <div className="h-full w-full flex-1 overflow-y-auto pr-3 custom-scrollbar">
      <div className="flex flex-col space-y-4 h-full">
        
        {/* Render the LIVE queue */}
        {queue.map((track, index) => (
          <QueueCard 
            key={track.id} 
            rank={index + 1} 
            track={track} 
            onUpvote={handleUpvote} 
          />
        ))}
        
        {/* Fill remaining slots up to 8 so the UI stays consistent */}
        {Array.from({ length: Math.max(0, 8 - queue.length) }).map((_, i) => (
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