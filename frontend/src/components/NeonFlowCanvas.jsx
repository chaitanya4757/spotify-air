// import React, { useRef, useEffect, useMemo } from 'react';

// /**
//  * Maps the 4 Fallback Phases to their complementary dual-theme pairs.
//  * Phase 1: Cyan/Pink (0-25%)
//  * Phase 2: Purple/Amber (25-50%)
//  * Phase 3: Red/IceBlue (50-75%)
//  * Phase 4: Green/Gold (75-100%)
//  */
// const getSecondaryColor = (hex) => {
//   if (!hex) return "#FF00FF";
//   const upperHex = hex.toUpperCase();

//   const colorMap = {
//     "#00FFFF": "#FF00FF", // Cyan -> Pink
//     "#BF00FF": "#FFBF00", // Purple -> Amber
//     "#FF0000": "#A0D8EF", // Red -> Ice Blue
//     "#00FF00": "#FFD700", // Green -> Gold
//   };

//   return colorMap[upperHex] || "#FFFFFF"; 
// };

// const NeonFlowCanvas = ({ vibeData, progress = 0 }) => {
//   const canvasRef = useRef(null);

//   // 1. Parse Data (Handle Gemini Object or Fallback Array)
//   const segments = useMemo(() => {
//     if (Array.isArray(vibeData)) return vibeData;
//     if (vibeData?.segments) return vibeData.segments;
//     return []; 
//   }, [vibeData]);

//   // 2. Find Active Phase (Detects if song is in the middle)
//   const activeSegment = useMemo(() => {
//     if (!segments.length) return { moodColor: "#00FFFF", energy: 0.5 };
//     // Reverse find the latest segment that has started based on current progress
//     return [...segments].reverse().find(s => s.startPercent <= progress) || segments[0];
//   }, [segments, progress]);

//   // 3. Extract Visual Properties
//   const targetPrimary = activeSegment.moodColor || "#00FFFF";
//   const targetSecondary = getSecondaryColor(targetPrimary);
//   const targetEnergy = activeSegment.energy || 0.5;

//   // Refs to maintain smooth animation values between renders
//   const targetPrimaryRef = useRef(targetPrimary);
//   const targetSecondaryRef = useRef(targetSecondary);
//   const energyRef = useRef(targetEnergy);

//   useEffect(() => {
//     targetPrimaryRef.current = targetPrimary;
//     targetSecondaryRef.current = targetSecondary;
//     energyRef.current = targetEnergy;
//   }, [targetPrimary, targetSecondary, targetEnergy]);

//   // Helper: Smoothly transition between hex colors
//   const lerpColor = (start, end, amount) => {
//     const s = parseInt(start.replace('#', ''), 16);
//     const e = parseInt(end.replace('#', ''), 16);
//     const r = Math.round(((e >> 16) - (s >> 16)) * amount + (s >> 16));
//     const g = Math.round((((e >> 8) & 0x00FF) - ((s >> 8) & 0x00FF)) * amount + ((s >> 8) & 0x00FF));
//     const b = Math.round(((e & 0x0000FF) - (s & 0x0000FF)) * amount + (s & 0x0000FF));
//     return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
//   };

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');
//     let animationFrameId;
//     let time = 0;
    
//     let currentPrimary = targetPrimaryRef.current;
//     let currentSecondary = targetSecondaryRef.current;

//     const resizeCanvas = () => {
//       canvas.width = window.innerWidth;
//       canvas.height = window.innerHeight;
//     };
//     window.addEventListener('resize', resizeCanvas);
//     resizeCanvas();

//     const LINE_COUNT = 20; 

//     const render = () => {
//       ctx.clearRect(0, 0, canvas.width, canvas.height);

//       // Smooth color morphing
//       currentPrimary = lerpColor(currentPrimary, targetPrimaryRef.current, 0.05);
//       currentSecondary = lerpColor(currentSecondary, targetSecondaryRef.current, 0.05);

//       const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
//       gradient.addColorStop(0, currentPrimary);
//       gradient.addColorStop(0.5, currentSecondary);
//       gradient.addColorStop(1, currentPrimary);

//       ctx.globalCompositeOperation = "screen"; 
//       ctx.lineWidth = 4;
//       ctx.strokeStyle = gradient;
//       ctx.shadowBlur = 40;
//       ctx.shadowColor = currentSecondary;

//       const cy = canvas.height / 2;

//       for (let i = 0; i < LINE_COUNT; i++) {
//         ctx.beginPath();
//         const offset = (i - LINE_COUNT / 2) * 12; 
//         const phaseShift = i * 0.2; 
        
//         // Dynamic Wave Height based on Energy from Backend
//         const baseAmp = 30 + (energyRef.current * 120);
//         const lineAmp = baseAmp * (1 - Math.abs(i - LINE_COUNT/2) / LINE_COUNT); 
//         const lineFreq = 0.008 + (i * 0.00015);

