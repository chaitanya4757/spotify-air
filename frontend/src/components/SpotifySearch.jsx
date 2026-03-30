// import React, { useState, useEffect } from 'react';
// import socket from '../services/socket'; 
// import api from '../services/api';
// import { useAuth } from '../hooks/useAuth';

// const SpotifySearch = ({ roomId }) => {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchResults, setSearchResults] = useState([]);
//   const [isSearching, setIsSearching] = useState(false);
//   const { user } = useAuth();

//   useEffect(() => {
//     if (!searchQuery.trim()) {
//       setSearchResults([]);
//       setIsSearching(false);
//       return;
//     }
//     setIsSearching(true);
//     const delayDebounceFn = setTimeout(async () => {
//       try {
//         const response = await api.get(`/api/spotify/search?q=${encodeURIComponent(searchQuery)}&userId=${user._id}`);
//         setSearchResults(response.data); 
//       } catch (error) {
//         console.error("Search error:", error);
//         setSearchResults([]); 
//       } finally {
//         setIsSearching(false);
//       }
//     }, 500); 
//     return () => clearTimeout(delayDebounceFn);
//   }, [searchQuery, user]);

//   const handleSuggestTrack = (track) => {
//     // Send to socket first
//     socket.emit('suggest_track', { roomId, track });
//     // Then clear local UI
//     setSearchQuery('');
//     setSearchResults([]);
//   };

//   return (
//     <div className="flex flex-col h-full w-full">
//       <div className="mb-4 shrink-0 relative">
//         <input 
//           type="text" 
//           placeholder="Search for a vibe..." 
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-cyan-500 transition-colors shadow-inner pr-10"
//         />
//         {isSearching && (
//           <div className="absolute right-3 top-1/2 -translate-y-1/2">
//             <svg className="animate-spin h-5 w-5 text-cyan-500" viewBox="0 0 24 24">
//               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//             </svg>
//           </div>
//         )}
//       </div>

//       <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
//         {searchResults.map((track) => (
//           <div key={track.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg hover:bg-white/10 border border-transparent hover:border-white/10">
//             <img src={track.albumArt} alt="art" className="w-10 h-10 rounded-md object-cover" />
//             <div className="flex flex-col overflow-hidden w-full">
//               <span className="text-white text-sm font-semibold truncate">{track.title}</span>
//               <span className="text-white/50 text-xs truncate">{track.artist}</span>
//             </div>
//             <button 
//               onClick={() => handleSuggestTrack(track)}
//               className="ml-auto text-xs bg-cyan-500/20 text-cyan-400 font-bold px-3 py-1.5 rounded-md hover:bg-cyan-500/40"
//             >
//               +
//             </button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default SpotifySearch;

import React, { useState, useEffect } from 'react';
import socket from '../services/socket'; 
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

const SpotifySearch = ({ roomId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await api.get(`/api/spotify/search?q=${encodeURIComponent(searchQuery)}&userId=${user._id}`);
        setSearchResults(response.data); 
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]); 
      } finally {
        setIsSearching(false);
      }
    }, 500); 
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, user]);

  const handleSuggestTrack = (track) => {
    // We send the track to the socket
    socket.emit('suggest_track', { roomId, track });
    
    // ✅ FIX 1: We no longer clear the search here. 
    // This allows the user to add multiple songs from the same search result.
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="mb-4 shrink-0 relative">
        <input 
          type="text" 
          placeholder="Search for a vibe..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-cyan-500 transition-colors shadow-inner pr-10"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="animate-spin h-5 w-5 text-cyan-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        {searchResults.map((track) => (
          <div key={track.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg hover:bg-white/10 border border-transparent hover:border-white/10">
            <img src={track.albumArt} alt="art" className="w-10 h-10 rounded-md object-cover" />
            <div className="flex flex-col overflow-hidden w-full">
              <span className="text-white text-sm font-semibold truncate">{track.title}</span>
              <span className="text-white/50 text-xs truncate">{track.artist}</span>
            </div>
            <button 
              onClick={() => handleSuggestTrack(track)}
              className="ml-auto text-xs bg-cyan-500/20 text-cyan-400 font-bold px-3 py-1.5 rounded-md hover:bg-cyan-500/40 transition-colors"
            >
              +
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpotifySearch;