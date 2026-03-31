import React, { useState, useEffect } from 'react';
import QueueCard from './QueueCard';
import socket from '../services/socket';

const SongQueue = ({ roomId }) => {
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    socket.on('queue_update', (updatedQueue) => setQueue(updatedQueue));
    return () => socket.off('queue_update');
  }, []);

  const handleUpvote = (trackId) => {
    socket.emit('upvote_track', { roomId, trackId });
  };

  return (
    <div className="h-full w-full overflow-hidden">
      {/* 4x2 Grid Layout with massive gaps */}
      <div className="grid grid-cols-4 grid-rows-2 gap-6 h-full">
        {queue.slice(0, 8).map((track, index) => (
          <QueueCard 
            key={track.id} 
            rank={index + 1} 
            track={track} 
            onUpvote={handleUpvote} 
          />
        ))}
        
        {/* Stylish Placeholders */}
        {Array.from({ length: Math.max(0, 8 - queue.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="flex flex-col items-center justify-center bg-black/10 rounded-[26px] border border-white/5 border-dashed opacity-40 h-full group">
            <span className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em] group-hover:text-white/40 transition-colors">
              Slot {queue.length + i + 1}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SongQueue;