import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Tag,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Sparkles,
  Flame,
  Award,
  ShieldCheck,
  Leaf,
  Star,
  Layers,
  Upload,
  Search,
  RefreshCw
} from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useConfirm } from "../../hooks/ConfirmContext.jsx";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:10000";

const ICON_OPTIONS = [
  { name: "Award", icon: Award, label: "Quality Award" },
  { name: "Flame", icon: Flame, label: "Trending / Best Seller" },
  { name: "Leaf", icon: Leaf, label: "Organic / Natural" },
  { name: "ShieldCheck", icon: ShieldCheck, label: "Stone Pressed / Verified" },
  { name: "Star", icon: Star, label: "Featured / Premium" },
  { name: "Sparkles", icon: Sparkles, label: "Special Offer / Festive" },
  { name: "Tag", icon: Tag, label: "Generic Badge" }
];

const COLOR_PRESETS = [
  { label: "Emerald Green", bg: "#1E971D", text: "#ffffff" },
  { label: "Amber Gold", bg: "#D97706", text: "#ffffff" },
  { label: "Deep Orange", bg: "#EA580C", text: "#ffffff" },
  { label: "Crimson Red", bg: "#DC2626", text: "#ffffff" },
  { label: "Royal Indigo", bg: "#4F46E5", text: "#ffffff" },
  { label: "Charcoal Dark", bg: "#1E293B", text: "#ffffff" }
];

