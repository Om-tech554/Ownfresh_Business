// import React, { useState } from "react";
// import axios from "axios";

// const AddBlog = ({ onClose }) => {
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [image, setImage] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!title || !description || !image) {
//       alert("Please fill all fields");
//       return;
//     }

//     try {
//       setLoading(true);

//       const formData = new FormData();
//       formData.append("title", title);
//       formData.append("description", description);
//       formData.append("image", image);

//       await axios.post(
//         "http://localhost:8000/api/blog/add",
//         formData,
//         { withCredentials: true }
//       );

//       alert("Blog added successfully");
//       onClose();

//     } catch (error) {
//       alert("Failed to add blog");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
//       <form
//         onSubmit={handleSubmit}
//         className="bg-white w-[90%] max-w-md p-6 rounded-xl flex flex-col gap-4"
//       >
//         <h2 className="text-xl font-bold">Add New Blog</h2>

//         <input
//           type="text"
//           placeholder="Blog Title"
//           className="border p-2 rounded"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//         />

//         <textarea
//           placeholder="Blog Description"
//           className="border p-2 rounded h-24"
//           value={description}
//           onChange={(e) => setDescription(e.target.value)}
//         />

//         <input
//           type="file"
//           accept="image/*"
//           className="border p-2 rounded"
//           onChange={(e) => setImage(e.target.files[0])}
//         />

//         <button
//           type="submit"
//           disabled={loading}
//           className="bg-[#ff4d2d] text-white p-2 rounded"
//         >
//           {loading ? "Adding..." : "Add Blog"}
//         </button>

//         <button type="button" onClick={onClose} className="text-red-500">
//           Cancel
//         </button>
//       </form>
//     </div>
//   );
// };

// export default AddBlog;


import React, { useState, useRef } from "react";
import axios from "axios";
import { X, Upload, FileText, Type, Image as ImageIcon, Loader2 } from "lucide-react";

const AddBlog = ({ onClose }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !image) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("image", image);

      await axios.post("http://localhost:8000/api/blog/add", formData, {
        withCredentials: true,
      });

      alert("Blog added successfully");
      onClose();
    } catch (error) {
      alert("Failed to add blog");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in duration-300">
        
        {/* Left Side: Preview/Visual (Hidden on mobile) */}
        <div className="hidden md:flex md:w-1/3 bg-slate-100 border-r border-slate-200 flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-[#ff4d2d]/10 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-[#ff4d2d]" />
          </div>
          <h3 className="font-bold text-slate-800">New Insight</h3>
          <p className="text-xs text-slate-500 mt-2 italic">
            "Share the latest updates from the oil & energy sector with your partners."
          </p>
        </div>

        {/* Right Side: Form */}
        <form onSubmit={handleSubmit} className="flex-1 p-8 flex flex-col gap-5">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Blog Post</h2>
            <button 
              type="button" 
              onClick={onClose} 
              className="p-1 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>

          {/* Title Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Type className="w-3 h-3" /> Blog Title
            </label>
            <input
              type="text"
              placeholder="e.g. Q4 Market Analysis: Crude Oil Trends"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#ff4d2d] focus:border-transparent transition-all outline-none text-slate-800"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <FileText className="w-3 h-3" /> Content Description
            </label>
            <textarea
              placeholder="Provide a detailed description of the update..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg h-32 focus:ring-2 focus:ring-[#ff4d2d] focus:border-transparent transition-all outline-none resize-none text-slate-800"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Image Upload Area - Set to show full image */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <ImageIcon className="w-3 h-3" /> Featured Image
            </label>
            <div 
              onClick={() => fileInputRef.current.click()}
              className={`relative cursor-pointer border-2 border-dashed rounded-lg transition-all flex items-center justify-center overflow-hidden bg-slate-50 h-40 ${
                preview ? 'border-[#ff4d2d]' : 'border-slate-300 hover:border-[#ff4d2d]'
              }`}
            >
              {preview ? (
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="w-full h-full object-contain bg-slate-200" // object-contain ensures the image is never cut
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <Upload className="w-6 h-6" />
                  <span className="text-sm font-medium">Click to upload (Full Ratio)</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center gap-4 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors border border-transparent hover:border-slate-200 rounded-lg"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] bg-[#ff4d2d] text-white py-3 rounded-lg font-bold shadow-lg shadow-[#ff4d2d]/30 hover:bg-[#e63b2a] hover:-translate-y-0.5 transition-all active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                "Publish Post"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBlog;