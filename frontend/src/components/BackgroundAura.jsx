function BackgroundAura({ vibeMap }) {
  // Derive colors directly instead of using setState
  const primaryColor =
    vibeMap && vibeMap.length > 0 && vibeMap[0].moodColor
      ? vibeMap[0].moodColor
      : "#7c3aed"; // fallback purple

  const secondaryColor = "#1e293b";

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div
        className="absolute w-[600px] h-[600px] rounded-full blur-[140px] opacity-40 animate-pulse-slow"
        style={{
          backgroundColor: primaryColor,
          top: "-10%",
          left: "-10%"
        }}
      />

      <div
        className="absolute w-[700px] h-[700px] rounded-full blur-[160px] opacity-30 animate-pulse-slower"
        style={{
          backgroundColor: secondaryColor,
          bottom: "-15%",
          right: "-15%"
        }}
      />
    </div>
  );
}

export default BackgroundAura;
