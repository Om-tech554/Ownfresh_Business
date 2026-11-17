import React, { useState, useEffect } from "react";
import axios from "axios";
import { Power, ShieldCheck, AlertTriangle, RefreshCw, CheckCircle2, Info } from "lucide-react";
import toast from "react-hot-toast";
import { useConfirm } from "../../hooks/ConfirmContext.jsx";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:10000";

const GlobalOOSControl = ({ compact = false, onToggle = null }) => {
  const confirm = useConfirm();
  const [isGlobalOOS, setIsGlobalOOS] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/inventory/global-oos`);
      if (res.data.success) {
        setIsGlobalOOS(Boolean(res.data.isGlobalOOS));
      }
    } catch (error) {
      console.warn("Failed to fetch global OOS status:", error.message);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    // Listen to storage/custom events if updated from another tab/component
    const handleSync = (e) => {
      if (e.detail && typeof e.detail.isGlobalOOS === "boolean") {
        setIsGlobalOOS(e.detail.isGlobalOOS);
      } else {
        fetchStatus();
      }
    };
    window.addEventListener("global-oos-updated", handleSync);
    return () => window.removeEventListener("global-oos-updated", handleSync);
  }, []);

  const handleToggle = async () => {
    const nextState = !isGlobalOOS;

    const isConfirmed = await confirm({
      title: nextState
        ? "Switch All Products to Out of Stock?"
        : "Resume Normal Store Operations?",
      message: nextState
        ? "⚠️ This will set all products to 'Out of Stock' across the store and disable checkout.\n\n🛡️ GOOGLE SEO SAFE:\n• All 91 product URLs remain 100% indexed with HTTP 200 OK.\n• Schema.org availability is set to 'OutOfStock' (Google's official standard).\n• Sitemaps and canonical tags remain untouched.\n• Individual stock counts are safely preserved in database and will restore instantly when turned off."
        : "✅ This will resume normal purchasing operations. Products will become available based on their saved inventory counts.",
      type: nextState ? "danger" : "success",
      confirmText: nextState ? "Set Out of Stock (SEO Safe)" : "Resume Normal Operations",
      cancelText: "Cancel"
    });

    if (!isConfirmed) return;

    try {
      setLoading(true);
      const res = await axios.put(
        `${API_BASE_URL}/api/inventory/global-oos`,
        { enabled: nextState },
        { withCredentials: true }
      );

      if (res.data.success) {
        setIsGlobalOOS(nextState);
        toast.success(res.data.message || (nextState ? "All products marked Out of Stock" : "Store operations resumed"), {
          duration: 5000
        });

        // Broadcast to all other components on the page
        window.dispatchEvent(
          new CustomEvent("global-oos-updated", { detail: { isGlobalOOS: nextState } })
        );

        if (onToggle) {
          onToggle(nextState);
        }
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to update Out of Stock state";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-xl text-xs text-slate-400 font-bold animate-pulse">
        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Checking Stock Mode...
      </div>
    );
  }

  // COMPACT BUTTON MODE (Used in headers & toolbars)
  if (compact) {
    return (
      <div className="inline-flex items-center gap-2">
        <button
          onClick={handleToggle}
          disabled={loading}
          title="Master switch: Set all products Out of Stock while keeping 100% Google SEO indexing intact"
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-60 ${
            isGlobalOOS
              ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20 animate-pulse"
              : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#1D2530] dark:hover:bg-[#252F3D]"
          }`}
        >
          {loading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Power className="w-3.5 h-3.5" />
          )}
          <span>{isGlobalOOS ? "OOS Active (Click to Resume)" : "OOS Master Switch"}</span>
        </button>

        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
            isGlobalOOS
              ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50"
              : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50"
          }`}
        >
          {isGlobalOOS ? (
            <>
              <AlertTriangle className="w-3 h-3 text-rose-500" /> All OOS (SEO Safe)
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> In Stock (Normal)
            </>
          )}
        </span>
      </div>
    );
  }

  // FULL CARD / BANNER MODE
  return (
    <div
      className={`p-5 rounded-2xl border transition-all mb-6 ${
        isGlobalOOS
          ? "bg-rose-50/80 border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/60 shadow-sm"
          : "bg-white border-slate-200 dark:bg-[#171D26] dark:border-[#27313D] shadow-xs"
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              isGlobalOOS
                ? "bg-rose-600 text-white shadow-md shadow-rose-600/30 animate-pulse"
                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
            }`}
          >
            <Power className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-black text-slate-900 dark:text-[#F5F7FA] uppercase tracking-wide">
                Master OOS Control (Out of Stock for All Products)
              </h3>
              <span
                className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                  isGlobalOOS
                    ? "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-200"
                    : "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200"
                }`}
              >
                {isGlobalOOS ? "🔴 OOS Mode Active" : "🟢 Normal Operations"}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-[#818C9B] mt-1 leading-relaxed">
              {isGlobalOOS ? (
                <>
                  <strong className="text-rose-700 dark:text-rose-400">All products are currently marked Out of Stock.</strong> Checkout is safely disabled. Customers see "Fresh batch in production".
                </>
              ) : (
                "Temporarily toggle all products to Out of Stock with 1-click (ideal for fresh production batches, warehouse pauses, or holidays)."
              )}
            </p>

            <div className="flex items-center gap-4 mt-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 flex-wrap">
              <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 100% SEO Safe (HTTP 200 OK)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-blue-700 dark:text-blue-400">
                <Info className="w-3.5 h-3.5 text-blue-600" /> Preserves Google 91 URLs & Sitemap
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-purple-700 dark:text-purple-400">
                Schema: schema.org/OutOfStock
              </span>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <button
            onClick={handleToggle}
            disabled={loading}
            className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-60 ${
              isGlobalOOS
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30"
                : "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30"
            }`}
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Power className="w-4 h-4" />
            )}
            <span>
              {isGlobalOOS
                ? "Turn Off OOS (Resume Normal Store)"
                : "Set All Products OOS (Out of Stock)"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalOOSControl;