//         for (let x = 0; x < canvas.width; x += 10) {
//             const y = cy + offset + Math.sin((x * lineFreq) - time + phaseShift) * lineAmp; 
//             if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
//         }
//         ctx.globalAlpha = 0.8 - (Math.abs(i - LINE_COUNT/2) / LINE_COUNT);
//         ctx.stroke();
//       }
      
//       ctx.globalCompositeOperation = "source-over";
//       // Dynamic Speed based on Energy from Backend
//       time += 0.002 + (energyRef.current * 0.012);
      
//       animationFrameId = window.requestAnimationFrame(render);
//     };

//     render();
//     return () => {
//       window.cancelAnimationFrame(animationFrameId);
//       window.removeEventListener('resize', resizeCanvas);
//     };
//   }, []); 

//   return (
//     <canvas 
//       ref={canvasRef} 
//       className="absolute inset-0 w-full h-full -z-10 pointer-events-none" 
//       style={{ display: 'block' }}
//     />
//   );
// };

// export default NeonFlowCanvas;


import React, { useRef, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

const getSecondaryColor = (hex) => {
  if (!hex) return "#FF00FF";
  const upperHex = hex.toUpperCase();
  const colorMap = {
    "#00FFFF": "#FF00FF", // Cyan -> Pink
    "#BF00FF": "#FFBF00", // Purple -> Amber
    "#FF0000": "#A0D8EF", // Red -> Ice Blue
    "#00FF00": "#FFD700", // Green -> Gold
  };
  return colorMap[upperHex] || "#FFFFFF"; 
};

const NeonFlowCanvas = () => {
  const canvasRef = useRef(null);

  // ✅ REDUX SELECTORS: Pulling data from the global store
  const vibeData = useSelector((state) => state.vibe.vibeData);
  const progress = useSelector((state) => state.vibe.progress);

  const segments = useMemo(() => {
    if (Array.isArray(vibeData)) return vibeData;
    if (vibeData?.segments) return vibeData.segments;
    return []; 
  }, [vibeData]);

  const activeSegment = useMemo(() => {
    if (!segments.length) return { moodColor: "#00FFFF", energy: 0.5 };
    return [...segments].reverse().find(s => s.startPercent <= progress) || segments[0];
  }, [segments, progress]);

  const targetPrimary = activeSegment.moodColor || "#00FFFF";
  const targetSecondary = getSecondaryColor(targetPrimary);
  const targetEnergy = activeSegment.energy || 0.5;

  const targetPrimaryRef = useRef(targetPrimary);
  const targetSecondaryRef = useRef(targetSecondary);
  const energyRef = useRef(targetEnergy);

  useEffect(() => {
    targetPrimaryRef.current = targetPrimary;
    targetSecondaryRef.current = targetSecondary;
    energyRef.current = targetEnergy;
  }, [targetPrimary, targetSecondary, targetEnergy]);

  const lerpColor = (start, end, amount) => {
    const s = parseInt(start.replace('#', ''), 16);
    const e = parseInt(end.replace('#', ''), 16);
    const r = Math.round(((e >> 16) - (s >> 16)) * amount + (s >> 16));
    const g = Math.round((((e >> 8) & 0x00FF) - ((s >> 8) & 0x00FF)) * amount + ((s >> 8) & 0x00FF));
    const b = Math.round(((e & 0x0000FF) - (s & 0x0000FF)) * amount + (s & 0x0000FF));
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;
    
    let currentPrimary = targetPrimaryRef.current;
    let currentSecondary = targetSecondaryRef.current;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const LINE_COUNT = 20; 

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      currentPrimary = lerpColor(currentPrimary, targetPrimaryRef.current, 0.05);
      currentSecondary = lerpColor(currentSecondary, targetSecondaryRef.current, 0.05);

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, currentPrimary);
      gradient.addColorStop(0.5, currentSecondary);
      gradient.addColorStop(1, currentPrimary);

      ctx.globalCompositeOperation = "screen"; 
      ctx.lineWidth = 4;
      ctx.strokeStyle = gradient;
      ctx.shadowBlur = 40;
      ctx.shadowColor = currentSecondary;

      const cy = canvas.height / 2;

      for (let i = 0; i < LINE_COUNT; i++) {
        ctx.beginPath();
        const offset = (i - LINE_COUNT / 2) * 12; 
        const phaseShift = i * 0.2; 
        const baseAmp = 30 + (energyRef.current * 120);
        const lineAmp = baseAmp * (1 - Math.abs(i - LINE_COUNT/2) / LINE_COUNT); 
        const lineFreq = 0.008 + (i * 0.00015);

        for (let x = 0; x < canvas.width; x += 10) {
          const y = cy + offset + Math.sin((x * lineFreq) - time + phaseShift) * lineAmp; 
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.globalAlpha = 0.8 - (Math.abs(i - LINE_COUNT/2) / LINE_COUNT);
        ctx.stroke();
      }
      
      ctx.globalCompositeOperation = "source-over";
      time += 0.002 + (energyRef.current * 0.012);
      animationFrameId = window.requestAnimationFrame(render);
    };

    render();
    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []); 

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full -z-10 pointer-events-none" 
      style={{ display: 'block' }}
    />
  );
};

export default NeonFlowCanvas;