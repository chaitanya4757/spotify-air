import React, { useState, useEffect } from 'react';
import QueueCard from './QueueCard';
import socket from '../services/socket';
import { useAuth } from '../hooks/useAuth'; 

const SongQueue = ({ roomId }) => {
  const [queue, setQueue] = useState([]);
  const { user } = useAuth(); 

  useEffect(() => {
    socket.on('queue_update', (updatedQueue) => setQueue(updatedQueue));
    return () => socket.off('queue_update');
  }, []);

  // ✅ Renamed handler to emit toggle_vote
  const handleToggleVote = (trackId) => {
    socket.emit('toggle_vote', { roomId, trackId });
  };

  return (
    <div className="h-full w-full overflow-hidden">
      <div className="grid grid-cols-4 gap-4 content-start h-full">
        {queue.slice(0, 8).map((track, index) => (
          <QueueCard 
            key={track.id} 
            rank={index + 1} 
            track={track} 
            onToggleVote={handleToggleVote} // Passed the new function
            currentUserId={user?._id}
          />
        ))}
        
        {Array.from({ length: Math.max(0, 8 - queue.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="flex flex-row items-center justify-center bg-black/10 rounded-xl border border-white/5 border-dashed opacity-40 w-full h-[72px]">
            <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest">
              Slot {queue.length + i + 1}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SongQueue;