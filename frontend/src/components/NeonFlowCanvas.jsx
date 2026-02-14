import React, { useRef, useEffect, useMemo } from 'react';

// Helper: Generate a contrasting secondary color
const getSecondaryColor = (hex) => {
  if (!hex) return "#FF00FF";
  // Simple inverter: Cyan->Pink, Red->Blue
  const colorMap = {
    "#00FFFF": "#FF00FF", 
    "#FF00FF": "#00FFFF", 
    "#FF0000": "#0000FF", 
    "#00FF00": "#FFFF00", 
  };
  return colorMap[hex] || "#FFFFFF"; 
};

// 1. ADD 'progress' PROP (0-100)
const NeonFlowCanvas = ({ vibeData, progress = 0 }) => {
  const canvasRef = useRef(null);

  // 2. PARSE DATA (Handle both AI and Fallback formats)
  const segments = useMemo(() => {
    if (Array.isArray(vibeData)) return vibeData; // Handle Fallback Array
    if (vibeData?.segments) return vibeData.segments; // Handle AI Object
    return []; 
  }, [vibeData]);

  // 3. FIND ACTIVE SEGMENT (The Magic Logic)
  const activeSegment = useMemo(() => {
    if (!segments.length) return null;
    
    // Find the segment that started most recently
    // e.g. If progress is 60%, pick the segment that started at 50%
    return [...segments].reverse().find(s => s.startPercent <= progress) || segments[0];
  }, [segments, progress]);

  // Determine Target Colors
  const targetPrimary = activeSegment?.moodColor || "#00FFFF";
  const targetSecondary = getSecondaryColor(targetPrimary);

  // Refs for smooth animation
  const targetPrimaryRef = useRef(targetPrimary);
  const targetSecondaryRef = useRef(targetSecondary);

  // Update refs when the target changes
  useEffect(() => {
    targetPrimaryRef.current = targetPrimary;
    targetSecondaryRef.current = targetSecondary;
  }, [targetPrimary, targetSecondary]);

  // --- RENDERING LOOP (Your existing nice waves) ---
  const energy = 0.5; // Default for smoothness
  const loudness = 0.5;

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
    const BASE_SPEED = 0.001; 
    
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Smoothly blend to the new colors
      currentPrimary = lerpColor(currentPrimary, targetPrimaryRef.current, 0.05);
      currentSecondary = lerpColor(currentSecondary, targetSecondaryRef.current, 0.05);

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, currentPrimary);
      gradient.addColorStop(0.5, currentSecondary);
      gradient.addColorStop(1, currentPrimary);

      ctx.globalCompositeOperation = "screen"; 
      ctx.lineWidth = 2;
      ctx.strokeStyle = gradient;
      ctx.shadowBlur = 15;
      ctx.shadowColor = currentSecondary;

      const cy = canvas.height / 2;

      for (let i = 0; i < LINE_COUNT; i++) {
        ctx.beginPath();
        const offset = (i - LINE_COUNT / 2) * 12; 
        const phase = i * 0.2; 
        const baseAmp = 20 + (loudness * 100);
        const lineAmp = baseAmp * (1 - Math.abs(i - LINE_COUNT/2) / LINE_COUNT); 
        const lineFreq1 = 0.008 + (i * 0.00015); 
        const lineFreq2 = 0.015 + (i * 0.0002);

        for (let x = 0; x < canvas.width; x += 10) {
            const y = cy + offset + Math.sin((x * lineFreq1) - time + phase) * lineAmp + Math.sin((x * lineFreq2) - time) * (lineAmp * 0.5); 
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.globalAlpha = 0.8 - (Math.abs(i - LINE_COUNT/2) / LINE_COUNT);
        ctx.stroke();
      }
      ctx.globalCompositeOperation = "source-over";
      time += BASE_SPEED + (energy * 0.005);
      animationFrameId = window.requestAnimationFrame(render);
    };
    render();
    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []); // Logic is self-contained via refs

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full -z-10 pointer-events-none" />;
};

export default NeonFlowCanvas;