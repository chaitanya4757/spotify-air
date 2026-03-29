function CoronalFlare({ energy, moodColor }) {
  const intensity = energy ?? 0.6;
  const color = moodColor || "#a855f7";

  const baseSize = 210 + intensity * 60;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">

      {[0, 0.4, 0.8, 1.2].map((delay, index) => (
        <div
          key={index}
          className="absolute rounded-full animate-ripple"
          style={{
            width: `${baseSize}px`,
            height: `${baseSize}px`,
            border: `2px solid ${color}`,
            boxShadow: `0 0 25px ${color}88`,
            animationDelay: `${delay}s`
          }}
        />
      ))}

    </div>
  );
}

export default CoronalFlare;
