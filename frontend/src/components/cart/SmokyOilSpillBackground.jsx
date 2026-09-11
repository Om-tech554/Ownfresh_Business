import React, { useMemo } from "react";

const SmokyOilSpillBackground = () => {
  // Pre-generate stable random floating oil droplets for zero runtime recalculation
  const droplets = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      size: 14 + (i % 5) * 8, // 14px to 46px
      left: `${(i * 8.3 + 4) % 94}%`,
      top: `${(i * 11 + 10) % 88}%`,
      delay: `${(i * 0.7).toFixed(1)}s`,
      duration: `${14 + (i % 6) * 3}s`,
      driftX: `${(i % 2 === 0 ? 1 : -1) * (20 + (i % 3) * 15)}px`,
      scale: (0.7 + (i % 4) * 0.2).toFixed(2),
    }));
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      {/* ── EMBEDDED HIGH-PERFORMANCE GPU KEYFRAMES ── */}
      <style>{`
        /* 60FPS Hardware-Accelerated Smooth Liquid Oil Morph */
        @keyframes oilSpillFlow1 {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
            border-radius: 48% 52% 68% 32% / 42% 58% 42% 58%;
          }
          33% {
            transform: translate3d(30px, -20px, 0) scale(1.08) rotate(25deg);
            border-radius: 65% 35% 45% 55% / 55% 45% 55% 45%;
          }
          66% {
            transform: translate3d(-20px, 25px, 0) scale(0.95) rotate(-15deg);
            border-radius: 35% 65% 55% 45% / 48% 52% 48% 52%;
          }
        }

        @keyframes oilSpillFlow2 {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1.05) rotate(0deg);
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
          }
          50% {
            transform: translate3d(-35px, -30px, 0) scale(1.15) rotate(-35deg);
            border-radius: 40% 60% 70% 30% / 40% 70% 30% 60%;
          }
        }

        @keyframes oilSpillFlow3 {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(0.95) rotate(0deg);
            border-radius: 52% 48% 35% 65% / 65% 35% 65% 35%;
          }
          50% {
            transform: translate3d(25px, 35px, 0) scale(1.12) rotate(40deg);
            border-radius: 70% 30% 55% 45% / 35% 65% 35% 65%;
          }
        }

        /* Smoky Haze Mist Drifting */
        @keyframes smokyMistSlow {
          0%, 100% {
            opacity: 0.45;
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            opacity: 0.7;
            transform: translate3d(-40px, 20px, 0) scale(1.12);
          }
        }

        @keyframes smokyMistFast {
          0%, 100% {
            opacity: 0.35;
            transform: translate3d(0, 0, 0) scale(1.05);
          }
          50% {
            opacity: 0.65;
            transform: translate3d(30px, -25px, 0) scale(1.18);
          }
        }

        /* Smooth Floating Oil Droplet Drift */
        @keyframes floatOilBead {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translate3d(var(--drift-x, 25px), -45px, 0) scale(1.15);
            opacity: 0.85;
          }
          100% {
            transform: translate3d(0, -90px, 0) scale(0.9);
            opacity: 0.2;
          }
        }

        /* Hypnotic Golden Oil Ripple Ring */
        @keyframes oilRippleSmooth {
          0% {
            transform: translate3d(-50%, -50%, 0) scale(0.35);
            opacity: 0.8;
          }
          50% {
            opacity: 0.4;
          }
          100% {
            transform: translate3d(-50%, -50%, 0) scale(2.8);
            opacity: 0;
          }
        }

        /* Ambient Liquid Oil Surface Sheen */
        @keyframes goldenSheenWave {
          0% {
            transform: translate3d(-100%, -100%, 0) rotate(35deg);
          }
          100% {
            transform: translate3d(200%, 200%, 0) rotate(35deg);
          }
        }
      `}</style>

      {/* ── 1. DEEP SMOKY CHARCOAL BASE VIGNETTE ── */}
      <div className="absolute inset-0 bg-[#0c1017] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(30,41,59,0.8),rgba(12,16,23,0.98))]" />

      {/* ── 2. SMOKY AMBIENT FOG & MIST AURAS ── */}
      <div
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-amber-500/15 via-orange-600/10 to-transparent blur-[140px] will-change-transform"
        style={{ animation: "smokyMistSlow 16s ease-in-out infinite" }}
      />
      <div
        className="absolute top-1/3 -right-32 w-[650px] h-[650px] rounded-full bg-gradient-to-bl from-yellow-500/15 via-amber-600/10 to-transparent blur-[150px] will-change-transform"
        style={{ animation: "smokyMistFast 18s ease-in-out infinite" }}
      />
      <div
        className="absolute -bottom-40 left-1/4 w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-emerald-600/10 via-amber-500/10 to-transparent blur-[160px] will-change-transform"
        style={{ animation: "smokyMistSlow 20s ease-in-out infinite reverse" }}
      />

      {/* ── 3. VISCOUS LIQUID GOLDEN OIL SPILL BLOBS (LAYER 1 - TOP RIGHT) ── */}
      <div
        className="absolute -top-24 right-4 sm:right-16 w-[340px] sm:w-[480px] h-[340px] sm:h-[480px] will-change-transform opacity-60"
        style={{
          background: "radial-gradient(circle at 35% 35%, rgba(253, 224, 71, 0.45) 0%, rgba(245, 158, 11, 0.35) 45%, rgba(180, 83, 9, 0.2) 75%, transparent 100%)",
          filter: "blur(40px)",
          animation: "oilSpillFlow1 22s ease-in-out infinite"
        }}
      />

      {/* ── 4. VISCOUS LIQUID GOLDEN OIL SPILL BLOBS (LAYER 2 - CENTER LEFT) ── */}
      <div
        className="absolute top-1/2 -left-20 w-[380px] sm:w-[520px] h-[380px] sm:h-[520px] will-change-transform opacity-50"
        style={{
          background: "radial-gradient(circle at 60% 40%, rgba(251, 191, 36, 0.4) 0%, rgba(217, 119, 6, 0.3) 50%, rgba(146, 64, 14, 0.15) 80%, transparent 100%)",
          filter: "blur(45px)",
          animation: "oilSpillFlow2 26s ease-in-out infinite"
        }}
      />

      {/* ── 5. VISCOUS LIQUID GOLDEN OIL SPILL BLOBS (LAYER 3 - BOTTOM RIGHT) ── */}
      <div
        className="absolute bottom-10 right-10 sm:right-1/4 w-[320px] sm:w-[460px] h-[320px] sm:h-[460px] will-change-transform opacity-55"
        style={{
          background: "radial-gradient(circle at 40% 60%, rgba(254, 240, 138, 0.35) 0%, rgba(245, 158, 11, 0.28) 45%, rgba(180, 83, 9, 0.12) 80%, transparent 100%)",
          filter: "blur(38px)",
          animation: "oilSpillFlow3 20s ease-in-out infinite"
        }}
      />

      {/* ── 6. ORGANIC LIQUID OIL FLOW SVG PATH (PRECISE FLUID SPILL SILHOUETTE) ── */}
      <svg
        className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="oilStreamGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#B45309" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="oilStreamGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3" />
            <stop offset="60%" stopColor="#D97706" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#78350F" stopOpacity="0" />
          </linearGradient>
          <filter id="oilGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="18" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient flowing viscous oil stream ribbons */}
        <path
          d="M -100,200 C 300,100 500,450 900,300 C 1300,150 1500,500 1800,350 L 1800,800 L -100,800 Z"
          fill="url(#oilStreamGrad1)"
          filter="url(#oilGlow)"
          className="opacity-70"
        />
        <path
          d="M -100,600 C 400,750 700,500 1100,680 C 1500,860 1700,600 2000,720 L 2000,1400 L -100,1400 Z"
          fill="url(#oilStreamGrad2)"
          filter="url(#oilGlow)"
          className="opacity-60"
        />
      </svg>

      {/* ── 7. CONTINUOUS CONCENTRIC GOLDEN OIL RIPPLE WAVES ── */}
      <div className="absolute top-[28%] left-[65%] w-0 h-0 pointer-events-none">
        <div
          className="absolute rounded-full border border-amber-400/40 will-change-transform"
          style={{
            width: "360px",
            height: "360px",
            boxShadow: "0 0 25px rgba(245, 158, 11, 0.2), inset 0 0 15px rgba(251, 191, 36, 0.15)",
            animation: "oilRippleSmooth 8s cubic-bezier(0.1, 0.8, 0.3, 1) infinite"
          }}
        />
        <div
          className="absolute rounded-full border border-yellow-300/30 will-change-transform"
          style={{
            width: "360px",
            height: "360px",
            boxShadow: "0 0 30px rgba(253, 224, 71, 0.15)",
            animation: "oilRippleSmooth 8s cubic-bezier(0.1, 0.8, 0.3, 1) infinite 4s"
          }}
        />
      </div>

      <div className="absolute top-[68%] left-[22%] w-0 h-0 pointer-events-none">
        <div
          className="absolute rounded-full border border-amber-500/35 will-change-transform"
          style={{
            width: "420px",
            height: "420px",
            animation: "oilRippleSmooth 9s cubic-bezier(0.1, 0.8, 0.3, 1) infinite 2s"
          }}
        />
        <div
          className="absolute rounded-full border border-yellow-400/25 will-change-transform"
          style={{
            width: "420px",
            height: "420px",
            animation: "oilRippleSmooth 9s cubic-bezier(0.1, 0.8, 0.3, 1) infinite 6.5s"
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
            background: "radial-gradient(circle at 35% 30%, rgba(254, 240, 138, 0.85) 0%, rgba(245, 158, 11, 0.75) 45%, rgba(180, 83, 9, 0.5) 85%)",
            boxShadow: "0 4px 14px rgba(217, 119, 6, 0.35), inset 0 1px 3px rgba(255, 255, 255, 0.6)",
            animation: `floatOilBead ${d.duration} ease-in-out infinite ${d.delay}`,
            "--drift-x": d.driftX,
            filter: d.size > 30 ? "blur(0.5px)" : "none"
          }}
        >
          {/* Internal specular highlight reflection */}
          <div className="absolute top-1 left-1 w-1.5 h-1 rounded-full bg-white/70 transform -rotate-25" />
        </div>
      ))}

      {/* ── 9. SUBTLE GLASS OVERLAY FOR LUXURY SMOKY SHEEN ── */}
      <div className="absolute inset-0 backdrop-blur-[0.5px] bg-gradient-to-b from-transparent via-[#0c1017]/30 to-[#0c1017]/80" />
    </div>
  );
};

export default SmokyOilSpillBackground;
