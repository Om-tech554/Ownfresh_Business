import React from "react";
import { useNavigate } from "react-router-dom";
import { Flame, Sparkles, Heart, Leaf, Package, ArrowRight, Utensils } from "lucide-react";
import SLink from "./SLink";

const PURPOSES = [
  {
    id: "frying",
    title: "Daily Deep Frying & Cooking",
    subtitle: "High smoke point, neutral aroma, zero trans fats",
    recommendedOils: "Groundnut & Sunflower Oils",
    icon: Flame,
    color: "#D97706",
    bgLight: "bg-amber-50/80",
    borderCol: "border-amber-200",
    categoryFilter: "Groundnut Oil",
    badge: "High Smoke Point 225°C"
  },
  {
    id: "tadka",
    title: "Authentic Tadka & Pickling",
    subtitle: "Natural pungent kick & Allyl isothiocyanates",
    recommendedOils: "Mustard & Sesame (Til) Oils",
    icon: Utensils,
    color: "#CA8A04",
    bgLight: "bg-yellow-50/80",
    borderCol: "border-yellow-200",
    categoryFilter: "Mustard Oil",
    badge: "Antimicrobial & Pungent"
  },
  {
    id: "wellness",
    title: "South Indian & Hair / Body Care",
    subtitle: "50%+ Lauric acid MCTs & Ayurvedic Abhyanga",
    recommendedOils: "Virgin Coconut & Sesame Oils",
    icon: Leaf,
    color: "#16A34A",
    bgLight: "bg-emerald-50/80",
    borderCol: "border-emerald-200",
    categoryFilter: "Coconut Oil",
    badge: "50%+ Lauric Acid"
  },
  {
    id: "heart",
    title: "Heart & Diabetic Wellness",
    subtitle: "High oleic fatty acids for optimal lipid balance",
    recommendedOils: "Safflower (Kardi) & Groundnut Oils",
    icon: Heart,
    color: "#DC2626",
    bgLight: "bg-rose-50/80",
    borderCol: "border-rose-200",
    categoryFilter: "Safflower Oil",
    badge: "Cardiologist Favorite"
  },
  {
    id: "bundles",
    title: "All-Star Kitchen Bundles",
    subtitle: "Curated multi-oil sets for healthy households",
    recommendedOils: "Combo Packs of 3 & 5",
    icon: Package,
    color: "#4F46E5",
    bgLight: "bg-indigo-50/80",
    borderCol: "border-indigo-200",
    categoryFilter: "Combo pack",
    badge: "Up to 20% Value Savings"
  }
];

const ShopByPurpose = () => {
  const navigate = useNavigate();

  return (
    <section id="purpose-section" className="w-full bg-[#FAF9F5] dark:bg-[#0B0F14] py-12 sm:py-16 md:py-24 px-4 sm:px-8 md:px-12 lg:px-24 border-t border-b border-stone-200/60 dark:border-[#202832] font-sans transition-colors duration-250">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4 sm:gap-6">
          <div>
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-[#1E971D] dark:text-[#FFD600] bg-emerald-100/60 dark:bg-[#1D2530] border border-emerald-200/80 dark:border-[#303B48] px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5 mb-2.5">
              <Sparkles size={13} className="text-[#1E971D] dark:text-[#FFD600]" /> Intent-Based Oil Selection
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 dark:text-[#F8FAFC] uppercase tracking-tight font-serif">
              Shop by <span className="text-[#1E971D] dark:text-[#FFD600]">Culinary &amp; Health</span> Purpose
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-[#CBD5E1] font-medium mt-2 max-w-2xl leading-relaxed">
              Every stone-pressed oil has unique bioactive properties and temperature tolerance. Select your cooking style to discover the ideal oil for your kitchen.
            </p>
          </div>

          <SLink
            to="/shop"
            className="group inline-flex items-center justify-center gap-2 self-start md:self-end bg-slate-900 dark:bg-[#1D2530] hover:bg-[#1E971D] dark:hover:bg-[#FFD600] text-white dark:hover:text-[#111318] border border-transparent dark:border-[#303B48] font-black text-xs uppercase tracking-widest px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl transition-all duration-300 shadow-sm w-full sm:w-auto text-center cursor-pointer"
          >
            <span>Explore All Oils</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </SLink>
        </div>

        {/* Purpose Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {PURPOSES.map((purpose) => {
            const Icon = purpose.icon;
            return (
              <div
                key={purpose.id}
                onClick={() => navigate(`/shop?category=${encodeURIComponent(purpose.categoryFilter)}`)}
                className={`group relative ${purpose.bgLight} dark:bg-[#171D26] border ${purpose.borderCol} dark:border-[#27313D] dark:hover:border-[#FFD600]/50 rounded-2xl sm:rounded-3xl p-5 sm:p-7 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden active:scale-[0.99]`}
              >
                {/* Subtle Decorative Circle */}
                <div
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10 dark:opacity-20 blur-xl pointer-events-none"
                  style={{ backgroundColor: purpose.color }}
                />

                <div>
                  {/* Top Badge & Icon */}
                  <div className="flex items-center justify-between gap-2 mb-4 sm:mb-5">
                    <div
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white dark:bg-[#111720] shadow-xs border border-slate-200/80 dark:border-[#27313D] flex items-center justify-center transition-transform group-hover:scale-110 shrink-0"
                      style={{ color: purpose.color }}
                    >
                      <Icon size={20} />
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2.5 sm:px-3 py-1 bg-white/90 dark:bg-[#111720] rounded-full border border-slate-200/60 dark:border-[#27313D] text-slate-700 dark:text-[#CBD5E1] shadow-xs truncate max-w-[170px]">
                      {purpose.badge}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-[#F8FAFC] uppercase tracking-tight mb-1.5 sm:mb-2 group-hover:text-[#1E971D] dark:group-hover:text-[#FFD600] transition-colors leading-snug">
                    {purpose.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-[#94A3B8] font-medium leading-relaxed mb-3 sm:mb-4">
                    {purpose.subtitle}
                  </p>
                </div>

                {/* Bottom Recommendation & CTA */}
                <div className="pt-3.5 sm:pt-4 border-t border-slate-200/60 dark:border-[#27313D] flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-[#64748B] block">Recommended</span>
                    <span className="text-xs font-black text-slate-800 dark:text-[#F1F5F9] truncate block">{purpose.recommendedOils}</span>
                  </div>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-[#111720] group-hover:bg-[#1E971D] dark:group-hover:bg-[#FFD600] text-slate-700 dark:text-[#CBD5E1] group-hover:text-white dark:group-hover:text-[#111318] flex items-center justify-center transition-all shadow-xs shrink-0">
                    <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ShopByPurpose;
