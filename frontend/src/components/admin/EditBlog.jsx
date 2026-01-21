import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, RefreshCw, Type, FileText, ImageIcon, Upload, CheckCircle2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const EditBlog = ({ blog, onClose, onUpdated }) => {
  const [title, setTitle] = useState(blog.title);
  const [description, setDescription] = useState(blog.description);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle image preview for the new file selection
  useEffect(() => {
    if (!image) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(image);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      if (image) formData.append("image", image);

      await axios.put(
        `http://localhost:8000/api/blog/update/${blog._id}`,
        formData,
        { withCredentials: true }
      );

      toast.success("Blog entry updated successfully!", {
        duration: 4000,
        style: { background: "#1e293b", color: "#fff", border: "1px solid #ff4d2d" },
      });

      // Brief delay so user sees the success toast before closing
      setTimeout(() => {
        onUpdated();
        onClose();
      }, 1000);
    } catch (error) {
      toast.error("Update failed. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <Toaster position="top-right" />
      
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-slate-50 border-b">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Edit Industry Blog</h2>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">Refining Content</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleUpdate} className="p-8 space-y-6">
          {/* Title Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <Type className="w-4 h-4 text-[#ff4d2d]" /> Title
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#ff4d2d] focus:border-transparent transition-all outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <FileText className="w-4 h-4 text-[#ff4d2d]" /> Description
            </label>
            <textarea
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl h-32 focus:ring-2 focus:ring-[#ff4d2d] transition-all outline-none resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Image Management */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <ImageIcon className="w-4 h-4 text-[#ff4d2d]" /> Image Assets
            </label>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Current Image */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase text-slate-400 font-bold">Currently Published</span>
                <div className="h-32 w-full bg-slate-100 rounded-lg overflow-hidden border">
                  <img src={blog.image} className="w-full h-full object-contain" alt="Current" />
                </div>
              </div>

              {/* New Selection Preview */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase text-[#ff4d2d] font-bold">New Selection</span>
                <div className={`h-32 w-full rounded-lg overflow-hidden border border-dashed flex items-center justify-center ${preview ? 'bg-slate-100' : 'bg-slate-50 border-slate-300'}`}>
                  {preview ? (
                    <img src={preview} className="w-full h-full object-contain" alt="New Preview" />
                  ) : (
                    <p className="text-[10px] text-slate-400 text-center px-2 italic text-balance">No new image selected</p>
                  )}
                </div>
              </div>
            </div>

            <label className="flex items-center justify-center gap-3 w-full py-3 px-4 bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-200 hover:border-[#ff4d2d] transition-all group">
              <Upload className="w-5 h-5 text-slate-400 group-hover:text-[#ff4d2d]" />
              <span className="text-sm font-semibold text-slate-600">Replace featured image</span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
              />
            </label>
          </div>
          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] bg-slate-900 text-white py-3 rounded-xl font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Updating Database...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 text-[#ff4d2d]" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBlog;