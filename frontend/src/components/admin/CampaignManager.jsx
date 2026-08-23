import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Sparkles,
  Trash2,
  Plus,
  Calendar,
  Tag,
  AlertCircle,
  CheckCircle2,
  X,
  Edit2,
  Copy,
  Eye,
  ToggleLeft,
  ToggleRight,
  Upload,
  Image as ImageIcon,
  Clock,
  ExternalLink,
  ChevronRight,
  Monitor,
  Smartphone
} from "lucide-react";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { serverUrl } from "../../App";
import { useConfirm } from "../../hooks/ConfirmContext.jsx";

// Typewriter effect that reveals description word by word in preview
const TypewriterText = ({ text }) => {
  const words = text ? text.split(" ") : [];
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (words.length === 0) return;

    let isMounted = true;
    let timer;

    const run = (currentCount) => {
      if (!isMounted) return;

      if (currentCount <= words.length) {
        setVisibleCount(currentCount);
        timer = setTimeout(() => {
          run(currentCount + 1);
        }, 250); // Speed: 250ms per word
      } else {
        // Wait 5 seconds, then restart
        timer = setTimeout(() => {
          if (isMounted) {
            run(0);
          }
        }, 5000);
      }
    };

    run(0);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [text]);

  return (
    <span className="font-semibold text-slate-100 leading-relaxed text-xs sm:text-sm md:text-base">
      {words.slice(0, visibleCount).map((word, idx) => (
        <motion.span
          key={`${idx}-${word}`}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="inline-block mr-1"
        >
          {word}
        </motion.span>
      ))}
      <span className="animate-pulse ml-0.5 text-[#FFDD00] font-extrabold inline-block">|</span>
    </span>
  );
};

const CampaignManager = () => {
  const confirm = useConfirm();
  const [campaigns, setCampaigns] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [previewCampaign, setPreviewCampaign] = useState(null);
  const [previewMode, setPreviewMode] = useState("desktop"); // desktop or mobile
  const [previewSlideIdx, setPreviewSlideIdx] = useState(0);

  // Get active images based on campaign being previewed
  const previewImages = previewCampaign
    ? [previewCampaign.bannerImage, previewCampaign.mobileBannerImage].filter(Boolean)
    : [];

  useEffect(() => {
    if (previewImages.length <= 1 || !showPreviewModal) return;
    const interval = setInterval(() => {
      setPreviewSlideIdx((prev) => (prev + 1) % previewImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [previewImages.length, showPreviewModal]);

  // Form State
  const [formData, setFormData] = useState({
    festivalName: "",
    title: "",
    description: "",
    promoCode: "",
    startDate: "",
    endDate: "",
    status: "Draft",
    ctaText: "Shop Now",
    ctaUrl: "/shop",
    priority: "0",
    displayLocation: "home_banner",
    showCountdown: true
  });

  const [bannerFile, setBannerFile] = useState(null);
  const [mobileBannerFile, setMobileBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState("");
  const [mobileBannerPreview, setMobileBannerPreview] = useState("");

  const fetchCampaigns = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/campaign/all`, { withCredentials: true });
      setCampaigns(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load campaigns");
    }
  };

  const fetchCoupons = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/coupon/all`, { withCredentials: true });
      setCoupons(res.data);
    } catch (error) {
      toast.error("Failed to load promo codes for dropdown selection");
    }
  };

  useEffect(() => {
    fetchCampaigns();
    fetchCoupons();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingCampaign(null);
    setFormData({
      festivalName: "",
      title: "",
      description: "",
      promoCode: coupons[0]?._id || "",
      startDate: "",
      endDate: "",
      status: "Draft",
      ctaText: "Shop Now",
      ctaUrl: "/shop",
      priority: "0",
      displayLocation: "home_banner",
      showCountdown: true
    });
    setBannerFile(null);
    setMobileBannerFile(null);
    setBannerPreview("");
    setMobileBannerPreview("");
    setShowFormModal(true);
  };

  const handleOpenEditModal = (campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      festivalName: campaign.festivalName || "",
      title: campaign.title || "",
      description: campaign.description || "",
      promoCode: campaign.promoCode?._id || campaign.promoCode || "",
      startDate: campaign.startDate ? new Date(campaign.startDate).toISOString().slice(0, 16) : "",
      endDate: campaign.endDate ? new Date(campaign.endDate).toISOString().slice(0, 16) : "",
      status: campaign.status || "Draft",
      ctaText: campaign.ctaText || "Shop Now",
      ctaUrl: campaign.ctaUrl || "/shop",
      priority: String(campaign.priority || 0),
      displayLocation: campaign.displayLocation || "home_banner",
      showCountdown: campaign.showCountdown !== false
    });
    setBannerFile(null);
    setMobileBannerFile(null);
    setBannerPreview(campaign.bannerImage || "");
    setMobileBannerPreview(campaign.mobileBannerImage || "");
    setShowFormModal(true);
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith("image/")) {
      return toast.error("Only image files are allowed.");
    }
    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return toast.error("Image file size should not exceed 5MB.");
    }

    const previewUrl = URL.createObjectURL(file);
    if (type === "banner") {
      setBannerFile(file);
      setBannerPreview(previewUrl);
    } else {
      setMobileBannerFile(file);
      setMobileBannerPreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.festivalName || !formData.title || !formData.startDate || !formData.endDate || !formData.promoCode) {
      return toast.error("Please fill in all required fields.");
    }

    if (!editingCampaign && !bannerFile) {
      return toast.error("Desktop banner image is required for new campaigns.");
    }

    setLoading(true);

    const postData = new FormData();
    postData.append("festivalName", formData.festivalName);
    postData.append("title", formData.title);
    postData.append("description", formData.description);
    postData.append("promoCode", formData.promoCode);
    postData.append("startDate", formData.startDate);
    postData.append("endDate", formData.endDate);
    postData.append("status", formData.status);
    postData.append("ctaText", formData.ctaText);
    postData.append("ctaUrl", formData.ctaUrl);
    postData.append("priority", formData.priority);
    postData.append("displayLocation", formData.displayLocation);
    postData.append("showCountdown", String(formData.showCountdown));

    if (bannerFile) postData.append("bannerImage", bannerFile);
    if (mobileBannerFile) postData.append("mobileBannerImage", mobileBannerFile);

    try {
      if (editingCampaign) {
        await axios.put(`${serverUrl}/api/campaign/${editingCampaign._id}`, postData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true
        });
        toast.success("Festival campaign updated successfully");
      } else {
        await axios.post(`${serverUrl}/api/campaign/create`, postData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true
        });
        toast.success("Festival campaign created successfully");
      }
      setShowFormModal(false);
      fetchCampaigns();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save campaign");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirm({
      title: "Delete Campaign?",
      message: "Are you sure you want to permanently delete this campaign? This action cannot be undone.",
      type: "danger",
      confirmText: "Delete"
    });
    if (!isConfirmed) return;

    try {
      await axios.delete(`${serverUrl}/api/campaign/${id}`, { withCredentials: true });
      toast.success("Campaign deleted successfully");
      fetchCampaigns();
    } catch (error) {
      toast.error("Failed to delete campaign");
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await axios.post(`${serverUrl}/api/campaign/${id}/duplicate`, {}, { withCredentials: true });
      toast.success("Campaign cloned to drafts successfully");
      fetchCampaigns();
    } catch (error) {
      toast.error("Failed to clone campaign");
    }
  };

  const handleToggleStatus = async (campaign) => {
    const nextStatus = campaign.status === "Active" ? "Disabled" : "Active";
    try {
      await axios.patch(`${serverUrl}/api/campaign/${campaign._id}/status`, { status: nextStatus }, { withCredentials: true });
      toast.success(`Campaign status updated to ${nextStatus}`);
      fetchCampaigns();
    } catch (error) {
      console.error("Failed to update campaign status:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleOpenPreview = (campaign) => {
    setPreviewCampaign(campaign);
    setPreviewMode("desktop");
    setPreviewSlideIdx(0);
    setShowPreviewModal(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Active":
        return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Active</span>;
      case "Scheduled":
        return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Scheduled</span>;
      case "Draft":
        return <span className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Draft</span>;
      case "Expired":
        return <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Expired</span>;
      case "Disabled":
        return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Disabled</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  return (
    <div className="px-6 py-8 md:px-12 lg:px-20 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Sparkles className="text-[#24672E] w-8 h-8" />
            Festival <span className="text-[#24672E]">Campaigns</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">
            Dynamic Seasonal Marketing & Banners
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 bg-[#24672E] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#167a17] transition-all shadow-lg shadow-[#24672E]/20 cursor-pointer"
        >
          <Plus size={20} />
          Create Campaign
        </button>
      </div>

      {/* Campaign Grid/List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-xs uppercase tracking-wider">
                <th className="px-6 py-4">Campaign / Festival</th>
                <th className="px-6 py-4">Promo Code</th>
                <th className="px-6 py-4">Date Schedule</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
              {campaigns.map((campaign) => (
                <tr key={campaign._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <div>
                      <div className="font-extrabold text-slate-900 text-base">{campaign.title}</div>
                      <div className="text-xs text-slate-400 font-semibold mt-0.5">{campaign.festivalName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-1.5">
                      <Tag size={14} className="text-[#24672E]" />
                      <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-xs font-bold text-slate-800">
                        {campaign.promoCode?.code || campaign.promoCode || "None"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-xs text-slate-500 space-y-1">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>Start: {new Date(campaign.startDate).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>End: {new Date(campaign.endDate).toLocaleString()}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="font-bold bg-amber-50 border border-amber-200 text-amber-800 rounded px-2 py-0.5 text-xs">
                      Priority: {campaign.priority || 0}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    {getStatusBadge(campaign.status)}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleStatus(campaign)}
                        title={campaign.status === "Active" ? "Deactivate" : "Activate"}
                        className="p-2 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                      >
                        {campaign.status === "Active" ? <ToggleRight className="text-green-600 w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => handleOpenPreview(campaign)}
                        title="Preview Banner"
                        className="p-2 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleDuplicate(campaign._id)}
                        title="Duplicate (Clone)"
                        className="p-2 text-slate-400 hover:text-purple-600 transition-colors cursor-pointer"
                      >
                        <Copy size={18} />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(campaign)}
                        title="Edit"
                        className="p-2 text-slate-400 hover:text-[#24672E] transition-colors cursor-pointer"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(campaign._id)}
                        title="Delete"
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {campaigns.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-20 text-center text-slate-400 font-bold">
                    <Sparkles className="mx-auto text-slate-200 mb-4" size={48} />
                    No festival campaigns found. Click "Create Campaign" to add your first marketing banner!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE & EDIT FORM MODAL */}
      <AnimatePresence>
        {showFormModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                <h3 className="text-xl font-bold text-slate-950 flex items-center gap-2">
                  <Sparkles className="text-[#24672E] w-5 h-5" />
                  {editingCampaign ? "Edit Festival Campaign" : "Create Festival Campaign"}
                </h3>
                <button
                  onClick={() => setShowFormModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Festival Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Raksha Bandhan, Diwali"
                      required
                      value={formData.festivalName}
                      onChange={(e) => setFormData({ ...formData, festivalName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#24672E] focus:bg-white transition-all text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Campaign Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Raksha Bandhan Special, Diwali Grand Sale"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#24672E] focus:bg-white transition-all text-sm font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Description</label>
                  <textarea
                    placeholder="Short promotional slogan or subtext..."
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#24672E] focus:bg-white transition-all text-sm font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Promo Code (Linked) *</label>
                    <select
                      value={formData.promoCode}
                      required
                      onChange={(e) => setFormData({ ...formData, promoCode: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#24672E] focus:bg-white transition-all text-sm font-bold text-slate-800"
                    >
                      <option value="" disabled>Select Promo Code...</option>
                      {coupons.map((coupon) => (
                        <option key={coupon._id} value={coupon._id}>
                          {coupon.code} ({coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`} off)
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">
                      Loads parameters (percentage, max limit, dates) from Promo Codes.
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Display Location</label>
                    <select
                      value={formData.displayLocation}
                      onChange={(e) => setFormData({ ...formData, displayLocation: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#24672E] focus:bg-white transition-all text-sm font-semibold"
                    >
                      <option value="home_banner">Home Page Top Banner</option>
                      <option value="pop_up">Marketing Pop-Up Modal</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Start Date & Time *</label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#24672E] focus:bg-white transition-all text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">End Date & Time *</label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#24672E] focus:bg-white transition-all text-sm font-semibold"
                    />
                  </div>
                </div>

                {/* Banner Uploads */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Desktop Upload */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Desktop Banner *</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden bg-slate-50 hover:bg-slate-100/50 transition-colors">
                      {bannerPreview ? (
                        <div className="w-full h-28 relative group rounded-lg overflow-hidden">
                          <img src={bannerPreview} alt="Desktop Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <label className="bg-white/80 backdrop-blur-sm text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1 hover:bg-white">
                              <Upload size={12} /> Replace
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, "banner")} />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center py-6 cursor-pointer w-full">
                          <ImageIcon size={28} className="text-slate-400 mb-2" />
                          <span className="text-xs text-slate-700 font-bold">Upload Desktop Banner</span>
                          <span className="text-[9px] text-slate-400 mt-1 uppercase font-semibold">JPG/PNG up to 5MB</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, "banner")} />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Mobile Upload */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Mobile Banner (Optional)</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden bg-slate-50 hover:bg-slate-100/50 transition-colors">
                      {mobileBannerPreview ? (
                        <div className="w-full h-28 relative group rounded-lg overflow-hidden">
                          <img src={mobileBannerPreview} alt="Mobile Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <label className="bg-white/80 backdrop-blur-sm text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1 hover:bg-white">
                              <Upload size={12} /> Replace
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, "mobile")} />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center py-6 cursor-pointer w-full">
                          <ImageIcon size={28} className="text-slate-400 mb-2" />
                          <span className="text-xs text-slate-700 font-bold">Upload Mobile Banner</span>
                          <span className="text-[9px] text-slate-400 mt-1 uppercase font-semibold">Falls back to desktop</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, "mobile")} />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">CTA Button Text</label>
                    <input
                      type="text"
                      value={formData.ctaText}
                      onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#24672E] focus:bg-white transition-all text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">CTA Redirection Link</label>
                    <input
                      type="text"
                      value={formData.ctaUrl}
                      onChange={(e) => setFormData({ ...formData, ctaUrl: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#24672E] focus:bg-white transition-all text-sm font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Priority Order</label>
                    <input
                      type="number"
                      placeholder="e.g. 10"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#24672E] focus:bg-white transition-all text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Campaign Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#24672E] focus:bg-white transition-all text-sm font-semibold"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="Active">Active</option>
                      <option value="Disabled">Disabled</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="showCountdown"
                      checked={formData.showCountdown}
                      onChange={(e) => setFormData({ ...formData, showCountdown: e.target.checked })}
                      className="w-4 h-4 text-[#24672E] border-slate-300 rounded focus:ring-[#24672E]"
                    />
                    <label htmlFor="showCountdown" className="text-xs font-bold uppercase tracking-wider text-slate-500 cursor-pointer">
                      Show Countdown
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowFormModal(false)}
                    className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 rounded-xl bg-[#24672E] text-white font-bold hover:bg-[#167a17] transition-all disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? "Saving..." : editingCampaign ? "Update Campaign" : "Create Campaign"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DYNAMIC CAMPAIGN PREVIEW MODAL */}
      <AnimatePresence>
        {showPreviewModal && previewCampaign && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[2000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-950 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col"
            >
              {/* Preview Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900 text-white shrink-0">
                <div className="flex items-center gap-2">
                  <Eye className="text-yellow-400" />
                  <span className="font-extrabold uppercase tracking-wider">Campaign Live Preview</span>
                </div>

                <div className="flex items-center gap-4">
                  {/* Mode Toggles */}
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-0.5 flex">
                    <button
                      onClick={() => setPreviewMode("desktop")}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${previewMode === "desktop" ? "bg-white text-black" : "text-slate-400 hover:text-white"
                        }`}
                    >
                      <Monitor size={14} />
                      Desktop
                    </button>
                    <button
                      onClick={() => setPreviewMode("mobile")}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${previewMode === "mobile" ? "bg-white text-black" : "text-slate-400 hover:text-white"
                        }`}
                    >
                      <Smartphone size={14} />
                      Mobile
                    </button>
                  </div>

                  <button
                    onClick={() => setShowPreviewModal(false)}
                    className="p-1 rounded-full text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>              {/* Preview Body Canvas */}
              <div className="flex-1 bg-slate-100 p-8 flex items-center justify-center min-h-[350px]">
                <div className={`transition-all duration-300 ${previewMode === "mobile" ? "w-[360px]" : "w-full"}`}>

                  {/* BANNER COMPONENT PREVIEW */}
                  <div className="rounded-2xl md:rounded-[36px] overflow-hidden shadow-2xl border border-[#24672E]/15 bg-white flex flex-col max-w-full text-left">
                    {/* Top Container */}
                    <div className="w-full h-auto flex items-center justify-center select-none relative bg-slate-50 border-b border-[#24672E]/10 overflow-hidden min-h-[180px]">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`preview-${previewSlideIdx}`}
                          initial={{ opacity: 0, x: 40 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -40 }}
                          transition={{ type: "tween", ease: "easeInOut", duration: 0.4 }}
                          className="w-full h-auto flex items-center justify-center"
                        >
                          <img
                            src={previewImages[previewSlideIdx]}
                            alt={previewCampaign.title}
                            className="w-full h-auto object-contain max-h-[220px] sm:max-h-[360px] md:max-h-[500px]"
                          />
                        </motion.div>
                      </AnimatePresence>

                      {/* Dots to show it's a carousel */}
                      {previewImages.length > 1 && (
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex gap-1.5">
                          {previewImages.map((_, index) => (
                            <button
                              type="button"
                              key={index}
                              onClick={() => setPreviewSlideIdx(index)}
                              className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${index === previewSlideIdx
                                  ? "bg-[#24672E] w-4"
                                  : "bg-slate-300 hover:bg-slate-400"
                                }`}
                              aria-label={`Go to slide ${index + 1}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Ticker Bar */}
                    <div className="w-full bg-[#24672E] p-3.5 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                      {/* Left section: Offer badge + Typewriter description */}
                      <div className="flex items-center gap-3 w-full md:w-auto min-h-[32px]">
                        {/* Blinking Offer Badge */}
                        <span className="bg-[#FFDD00] text-[#24672E] text-[9px] sm:text-[10px] font-black uppercase px-2.5 py-1 rounded-lg tracking-widest flex items-center gap-1.5 shadow-[0_0_10px_rgba(255,221,0,0.3)] animate-pulse border border-[#FFDD00]/20 shrink-0 select-none">
                          <span className="h-1.5 w-1.5 bg-[#24672E] rounded-full animate-ping shrink-0"></span>
                          🎉 OFFER
                        </span>

                        {/* Typewriter Description */}
                        <div className="flex-1 text-slate-100">
                          {previewCampaign.description ? (
                            <TypewriterText text={previewCampaign.description} />
                          ) : (
                            <span className="text-slate-200 italic text-xs sm:text-sm md:text-base">Special Festive Offer!</span>
                          )}
                        </div>
                      </div>

                      {/* Right section: Coupon + Countdown + CTA */}
                      <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto justify-end shrink-0">
                        {/* Coupon Code box */}
                        {previewCampaign.promoCode?.code && (
                          <div
                            className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-white/10 border border-white/20 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider shrink-0 select-none"
                          >
                            <Tag size={12} className="text-[#FFDD00]" />
                            <span>Use Code: {previewCampaign.promoCode.code}</span>
                          </div>
                        )}

                        {/* Countdown timer */}
                        {previewCampaign.showCountdown && (
                          <div className="w-full sm:w-auto flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-200 bg-black/20 border border-white/10 px-3.5 py-2 rounded-xl shadow-md shrink-0">
                            <Clock size={12} className="text-[#FFDD00]" />
                            <div className="flex items-center gap-1 font-black text-[#FFDD00] text-xs">
                              <span>02d</span>:<span>14h</span>:<span>32m</span>
                            </div>
                          </div>
                        )}

                        {/* CTA Button */}
                        <div className="shrink-0 w-full sm:w-auto">
                          <button
                            type="button"
                            className="w-full bg-[#FFDD00] text-[#24672E] text-xs font-black px-6 py-2.5 rounded-full uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg"
                          >
                            <span>{previewCampaign.ctaText || "Shop Now"}</span>
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Preview Footer */}
              <div className="px-6 py-4 border-t border-slate-800 bg-slate-900 text-slate-400 text-xs text-center font-bold">
                ⚠️ This is an interactive visual campaign preview. It mimics customer device layouts without triggering active database states.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default CampaignManager;
