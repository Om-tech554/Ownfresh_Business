import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Filter, X, ChevronLeft, ChevronRight, Check } from "lucide-react";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const CATEGORIES = ["Our Oils", "Extraction", "Ingredients", "Culinary", "Community"];

const ImagePickerModal = ({ isOpen, onClose, onSelect }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUrl, setSelectedUrl] = useState("");

  const fetchImages = async () => {
    if (!isOpen) return;
    setLoading(true);
    try {
      // Fetch all images for the admin picker
      const res = await axios.get(`${API_BASE_URL}/api/gallery/admin`, {
        params: { page, limit: 12, search, category },
        withCredentials: true,
      });
      if (res.data.success) {
        setImages(res.data.images || []);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to load gallery images in picker", error);
      toast.error("Failed to load gallery images");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [isOpen, page, search, category]);

  // Removed early return to allow exit animation

  const handleSelect = () => {
    if (!selectedUrl) {
      toast.error("Please select an image first");
      return;
    }
    onSelect(selectedUrl);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] z-10"
          >
        
        {/* HEADER */}
        <div className="bg-[#24672E] p-5 text-white flex justify-between items-center">
          <h3 className="text-lg font-bold flex items-center gap-2">
            Select Photo from Gallery
          </h3>
          <button onClick={onClose} className="hover:rotate-90 transition-transform">
            <X size={22} />
          </button>
        </div>

        {/* CONTROLS */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#24672E]/10"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="relative w-full sm:w-56">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <select
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl outline-none"
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

        {/* IMAGE LIST GRID */}
        <div className="flex-grow overflow-y-auto p-6 bg-slate-50/50">
          {loading && images.length === 0 ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#24672E]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((img) => (
                <div
                  key={img._id}
                  onClick={() => setSelectedUrl(img.imageUrl)}
                  onDoubleClick={() => {
                    onSelect(img.imageUrl);
                    onClose();
                  }}
                  className={`group relative rounded-xl overflow-hidden border bg-white cursor-pointer transition-all ${
                    selectedUrl === img.imageUrl
                      ? "border-[#24672E] ring-2 ring-[#24672E]/20 shadow-md"
                      : "border-slate-200 hover:border-slate-400 shadow-sm"
                  }`}
                >
                  <div className="w-full h-32 bg-slate-100 overflow-hidden relative">
                    <img
                      src={img.imageUrl}
                      alt={img.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {selectedUrl === img.imageUrl && (
                      <div className="absolute inset-0 bg-[#24672E]/30 flex items-center justify-center">
                        <div className="bg-[#24672E] text-white p-1 rounded-full shadow-lg">
                          <Check size={18} strokeWidth={3} />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-2.5">
                    <p className="text-xs font-bold text-slate-800 line-clamp-1" title={img.title}>
                      {img.title}
                    </p>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mt-0.5">
                      {img.category}
                    </p>
                  </div>
                </div>
              ))}

              {images.length === 0 && (
                <div className="col-span-full py-16 text-center text-slate-400 font-bold text-sm">
                  No images found. Please upload to Gallery first.
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER & PAGINATION */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Pagination controls */}
          {totalPages > 1 ? (
            <div className="flex items-center gap-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-full border text-slate-600 disabled:opacity-30 hover:bg-[#24672E] hover:text-white transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-slate-500 font-medium">
                Page <span className="font-bold text-slate-900">{page}</span> of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-full border text-slate-600 disabled:opacity-30 hover:bg-[#24672E] hover:text-white transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            <div />
          )}

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSelect}
              className="flex-1 sm:flex-none px-6 py-2 text-sm font-bold text-white bg-[#24672E] hover:bg-[#167a17] rounded-xl shadow transition-colors"
            >
              Select Image
            </button>
          </div>
        </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ImagePickerModal;
