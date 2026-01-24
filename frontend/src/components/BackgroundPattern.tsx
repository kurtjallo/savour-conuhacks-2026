export default function BackgroundPattern() {
  // Create a tileable dot pattern using inline SVG data URL
  const dotSize = 2;
  const spacing = 20;
  const dotColor = 'rgba(0, 0, 0, 0.08)'; // Subtle gray dots

  const svgPattern = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${spacing}" height="${spacing}">
      <circle cx="${spacing / 2}" cy="${spacing / 2}" r="${dotSize / 2}" fill="${dotColor}"/>
    </svg>
  `;

  const encodedSvg = encodeURIComponent(svgPattern.trim());
  const dataUrl = `url("data:image/svg+xml,${encodedSvg}")`;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Dot pattern layer */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: dataUrl,
          backgroundRepeat: 'repeat',
        }}
      />
      {/* Radial gradient overlay - soft warm center glow */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 30% 50%, rgba(255, 250, 245, 0.9) 0%, transparent 60%)',
        }}
      />
      {/* Bottom faded orange gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, transparent 60%, rgba(255, 237, 225, 0.6) 100%)',
        }}
      />
    </div>
  );
}
