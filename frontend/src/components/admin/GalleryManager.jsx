import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  Trash2,
  Edit,
  Search,
  Filter,
  Eye,
  EyeOff,
  Upload,
  X,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { useConfirm } from "../../hooks/ConfirmContext.jsx";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const CATEGORIES = ["Our Oils", "Extraction", "Ingredients", "Culinary", "Community"];

const GalleryManager = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalImages, setTotalImages] = useState(0);

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingImage, setEditingImage] = useState(null);

  // Form States
  const [uploadForm, setUploadForm] = useState({
    title: "",
    category: "Our Oils",
    description: "",
    displayOrder: 0,
    isActive: true,
  });
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState("");

  const [editForm, setEditForm] = useState({
    title: "",
    category: "",
    description: "",
    displayOrder: 0,
    isActive: true,
  });

  const [copiedId, setCopiedId] = useState(null);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/gallery/admin`, {
        params: { page, limit: 12, search, category },
        withCredentials: true,
      });
      if (res.data.success) {
        setImages(res.data.images || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalImages(res.data.totalImages || 0);
      }
    } catch (error) {
      toast.error("Failed to load gallery images");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [page, search, category]);

  const handleCopyLink = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Image URL copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit");
      return;
    }

    // Validate type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPEG, JPG, PNG and WEBP images are allowed");
      return;
    }

    setUploadFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.error("Please select an image file to upload");
      return;
    }
    if (!uploadForm.title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    const data = new FormData();
    data.append("image", uploadFile);
    data.append("title", uploadForm.title.trim());
    data.append("category", uploadForm.category);
    data.append("description", uploadForm.description.trim());
    data.append("displayOrder", uploadForm.displayOrder);
    data.append("isActive", uploadForm.isActive);

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/gallery/admin/upload`, data, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        toast.success("Image uploaded successfully");
        setShowUploadModal(false);
        setUploadFile(null);
        setUploadPreview("");
        setUploadForm({
          title: "",
          category: "Our Oils",
          description: "",
          displayOrder: 0,
          isActive: true,
        });
        fetchImages();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  const handleEditOpen = (img) => {
    setEditingImage(img);
    setEditForm({
      title: img.title,
      category: img.category,
      description: img.description || "",
      displayOrder: img.displayOrder || 0,
      isActive: img.isActive,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.title.trim()) {
      toast.error("Title is required");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/gallery/admin/${editingImage._id}`,
        editForm,
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success("Image updated successfully");
        setShowEditModal(false);
        fetchImages();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update image");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (id) => {
    const isConfirmed = await confirm({
      title: "Delete Image?",
      message: "Are you sure you want to delete this photo from the gallery?",
      type: "danger",
      confirmText: "Delete"
    });
    if (!isConfirmed) return;

    setLoading(true);
    try {
      const res = await axios.delete(`${API_BASE_URL}/api/gallery/admin/${id}`, {
        withCredentials: true,
      });
      if (res.data.success) {
        toast.success("Image deleted successfully");
        fetchImages();
      }
    } catch (error) {
      toast.error("Failed to delete image");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (img) => {
    try {
      const updatedStatus = !img.isActive;
      const res = await axios.put(
        `${API_BASE_URL}/api/gallery/admin/${img._id}`,
        {
          title: img.title,
          category: img.category,
          description: img.description,
          displayOrder: img.displayOrder,
          isActive: updatedStatus,
        },
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success(`Image ${updatedStatus ? "enabled" : "disabled"}`);
        fetchImages();
      }
    } catch (error) {
      toast.error("Failed to toggle status");
    }
  };

  return (
    <div className="px-6 py-8 md:px-12 lg:px-20 max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <ImageIcon className="text-[#24672E] w-8 h-8" />
            Media & <span className="text-[#24672E]">Gallery</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">
            Central Media Library
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm text-sm font-bold text-slate-700">
            {totalImages} Total Photos
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 bg-[#24672E] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#167a17] transition-all shadow-lg shadow-[#24672E]/20"
          >
            <Plus size={20} />
            Upload Photo
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="mb-8 p-4 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-[#24672E]/20 outline-none"
            placeholder="Search by title or description..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="relative w-full md:w-72">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <select
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl outline-none"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* GALLERY GRID */}
      {loading && images.length === 0 ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#24672E]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((img) => (
            <div
              key={img._id}
              className={`bg-white rounded-2xl overflow-hidden border shadow-sm transition-all duration-300 flex flex-col group relative ${img.isActive ? "border-slate-200 hover:shadow-md" : "border-slate-200 bg-slate-50/55 opacity-75"
                }`}
            >
              {/* IMAGE PREVIEW */}
              <div className="relative w-full h-48 bg-slate-100 overflow-hidden">
                <img
                  src={img.imageUrl}
                  alt={img.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />

                {/* Badge Overlay */}
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className="bg-slate-900/80 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded">
                    {img.category}
                  </span>
                  <span
                    className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${img.isActive
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                      }`}
                  >
                    Order: {img.displayOrder}
                  </span>
                </div>

                {/* Quick Toggle Status */}
                <button
                  onClick={() => handleToggleActive(img)}
                  className="absolute top-3 right-3 p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow hover:bg-white text-slate-700 transition-colors"
                  title={img.isActive ? "Disable visibility" : "Enable visibility"}
                >
                  {img.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>

              {/* DETAILS */}
              <div className="p-4 flex-grow flex flex-col justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-800 line-clamp-1 mb-1" title={img.title}>
                    {img.title}
                  </h4>
                  <p className="text-slate-500 text-xs line-clamp-2 h-8 leading-relaxed mb-4">
                    {img.description || "No description provided."}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleCopyLink(img.imageUrl, img._id)}
                    className="text-xs font-bold text-slate-600 hover:text-[#24672E] flex items-center gap-1 transition-colors"
                  >
                    {copiedId === img._id ? (
                      <>
                        <Check size={14} className="text-emerald-600" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        Copy URL
                      </>
                    )}
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditOpen(img)}
                      className="p-1.5 bg-slate-50 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                      title="Edit details"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteImage(img._id)}
                      className="p-1.5 bg-slate-50 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                      title="Delete photo"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {images.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
              <ImageIcon className="mx-auto text-slate-300 mb-4" size={48} />
              <p className="text-slate-500 font-bold">No gallery photos found. Start by uploading one!</p>
            </div>
          )}
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-6">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="p-2.5 rounded-full bg-white border text-slate-600 disabled:opacity-30 hover:bg-[#24672E] hover:text-white transition-all shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-slate-500 font-medium text-sm">
            Page <span className="text-slate-900 font-bold">{page}</span> of {totalPages}
          </span>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="p-2.5 rounded-full bg-white border text-slate-600 disabled:opacity-30 hover:bg-[#24672E] hover:text-white transition-all shadow-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* UPLOAD MODAL */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => {
                setShowUploadModal(false);
                setUploadFile(null);
                setUploadPreview("");
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl z-10"
            >
              <div className="bg-[#24672E] p-6 text-white flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Upload size={20} />
                  Upload New Image
                </h3>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadFile(null);
                    setUploadPreview("");
                  }}
                  className="hover:rotate-90 transition-transform"
                >
                  <X size={24} />
                </button>
              </div>

            <form onSubmit={handleUploadSubmit} className="p-8 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Select Image (Limit: 10MB)
                </label>
                <div className="space-y-4">
                  {uploadPreview && (
                    <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-slate-200">
                      <img src={uploadPreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setUploadFile(null);
                          setUploadPreview("");
                        }}
                        className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-lg text-red-500 hover:bg-red-50 shadow-sm"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                  <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-[#24672E] transition-all group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 text-slate-400 group-hover:text-[#24672E] mb-2" />
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                        {uploadFile ? "Change Image File" : "Choose Image File"}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">JPEG, JPG, PNG, WEBP</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Image Title
                </label>
                <input
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#24672E] transition-all font-medium"
                  placeholder="e.g. Traditional stone pressed grinding"
                  required
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Category
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#24672E] transition-all font-bold cursor-pointer"
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#24672E] transition-all font-bold"
                    placeholder="0"
                    value={uploadForm.displayOrder}
                    onChange={(e) => setUploadForm({ ...uploadForm, displayOrder: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Description / Caption
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#24672E] transition-all min-h-[80px] resize-none font-medium"
                  placeholder="Provide a caption or short description..."
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveUpload"
                  checked={uploadForm.isActive}
                  onChange={(e) => setUploadForm({ ...uploadForm, isActive: e.target.checked })}
                  className="w-4 h-4 text-[#24672E] focus:ring-[#24672E] border-slate-300 rounded cursor-pointer"
                />
                <label
                  htmlFor="isActiveUpload"
                  className="text-sm font-bold text-slate-700 cursor-pointer select-none"
                >
                  Visible on user gallery page immediately
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-[#24672E] transition-all transform active:scale-95 disabled:opacity-50 mt-6 shadow-xl uppercase tracking-wider text-xs"
              >
                {loading ? "Uploading image..." : "Upload Image"}
              </button>
            </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowEditModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl z-10"
            >
              <div className="bg-[#24672E] p-6 text-white flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Edit size={20} />
                  Edit Gallery Image Properties
                </h3>
                <button onClick={() => setShowEditModal(false)} className="hover:rotate-90 transition-transform">
                  <X size={24} />
                </button>
              </div>

            <form onSubmit={handleEditSubmit} className="p-8 space-y-4">
              <div className="w-full h-32 rounded-xl overflow-hidden border border-slate-200 mb-4 bg-slate-50">
                <img
                  src={editingImage?.imageUrl}
                  alt="Edit Target"
                  className="w-full h-full object-contain"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Image Title
                </label>
                <input
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#24672E] transition-all font-medium"
                  placeholder="e.g. Pure stone pressed oil extraction"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Category
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#24672E] transition-all font-bold cursor-pointer"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#24672E] transition-all font-bold"
                    placeholder="0"
                    value={editForm.displayOrder}
                    onChange={(e) => setEditForm({ ...editForm, displayOrder: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Description / Caption
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#24672E] transition-all min-h-[80px] resize-none font-medium"
                  placeholder="Provide a caption or short description..."
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveEdit"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                  className="w-4 h-4 text-[#24672E] focus:ring-[#24672E] border-slate-300 rounded cursor-pointer"
                />
                <label
                  htmlFor="isActiveEdit"
                  className="text-sm font-bold text-slate-700 cursor-pointer select-none"
                >
                  Visible on user gallery page
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-[#24672E] transition-all transform active:scale-95 disabled:opacity-50 mt-6 shadow-xl uppercase tracking-wider text-xs"
              >
                {loading ? "Saving changes..." : "Save Image Properties"}
              </button>
            </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryManager;
