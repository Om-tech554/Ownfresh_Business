import React, { useEffect, useState } from "react";
import axios from "axios";
import { Settings, Save, AlertCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const SettingsManager = () => {
  const [announcements, setAnnouncements] = useState({
    announcement1: "🎉 FREE SHIPPING ON ORDERS ABOVE ₹999",
    announcement2: "🌿 100% PURE & STONE PRESSED BOTANIC OILS",
    announcement3: "👑 JOIN PRIME 1% TO EARN REDEEMABLE COIN COMMISSIONS",
    announcement4: "📦 EXPRESS 2-DAY DELIVERY ACROSS INDIA"
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const keys = ["announcement1", "announcement2", "announcement3", "announcement4"];
      const results = await Promise.all(
        keys.map(k => axios.get(`${API_BASE_URL}/api/settings/${k}`))
      );

      const updated = { ...announcements };
      results.forEach((res, i) => {
        if (res.data?.success && res.data?.value) {
          updated[`announcement${i + 1}`] = res.data.value;
        }
      });

      setAnnouncements(updated);
    } catch (error) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const keys = ["announcement1", "announcement2", "announcement3", "announcement4"];
      await Promise.all(
        keys.map(k =>
          axios.put(
            `${API_BASE_URL}/api/settings/${k}`,
            { value: announcements[k] },
            { withCredentials: true }
          )
        )
      );

      // Also sync combined string to legacy key for backward compatibility
      const combined = keys.map(k => announcements[k]).filter(Boolean).join(" • ");
      await axios.put(
        `${API_BASE_URL}/api/settings/announcement`,
        { value: combined },
        { withCredentials: true }
      );

      toast.success("All 4 Announcement lines updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto pt-16 flex flex-col items-center justify-center font-sans">
        <div className="w-12 h-12 border-4 border-[#24672E] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-black uppercase tracking-widest text-slate-400 text-xs">Loading Settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 font-sans">
      <Toaster position="bottom-right" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-[#24672E] text-white flex items-center justify-center shadow-md">
          <Settings className="w-6 h-6 text-[#FFDD00]" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900">Site Configuration</h2>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Manage top bar announcement ticker lines, global banners, and website features.
          </p>
        </div>
      </div>

      {/* Main Settings Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-8 space-y-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-black text-slate-900 uppercase tracking-widest">
                Top Bar Announcement Ticker (4 Sentences)
              </label>
              <span className="text-[10px] font-bold text-slate-400">
                4 Unique Scrolling Sentences
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Enter up to 4 unique announcement sentences below. They will stream continuously across the top of all website pages separated by stylish bullet badges.
            </p>

            <div className="space-y-4">
              {[
                { key: "announcement1", label: "Sentence 1 (Main Promotional Banner)", ph: "🎉 FREE SHIPPING ON ORDERS ABOVE ₹999" },
                { key: "announcement2", label: "Sentence 2 (Product Quality Highlight)", ph: "🌿 100% PURE & COLD PRESSED BOTANIC OILS" },
                { key: "announcement3", label: "Sentence 3 (Prime 1% Commission Reward)", ph: "👑 JOIN PRIME 1% TO EARN REDEEMABLE COIN COMMISSIONS" },
                { key: "announcement4", label: "Sentence 4 (Delivery / Special Offer)", ph: "📦 EXPRESS 2-DAY DELIVERY ACROSS INDIA" }
              ].map((item, idx) => (
                <div key={item.key} className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-[#FFDD00] text-[10px] font-black flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span>{item.label}</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-xs focus:bg-white focus:border-[#24672E] transition-all"
                    placeholder={item.ph}
                    value={announcements[item.key]}
                    onChange={(e) =>
                      setAnnouncements({ ...announcements, [item.key]: e.target.value })
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-2 border border-slate-800">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FFDD00] block">
              Live Top Scroll Bar Preview
            </span>
            <div className="overflow-hidden whitespace-nowrap bg-black/40 py-2 px-4 rounded-xl text-xs font-extrabold text-slate-200 font-mono flex items-center gap-3">
              <span>{announcements.announcement1 || "Sentence 1"}</span>
              <span className="text-[#FFDD00]">•</span>
              <span>{announcements.announcement2 || "Sentence 2"}</span>
              <span className="text-[#FFDD00]">•</span>
              <span>{announcements.announcement3 || "Sentence 3"}</span>
              <span className="text-[#FFDD00]">•</span>
              <span>{announcements.announcement4 || "Sentence 4"}</span>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex gap-3 text-xs text-emerald-800 font-medium">
            <AlertCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <p>
              Changes take effect immediately for all visitors browsing MyOwnFresh. Use emojis and ALL CAPS for maximum visual impact.
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-[#24672E] text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-2 hover:bg-slate-900 shadow-md transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-[#FFDD00]" />
              {saving ? "Saving All 4 Lines..." : "Save Announcement Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsManager;
