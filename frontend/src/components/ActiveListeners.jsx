// // import React from 'react';
// // import { useSelector } from 'react-redux';

// // /**
// //  * Green Zone: Displays users currently in the Vibe Room.
// //  * Pulls data directly from Redux to avoid prop-drilling.
// //  */
// // const ActiveListeners = () => {
// //   // ✅ PULLING FROM REDUX: The members list we dispatched in Room.jsx
// //   const members = useSelector((state) => state.vibe.members);

// //   return (
// //     <div className="flex flex-col items-center gap-6 py-4 w-16">
// //       {/* Label for the Zone */}
// //       <p className="text-white/20 text-[10px] uppercase tracking-[0.2em] [writing-mode:vertical-lr] rotate-180 mb-2">
// //         Listeners
// //       </p>

// //       {/* Map through members in the store */}
// //       <div className="flex flex-col gap-4">
// //         {members.map((member) => (
// //           <div key={member.userId} className="relative group cursor-pointer">
// //             {/* Spotify Profile Image */}
// //             <img 
// //               // If member.image exists, use it. Otherwise, generate an avatar based on their name!
// //               src={member.image || `https://ui-avatars.com/api/?name=${member.name}&background=random&color=fff`} 
// //               alt={member.name}
// //               referrerPolicy="no-referrer" 
// //               className="w-12 h-12 rounded-full border-2 border-white/20 object-cover" 
// //             />
            
// //             {/* Online Status Indicator */}
// //             <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#030712] rounded-full" />

// //             {/* Glassmorphism Tooltip for Name */}
// //             <span className="absolute left-16 top-3 bg-white/5 backdrop-blur-md border border-white/10 text-white text-[10px] px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-50 pointer-events-none">
// //               {member.name}
// //             </span>
// //           </div>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // };

// // export default ActiveListeners;


// import React from 'react';
// import { useSelector } from 'react-redux';

// const ActiveListeners = () => {
//   const members = useSelector((state) => state.vibe.members || []);

//   return (
//     <div className="flex flex-col gap-5 items-center justify-center w-[80px] z-20 relative">
//       <p className="text-white/30 text-[9px] uppercase tracking-widest -rotate-90 mb-8 font-bold">Listeners</p>
      
//       {members.map((member, i) => (
//         <div key={i} className="relative group cursor-pointer">
          
//           {/* Avatar Image with dynamic Host Glow */}
//           <img
//             src={member.image || `https://ui-avatars.com/api/?name=${member.name}&background=random&color=fff`}
//             alt={member.name}
//             className={`w-12 h-12 rounded-full object-cover border-2 transition-all ${
//               member.isHost 
//                 ? "border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.5)]" // Pink glow for Host
//                 : "border-white/10" 
//             }`}
//           />
          
//           {/* Online Green Dot */}
//           <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#0B0B13] rounded-full"></div>
          
//           {/* ✅ THE CROWN (Only renders if isHost is true) */}
//           {member.isHost && (
//             <div className="absolute -top-4 -right-2 text-xl drop-shadow-lg">
//               👑
//             </div>
//           )}

//           {/* Hover Nameplate Tooltip */}
//           <div className="absolute left-16 top-2 bg-black/80 border border-white/10 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl">
//             {member.name} {member.isHost ? <span className="text-pink-400 font-bold ml-1">(Host)</span> : ""}
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default ActiveListeners;
import React from 'react';
import { useSelector } from 'react-redux';

const ActiveListeners = () => {
  const members = useSelector((state) => state.vibe.members || []);

  return (
    <div className="flex flex-col gap-5 items-center justify-center w-[80px] z-20 relative">
      <p className="text-white/30 text-[9px] uppercase tracking-widest -rotate-90 mb-8 font-bold">Listeners</p>
      
      {members.map((member, i) => (
        <div key={i} className="relative group cursor-pointer">
          
          {/* Avatar Image with dynamic Host Glow */}
          <img
            src={member.image || `https://ui-avatars.com/api/?name=${member.name}&background=random&color=fff`}
            alt={member.name}
            className={`w-12 h-12 rounded-full object-cover border-2 transition-all ${
              member.isHost 
                ? "border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.5)] z-0" 
                : "border-white/10" 
            }`}
          />
          
          {/* Online Green Dot */}
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#0B0B13] rounded-full z-10"></div>
          
          {/* ✅ THE NEW SLEEK HOST BADGE */}
          {member.isHost && (
            <div className="absolute -top-2 -right-3 bg-pink-600 text-white text-[7px] font-black px-2 py-0.5 rounded-full border-[1.5px] border-[#0B0B13] shadow-[0_0_10px_rgba(236,72,153,0.8)] z-10 tracking-widest">
              HOST
            </div>
          )}

          {/* Hover Nameplate Tooltip */}
          <div className="absolute left-16 top-2 bg-black/80 border border-white/10 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl">
            {member.name} {member.isHost ? <span className="text-pink-400 font-bold ml-1">(Host)</span> : ""}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActiveListeners;