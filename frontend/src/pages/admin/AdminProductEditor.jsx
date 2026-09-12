import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  Loader2,
  Save,
  Package,
  Star,
  Image as ImageIcon,
  Plus,
  Trash2,
  Layers,
  Tag,
  Check,
  Eye,
  Info,
  Award,
  ShieldCheck,
  Leaf,
  Sparkles
} from "lucide-react";
import toast from "react-hot-toast";
import ImagePickerModal from "../../components/admin/ImagePickerModal";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:10000";

const STANDARD_SIZES = ["250 ml", "500 ml", "1 Litre", "2 Litre", "5 Litre", "15 Litre"];

const AdminProductEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id !== "create";

  // Product Base Fields
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [rating, setRating] = useState(5);
  const [status, setStatus] = useState("Active");

  // Product Images
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [labelImage, setLabelImage] = useState("");

  // Tags & Badges
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTagIds, setSelectedTagIds] = useState([]);

  // Variations (Bottle Sizes)
  const [variants, setVariants] = useState([]);

  // State for Image Picker
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [imagePickerTarget, setImagePickerTarget] = useState(null); // 'main', 'gallery', 'label', or { type: 'variant', index, field }

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  // Fetch Categories & Tags
  const fetchMetadata = async () => {
    try {
      const [catRes, tagRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/category/all`),
        axios.get(`${API_BASE_URL}/api/tag/all`, { withCredentials: true })
      ]);
      if (catRes.data.success) {
        setCategories(catRes.data.categories || []);
        if (!isEditing && catRes.data.categories.length > 0) {
          setCategory(catRes.data.categories[0]._id);
        }
      }
      if (tagRes.data.success) {
        setAvailableTags(tagRes.data.tags || []);
      }
    } catch (error) {
      console.error("Failed to load metadata", error);
    }
  };

  useEffect(() => {
    fetchMetadata();
    if (isEditing) {
      const fetchProduct = async () => {
        try {
          const res = await axios.get(`${API_BASE_URL}/api/product/${id}`);
          const prod = res.data.product;
          if (prod) {
            setName(prod.name || "");
            setSku(prod.sku || "");
            setShortDesc(prod.shortDesc || "");
            setDescription(prod.description || "");
            setCategory(prod.category?._id || prod.category || "");
            setRating(prod.rating || 5);
            setStatus(prod.status || "Active");
            setPreview(prod.image || null);
            setGalleryImages(prod.images || [prod.image].filter(Boolean));
            setLabelImage(prod.labelImage || "");
            setSelectedTagIds((prod.tags || []).map(t => (typeof t === 'object' ? t._id : t)));
            setVariants(prod.variants || []);
          }
        } catch (error) {
          toast.error("Failed to load product details.");
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    } else {
      // Default standard variations for new product
      setVariants([
        { name: "250 ml", size: "250ml", sku: "OF-250ML", price: 180, salePrice: 150, stockQuantity: 50, weight: "250g", shippingWeight: 0.35, image: "", images: [], status: "Active" },
        { name: "500 ml", size: "500ml", sku: "OF-500ML", price: 320, salePrice: 260, stockQuantity: 60, weight: "500g", shippingWeight: 0.65, image: "", images: [], status: "Active" },
        { name: "1 Litre", size: "1L", sku: "OF-1L", price: 580, salePrice: 475, stockQuantity: 100, weight: "1kg", shippingWeight: 1.20, image: "", images: [], status: "Active" },
        { name: "5 Litre", size: "5L", sku: "OF-5L", price: 4600, salePrice: 3800, stockQuantity: 25, weight: "5kg", shippingWeight: 5.50, image: "", images: [], status: "Active" }
      ]);
    }
  }, [id, isEditing]);

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const toggleTag = (tagId) => {
    if (selectedTagIds.includes(tagId)) {
      setSelectedTagIds(selectedTagIds.filter(id => id !== tagId));
    } else {
      setSelectedTagIds([...selectedTagIds, tagId]);
    }
  };

  // Variant Management Helpers
  const addVariant = (sizeName = "1 Litre") => {
    let defaultWeightKg = 1.20;
    const lower = sizeName.toLowerCase();
    if (lower.includes("15")) defaultWeightKg = 16.0;
    else if (lower.includes("5")) defaultWeightKg = 5.50;
    else if (lower.includes("2")) defaultWeightKg = 2.30;
    else if (lower.includes("1")) defaultWeightKg = 1.20;
    else if (lower.includes("500")) defaultWeightKg = 0.65;
    else if (lower.includes("250")) defaultWeightKg = 0.35;

    const newV = {
      name: sizeName,
      size: sizeName.replace(/\s+/g, "").toLowerCase(),
      sku: `${sku || 'OF'}-${sizeName.replace(/\s+/g, "").toUpperCase()}`,
      price: 500,
      salePrice: 450,
      stockQuantity: 50,
      weight: sizeName,
      shippingWeight: defaultWeightKg,
      image: preview || "",
      images: preview ? [preview] : [],
      labelImage: "",
      status: "Active"
    };
    setVariants([...variants, newV]);
  };

  const updateVariantField = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const removeVariant = (index) => {
    if (variants.length <= 1) {
      toast.error("At least one variation is required");
      return;
    }
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleImagePickerSelect = (url) => {
    if (imagePickerTarget === "main") {
      setImage(url);
      setPreview(url);
      toast.success("Main image updated");
    } else if (imagePickerTarget === "gallery") {
      if (!galleryImages.includes(url)) {
        setGalleryImages([...galleryImages, url]);
      }
      toast.success("Photo added to gallery");
    } else if (imagePickerTarget === "label") {
      setLabelImage(url);
      toast.success("Label image updated");
    } else if (imagePickerTarget && imagePickerTarget.type === "variant") {
      const { index, field } = imagePickerTarget;
      const updated = [...variants];
      if (field === "image") {
        updated[index].image = url;
        if (!updated[index].images.includes(url)) {
          updated[index].images = [url, ...updated[index].images];
        }
      } else if (field === "images") {
        if (!updated[index].images.includes(url)) {
          updated[index].images = [...updated[index].images, url];
        }
      } else if (field === "labelImage") {
        updated[index].labelImage = url;
      }
      setVariants(updated);
      toast.success("Variant image updated");
    }
    setShowImagePicker(false);
  };

  const handleSave = async () => {
    if (!name.trim() || !shortDesc.trim() || !category) {
      toast.error("Product name, short description, and category are required!");
      return;
    }
    if (!isEditing && !image && !preview) {
      toast.error("Product display image is required!");
      return;
    }
    if (variants.length === 0) {
      toast.error("At least one bottle size variation is required!");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("sku", sku.trim());
      formData.append("shortDesc", shortDesc.trim());
      formData.append("description", description.trim());
      formData.append("category", category);
      formData.append("rating", rating);
      formData.append("status", status);

      formData.append("tags", JSON.stringify(selectedTagIds));
      formData.append("images", JSON.stringify(galleryImages));
      formData.append("labelImage", labelImage);

      // Pass variants array JSON
      formData.append("variants", JSON.stringify(variants));

      if (image instanceof File) {
        formData.append("image", image);
      } else if (preview) {
        formData.append("image", preview);
      }

      if (isEditing) {
        await axios.put(`${API_BASE_URL}/api/product/update/${id}`, formData, { withCredentials: true });
        toast.success("Product and variations updated successfully!");
      } else {
        await axios.post(`${API_BASE_URL}/api/product/add`, formData, { withCredentials: true });
        toast.success("Product published with all bottle sizes!");
      }
      setTimeout(() => navigate("/admin"), 1200);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save product.");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center pt-32 bg-[#fafafa]">
        <Loader2 className="w-12 h-12 animate-spin text-[#1E971D]" />
      </div>
    );
  }

  return (
    <div className="bg-[#fafafa] min-h-screen pb-28 font-sans">
      {/* ── HEADER NAVBAR ── */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin")}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex items-center gap-2 border-l-2 border-gray-200 pl-4 text-slate-900">
            <Package className="w-5 h-5 text-[#1E971D]" />
            <h1 className="text-lg md:text-xl font-black uppercase tracking-widest">
              {isEditing ? "Edit Product & Variations" : "Draft New Oil Product"}
            </h1>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#1E971D] hover:bg-[#167a17] text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEditing ? "Save All Changes" : "Publish to Catalog"}
        </button>
      </div>

      <div className="max-w-7xl mx-auto mt-8 px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ── LEFT & CENTER: PRODUCT DETAILS + VARIATIONS (2 COLUMNS) ── */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 1. BASIC DETAILS CARD */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xs flex flex-col gap-6">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-gray-100 pb-3">
              <Info size={14} className="text-[#1E971D]" /> Product Information
            </h2>

            {/* Product Name */}
            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">
                Product Title / Name *
              </label>
              <input
                type="text"
                placeholder="e.g. OwnFresh Stone Pressed Mustard Oil"
                className="w-full text-xl font-black text-slate-900 bg-slate-50 rounded-2xl p-4 focus:ring-2 focus:ring-[#1E971D]/20 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Short Description */}
            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">
                Short Description *
              </label>
              <textarea
                placeholder="Key benefits and extraction highlights..."
                className="w-full text-sm font-medium text-slate-700 bg-slate-50 rounded-2xl p-4 h-24 resize-none focus:ring-2 focus:ring-[#1E971D]/20 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
              />
            </div>

            {/* Detailed Description */}
            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">
                Detailed Product Description (Optional)
              </label>
              <textarea
                placeholder="Nutritional facts, stone-pressed extraction technique, aroma, culinary uses..."
                className="w-full text-sm font-medium text-slate-700 bg-slate-50 rounded-2xl p-4 h-28 resize-none focus:ring-2 focus:ring-[#1E971D]/20 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Category & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">
                  Category *
                </label>
                <select
                  className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-bold text-slate-800 outline-none cursor-pointer focus:ring-2 focus:ring-[#1E971D]/20"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="" disabled>Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">
                  Status
                </label>
                <select
                  className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-bold text-slate-800 outline-none cursor-pointer focus:ring-2 focus:ring-[#1E971D]/20"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Active">Active (Visible)</option>
                  <option value="Inactive">Inactive (Hidden)</option>
                </select>
              </div>
            </div>

            {/* SKU & Quality Rating */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">
                  Parent SKU / Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. OF-MUSTARD"
                  className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#1E971D]/20"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-black uppercase text-yellow-600 tracking-widest flex items-center gap-1">
                    <Star size={14} className="fill-yellow-500 text-yellow-500" /> Rating
                  </label>
                  <span className="text-sm font-black text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-lg">{rating}.0</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full h-2.5 bg-yellow-200 rounded-lg appearance-none cursor-pointer accent-yellow-600 mt-2"
                />
              </div>
            </div>

          </div>

          {/* 2. TAGS, BADGES & LABELS ASSIGNMENT */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xs flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Tag size={14} className="text-[#1E971D]" /> Product Badges & Stickers
              </h2>
              <span className="text-xs text-slate-400 font-bold">
                {selectedTagIds.length} Selected
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Select which promotional badges appear on product cards and details:
            </p>

            <div className="flex flex-wrap gap-2.5">
              {availableTags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag._id);
                const renderTagIcon = (iconName) => {
                  switch (iconName) {
                    case "Award": return <Award size={13} />;
                    case "Leaf": return <Leaf size={13} />;
                    case "ShieldCheck": return <ShieldCheck size={13} />;
                    case "Sparkles": return <Sparkles size={13} />;
                    case "Star": return <Star size={13} />;
                    default: return <Tag size={13} />;
                  }
                };

                return (
                  <button
                    key={tag._id}
                    type="button"
                    onClick={() => toggleTag(tag._id)}
                    style={{
                      backgroundColor: isSelected ? tag.bgColor : "#f8fafc",
                      color: isSelected ? tag.textColor : "#475569",
                      borderColor: isSelected ? tag.bgColor : "#e2e8f0"
                    }}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all cursor-pointer shadow-xs ${
                      isSelected ? "scale-105 shadow-md" : "hover:bg-slate-100"
                    }`}
                  >
                    {isSelected ? <Check size={13} /> : <Plus size={13} />}
                    {tag.imageUrl ? (
                      <img src={tag.imageUrl} alt="" className="w-3.5 h-3.5 object-contain rounded" />
                    ) : (
                      tag.icon && renderTagIcon(tag.icon)
                    )}
                    {tag.name ? <span>{tag.name}</span> : <span>{tag.icon || "Badge"}</span>}
                  </button>
                );
              })}
              {availableTags.length === 0 && (
                <p className="text-xs text-slate-400 italic">No tags created yet. You can create badges from the Tags & Badges tab.</p>
              )}
            </div>
          </div>

          {/* 3. PRODUCT VARIATION & BOTTLE SIZES MANAGER */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xs flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <Layers size={16} className="text-[#1E971D]" /> Bottle Size Variations & Photos
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Each bottle size has independent pricing, stock, SKU, and dedicated variation photos.
                </p>
              </div>

              {/* Quick Add Preset Sizes */}
              <div className="flex flex-wrap items-center gap-1.5">
                {STANDARD_SIZES.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => addVariant(sz)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-[#1E971D] hover:text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors"
                  >
                    + {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* VARIATIONS LIST */}
            <div className="space-y-6">
              {variants.map((v, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200/80 flex flex-col gap-4 relative group hover:border-[#1E971D]/40 transition-all"
                >
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                    <span className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg">
                      Variation #{idx + 1}: {v.name || "Bottle Size"}
                    </span>

                    <button
                      type="button"
                      onClick={() => removeVariant(idx)}
                      className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      title="Remove Variation"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Variation Details Form Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                        Size / Name *
                      </label>
                      <input
                        type="text"
                        value={v.name}
                        onChange={(e) => updateVariantField(idx, "name", e.target.value)}
                        placeholder="e.g. 5 Litre"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                        SKU
                      </label>
                      <input
                        type="text"
                        value={v.sku || ""}
                        onChange={(e) => updateVariantField(idx, "sku", e.target.value)}
                        placeholder="PRD-5L"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                        Regular Price (₹) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={v.price}
                        onChange={(e) => updateVariantField(idx, "price", Number(e.target.value))}
                        placeholder="500"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                        Sale Price (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={v.salePrice || ""}
                        onChange={(e) => updateVariantField(idx, "salePrice", e.target.value ? Number(e.target.value) : null)}
                        placeholder="Optional"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                        Stock Qty *
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={v.stockQuantity}
                        onChange={(e) => updateVariantField(idx, "stockQuantity", Number(e.target.value))}
                        placeholder="100"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                        Display Label
                      </label>
                      <input
                        type="text"
                        value={v.weight || ""}
                        onChange={(e) => updateVariantField(idx, "weight", e.target.value)}
                        placeholder="e.g. 5 Litre"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-[#1E971D] uppercase tracking-wider block mb-1 flex items-center justify-between">
                        <span>Ship Weight (kg) *</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={v.shippingWeight !== undefined && v.shippingWeight !== null ? v.shippingWeight : ""}
                        onChange={(e) => updateVariantField(idx, "shippingWeight", e.target.value === "" ? 0 : Number(e.target.value))}
                        placeholder="e.g. 5.50"
                        className="w-full p-2.5 bg-emerald-50/50 border border-emerald-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#1E971D]/20 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                        Status
                      </label>
                      <select
                        value={v.status || "Active"}
                        onChange={(e) => updateVariantField(idx, "status", e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  {/* Variation Photos Strip */}
                  <div className="mt-2 pt-3 border-t border-slate-200/60">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                        {v.name} Bottle Photos ({v.images?.length || 0})
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setImagePickerTarget({ type: "variant", index: idx, field: "images" });
                          setShowImagePicker(true);
                        }}
                        className="text-[10px] font-bold text-[#1E971D] hover:underline flex items-center gap-1"
                      >
                        <Plus size={12} /> Add Photo from Gallery
                      </button>
                    </div>

                    <div className="flex items-center gap-3 overflow-x-auto pb-2">
                      {/* Primary Bottle Photo Box */}
                      <div className="w-16 h-16 rounded-xl bg-white border-2 border-[#1E971D] p-1 shrink-0 relative group/img overflow-hidden">
                        <img
                          src={v.image || (v.images && v.images[0]) || preview || "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786009742/products/banner.png"}
                          alt={v.name}
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                        <span className="absolute bottom-0 inset-x-0 bg-[#1E971D] text-white text-[7px] font-black uppercase text-center py-0.5">
                          Primary
                        </span>
                      </div>

                      {/* Extra Variation Photos */}
                      {(v.images || []).filter(img => img !== v.image).map((extraImg, imgIdx) => (
                        <div key={imgIdx} className="w-16 h-16 rounded-xl bg-white border border-slate-200 p-1 shrink-0 relative group/img overflow-hidden">
                          <img src={extraImg} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...variants];
                              updated[idx].images = updated[idx].images.filter((_, i) => i !== imgIdx);
                              setVariants(updated);
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded p-0.5 opacity-0 group-hover/img:opacity-100 transition-opacity"
                          >
                            <Trash2 size={10} />
                          </button>
                          <button
                            type="button"
                            onClick={() => updateVariantField(idx, "image", extraImg)}
                            className="absolute bottom-0 inset-x-0 bg-slate-900 text-white text-[7px] font-bold uppercase text-center py-0.5 opacity-0 group-hover/img:opacity-100 transition-opacity"
                          >
                            Set Main
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => addVariant("New Bottle Size")}
              className="w-full py-4 border-2 border-dashed border-slate-300 hover:border-[#1E971D] rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 hover:text-[#1E971D] flex items-center justify-center gap-2 transition-colors cursor-pointer bg-slate-50/50"
            >
              <Plus size={16} /> Add Another Bottle Size Variation
            </button>
          </div>

        </div>

        {/* ── RIGHT: MEDIA CANVAS & GALLERY (1 COLUMN) ── */}
        <div className="space-y-6">

          {/* Primary Display Photo */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex flex-col">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4">
              Primary Product Display Visual
            </h3>

            <label className="h-64 cursor-pointer group flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-200 bg-slate-50 rounded-2xl hover:border-[#1E971D] transition-all overflow-hidden relative">
              <input type="file" className="hidden" onChange={handleMainImageChange} accept="image/*" />

              {preview ? (
                <>
                  <img src={preview} alt="Product Media" className="w-full h-full object-contain p-2 mix-blend-multiply" />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <span className="bg-white text-slate-900 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-xl flex items-center gap-2">
                      <Upload size={14} /> Update Photo
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-[#1E971D]">
                  <div className="p-3 bg-white rounded-full shadow-xs border border-slate-100">
                    <Upload size={20} />
                  </div>
                  <span className="text-xs uppercase font-black tracking-widest text-center mt-1">Upload Display Photo</span>
                  <span className="text-[10px] text-slate-400">PNG, JPG, WEBP Format</span>
                </div>
              )}
            </label>

            <button
              type="button"
              onClick={() => {
                setImagePickerTarget("main");
                setShowImagePicker(true);
              }}
              className="mt-3 w-full bg-slate-900 text-white hover:bg-[#1E971D] py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <ImageIcon size={14} /> Pick from Media Gallery
            </button>
          </div>

          {/* Product Gallery Photos */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                Additional Product Gallery ({galleryImages.length})
              </h3>
              <button
                type="button"
                onClick={() => {
                  setImagePickerTarget("gallery");
                  setShowImagePicker(true);
                }}
                className="text-xs font-bold text-[#1E971D] hover:underline"
              >
                + Add Photo
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {galleryImages.map((gImg, gIdx) => (
                <div key={gIdx} className="h-20 bg-slate-50 border border-slate-200 rounded-xl p-1 relative group/gimg overflow-hidden">
                  <img src={gImg} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                  <button
                    type="button"
                    onClick={() => setGalleryImages(galleryImages.filter((_, i) => i !== gIdx))}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded p-1 opacity-0 group-hover/gimg:opacity-100 transition-opacity"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </div>
            {galleryImages.length === 0 && (
              <p className="text-xs text-slate-400 italic text-center py-4">No additional gallery photos added.</p>
            )}
          </div>

          {/* Bottle / Label Image */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex flex-col">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-gray-100 pb-3 mb-3">
              Packaging & Bottle Label Image
            </h3>

            {labelImage ? (
              <div className="relative h-28 bg-slate-50 rounded-xl p-2 border border-slate-200 group/lbl overflow-hidden mb-3">
                <img src={labelImage} alt="Bottle Label" className="w-full h-full object-contain" />
                <button
                  type="button"
                  onClick={() => setLabelImage("")}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-lg opacity-0 group-hover/lbl:opacity-100 transition-opacity"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => {
                setImagePickerTarget("label");
                setShowImagePicker(true);
              }}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <ImageIcon size={14} /> {labelImage ? "Change Label Photo" : "Upload / Select Label Image"}
            </button>
          </div>

        </div>

      </div>

      <ImagePickerModal
        isOpen={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onSelect={handleImagePickerSelect}
      />
    </div>
  );
};

export default AdminProductEditor;
