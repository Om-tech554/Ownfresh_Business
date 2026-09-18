import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { 
  Sparkles, 
  Calculator, 
  RefreshCw, 
  Save, 
  ChevronDown, 
  ChevronUp, 
  Sliders, 
  CheckCircle2, 
  Info,
  TrendingUp,
  Layers,
  Check
} from "lucide-react";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:10000";

const DEFAULT_RATES = {
  "Groundnut Oil": { "1L": 605, "500ml": 390, "250ml": null },
  "Coconut Oil": { "1L": 1210, "500ml": 695, "250ml": 418 },
  "Sunflower Oil": { "1L": 565, "500ml": 375, "250ml": null },
  "Safflower Oil": { "1L": 640, "500ml": 412, "250ml": null },
  "Sesame Oil": { "1L": 650, "500ml": 415, "250ml": 290 },
  "Mustard Oil": { "1L": 585, "500ml": 380, "250ml": 175 }
};

const DEFAULT_MULTIPLIERS = {
  "2L": 1.85,
  "3L": 2.8,
  "5L_coconut": 5.0,
  "5L_others": 8.0,
  "15L_coconut": 15.0,
  "15L_others": 22.0
};

const OIL_METADATA = {
  "Groundnut Oil": { color: "from-amber-500/20 to-amber-50 border-amber-300 text-amber-900 badge-bg-amber-100" },
  "Coconut Oil": { color: "from-emerald-500/20 to-emerald-50 border-emerald-300 text-emerald-900 badge-bg-emerald-100" },
  "Sunflower Oil": { color: "from-yellow-500/20 to-yellow-50 border-yellow-300 text-yellow-900 badge-bg-yellow-100" },
  "Safflower Oil": { color: "from-orange-500/20 to-orange-50 border-orange-300 text-orange-900 badge-bg-orange-100" },
  "Sesame Oil": { color: "from-stone-500/20 to-stone-50 border-stone-300 text-stone-900 badge-bg-stone-100" },
  "Mustard Oil": { color: "from-lime-500/20 to-lime-50 border-lime-300 text-lime-900 badge-bg-lime-100" }
};

