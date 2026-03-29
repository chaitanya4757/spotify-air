// import React, { useRef, useEffect } from 'react';

// const NeonFlowCanvas = ({ vibeData }) => {
//   const canvasRef = useRef(null);

//   // Defaults
//   const primaryColor = vibeData?.ai_sentiment?.primary_hex || "#00FFFF"; 
//   const secondaryColor = vibeData?.ai_sentiment?.secondary_hex || "#FF00FF";
//   const energy = vibeData?.audio_physics?.energy || 0.5;
//   const loudness = vibeData?.audio_physics?.loudness || 0.5;

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');
//     let animationFrameId;
//     let time = 0;

//     const resizeCanvas = () => {
//       canvas.width = window.innerWidth;
//       canvas.height = window.innerHeight;
//     };
//     window.addEventListener('resize', resizeCanvas);
//     resizeCanvas();

//     // --- CONFIGURATION ---
//     const LINE_COUNT = 20; // Increased for richer look
//     const BASE_SPEED = 0.005; 
    
//     const render = () => {
//       ctx.clearRect(0, 0, canvas.width, canvas.height);

//       // Create Gradient
//       const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
//       gradient.addColorStop(0, primaryColor);
//       gradient.addColorStop(0.5, secondaryColor);
//       gradient.addColorStop(1, primaryColor);

//       // "Screen" blend mode makes overlapping lines glow brighter
//       ctx.globalCompositeOperation = "screen"; 
//       ctx.lineWidth = 2;
//       ctx.strokeStyle = gradient;
//       ctx.shadowBlur = 15;
//       ctx.shadowColor = secondaryColor;

//       const cy = canvas.height / 2;

//       for (let i = 0; i < LINE_COUNT; i++) {
//         ctx.beginPath();
        
//         // 1. Calculate Vertical Spacing (The Fix!)
//         // This spreads lines out from -100px to +100px from center
//         const offset = (i - LINE_COUNT / 2) * 12; 

//         // 2. Calculate Horizontal Phase (Weaving effect)
//         const phase = i * 0.2; 
        
//         // 3. Amplitude (Height) logic
//         // Outer lines are calmer, center lines are wilder
//         const baseAmp = 20 + (loudness * 100);
//         const lineAmp = baseAmp * (1 - Math.abs(i - LINE_COUNT/2) / LINE_COUNT); 

//         for (let x = 0; x < canvas.width; x += 10) {
//             // The Wave Equation
//             // y = Center + Vertical_Offset + Sine_Wave
//             const y = cy 
//               + offset 
//               + Math.sin((x * 0.002) + time + phase) * lineAmp
//               + Math.sin((x * 0.005) + time) * (lineAmp * 0.5); 

//             if (x === 0) ctx.moveTo(x, y);
//             else ctx.lineTo(x, y);
//         }
        
//         // Fade out edges for smooth look
//         ctx.globalAlpha = 0.8 - (Math.abs(i - LINE_COUNT/2) / LINE_COUNT);
//         ctx.stroke();
//       }

//       // Reset blend mode for next frame
//       ctx.globalCompositeOperation = "source-over";

//       time += BASE_SPEED + (energy * 0.01);
//       animationFrameId = window.requestAnimationFrame(render);
//     };

//     render();

//     return () => {
//       window.cancelAnimationFrame(animationFrameId);
//       window.removeEventListener('resize', resizeCanvas);
//     };
//   }, [primaryColor, secondaryColor, energy, loudness]);

//   return (
//     <canvas 
//       ref={canvasRef} 
//       className="absolute inset-0 w-full h-full -z-10 pointer-events-none"
//     />
//   );
// };

// export default NeonFlowCanvas;