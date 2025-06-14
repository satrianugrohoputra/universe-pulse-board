
import React from "react";

// Generates a twinkling star background with very lightweight CSS (no heavy JS animation)
const StarBackground: React.FC = () => (
  <>
    {/* Parallax star layers */}
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden star-bg">
      <div className="absolute inset-0 animate-[starMove_180s_linear_infinite] bg-transparent" style={{backgroundImage:'radial-gradient(white 0.8px, transparent 1px)', backgroundSize:'80px 80px', opacity:0.23}} />
      <div className="absolute inset-0 animate-[starMove2_320s_linear_infinite] bg-transparent" style={{backgroundImage:'radial-gradient(white 1.2px, transparent 1.3px)', backgroundSize:'140px 140px', opacity:0.13}} />
      <div className="absolute inset-0 animate-[starMove3_90s_linear_infinite] bg-transparent" style={{backgroundImage:'radial-gradient(white 2px, transparent 2.1px)', backgroundSize:'240px 240px', opacity:0.09}} />
      {/* Optional: soft vignette */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/60 via-transparent via-60% to-black/70" />
    </div>
    <style>{`
      @keyframes starMove {
        0% { background-position: 0 0; }
        100% { background-position: 150px 380px; }
      }
      @keyframes starMove2 {
        0% { background-position: 0 0; }
        100% { background-position: -160px 700px; }
      }
      @keyframes starMove3 {
        0% { background-position: 0 0; }
        100% { background-position: 700px -260px; }
      }
    `}</style>
  </>
);

export default StarBackground;
