import React from "react";

/**
 * OilFlowAnimation — A lightweight, premium SVG/CSS background animation
 * simulating golden, pure stone-pressed botanical oil flowing with organic
 * liquid curves, gentle ripples, and glowing translucent micro-droplets.
 */
const OilFlowAnimation = ({ className = "" }) => {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none z-0 ${className}`}
    >
      {/* Background radial warmth glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-[#FFD700]/15 via-[#F59E0B]/10 to-transparent blur-3xl opacity-80 animate-pulse-slow" />
      <div className="absolute -bottom-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-gradient-to-tr from-[#24672E]/10 via-[#F59E0B]/15 to-transparent blur-3xl opacity-70" />

      {/* SVG Liquid Flow Waves */}
      <svg
        className="absolute inset-0 w-full h-full object-cover opacity-65 transition-opacity"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Rich Golden Botanical Oil Gradient 1 */}
          <linearGradient id="oilGradPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFBEB" stopOpacity="0.8" />
            <stop offset="40%" stopColor="#FDE68A" stopOpacity="0.4" />
            <stop offset="80%" stopColor="#F59E0B" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0.1" />
          </linearGradient>

          {/* Deep Amber Oil Flow Gradient 2 */}
          <linearGradient id="oilGradSecondary" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#FBBF24" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#B45309" stopOpacity="0.08" />
          </linearGradient>

          {/* Liquid Droplet Specular Gradient */}
          <radialGradient id="dropletSpecular" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#FDE68A" stopOpacity="0.75" />
            <stop offset="80%" stopColor="#F59E0B" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0.2" />
          </radialGradient>
        </defs>

        {/* Organic Flow Wave Layer 1 (Bottom Liquid Flow) */}
        <path
          className="oil-wave-flow-1"
          fill="url(#oilGradPrimary)"
          d="M0,720 C240,680 480,780 720,730 C960,680 1200,760 1440,710 L1440,900 L0,900 Z"
        />

        {/* Organic Flow Wave Layer 2 (Middle Liquid Curve) */}
        <path
          className="oil-wave-flow-2"
          fill="url(#oilGradSecondary)"
          d="M0,780 C320,740 600,820 900,770 C1140,730 1320,800 1440,760 L1440,900 L0,900 Z"
        />

        {/* Top Floating Liquid Stream */}
        <path
          className="oil-stream-top"
          fill="url(#oilGradSecondary)"
          d="M0,0 L1440,0 L1440,120 C1180,180 920,80 640,140 C400,190 180,110 0,160 Z"
        />
      </svg>

      {/* Floating Translucent Golden Oil Droplets */}
      <div className="absolute inset-0">
        {/* Droplet 1 (Top Left) */}
        <div
          className="oil-drop droplet-1 absolute top-[18%] left-[12%] w-7 h-7 rounded-full shadow-inner"
          style={{ background: "radial-gradient(circle at 35% 35%, #ffffff 0%, #FDE047 35%, #F59E0B 75%, #D97706 100%)", opacity: 0.75 }}
        >
          <div className="w-2 h-1 bg-white rounded-full mt-1 ml-1.5 opacity-80" />
        </div>

        {/* Droplet 2 (Center Right) */}
        <div
          className="oil-drop droplet-2 absolute top-[38%] right-[10%] w-10 h-10 rounded-full shadow-inner"
          style={{ background: "radial-gradient(circle at 35% 35%, #ffffff 0%, #FEF08A 30%, #F59E0B 70%, #B45309 100%)", opacity: 0.65 }}
        >
          <div className="w-2.5 h-1.5 bg-white rounded-full mt-1.5 ml-2 opacity-85" />
        </div>

        {/* Droplet 3 (Bottom Left Micro) */}
        <div
          className="oil-drop droplet-3 absolute bottom-[22%] left-[8%] w-5 h-5 rounded-full shadow-inner"
          style={{ background: "radial-gradient(circle at 35% 35%, #ffffff 0%, #FDE68A 35%, #F59E0B 80%, #D97706 100%)", opacity: 0.7 }}
        >
          <div className="w-1.5 h-0.5 bg-white rounded-full mt-1 ml-1 opacity-70" />
        </div>

        {/* Droplet 4 (Bottom Right) */}
        <div
          className="oil-drop droplet-4 absolute bottom-[15%] right-[18%] w-8 h-8 rounded-full shadow-inner"
          style={{ background: "radial-gradient(circle at 35% 35%, #ffffff 0%, #FEF08A 30%, #F59E0B 75%, #D97706 100%)", opacity: 0.6 }}
        >
          <div className="w-2 h-1 bg-white rounded-full mt-1.5 ml-1.5 opacity-75" />
        </div>

        {/* Golden Organic Liquid Ripple Ring */}
        <div className="oil-ripple absolute top-[28%] right-[22%] w-24 h-24 rounded-full border-2 border-amber-300/30 opacity-40 animate-ping-slow pointer-events-none" />
        <div className="oil-ripple absolute bottom-[30%] left-[16%] w-20 h-20 rounded-full border-2 border-yellow-400/25 opacity-35 animate-ping-slow-delayed pointer-events-none" />
      </div>

      {/* Embedded High-Performance Liquid CSS Animation Keyframes */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes oilWave1 {
            0% { transform: translate3d(0, 0, 0) scaleY(1); }
            50% { transform: translate3d(-3%, 12px, 0) scaleY(1.05); }
            100% { transform: translate3d(0, 0, 0) scaleY(1); }
          }

          @keyframes oilWave2 {
            0% { transform: translate3d(0, 0, 0) scaleY(1); }
            50% { transform: translate3d(3%, -10px, 0) scaleY(0.96); }
            100% { transform: translate3d(0, 0, 0) scaleY(1); }
          }

          @keyframes oilStreamTop {
            0% { transform: translate3d(0, 0, 0) scaleX(1); }
            50% { transform: translate3d(2%, -6px, 0) scaleX(1.02); }
            100% { transform: translate3d(0, 0, 0) scaleX(1); }
          }

          @keyframes floatDrop1 {
            0% { transform: translate3d(0, 0, 0) rotate(0deg); }
            50% { transform: translate3d(6px, -18px, 0) rotate(6deg); }
            100% { transform: translate3d(0, 0, 0) rotate(0deg); }
          }

          @keyframes floatDrop2 {
            0% { transform: translate3d(0, 0, 0) rotate(0deg); }
            50% { transform: translate3d(-8px, -22px, 0) rotate(-8deg); }
            100% { transform: translate3d(0, 0, 0) rotate(0deg); }
          }

          @keyframes floatDrop3 {
            0% { transform: translate3d(0, 0, 0); }
            50% { transform: translate3d(5px, -12px, 0); }
            100% { transform: translate3d(0, 0, 0); }
          }

          @keyframes floatDrop4 {
            0% { transform: translate3d(0, 0, 0); }
            50% { transform: translate3d(-6px, -16px, 0); }
            100% { transform: translate3d(0, 0, 0); }
          }

          @keyframes pulseSlow {
            0%, 100% { opacity: 0.7; transform: scale(1); }
            50% { opacity: 0.95; transform: scale(1.06); }
          }

          @keyframes pingSlow {
            0% { transform: scale(0.85); opacity: 0.5; }
            50% { transform: scale(1.18); opacity: 0.15; }
            100% { transform: scale(1.35); opacity: 0; }
          }

          .oil-wave-flow-1 {
            animation: oilWave1 14s ease-in-out infinite;
            transform-origin: center bottom;
          }

          .oil-wave-flow-2 {
            animation: oilWave2 18s ease-in-out infinite;
            transform-origin: center bottom;
          }

          .oil-stream-top {
            animation: oilStreamTop 20s ease-in-out infinite;
            transform-origin: center top;
          }

          .droplet-1 { animation: floatDrop1 7s ease-in-out infinite; }
          .droplet-2 { animation: floatDrop2 9s ease-in-out infinite 1s; }
          .droplet-3 { animation: floatDrop3 6s ease-in-out infinite 0.5s; }
          .droplet-4 { animation: floatDrop4 8s ease-in-out infinite 1.5s; }

          .animate-pulse-slow { animation: pulseSlow 8s ease-in-out infinite; }
          .animate-ping-slow { animation: pingSlow 6s cubic-bezier(0, 0, 0.2, 1) infinite; }
          .animate-ping-slow-delayed { animation: pingSlow 7s cubic-bezier(0, 0, 0.2, 1) infinite 2.5s; }

          @media (prefers-reduced-motion: reduce) {
            .oil-wave-flow-1,
            .oil-wave-flow-2,
            .oil-stream-top,
            .oil-drop,
            .animate-pulse-slow,
            .animate-ping-slow,
            .animate-ping-slow-delayed {
              animation: none !important;
            }
          }
        `
      }} />
    </div>
  );
};

export default OilFlowAnimation;