const MasterRateCard = ({ onUpdated }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [showMultipliers, setShowMultipliers] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [rates, setRates] = useState(DEFAULT_RATES);
  const [multipliers, setMultipliers] = useState(DEFAULT_MULTIPLIERS);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch current master rates from database
  const fetchMasterRates = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/inventory/master-rates`);
      if (res.data?.success && res.data.rates) {
        setRates(res.data.rates);
        if (res.data.multipliers) {
          setMultipliers(res.data.multipliers);
        }
      }
    } catch (error) {
      console.error("Failed to load master rates:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMasterRates();
  }, []);

  // Calculate live preview
  const calculatedMatrix = useMemo(() => {
    const matrix = {};
    for (const [oil, r] of Object.entries(rates)) {
      const isCoconut = oil.toLowerCase().includes("coconut");
      const p1L = Number(r["1L"]) || 0;
      const p500ml = Number(r["500ml"]) || 0;
      const raw250 = r["250ml"];
      const is250Active = raw250 !== null && raw250 !== undefined && raw250 !== "" && !isNaN(raw250) && Number(raw250) > 0;
      const p250ml = is250Active ? Number(raw250) : null;

      const m2L = Number(multipliers["2L"]) || 1.85;
      const m3L = Number(multipliers["3L"]) || 2.8;
      const m5L = isCoconut ? (Number(multipliers["5L_coconut"]) || 5.0) : (Number(multipliers["5L_others"]) || 8.0);
      const m15L = isCoconut ? (Number(multipliers["15L_coconut"]) || 15.0) : (Number(multipliers["15L_others"]) || 22.0);

      const p2L = Math.round(p1L * m2L);
      const p3L = Math.round(p1L * m3L);
      const p5L = Math.round(p1L * m5L);
      const p15L = Math.round(p1L * m15L);

      matrix[oil] = {
        "250ml": {
          salePrice: p250ml,
          mrp: p250ml ? Math.round(p250ml * 1.10) : null,
          isNA: !is250Active
        },
        "500ml": {
          salePrice: p500ml,
          mrp: Math.round(p500ml * 1.10)
        },
        "1L": {
          salePrice: p1L,
          mrp: Math.round(p1L * 1.10)
        },
        "2L": {
          salePrice: p2L,
          mrp: Math.round(p2L * 1.10)
        },
        "3L": {
          salePrice: p3L,
          mrp: Math.round(p3L * 1.10)
        },
        "5L": {
          salePrice: p5L,
          mrp: Math.round(p5L * 1.10)
        },
        "15L": {
          salePrice: p15L,
          mrp: Math.round(p15L * 1.10)
        }
      };
    }
    return matrix;
  }, [rates, multipliers]);

  const handleRateChange = (oil, sizeKey, value) => {
    setHasChanges(true);
    setRates((prev) => {
      const updated = { ...prev };
      if (!updated[oil]) updated[oil] = {};
      if (value === "" || value === null) {
        updated[oil][sizeKey] = null;
      } else {
        updated[oil][sizeKey] = Number(value);
      }
      return updated;
    });
  };

  const handleToggle250NA = (oil) => {
    setHasChanges(true);
    setRates((prev) => {
      const current = prev[oil]?.["250ml"];
      const isCurrentlyNA = current === null || current === undefined || current === "";
      return {
        ...prev,
        [oil]: {
          ...prev[oil],
          "250ml": isCurrentlyNA ? Math.round(Number(prev[oil]?.["500ml"] || 400) * 0.6) : null
        }
      };
    });
  };

  const handleMultiplierChange = (key, val) => {
    setHasChanges(true);
    setMultipliers((prev) => ({
      ...prev,
      [key]: Number(val)
    }));
  };

  const handleReset = () => {
    setRates(DEFAULT_RATES);
    setMultipliers(DEFAULT_MULTIPLIERS);
    setHasChanges(true);
    toast.success("Reset to factory master rates");
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await axios.put(`${API_BASE_URL}/api/inventory/update-master-rates`, {
        rates,
        multipliers
      });

      if (res.data?.success) {
        toast.success(res.data.message || "Master rates and all bulk sizes updated successfully!");
        setHasChanges(false);
        if (onUpdated) {
          onUpdated();
        }
      } else {
        toast.error(res.data?.message || "Failed to update master rates");
      }
    } catch (error) {
      console.error("Save master rates failed:", error);
      toast.error(error.response?.data?.message || "Failed to update master rates");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-emerald-50/40 rounded-3xl border border-emerald-200/80 shadow-lg shadow-emerald-950/5 mb-8 overflow-hidden transition-all">
      {/* Top Banner & Collapsible Toggle */}
      <div className="p-6 bg-gradient-to-r from-emerald-900 via-[#167a17] to-[#1E971D] text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
              <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-extrabold tracking-tight text-white font-sans">
                  Intelligent Oil Master Rate Card
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-200 border border-emerald-300/30">
                  Auto-Calculates 2L, 3L, 5L & 15L
                </span>
                {hasChanges && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-amber-950 animate-bounce">
                    Unsaved Changes
                  </span>
                )}
              </div>
              <p className="text-emerald-100/90 text-xs sm:text-sm mt-1 max-w-3xl leading-relaxed">
                Edit base prices (<strong>1L, 500ml, 250ml</strong>) for the 6 core oil families below. 
                Derived bulk amounts (<strong>2L, 3L, 5L, 15L</strong>) and crossed-out MRP (+10%) are automatically calculated and applied store-wide!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end lg:self-center">
            <button
              onClick={() => setShowMultipliers(!showMultipliers)}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors border border-white/15 backdrop-blur-sm"
              title="Adjust calculation multipliers"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Multipliers</span>
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors border border-white/15 backdrop-blur-sm"
            >
              {isOpen ? (
                <>
                  <ChevronUp className="w-4 h-4" /> Collapse
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" /> Expand
                </>
              )}
            </button>
          </div>
        </div>

        {/* Optional Multiplier Controls Accordion */}
        {showMultipliers && (
          <div className="mt-5 pt-4 border-t border-white/20 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-white text-xs">
            <div className="bg-black/20 p-2.5 rounded-xl border border-white/10">
              <span className="text-[11px] text-emerald-200 block font-bold mb-1">2L Multiplier</span>
              <input
                type="number"
                step="0.05"
                value={multipliers["2L"]}
                onChange={(e) => handleMultiplierChange("2L", e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white font-mono font-bold outline-none text-xs"
              />
            </div>
            <div className="bg-black/20 p-2.5 rounded-xl border border-white/10">
              <span className="text-[11px] text-emerald-200 block font-bold mb-1">3L Multiplier</span>
              <input
                type="number"
                step="0.05"
                value={multipliers["3L"]}
                onChange={(e) => handleMultiplierChange("3L", e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white font-mono font-bold outline-none text-xs"
              />
            </div>
            <div className="bg-black/20 p-2.5 rounded-xl border border-white/10">
              <span className="text-[11px] text-emerald-200 block font-bold mb-1">5L (Coconut)</span>
              <input
                type="number"
                step="0.1"
                value={multipliers["5L_coconut"]}
                onChange={(e) => handleMultiplierChange("5L_coconut", e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white font-mono font-bold outline-none text-xs"
              />
            </div>
            <div className="bg-black/20 p-2.5 rounded-xl border border-white/10">
              <span className="text-[11px] text-emerald-200 block font-bold mb-1">5L (Others)</span>
              <input
                type="number"
                step="0.1"
                value={multipliers["5L_others"]}
                onChange={(e) => handleMultiplierChange("5L_others", e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white font-mono font-bold outline-none text-xs"
              />
            </div>
            <div className="bg-black/20 p-2.5 rounded-xl border border-white/10">
              <span className="text-[11px] text-emerald-200 block font-bold mb-1">15L (Coconut)</span>
              <input
                type="number"
                step="0.1"
                value={multipliers["15L_coconut"]}
                onChange={(e) => handleMultiplierChange("15L_coconut", e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white font-mono font-bold outline-none text-xs"
              />
            </div>
            <div className="bg-black/20 p-2.5 rounded-xl border border-white/10">
              <span className="text-[11px] text-emerald-200 block font-bold mb-1">15L (Others)</span>
              <input
                type="number"
                step="0.1"
                value={multipliers["15L_others"]}
                onChange={(e) => handleMultiplierChange("15L_others", e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white font-mono font-bold outline-none text-xs"
              />
            </div>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="p-6">
          {/* Table of the 6 core categories */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-600">
                  <th className="py-3.5 px-4">Oil Category</th>
                  <th className="py-3.5 px-3 bg-amber-50/50 text-amber-900 border-l border-r border-amber-100">
                    1 Litre (Base ₹)
                  </th>
                  <th className="py-3.5 px-3 bg-amber-50/50 text-amber-900 border-r border-amber-100">
                    500 ml (Base ₹)
                  </th>
                  <th className="py-3.5 px-3 bg-amber-50/50 text-amber-900 border-r border-amber-100">
                    250 ml (Base ₹)
                  </th>
                  <th className="py-3.5 px-3 text-slate-500 text-center">2 Litre (Auto)</th>
                  <th className="py-3.5 px-3 text-slate-500 text-center">3 Litre (Auto)</th>
                  <th className="py-3.5 px-3 text-slate-500 text-center">5 Litre (Auto)</th>
                  <th className="py-3.5 px-3 text-slate-500 text-center">15 Litre (Auto)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                {Object.keys(DEFAULT_RATES).map((oil) => {
                  const currentRate = rates[oil] || { "1L": 0, "500ml": 0, "250ml": null };
                  const calc = calculatedMatrix[oil] || {};
                  const is250NA = currentRate["250ml"] === null || currentRate["250ml"] === undefined || currentRate["250ml"] === "";

                  return (
                    <tr key={oil} className="hover:bg-slate-50/60 transition-colors">
                      {/* Oil Name */}
                      <td className="py-4 px-4 font-bold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#1E971D]"></span>
                          <span>{oil}</span>
                        </div>
                      </td>

                      {/* 1 Litre Input */}
                      <td className="py-3 px-3 bg-amber-50/20 border-l border-r border-amber-100/60">
                        <div className="flex flex-col gap-1">
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                            <input
                              type="number"
                              min="0"
                              value={currentRate["1L"] || ""}
                              onChange={(e) => handleRateChange(oil, "1L", e.target.value)}
                              className="w-24 pl-6 pr-2 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold text-xs focus:ring-2 focus:ring-[#1E971D] focus:border-[#1E971D] outline-none"
                            />
                          </div>
                          <span className="text-[10px] text-slate-400">
                            MRP: ₹{calc["1L"]?.mrp || "-"}
                          </span>
                        </div>
                      </td>

                      {/* 500 ml Input */}
                      <td className="py-3 px-3 bg-amber-50/20 border-r border-amber-100/60">
                        <div className="flex flex-col gap-1">
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                            <input
                              type="number"
                              min="0"
                              value={currentRate["500ml"] || ""}
                              onChange={(e) => handleRateChange(oil, "500ml", e.target.value)}
                              className="w-24 pl-6 pr-2 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold text-xs focus:ring-2 focus:ring-[#1E971D] focus:border-[#1E971D] outline-none"
                            />
                          </div>
                          <span className="text-[10px] text-slate-400">
                            MRP: ₹{calc["500ml"]?.mrp || "-"}
                          </span>
                        </div>
                      </td>

                      {/* 250 ml Input or NA Toggle */}
                      <td className="py-3 px-3 bg-amber-50/20 border-r border-amber-100/60">
                        <div className="flex flex-col gap-1">
                          {is250NA ? (
                            <div className="flex items-center gap-1.5">
                              <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold border border-slate-200">
                                NA
                              </span>
                              <button
                                type="button"
                                onClick={() => handleToggle250NA(oil)}
                                className="text-[10px] text-blue-600 hover:text-blue-800 font-bold underline"
                              >
                                Enable
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <div className="relative">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                                <input
                                  type="number"
                                  min="0"
                                  value={currentRate["250ml"] || ""}
                                  onChange={(e) => handleRateChange(oil, "250ml", e.target.value)}
                                  className="w-20 pl-6 pr-2 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold text-xs focus:ring-2 focus:ring-[#1E971D] focus:border-[#1E971D] outline-none"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => handleToggle250NA(oil)}
                                className="text-[10px] text-rose-600 hover:text-rose-800 font-bold"
                                title="Set to NA"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                          <span className="text-[10px] text-slate-400">
                            {is250NA ? "Not Available" : `MRP: ₹${calc["250ml"]?.mrp || "-"}`}
                          </span>
                        </div>
                      </td>

                      {/* 2 Litre Calculated */}
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex flex-col items-center bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200/60">
                          <span className="text-xs font-black text-slate-800">
                            ₹{calc["2L"]?.salePrice?.toLocaleString("en-IN") || "-"}
                          </span>
                          <span className="text-[10px] text-slate-400 line-through">
                            ₹{calc["2L"]?.mrp?.toLocaleString("en-IN") || "-"}
                          </span>
                        </div>
                      </td>

                      {/* 3 Litre Calculated */}
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex flex-col items-center bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200/60">
                          <span className="text-xs font-black text-slate-800">
                            ₹{calc["3L"]?.salePrice?.toLocaleString("en-IN") || "-"}
                          </span>
                          <span className="text-[10px] text-slate-400 line-through">
                            ₹{calc["3L"]?.mrp?.toLocaleString("en-IN") || "-"}
                          </span>
                        </div>
                      </td>

                      {/* 5 Litre Calculated */}
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex flex-col items-center bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200/60">
                          <span className="text-xs font-black text-slate-800">
                            ₹{calc["5L"]?.salePrice?.toLocaleString("en-IN") || "-"}
                          </span>
                          <span className="text-[10px] text-slate-400 line-through">
                            ₹{calc["5L"]?.mrp?.toLocaleString("en-IN") || "-"}
                          </span>
                        </div>
                      </td>

                      {/* 15 Litre Calculated */}
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex flex-col items-center bg-emerald-50/80 px-2.5 py-1.5 rounded-xl border border-emerald-200/60">
                          <span className="text-xs font-black text-emerald-900">
                            ₹{calc["15L"]?.salePrice?.toLocaleString("en-IN") || "-"}
                          </span>
                          <span className="text-[10px] text-emerald-600/70 line-through">
                            ₹{calc["15L"]?.mrp?.toLocaleString("en-IN") || "-"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bottom Action Footer */}
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Info className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Derived sizes update automatically across all store variants. MRP displays with standard 10% strikethrough.
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Reset Defaults
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="px-6 py-2.5 bg-gradient-to-r from-[#167a17] to-[#1E971D] hover:from-[#136814] hover:to-[#167a17] text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg hover:shadow-emerald-600/20 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Syncing Store Database...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save & Update All Sizes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterRateCard;
