import React, { useState } from "react";
import { Thermometer, Utensils, CheckCircle2, Flame, ArrowRight, Heart, Droplets } from "lucide-react";
import { useNavigate } from "react-router-dom";

const OIL_DATA = [
  {
    name: "Stone-Pressed Groundnut Oil",
    category: "Groundnut Oil",
    smokePoint: "225°C (437°F)",
    aroma: "Nutty, Rich & Roasted",
    bestFor: "Deep Frying, Puris, Daily Curries, Sautéing",
    keyBioactive: "Resveratrol & High MUFA (Oleic Acid)",
    intensity: "Medium",
    rating: "5.0 ★"
  },
  {
    name: "Kacchi Ghani Mustard Oil",
    category: "Mustard Oil",
    smokePoint: "250°C (482°F)",
    aroma: "Sharp, Pungent & Warm",
    bestFor: "Authentic North Indian & Bengali Curries, Pickles, Tadka, Massage",
    keyBioactive: "Allyl Isothiocyanate & Omega-3 (ALA)",
    intensity: "Bold",
    rating: "5.0 ★"
  },
  {
    name: "Virgin Coconut Oil",
    category: "Coconut Oil",
    smokePoint: "177°C (350°F)",
    aroma: "Sweet, Fresh & Tropical",
    bestFor: "South Indian Cooking, Baking, Bulletproof Coffee, Hair Scalp & Skin",
    keyBioactive: "50%+ Lauric Acid & Medium Chain Triglycerides",
    intensity: "Aromatic",
    rating: "4.9 ★"
  },
  {
    name: "Stone-Pressed Sesame (Til) Oil",
    category: "Sesame Oil",
    smokePoint: "210°C (410°F)",
    aroma: "Earthy, Nutty & Toasted",
    bestFor: "South Indian Tadka (Sambar/Rasam), Idli-Podi, Oil Pulling, Abhyanga",
    keyBioactive: "Sesamol & Sesamin Lignans",
    intensity: "Rich",
    rating: "5.0 ★"
  },
  {
    name: "Stone-Pressed Sunflower Oil",
    category: "Sunflower Oil",
    smokePoint: "225°C (440°F)",
    aroma: "Mild, Light & Neutral",
    bestFor: "All-Round Everyday Cooking, Stir-Frying, Baking, Salad Dressings",
    keyBioactive: "High Vitamin E & Essential Omega-6",
    intensity: "Light",
    rating: "4.9 ★"
  },
  {
    name: "Stone-Pressed Safflower (Kardi) Oil",
    category: "Safflower Oil",
    smokePoint: "232°C (450°F)",
    aroma: "Subtle Nutty & Clean",
    bestFor: "Cardiac & Diabetic Diets, Roasting, Sautéing, Healthy Cooking",
    keyBioactive: "High Oleic Fatty Acids & Plant Sterols",
    intensity: "Mild",
    rating: "4.9 ★"
  }
];

const OilSelectionChart = () => {
  const navigate = useNavigate();
  const [selectedOil, setSelectedOil] = useState(OIL_DATA[0]);

  return (
    <section className="w-full bg-[#FAF9F5] py-12 sm:py-16 md:py-24 px-4 sm:px-8 md:px-12 lg:px-24 font-sans border-b border-stone-200/60">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-14">
          <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-[#1E971D] bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5 mb-2.5">
            <Thermometer size={13} className="text-[#1E971D]" /> Temperature &amp; Culinary Guide
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tight font-serif">
            Oil Selection &amp; <span className="text-[#1E971D]">Smoke Point</span> Guide
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-slate-600 font-medium mt-2 leading-relaxed">
            Selecting the right cooking oil ensures maximum retention of vitamins, avoids toxic smoke degradation, and elevates every recipe.
          </p>
        </div>

        {/* Mobile Cards View (< md) */}
        <div className="md:hidden space-y-4">
          {OIL_DATA.map((oil, idx) => (
            <div
              key={idx}
              className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Droplets size={16} className="text-[#1E971D] shrink-0" />
                    <h3 className="font-extrabold text-slate-900 text-sm">{oil.name}</h3>
                  </div>
                  <span className="font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] whitespace-nowrap shrink-0">
                    {oil.smokePoint}
                  </span>
                </div>

                <p className="text-xs text-slate-700 font-semibold mb-1.5">
                  <strong className="text-slate-400 font-bold uppercase text-[9px] block">Best For:</strong>
                  {oil.bestFor}
                </p>

                <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 font-medium pt-2 border-t border-slate-100">
                  <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-700">Aroma: {oil.aroma}</span>
                  <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md border border-amber-100">{oil.keyBioactive}</span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-end">
                <button
                  onClick={() => navigate(`/shop?category=${encodeURIComponent(oil.category)}`)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-[#1E971D] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <span>Shop {oil.category}</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Desktop & Tablet Table (>= md) */}
        <div className="hidden md:block bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-white font-black text-[11px] uppercase tracking-wider">
                  <th className="p-4 md:p-5">Oil Variety</th>
                  <th className="p-4 md:p-5">Smoke Point</th>
                  <th className="p-4 md:p-5">Aroma Profile</th>
                  <th className="p-4 md:p-5">Best Culinary Preparations</th>
                  <th className="p-4 md:p-5">Key Bioactive Compound</th>
                  <th className="p-4 md:p-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {OIL_DATA.map((oil, idx) => (
                  <tr
                    key={idx}
                    className={`hover:bg-emerald-50/40 transition-colors ${
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                    }`}
                  >
                    <td className="p-4 md:p-5 font-extrabold text-slate-900">
                      <div className="flex items-center gap-2">
                        <Droplets size={16} className="text-[#1E971D]" />
                        <span>{oil.name}</span>
                      </div>
                    </td>
                    <td className="p-4 md:p-5">
                      <span className="font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full text-[11px]">
                        {oil.smokePoint}
                      </span>
                    </td>
                    <td className="p-4 md:p-5 font-semibold text-slate-600">
                      {oil.aroma}
                    </td>
                    <td className="p-4 md:p-5 text-slate-800 font-semibold max-w-xs">
                      {oil.bestFor}
                    </td>
                    <td className="p-4 md:p-5 text-slate-600 font-medium">
                      {oil.keyBioactive}
                    </td>
                    <td className="p-4 md:p-5 text-right">
                      <button
                        onClick={() => navigate(`/shop?category=${encodeURIComponent(oil.category)}`)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-[#1E971D] text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer"
                      >
                        <span>Shop</span>
                        <ArrowRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OilSelectionChart;