const TagManager = () => {
  const confirm = useConfirm();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingTag, setEditingTag] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    icon: "Award",
    bgColor: "#1E971D",
    textColor: "#ffffff",
    description: "",
    imageUrl: "",
    isActive: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const fetchTags = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/tag/all`);
      if (res.data.success) {
        setTags(res.data.tags || []);
      }
    } catch (error) {
      toast.error("Failed to load tags & badges");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const openModal = (tag = null) => {
    setEditingTag(tag);
    if (tag) {
      setFormData({
        name: tag.name,
        icon: tag.icon || "Award",
        bgColor: tag.bgColor || "#1E971D",
        textColor: tag.textColor || "#ffffff",
        description: tag.description || "",
        imageUrl: tag.imageUrl || "",
        isActive: tag.isActive !== undefined ? tag.isActive : true
      });
      setImagePreview(tag.imageUrl || "");
    } else {
      setFormData({
        name: "",
        icon: "Award",
        bgColor: "#1E971D",
        textColor: "#ffffff",
        description: "",
        imageUrl: "",
        isActive: true
      });
      setImagePreview("");
    }
    setImageFile(null);
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() && !formData.icon && !imageFile && !formData.imageUrl) {
      toast.error("Please enter a badge name, choose an icon, or upload an image.");
      return;
    }

    try {
      const data = new FormData();
      data.append("name", formData.name.trim());
      data.append("icon", formData.icon || "");
      data.append("bgColor", formData.bgColor);
      data.append("textColor", formData.textColor);
      data.append("description", formData.description);
      data.append("isActive", formData.isActive);

      if (imageFile) {
        data.append("image", imageFile);
      } else if (formData.imageUrl) {
        data.append("imageUrl", formData.imageUrl);
      }

      if (editingTag) {
        await axios.put(`${API_BASE_URL}/api/tag/update/${editingTag._id}`, data);
        toast.success("Badge updated successfully");
      } else {
        await axios.post(`${API_BASE_URL}/api/tag/add`, data);
        toast.success("Badge created successfully");
      }

      setShowModal(false);
      fetchTags();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save tag");
    }
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirm({
      title: "Delete Badge/Tag?",
      message: "Are you sure you want to delete this badge?",
      type: "danger",
      confirmText: "Delete"
    });
    if (!isConfirmed) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/tag/delete/${id}`);
      toast.success("Badge deleted");
      fetchTags();
    } catch (error) {
      toast.error("Failed to delete badge");
    }
  };

  const handleSeedDefaults = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/tag/seed-defaults`);
      toast.success("Default badges populated successfully");
      fetchTags();
    } catch (error) {
      toast.error("Failed to seed default badges");
    }
  };

  const filteredTags = tags.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(search.toLowerCase()))
  );

  const renderIcon = (iconName, size = 16) => {
    switch (iconName) {
      case "Flame": return <Flame size={size} />;
      case "Award": return <Award size={size} />;
      case "Leaf": return <Leaf size={size} />;
      case "ShieldCheck": return <ShieldCheck size={size} />;
      case "Star": return <Star size={size} />;
      case "Sparkles": return <Sparkles size={size} />;
      default: return <Tag size={size} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Tag className="text-[#1E971D] w-8 h-8" />
            Tags, Labels & <span className="text-[#1E971D]">Badges</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">
            Create visual promotional badges, stickers, and certification tags
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSeedDefaults}
            className="flex items-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
          >
            <RefreshCw size={14} /> Seed Default Badges
          </button>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-[#1E971D] text-white hover:bg-[#167a17] px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#1E971D]/20"
          >
            <Plus size={16} /> Create New Badge
          </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex items-center gap-3">
        <Search className="text-slate-400 w-5 h-5 ml-2" />
        <input
          type="text"
          placeholder="Search tags by name or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-sm outline-none font-medium text-slate-800"
        />
      </div>

      {/* TAGS GRID */}
      {loading && tags.length === 0 ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#1E971D]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTags.map((tag) => (
            <div
              key={tag._id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Visual Preview */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span
                      style={{ backgroundColor: tag.bgColor, color: tag.textColor }}
                      className={`inline-flex items-center justify-center font-black uppercase tracking-wider shadow-sm ${
                        tag.name?.trim()
                          ? "gap-1.5 px-3 py-1.5 rounded-full text-xs"
                          : "w-8 h-8 rounded-full p-0 aspect-square shrink-0"
                      }`}
                    >
                      {tag.imageUrl ? (
                        <img
                          src={tag.imageUrl}
                          alt={tag.name || "Badge"}
                          className={tag.name?.trim() ? "w-4 h-4 object-contain rounded" : "w-5 h-5 object-contain rounded-full"}
                        />
                      ) : (
                        renderIcon(tag.icon, tag.name?.trim() ? 14 : 16)
                      )}
                      {tag.name?.trim() && <span>{tag.name}</span>}
                    </span>
                  </div>

                  <span
                    className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${
                      tag.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {tag.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-800 mb-1">
                  {tag.name || `${tag.icon || "Custom"} Icon Badge`}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                  {tag.description || "No description provided."}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Slug: {tag.slug || (tag.name ? tag.name.toLowerCase() : tag._id)}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openModal(tag)}
                    className="p-2 bg-slate-50 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                    title="Edit Badge"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(tag._id)}
                    className="p-2 bg-slate-50 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                    title="Delete Badge"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredTags.length === 0 && (
            <div className="col-span-full py-16 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
              <Tag className="mx-auto text-slate-300 mb-3" size={40} />
              <p className="text-slate-500 font-bold text-sm">No badges or tags found.</p>
              <button
                onClick={handleSeedDefaults}
                className="mt-4 px-4 py-2 bg-[#1E971D] text-white rounded-xl text-xs font-bold uppercase tracking-wider"
              >
                Seed Default Badges
              </button>
            </div>
          )}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl z-10"
            >
              <div className="bg-[#1E971D] p-6 text-white flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Tag size={20} />
                  {editingTag ? "Edit Badge / Tag" : "Create New Badge"}
                </h3>
                <button onClick={() => setShowModal(false)} className="hover:rotate-90 transition-transform">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                {/* Live Preview Bar */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Preview:</span>
                  <span
                    style={{ backgroundColor: formData.bgColor, color: formData.textColor }}
                    className={`inline-flex items-center justify-center font-black uppercase tracking-wider shadow-sm ${
                      formData.name.trim()
                        ? "gap-1.5 px-3 py-1 rounded-full text-xs"
                        : "w-8 h-8 rounded-full p-0 aspect-square shrink-0"
                    }`}
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Badge"
                        className={formData.name.trim() ? "w-4 h-4 object-contain rounded" : "w-5 h-5 object-contain rounded-full"}
                      />
                    ) : (
                      renderIcon(formData.icon, formData.name.trim() ? 14 : 16)
                    )}
                    {formData.name.trim() && <span>{formData.name}</span>}
                  </span>
                </div>

                {/* Badge Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Badge Title / Text (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Best Seller, Organic (or leave blank for icon-only badge)"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1E971D] font-bold text-slate-800"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">
                    Leave blank to show only the selected icon or uploaded sticker.
                  </p>
                </div>

                {/* Icon Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Badge Icon
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {ICON_OPTIONS.map((opt) => {
                      const IconComp = opt.icon;
                      const isSelected = formData.icon === opt.name;
                      return (
                        <button
                          key={opt.name}
                          type="button"
                          onClick={() => setFormData({ ...formData, icon: opt.name })}
                          className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs font-bold transition-all ${
                            isSelected
                              ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          <IconComp size={16} />
                          <span className="text-[10px] truncate max-w-full">{opt.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Color Theme Presets */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Color Preset
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.bg}
                        type="button"
                        onClick={() => setFormData({ ...formData, bgColor: preset.bg, textColor: preset.text })}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all"
                        style={{
                          backgroundColor: preset.bg,
                          color: preset.text,
                          borderColor: formData.bgColor === preset.bg ? "#000000" : "transparent"
                        }}
                      >
                        {formData.bgColor === preset.bg && <Check size={12} />}
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Custom Hex Color
                      </label>
                      <input
                        type="color"
                        value={formData.bgColor}
                        onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                        className="w-full h-10 p-1 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Text Color
                      </label>
                      <input
                        type="color"
                        value={formData.textColor}
                        onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                        className="w-full h-10 p-1 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Custom Image / Sticker Upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Custom Sticker / Badge Image (Optional)
                  </label>
                  <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer bg-slate-50 hover:border-[#1E971D] transition-all">
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    <Upload size={18} className="text-slate-400 mb-1" />
                    <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">
                      {imageFile ? imageFile.name : "Upload Badge PNG/WEBP"}
                    </span>
                  </label>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Short description of this tag's meaning..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1E971D] text-sm text-slate-700"
                  />
                </div>

                {/* Active Checkbox */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActiveTag"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-[#1E971D] rounded cursor-pointer"
                  />
                  <label htmlFor="isActiveTag" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
                    Badge is Active & Visible on Website
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1E971D] hover:bg-[#167a17] text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-[#1E971D]/20 mt-4"
                >
                  {editingTag ? "Save Badge Changes" : "Create Badge"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TagManager;
