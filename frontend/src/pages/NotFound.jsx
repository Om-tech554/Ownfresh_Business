import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import SEO from "../components/SEO";
import { Home, ShoppingBag, ArrowLeft, Search, Phone } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F14] text-slate-800 dark:text-[#F5F7FA] font-sans flex flex-col justify-between">
      <SEO
        title="404 Page Not Found"
        description="The page you requested could not be found. Explore our authentic stone pressed edible oils range."
        noindex={true}
      />
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-24 sm:py-32">
        <div className="max-w-2xl w-full bg-white dark:bg-[#151B23] border border-slate-200 dark:border-[#27313D] rounded-3xl p-8 sm:p-12 text-center shadow-xl space-y-6">
          <span className="text-7xl sm:text-9xl font-black text-[#1E971D] dark:text-[#FFD600] tracking-tighter block">
            404
          </span>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-[#F7F9FC] tracking-tight">
              Looking for Pure Stone Pressed Oils?
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-[#8C97A6] max-w-md mx-auto leading-relaxed">
              We could not find the page you were looking for. It might have been moved, renamed, or is temporarily unavailable.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1E971D] hover:bg-[#167415] text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-95"
            >
              <Home className="w-4 h-4" />
              Return Home
            </Link>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-[#1D2530] text-slate-800 dark:text-[#F7F9FC] border border-slate-200 dark:border-[#34404E] hover:border-[#1E971D] font-bold rounded-xl text-sm transition-all shadow-xs active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              Shop All Oils
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-[#1C232D] text-slate-700 dark:text-[#B7C1CE] hover:text-[#1E971D] font-bold rounded-xl text-sm transition-all active:scale-95"
            >
              <Phone className="w-4 h-4" />
              Contact Pune Facility
            </Link>
          </div>

          <div className="border-t border-slate-100 dark:border-[#202832] pt-6 mt-6">
            <p className="text-xs font-bold text-slate-400 dark:text-[#818C9B] uppercase tracking-widest mb-3">
              Explore Our Authentic Stone Pressed Oils:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold">
              <Link to="/groundnut-oil" className="px-3 py-1.5 bg-slate-100 dark:bg-[#1A212B] hover:bg-[#1E971D] hover:text-white rounded-lg transition-colors">
                Groundnut Oil
              </Link>
              <Link to="/mustard-oil" className="px-3 py-1.5 bg-slate-100 dark:bg-[#1A212B] hover:bg-[#1E971D] hover:text-white rounded-lg transition-colors">
                Mustard Oil
              </Link>
              <Link to="/sesame-oil" className="px-3 py-1.5 bg-slate-100 dark:bg-[#1A212B] hover:bg-[#1E971D] hover:text-white rounded-lg transition-colors">
                Sesame Oil
              </Link>
              <Link to="/coconut-oil" className="px-3 py-1.5 bg-slate-100 dark:bg-[#1A212B] hover:bg-[#1E971D] hover:text-white rounded-lg transition-colors">
                Coconut Oil
              </Link>
              <Link to="/safflower-oil" className="px-3 py-1.5 bg-slate-100 dark:bg-[#1A212B] hover:bg-[#1E971D] hover:text-white rounded-lg transition-colors">
                Safflower Oil
              </Link>
              <Link to="/sunflower-oil" className="px-3 py-1.5 bg-slate-100 dark:bg-[#1A212B] hover:bg-[#1E971D] hover:text-white rounded-lg transition-colors">
                Sunflower Oil
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
