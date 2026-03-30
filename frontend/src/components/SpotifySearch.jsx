// import React, { useState } from 'react';
// import socket from '../services/socket'; 
// import api from '../services/api';

// const SpotifySearch = ({ roomId }) => {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchResults, setSearchResults] = useState([]);
//   const [isSearching, setIsSearching] = useState(false);

//   const handleSearch = async (e) => {
//     e.preventDefault();
//     if (!searchQuery.trim()) return;

//     setIsSearching(true);
//     try {
//       const response = await api.get(`/api/spotify/search?q=${encodeURIComponent(searchQuery)}`);
//       setSearchResults(response.data); 
//     } catch (error) {
//       console.error("Failed to search Spotify:", error);
//     } finally {
//       setIsSearching(false);
//     }
//   };

//   const handleSuggestTrack = (track) => {
//     socket.emit('suggest_track', { roomId, track });
//     setSearchQuery('');
//     setSearchResults([]);
//   };

//   return (
//     <div className="flex flex-col h-full w-full">
//       <form onSubmit={handleSearch} className="mb-4 shrink-0">
//         <input 
//           type="text" 
//           placeholder="Search for a vibe..." 
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-cyan-500 transition-colors shadow-inner"
//         />
//       </form>

//       <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
//         {searchResults.length === 0 && !isSearching ? (
//           <div className="h-full flex items-center justify-center text-white/30 text-sm">
//             Search to suggest a track
//           </div>
//         ) : (
//           searchResults.map((track) => (
//             <div 
//               key={track.id} 
//               className="flex items-center gap-3 p-2 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors border border-transparent hover:border-white/10"
//             >
//               <img src={track.albumArt} alt="art" className="w-10 h-10 rounded-md object-cover shadow-md" />
//               <div className="flex flex-col overflow-hidden w-full">
//                 <span className="text-white text-sm font-semibold truncate">{track.title}</span>
//                 <span className="text-white/50 text-xs truncate">{track.artist}</span>
//               </div>
//               <button 
//                 onClick={() => handleSuggestTrack(track)}
//                 className="ml-auto text-xs bg-cyan-500/20 text-cyan-400 font-bold px-3 py-1.5 rounded-md hover:bg-cyan-500/40 transition-colors"
//               >
//                 +
//               </button>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default SpotifySearch;

import React, { useState, useEffect } from 'react';
import socket from '../services/socket'; 
import api from '../services/api';
import { useAuth } from '../hooks/useAuth'; // 1. IMPORT YOUR AUTH HOOK

const SpotifySearch = ({ roomId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const { user } = useAuth(); // 2. GRAB THE CURRENT USER

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    const delayDebounceFn = setTimeout(async () => {
      try {
        // 3. ATTACH THE userId TO THE QUERY STRING!
        const response = await api.get(
          `/api/spotify/search?q=${encodeURIComponent(searchQuery)}&userId=${user._id}`
        );
        setSearchResults(response.data); 
      } catch (error) {
        // Log the actual error so we can see it in the F12 console!
        console.error("Failed to search Spotify:", error.response?.data || error.message);
        setSearchResults([]); 
      } finally {
        setIsSearching(false);
      }
    }, 500); 

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, user]); // Add user to dependency array

  const handleSuggestTrack = (track) => {
    socket.emit('suggest_track', { roomId, track });
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Search Input Container */}
      <div className="mb-4 shrink-0 relative">
        <input 
          type="text" 
          placeholder="Search for a vibe..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-cyan-500 transition-colors shadow-inner pr-10"
        />
        
        {/* Loading Spinner */}
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="animate-spin h-5 w-5 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>

      {/* Results Container */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        {searchResults.length === 0 && !isSearching && searchQuery.length === 0 ? (
          <div className="h-full flex items-center justify-center text-white/30 text-sm">
            Search to suggest a track
          </div>
        ) : searchResults.length === 0 && !isSearching && searchQuery.length > 0 ? (
          <div className="h-full flex items-center justify-center text-white/30 text-sm">
            No results found.
          </div>
        ) : (
          searchResults.map((track) => (
            <div 
              key={track.id} 
              className="flex items-center gap-3 p-2 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors border border-transparent hover:border-white/10"
            >
              <img src={track.albumArt} alt="art" className="w-10 h-10 rounded-md object-cover shadow-md" />
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
          ))
        )}
      </div>
    </div>
  );
};

export default SpotifySearch;