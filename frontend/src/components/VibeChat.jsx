// import React, { useState, useRef, useEffect } from 'react';
// import { useSelector } from 'react-redux';
// import socket from '../services/socket';
// import { useAuth } from '../hooks/useAuth'; // ✅ Add your auth hook!

// const VibeChat = ({ roomId }) => {
//   const [text, setText] = useState("");
//   const messages = useSelector((state) => state.chat.messages);
//   const { user } = useAuth();
//   const scrollRef = useRef();

//   // Auto-scroll to bottom on new message
//   useEffect(() => {
//     scrollRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const sendMessage = (e) => {
//     e.preventDefault();
//     if (!text.trim() || !user) return;

//     // ✅ Grab the Spotify image array safely, just like we did in Room.jsx!
//     const userImage = user.images && user.images.length > 0 ? user.images[0].url : "";

//     const msgData = {
//       roomId,
//       userId: user._id, // ✅ Add userId so we know who sent it
//       sender: user.displayName,
//       image: userImage, // ✅ Use the safely extracted image
//       text: text,
//       time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//     };

//     socket.emit("chat-message", msgData);
//     setText("");
//   };

//   return (
//     <div className="flex flex-col h-[450px] w-[280px] bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
//       {/* Header */}
//       <div className="p-4 border-b border-white/5 bg-white/5">
//         <p className="text-white/40 text-[10px] uppercase tracking-widest text-center">Room Chat</p>
//       </div>

//       {/* Messages Area */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
//         {messages.map((msg, i) => {
//           // ✅ Check if this message belongs to the person looking at the screen
//           const isMe = msg.userId === user?._id;
//           // ✅ Smart Fallback avatar if they don't have a Spotify PFP
//           const avatarSrc = msg.image || `https://ui-avatars.com/api/?name=${msg.sender}&background=random&color=fff`;

//           return (
//             <div key={i} className={`flex items-start gap-3 animate-fade-in ${isMe ? "flex-row-reverse" : "flex-row"}`}>
//               <img src={avatarSrc} className="w-7 h-7 rounded-full border border-white/10 object-cover flex-shrink-0" alt="" />
//               <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
//                 <span className="text-[10px] text-white/30 font-bold mb-1">{msg.sender}</span>
//                 <p className={`text-sm text-white/80 leading-relaxed px-3 py-2 rounded-2xl ${isMe ? "bg-pink-600/80 rounded-tr-none" : "bg-white/5 rounded-tl-none"}`}>
//                   {msg.text}
//                 </p>
//               </div>
//             </div>
//           );
//         })}
//         <div ref={scrollRef} />
//       </div>

//       {/* Input Area */}
//       <form onSubmit={sendMessage} className="p-4 bg-black/20">
//         <input
//           type="text"
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//           placeholder="Send a vibe..."
//           className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-pink-500/50 transition-all"
//         />
//       </form>
//     </div>
//   );
// };

// export default VibeChat;

import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import socket from '../services/socket';
import { useAuth } from '../hooks/useAuth';

const VibeChat = ({ roomId }) => {
  const [text, setText] = useState("");
  const messages = useSelector((state) => state.chat.messages);
  const { user } = useAuth();
  const scrollRef = useRef();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() || !user) return;

    const userImage = user.images && user.images.length > 0 ? user.images[0].url : "";

    const msgData = {
      roomId,
      userId: user._id || user.id, 
      sender: user.displayName,
      image: userImage, 
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    socket.emit("chat-message", msgData);
    setText("");
  };

  return (
    <div className="flex flex-col h-[450px] w-[280px] bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-white/5">
        <p className="text-white/40 text-[10px] uppercase tracking-widest text-center font-bold">Room Chat</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-hide">
        {messages.map((msg, i) => {
          // ✅ FOOLPROOF CHECK: Compare exact Display Names instead of tricky database IDs
          const isMe = msg.sender === user?.displayName;
          
          const avatarSrc = msg.image || `https://ui-avatars.com/api/?name=${msg.sender}&background=random&color=fff`;

          return (
            <div key={i} className={`flex items-start gap-3 animate-fade-in w-full ${isMe ? "flex-row-reverse" : "flex-row"}`}>
              <img src={avatarSrc} className="w-8 h-8 rounded-full border border-white/10 object-cover flex-shrink-0 shadow-md" alt="avatar" />
              
              <div className={`flex flex-col max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
                <span className="text-[9px] text-white/40 font-semibold mb-1 tracking-wide">{msg.sender}</span>
                
                {/* ✅ DYNAMIC CSS: Pink for Me, Glass for Them */}
                <p className={`text-sm leading-relaxed px-4 py-2.5 shadow-lg ${
                  isMe 
                    ? "bg-pink-600 text-white rounded-2xl rounded-tr-sm" 
                    : "bg-white/10 text-white/90 rounded-2xl rounded-tl-sm border border-white/5 backdrop-blur-md"
                }`}>
                  {msg.text}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} className="p-4 bg-black/20 border-t border-white/5">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Send a vibe..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500/50 transition-all shadow-inner"
        />
      </form>
    </div>
  );
};

export default VibeChat;