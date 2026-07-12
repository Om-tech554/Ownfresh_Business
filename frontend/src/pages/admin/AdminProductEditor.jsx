import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Loader2, Save, Package, DollarSign, Star, Image as ImageIcon } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import ImagePickerModal from "../../components/admin/ImagePickerModal";

const AdminProductEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id !== "create";

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [category, setCategory] = useState("");
  const [rating, setRating] = useState(5);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showImagePicker, setShowImagePicker] = useState(false);

  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/category/all`);
      if (res.data.success) {
        setCategories(res.data.categories);
        if (!isEditing && res.data.categories.length > 0) {
          setCategory(res.data.categories[0]._id);
        }
      }
    } catch (error) {
      console.error("Failed to load categories", error);
    }
  };

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      const fetchProduct = async () => {
        try {
          const res = await axios.get(`${API_BASE_URL}/api/product/${id}`);
          const product = res.data.product;
          if (product) {
            setName(product.name || "");
            setSku(product.sku || "");
            setShortDesc(product.shortDesc || "");
            setCategory(product.category?._id || product.category || "");
            setRating(product.rating || 5);
            setPreview(product.image || null);
          }
        } catch (error) {
          toast.error("Failed to load product details.");
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEditing]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !shortDesc.trim() || !category) {
      toast.error("All textual fields, including category, are required!");
      return;
    }
    if (!isEditing && !image) {
      toast.error("Product image is required for new items!");
      return;
    }

    setSaving(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("sku", sku);
    formData.append("shortDesc", shortDesc);
    formData.append("category", category);
    formData.append("rating", rating);

    if (image) formData.append("image", image);

    try {
      if (isEditing) {
        await axios.put(`${API_BASE_URL}/api/product/update/${id}`, formData, { withCredentials: true });
        toast.success("Product updated successfully!");
      } else {
        await axios.post(`${API_BASE_URL}/api/product/add`, formData, { withCredentials: true });
        toast.success("Product published successfully!");
      }
      setTimeout(() => navigate("/admin"), 1500);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save product.");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex justify-center pt-32 bg-[#fafafa]"><Loader2 className="w-12 h-12 animate-spin text-[#24672E]" /></div>;
  }

  return (
    <div className="bg-[#fafafa] min-h-screen pb-20 font-sans">
      <Toaster position="top-center" />

      {/* ── HEADER NAVBAR ── */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/admin")} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex items-center gap-2 border-l-2 border-gray-200 pl-4 text-slate-900">
            <Package className="w-5 h-5 text-[#24672E]" />
            <h1 className="text-xl font-black uppercase tracking-widest">
              {isEditing ? "Edit Product Details" : "Draft New Product"}
            </h1>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#24672E] text-white px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#e63b2a] hover:shadow-lg transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEditing ? "Save Configuration" : "Publish to Catalog"}
        </button>
      </div>

      <div className="max-w-6xl mx-auto mt-10 px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── LEFT: MAIN DETAILS (2 COLUMNS) ── */}
        <div className="lg:col-span-2 space-y-6">

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-8">

            {/* Name */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Product Designation</label>
              <input
                type="text"
                placeholder="e.g. Premium Stone Pressed Mustard Oil"
                className="w-full text-3xl font-black text-slate-900 border-none bg-slate-50 rounded-2xl p-4 focus:ring-2 focus:ring-[#24672E]/20 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Short Description */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Short Description</label>
              <textarea
                placeholder="Briefly describe the key benefits and features of this product..."
                className="w-full text-lg font-medium text-slate-700 border-none bg-slate-50 rounded-2xl p-4 h-32 resize-none focus:ring-2 focus:ring-[#24672E]/20 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
              />
            </div>

            {/* Category Selection */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Product Category</label>
              <select
                className="w-full text-lg font-bold text-slate-900 border-none bg-slate-50 rounded-2xl p-4 focus:ring-2 focus:ring-[#24672E]/20 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="" disabled>Select Category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Pricing Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
              {/* SKU */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">SKU / Identifier</label>
                <div className="relative">
                  <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="e.g. PRD-123"
                    className="w-full pl-12 pr-4 py-4 text-xl font-bold text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#24672E]/20 focus:border-[#24672E] outline-none transition-all"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                  />
                </div>
              </div>

              {/* Rating */}
              <div className="space-y-3 flex flex-col justify-center">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black uppercase text-yellow-600 tracking-widest flex items-center gap-1">
                    <Star size={14} className="fill-yellow-500 text-yellow-500" /> Quality Rating
                  </label>
                  <span className="text-lg font-black text-yellow-700 bg-yellow-100 px-3 py-1 rounded-xl shadow-sm">{rating}.0</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full h-2.5 bg-yellow-200 rounded-lg appearance-none cursor-pointer accent-yellow-600"
                />
              </div>
            </div>

          </div>
        </div>

        {/* ── RIGHT: MEDIA CANVAS (1 COLUMN) ── */}
        <div className="space-y-6">

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-[500px]">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-gray-100 pb-4 mb-4">Product Visuals</h3>

            <label className="flex-1 cursor-pointer group flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-200 bg-slate-50 rounded-2xl hover:border-[#24672E] hover:bg-orange-50/30 transition-all overflow-hidden relative">
              <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />

              {preview ? (
                <>
                  <img src={preview} alt="Product Media" className="w-full h-full object-contain p-2 mix-blend-multiply" />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <span className="bg-white text-slate-900 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-xl flex items-center gap-2">
                      <Upload size={14} /> Update Image
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 text-slate-400 group-hover:text-[#24672E]">
                  <div className="p-4 bg-white rounded-full shadow-sm border border-slate-100">
                    <Upload size={24} />
                  </div>
                  <span className="text-xs uppercase font-black tracking-widest text-center mt-2">Upload Display<br />Image</span>
                  <span className="text-[10px] text-slate-400 font-medium">PNG, JPG, WEBP Format</span>
                </div>
              )}
            </label>

            <button
              type="button"
              onClick={() => setShowImagePicker(true)}
              className="mt-4 w-full bg-slate-900 text-white hover:bg-[#24672E] py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
            >
              <ImageIcon size={14} />
              Choose from Gallery
            </button>
          </div>

        </div>
      </div>

      <ImagePickerModal
        isOpen={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onSelect={(url) => {
          setImage(url);
          setPreview(url);
          toast.success("Image selected from gallery!");
        }}
      />
    </div>
  );
};

export default AdminProductEditor;
