import React, { useMemo, memo } from "react";

const SmokyOilSpillBackground = () => {
  // Pre-generate stable random floating oil droplets for zero runtime recalculation
  const droplets = useMemo(() => {
    return Array.from({ length: 10 }).map((_, i) => ({
      id: i,
      size: 14 + (i % 4) * 8, // 14px to 38px
      left: `${(i * 9.5 + 5) % 92}%`,
      top: `${(i * 11 + 8) % 85}%`,
      delay: `${(i * 0.8).toFixed(1)}s`,
      duration: `${14 + (i % 5) * 3}s`,
      driftX: `${(i % 2 === 0 ? 1 : -1) * (18 + (i % 3) * 12)}px`,
      scale: (0.75 + (i % 3) * 0.15).toFixed(2),
    }));
  }, []);

  return (
    <div 
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0"
      style={{
        contain: "paint layout size",
        transform: "translateZ(0)",
        backfaceVisibility: "hidden"
      }}
    >
      {/* ── HIGH-PERFORMANCE HARDWARE-ACCELERATED 60FPS KEYFRAMES ── */}
      <style>{`
        /* 60FPS Hardware-Accelerated Smooth Liquid Oil Flow */
        @keyframes oilSpillFlow1 {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
          }
          50% {
            transform: translate3d(24px, -18px, 0) scale(1.06) rotate(15deg);
          }
        }

        @keyframes oilSpillFlow2 {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
          }
          50% {
            transform: translate3d(-25px, -20px, 0) scale(1.08) rotate(-18deg);
          }
        }

        @keyframes oilSpillFlow3 {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
          }
          50% {
            transform: translate3d(20px, 24px, 0) scale(1.07) rotate(20deg);
          }
        }

        /* Smoky Ambient Mist Drifting (Pure Transform & Opacity) */
        @keyframes smokyMistSlow {
          0%, 100% {
            opacity: 0.45;
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            opacity: 0.65;
            transform: translate3d(-30px, 15px, 0) scale(1.08);
          }
        }

        @keyframes smokyMistFast {
          0%, 100% {
            opacity: 0.35;
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            opacity: 0.6;
            transform: translate3d(25px, -20px, 0) scale(1.1);
          }
        }

        /* Smooth Floating Oil Droplet Drift */
        @keyframes floatOilBead {
          0% {
            transform: translate3d(0, 0, 0);
            opacity: 0.3;
          }
          50% {
            transform: translate3d(var(--drift-x, 20px), -35px, 0);
            opacity: 0.8;
          }
          100% {
            transform: translate3d(0, -70px, 0);
            opacity: 0.2;
          }
        }

        /* Butter-Smooth GPU Golden Oil Ripple Rings */
        @keyframes oilRippleSmooth {
          0% {
            transform: translate3d(-50%, -50%, 0) scale(0.35);
            opacity: 0.75;
          }
          60% {
            opacity: 0.35;
          }
          100% {
            transform: translate3d(-50%, -50%, 0) scale(2.6);
            opacity: 0;
          }
        }
      `}</style>

      {/* ── 1. DEEP SMOKY CHARCOAL BASE VIGNETTE ── */}
      <div className="absolute inset-0 bg-[#0c1017] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(30,41,59,0.8),rgba(12,16,23,0.98))]" />

      {/* ── 2. SMOKY AMBIENT FOG & MIST AURAS (PRE-BLURRED GRADIENTS FOR 0% GPU OVERHEAD) ── */}
      <div
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full opacity-60 will-change-transform pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(245, 158, 11, 0.16) 0%, rgba(217, 119, 6, 0.08) 45%, transparent 70%)",
          animation: "smokyMistSlow 18s ease-in-out infinite",
          transform: "translateZ(0)"
        }}
      />
      <div
        className="absolute top-1/3 -right-32 w-[650px] h-[650px] rounded-full opacity-55 will-change-transform pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(234, 179, 8, 0.15) 0%, rgba(245, 158, 11, 0.07) 48%, transparent 72%)",
          animation: "smokyMistFast 20s ease-in-out infinite",
          transform: "translateZ(0)"
        }}
      />
      <div
        className="absolute -bottom-40 left-1/4 w-[700px] h-[700px] rounded-full opacity-50 will-change-transform pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, rgba(245, 158, 11, 0.08) 40%, transparent 68%)",
          animation: "smokyMistSlow 22s ease-in-out infinite reverse",
          transform: "translateZ(0)"
        }}
      />

      {/* ── 3. VISCOUS LIQUID GOLDEN OIL SPILL BLOBS (LAYER 1 - TOP RIGHT) ── */}
      <div
        className="absolute -top-20 right-4 sm:right-16 w-[360px] sm:w-[480px] h-[360px] sm:h-[480px] rounded-full will-change-transform opacity-75 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 40% 35%, rgba(253, 224, 71, 0.35) 0%, rgba(245, 158, 11, 0.22) 35%, rgba(180, 83, 9, 0.1) 60%, transparent 80%)",
          animation: "oilSpillFlow1 22s ease-in-out infinite",
          transform: "translateZ(0)"
        }}
      />

      {/* ── 4. VISCOUS LIQUID GOLDEN OIL SPILL BLOBS (LAYER 2 - CENTER LEFT) ── */}
      <div
        className="absolute top-1/2 -left-20 w-[380px] sm:w-[500px] h-[380px] sm:h-[500px] rounded-full will-change-transform opacity-70 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 55% 45%, rgba(251, 191, 36, 0.3) 0%, rgba(217, 119, 6, 0.18) 38%, rgba(146, 64, 14, 0.08) 62%, transparent 80%)",
          animation: "oilSpillFlow2 26s ease-in-out infinite",
          transform: "translateZ(0)"
        }}
      />

      {/* ── 5. VISCOUS LIQUID GOLDEN OIL SPILL BLOBS (LAYER 3 - BOTTOM RIGHT) ── */}
      <div
        className="absolute bottom-10 right-10 sm:right-1/4 w-[320px] sm:w-[440px] h-[320px] sm:h-[440px] rounded-full will-change-transform opacity-70 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 45% 55%, rgba(254, 240, 138, 0.28) 0%, rgba(245, 158, 11, 0.18) 36%, rgba(180, 83, 9, 0.07) 60%, transparent 80%)",
          animation: "oilSpillFlow3 20s ease-in-out infinite",
          transform: "translateZ(0)"
        }}
      />

      {/* ── 6. ORGANIC LIQUID OIL FLOW STREAM (STREAMLINED HARDWARE VECTOR) ── */}
      <svg
        className="absolute top-0 left-0 w-full h-full opacity-25 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="oilStreamGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" stopOpacity="0.45" />
            <stop offset="45%" stopColor="#F59E0B" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#B45309" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="oilStreamGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.35" />
            <stop offset="55%" stopColor="#D97706" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#78350F" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path
          d="M -100,200 C 300,100 500,450 900,300 C 1300,150 1500,500 1800,350 L 1800,800 L -100,800 Z"
          fill="url(#oilStreamGrad1)"
          className="opacity-70"
        />
        <path
          d="M -100,600 C 400,750 700,500 1100,680 C 1500,860 1700,600 2000,720 L 2000,1400 L -100,1400 Z"
          fill="url(#oilStreamGrad2)"
          className="opacity-60"
        />
      </svg>

      {/* ── 7. CONTINUOUS CONCENTRIC GOLDEN OIL RIPPLE WAVES ── */}
      <div className="absolute top-[28%] left-[65%] w-0 h-0 pointer-events-none">
        <div
          className="absolute rounded-full border border-amber-400/35 will-change-transform"
          style={{
            width: "340px",
            height: "340px",
            animation: "oilRippleSmooth 8s cubic-bezier(0.1, 0.8, 0.3, 1) infinite",
            transform: "translateZ(0)"
          }}
        />
        <div
          className="absolute rounded-full border border-yellow-300/25 will-change-transform"
          style={{
            width: "340px",
            height: "340px",
            animation: "oilRippleSmooth 8s cubic-bezier(0.1, 0.8, 0.3, 1) infinite 4s",
            transform: "translateZ(0)"
          }}
        />
      </div>

      <div className="absolute top-[68%] left-[22%] w-0 h-0 pointer-events-none">
        <div
          className="absolute rounded-full border border-amber-500/30 will-change-transform"
          style={{
            width: "380px",
            height: "380px",
            animation: "oilRippleSmooth 9s cubic-bezier(0.1, 0.8, 0.3, 1) infinite 2s",
            transform: "translateZ(0)"
          }}
        />
        <div
          className="absolute rounded-full border border-yellow-400/20 will-change-transform"
          style={{
            width: "380px",
            height: "380px",
            animation: "oilRippleSmooth 9s cubic-bezier(0.1, 0.8, 0.3, 1) infinite 6.5s",
            transform: "translateZ(0)"
          }}
        />
      </div>

      {/* ── 8. DRIFTING VISCOUS GOLDEN OIL DROPLETS ── */}
      {droplets.map((d) => (
        <div
          key={d.id}
          className="absolute rounded-full will-change-transform pointer-events-none"
          style={{
            width: `${d.size}px`,
            height: `${d.size * 1.15}px`,
            left: d.left,
            top: d.top,
            borderRadius: "50% 50% 60% 40% / 60% 40% 60% 40%",
            background: "radial-gradient(circle at 35% 30%, rgba(254, 240, 138, 0.9) 0%, rgba(245, 158, 11, 0.75) 45%, rgba(180, 83, 9, 0.45) 85%)",
            boxShadow: "0 2px 10px rgba(217, 119, 6, 0.3)",
            animation: `floatOilBead ${d.duration} ease-in-out infinite ${d.delay}`,
            "--drift-x": d.driftX,
            transform: "translateZ(0)"
          }}
        >
          {/* Specular highlight */}
          <div className="absolute top-1 left-1 w-1.5 h-1 rounded-full bg-white/70 transform -rotate-25" />
        </div>
      ))}

      {/* ── 9. SUBTLE GRADIENT OVERLAY ── */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0c1017]/35 to-[#0c1017]/85" />
    </div>
  );
};

export default memo(SmokyOilSpillBackground);
