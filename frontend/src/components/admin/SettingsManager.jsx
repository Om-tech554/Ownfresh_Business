import React, { useEffect, useState } from "react";
import axios from "axios";
import { Settings, Save, AlertCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const SettingsManager = () => {
  const [announcement, setAnnouncement] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE_URL}/api/settings/announcement`);
      if (data.success) {
        setAnnouncement(data.value);
      }
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
      const { data } = await axios.put(
        `${API_BASE_URL}/api/settings/announcement`,
        { value: announcement },
        { withCredentials: true }
      );
      if (data.success) {
        toast.success("Settings updated successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto pt-16 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#1E971D] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-black uppercase tracking-widest text-slate-400 text-xs">Loading Settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <Toaster position="bottom-right" />
      
      {/* Header */}
      <div className="flex items-center gap-2 mb-8">
        <Settings className="w-6 h-6 text-[#1E971D]" />
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Site Configuration</h2>
          <p className="text-slate-500 text-sm mt-1">Manage global website banners, notifications, and features.</p>
        </div>
      </div>

      {/* Main Settings Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-8">
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2 uppercase tracking-wider">
              Announcement Banner Text
            </label>
            <p className="text-xs text-slate-400 mb-3">
              This text scrolls continuously at the very top of all store pages (above the header).
            </p>
            <textarea
              required
              rows="3"
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm focus:bg-white focus:ring-2 focus:ring-[#1E971D] focus:border-[#1E971D] transition-all resize-none"
              placeholder="🎉 FREE SHIPPING ON ORDERS ABOVE ₹999 | 100% PURE BOTANIC OILS"
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
            />
          </div>

          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex gap-3 text-xs text-emerald-800 font-medium">
            <AlertCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <p>
              Updates to the announcement banner take effect instantly for all visitors browsing MyOwnFresh. Use emojis and clear caps for a clean and catchy promotional message.
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3.5 bg-[#1E971D] text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-2 hover:bg-[#1E971D]/90 shadow-md transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving Changes..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsManager;
