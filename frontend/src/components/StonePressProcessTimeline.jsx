import React, { useState } from "react";
import { Check, X, ShieldCheck, RotateCcw, Droplets, Sparkles, Award, Leaf } from "lucide-react";
import SLink from "./SLink";

const STEPS = [
  {
    num: "01",
    title: "Single-Origin Seed Selection",
    desc: "We partner directly with certified Indian farmers, sourcing sun-dried whole kernels (Groundnut, Mustard, Coconut, Sesame) tested for zero aflatoxins.",
    badge: "100% Whole Seeds"
  },
  {
    num: "02",
    title: "Granite Stone Kolhu Churning",
    desc: "Seeds are placed in heavy stone mortars where a natural pestle rotates slowly at 14–16 RPM without any friction-induced heat build-up.",
    badge: "Slow 14-16 RPM"
  },
  {
    num: "03",
    title: "Zero-Heat (<40°C) Cold Flow",
    desc: "The unheated oil seeps naturally under gentle mechanical pressure, preserving all native polyphenols, Tocopherols (Vit E), and aromas.",
    badge: "Cold Extracted"
  },
  {
    num: "04",
    title: "Micro-Cotton Cloth Filtration",
    desc: "Naturally settled in stainless tanks for 24 hours, then passed through pure cotton sheets. Absolutely zero chemical bleaching or synthetic clays.",
    badge: "Zero Chemical Bleach"
  },
  {
    num: "05",
    title: "UV-Shield Fresh Bottling",
    desc: "Bottled directly into airtight, food-grade UV protected containers to ensure the oil reaches your kitchen at the peak of living nutrition.",
    badge: "Airtight & Fresh"
  }
];

const COMPARISON = [
  {
    feature: "Extraction Temperature",
    stone: "Room Temperature (<40°C)",
    refined: "High Heat (>200°C) Destroying Nutrients"
  },
  {
    feature: "Chemical Solvents (Hexane)",
    stone: "Zero (100% Pure Mechanical Press)",
    refined: "Hexane solvent used to strip oil"
  },
  {
    feature: "Refining & Bleaching Clays",
    stone: "Natural Cotton Cloth Filtration Only",
    refined: "Bleached with acid & activated clays"
  },
  {
    feature: "Deodorization",
    stone: "Original Rich Nutty/Pungent Aroma",
    refined: "Artificially stripped to odorless fluid"
  },
  {
    feature: "Antioxidants & Vitamins",
    stone: "100% Intact (Resveratrol, Sesamol, Vit E)",
    refined: "Almost entirely stripped during heating"
  }
];

