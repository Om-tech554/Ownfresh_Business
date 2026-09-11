import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, Sparkles, ShieldCheck, ArrowRight, X, Award } from "lucide-react";
import SLink from "../SLink";

const FloatingOilSpill = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [ripples, setRipples] = useState([]);
  const [isHovered, setIsHovered] = useState(false);

  // Trigger interactive splash ripple on click
  const triggerRipple = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple = { id: Date.now(), x, y };

    setRipples((prev) => [...prev.slice(-4), newRipple]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 1800);
  };

  return (
    <>
      {/* ── EMBEDDED LIQUID OIL KEYFRAMES ── */}
      <style>{`
        @keyframes oilSpillMorph {
          0%, 100% {
            border-radius: 62% 38% 70% 30% / 45% 65% 35% 55%;
            transform: rotate(0deg) scale(1);
          }
          33% {
            border-radius: 40% 60% 35% 65% / 60% 40% 60% 40%;
            transform: rotate(120deg) scale(1.05);
          }
          66% {
            border-radius: 65% 35% 55% 45% / 35% 65% 45% 55%;
            transform: rotate(240deg) scale(0.96);
          }
        }

        @keyframes oilRippleRing {
          0% {
            transform: scale(0.6);
            opacity: 0.85;
            border-width: 3px;
          }
          50% {
            opacity: 0.45;
          }
          100% {
            transform: scale(2.6);
            opacity: 0;
            border-width: 1px;
          }
        }

        @keyframes oilDropletFloat {
          0% {
            transform: translateY(0px) scale(0.8);
            opacity: 0;
          }
          40% {
            opacity: 0.9;
            transform: translateY(-20px) scale(1.1);
          }
          100% {
            transform: translateY(-45px) scale(0.6);
            opacity: 0;
          }
        }

        @keyframes liquidShine {
          0% {
            transform: translateX(-150%) skewX(-25deg);
          }
          100% {
            transform: translateX(250%) skewX(-25deg);
          }
        }
      `}</style>

      {/* ── FLOATING OIL SPILL WIDGET CONTAINER ── */}
      <div className="fixed bottom-24 sm:bottom-8 right-5 sm:right-8 z-40 flex flex-col items-end select-none">
        
        {/* EXPANDABLE PURITY POPUP DRAWER */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="mb-4 w-[310px] sm:w-[350px] bg-slate-900/90 backdrop-blur-2xl p-6 rounded-3xl shadow-2xl border border-amber-500/30 text-white relative overflow-hidden"
            >
              {/* Golden Ambient Liquid Sheen in Background */}
              <div className="absolute -top-16 -right-16 w-36 h-36 bg-gradient-to-br from-amber-400/20 to-yellow-300/10 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/30">
                    <Droplets size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">100% Stone-Pressed</h4>
                    <p className="text-[10px] text-amber-300 font-bold">Fresh Kolhu Extraction</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="py-4 space-y-3 text-xs">
                <div className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-white/5 border border-white/10">
                  <ShieldCheck size={18} className="text-[#1E971D] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-extrabold text-white text-[11px] leading-snug">Zero Heat & Zero Chemicals</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Retains 100% natural vitamins, antioxidants, and authentic taste.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-white/5 border border-white/10">
                  <Award size={18} className="text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-extrabold text-white text-[11px] leading-snug">Bottled Fresh in Small Batches</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Cold stone extraction delivers raw unrefined purity straight to your kitchen.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <SLink
                  to="/shop"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-center text-[10px] uppercase tracking-widest rounded-xl shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  Explore More Oils <ArrowRight size={13} />
                </SLink>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── THE LIQUID OIL SPILL & RIPPLE BUTTON ── */}
        <div className="relative flex items-center justify-center group">
          
          {/* CONCENTRIC OIL RIPPLE WAVE 1 */}
          <div
            className="absolute -inset-3 rounded-full border border-amber-400/60 pointer-events-none"
            style={{
              animation: "oilRippleRing 3s cubic-bezier(0.1, 0.8, 0.3, 1) infinite",
              boxShadow: "0 0 15px rgba(245, 158, 11, 0.25)"
            }}
          />

          {/* CONCENTRIC OIL RIPPLE WAVE 2 (DELAYED) */}
          <div
            className="absolute -inset-3 rounded-full border border-yellow-400/50 pointer-events-none"
            style={{
              animation: "oilRippleRing 3s cubic-bezier(0.1, 0.8, 0.3, 1) infinite 1.5s",
              boxShadow: "0 0 20px rgba(251, 191, 36, 0.2)"
            }}
          />

          {/* AMBIENT FLOATING MICRO-DROPLETS */}
          <div
            className="absolute -top-3 left-2 w-2 h-2.5 rounded-full bg-gradient-to-t from-amber-500 to-yellow-300 pointer-events-none shadow-xs"
            style={{ animation: "oilDropletFloat 2.4s ease-out infinite" }}
          />
          <div
            className="absolute -top-4 right-2 w-1.5 h-2 rounded-full bg-gradient-to-t from-amber-400 to-yellow-200 pointer-events-none shadow-xs"
            style={{ animation: "oilDropletFloat 2.8s ease-out infinite 1.2s" }}
          />

          {/* MAIN MORPHING LIQUID SPILL ORB */}
          <motion.button
            onClick={(e) => {
              triggerRipple(e);
              setIsOpen(!isOpen);
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center cursor-pointer shadow-2xl transition-all duration-300 overflow-hidden"
            style={{
              background: "radial-gradient(circle at 35% 30%, #FDE047 0%, #F59E0B 45%, #D97706 75%, #92400E 100%)",
              animation: "oilSpillMorph 8s ease-in-out infinite",
              boxShadow: isHovered
                ? "0 10px 30px rgba(217, 119, 6, 0.6), inset 0 2px 6px rgba(255, 255, 255, 0.6)"
                : "0 8px 24px rgba(217, 119, 6, 0.45), inset 0 2px 4px rgba(255, 255, 255, 0.5)"
            }}
            title="100% Pure Cold-Pressed Oil Guarantee"
            aria-label="Pure Cold-Pressed Oil Info"
          >
            {/* Glossy Liquid Shine Highlight Reflection */}
            <div
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)",
                animation: "liquidShine 4s infinite"
              }}
            />

            {/* Micro Golden Glow Core */}
            <div className="absolute top-1.5 left-2 w-4 h-2 rounded-full bg-white/60 blur-[1px] transform -rotate-12 pointer-events-none" />

            {/* Interactive Click Ripple Rings Container */}
            {ripples.map((rip) => (
              <span
                key={rip.id}
                className="absolute rounded-full pointer-events-none bg-white/40"
                style={{
                  left: rip.x - 20,
                  top: rip.y - 20,
                  width: 40,
                  height: 40,
                  animation: "oilRippleRing 1.5s ease-out forwards"
                }}
              />
            ))}

            {/* Icon Content */}
            <motion.div
              animate={{ rotate: isHovered ? 15 : 0 }}
              className="relative z-10 text-white flex flex-col items-center justify-center drop-shadow-md"
            >
              <Droplets size={22} className="stroke-[2.5]" />
              <span className="text-[7px] font-black uppercase tracking-tighter text-amber-950 mt-0.5 font-mono">
                PURE
              </span>
            </motion.div>
          </motion.button>
        </div>
      </div>
    </>
  );
};

export default FloatingOilSpill;