const StonePressProcessTimeline = () => {
  const [activeView, setActiveView] = useState("process"); // 'process' or 'comparison'

  return (
    <section className="w-full bg-white py-12 sm:py-16 md:py-24 px-4 sm:px-8 md:px-12 lg:px-24 border-b border-stone-200/60 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Section Header with View Toggle */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4 sm:gap-6">
          <div>
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-[#1E971D] bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5 mb-2.5">
              <RotateCcw size={13} className="text-[#1E971D]" /> Farm-To-Bottle Transparency
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tight font-serif">
              How Our <span className="text-[#1E971D]">Stone-Pressed</span> Oils Are Made
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-600 font-medium mt-2 max-w-2xl leading-relaxed">
              We preserve ancient Indian extraction wisdom using slow granite stone mills (Kolhu / Ghani) to deliver living, unadulterated oils that nurture your family’s health.
            </p>
          </div>

          {/* View Toggle Switch */}
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 self-stretch sm:self-start md:self-end border border-slate-200">
            <button
              onClick={() => setActiveView("process")}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
                activeView === "process"
                  ? "bg-[#1E971D] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              5-Step Process
            </button>
            <button
              onClick={() => setActiveView("comparison")}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
                activeView === "comparison"
                  ? "bg-[#1E971D] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Stone-Pressed vs Refined
            </button>
          </div>
        </div>

        {/* VIEW 1: 5-STEP PROCESS ROADMAP */}
        {activeView === "process" && (
          <div className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              {STEPS.map((step, idx) => (
                <div
                  key={idx}
                  className="relative bg-[#FAF9F5] border border-stone-200 rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-300 group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <span className="text-2xl sm:text-3xl font-black text-[#1E971D] font-mono tracking-tighter">
                        {step.num}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-100/80 text-[#1E971D] border border-emerald-200">
                        {step.badge}
                      </span>
                    </div>

                    <h3 className="text-sm font-black uppercase tracking-wide text-slate-900 mb-1.5 sm:mb-2 leading-snug">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      {step.desc}
                    </p>
                  </div>

                  <div className="mt-4 sm:mt-6 pt-3 border-t border-stone-200/80 flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Phase {idx + 1}</span>
                    <ShieldCheck size={14} className="text-[#1E971D]" />
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Key Metric Strip */}
            <div className="p-5 sm:p-6 md:p-8 bg-slate-900 text-white rounded-2xl sm:rounded-3xl grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center shadow-md">
              <div>
                <span className="text-xl sm:text-2xl md:text-3xl font-black text-[#EFDB27] block font-mono">14–16</span>
                <span className="text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400 mt-1 block">Kolhu RPM Rotation</span>
              </div>
              <div>
                <span className="text-xl sm:text-2xl md:text-3xl font-black text-[#EFDB27] block font-mono">&lt; 40°C</span>
                <span className="text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400 mt-1 block">Room Temp Extraction</span>
              </div>
              <div>
                <span className="text-xl sm:text-2xl md:text-3xl font-black text-[#EFDB27] block font-mono">100%</span>
                <span className="text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400 mt-1 block">Unrefined &amp; Pure</span>
              </div>
              <div>
                <span className="text-xl sm:text-2xl md:text-3xl font-black text-[#EFDB27] block font-mono">0%</span>
                <span className="text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400 mt-1 block">Chemical Solvents</span>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: STONE-PRESSED VS REFINED TABLE */}
        {activeView === "comparison" && (
          <div>
            {/* Desktop / Tablet Table View */}
            <div className="hidden md:block border border-slate-200 rounded-3xl overflow-hidden shadow-sm bg-white">
              <div className="grid grid-cols-3 p-5 bg-slate-900 text-white font-black text-xs uppercase tracking-wider">
                <span>Quality Factor</span>
                <span className="text-[#EFDB27] flex items-center gap-1.5"><ShieldCheck size={16} /> OwnFresh Stone-Pressed</span>
                <span className="text-slate-400 flex items-center gap-1.5"><X size={16} /> Commercial Refined Oil</span>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {COMPARISON.map((row, idx) => (
                  <div key={idx} className={`grid grid-cols-3 p-4 md:p-5 ${idx % 2 === 0 ? "bg-slate-50/50" : "bg-white"} items-center`}>
                    <span className="font-extrabold text-slate-900">{row.feature}</span>
                    <div className="flex items-center gap-2 text-emerald-800 font-bold">
                      <Check size={16} className="text-[#1E971D] shrink-0" />
                      <span>{row.stone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 font-medium">
                      <X size={16} className="text-red-500 shrink-0" />
                      <span>{row.refined}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden space-y-3">
              {COMPARISON.map((row, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-900 block mb-2.5 pb-2 border-b border-slate-100">
                    {row.feature}
                  </span>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-xl flex items-start gap-2">
                      <Check size={14} className="text-[#1E971D] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[9px] font-black uppercase text-[#1E971D] block">OwnFresh Stone-Pressed</span>
                        <span className="font-bold text-slate-800">{row.stone}</span>
                      </div>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-2">
                      <X size={14} className="text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[9px] font-black uppercase text-slate-400 block">Commercial Refined</span>
                        <span className="font-medium text-slate-600">{row.refined}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default StonePressProcessTimeline;
