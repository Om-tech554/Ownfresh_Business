// import React, { useState } from "react";
// import axios from "axios";

// const AddProduct = ({ onClose }) => {
//   const [name, setName] = useState("");
//   const [price, setPrice] = useState("");
//   const [image, setImage] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!name || !price || !image) {
//       alert("Please fill all fields");
//       return;
//     }

//     try {
//       setLoading(true);

//       const formData = new FormData();
//       formData.append("name", name);
//       formData.append("price", price);
//       formData.append("image", image);

//       await axios.post(
//         "http://localhost:8000/api/product/add",
//         formData,
//         { withCredentials: true }
//       );

//       alert("Product added successfully");
//       onClose();

//     } catch (error) {
//       alert(
//         error?.response?.data?.message ||
//         "Failed to upload product"
//       );
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
//         <h2 className="text-xl font-bold">Add New Product</h2>

//         <input
//           type="text"
//           placeholder="Product Name"
//           className="border p-2 rounded"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//         />

//         <input
//           type="number"
//           placeholder="Price"
//           className="border p-2 rounded"
//           value={price}
//           onChange={(e) => setPrice(e.target.value)}
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
//           className="bg-[#ff4d2d] text-white p-2 rounded hover:bg-[#e63b2a]"
//         >
//           {loading ? "Uploading..." : "Add Product"}
//         </button>

//         <button
//           type="button"
//           onClick={onClose}
//           className="text-red-500"
//         >
//           Cancel
//         </button>
//       </form>
//     </div>
//   );
// };

// export default AddProduct;


// import React, { useState, useRef } from "react";
// import axios from "axios";
// import { X, Upload, Package, DollarSign, Image as ImageIcon } from "lucide-react";

// const AddProduct = ({ onClose }) => {
//   const [name, setName] = useState("");
//   const [price, setPrice] = useState("");
//   const [image, setImage] = useState(null);
//   const [preview, setPreview] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const fileInputRef = useRef(null);

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setImage(file);
//       setPreview(URL.createObjectURL(file)); // Creates a local URL for the image preview
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!name || !price || !image) {
//       alert("Please fill all fields");
//       return;
//     }

//     try {
//       setLoading(true);
//       const formData = new FormData();
//       formData.append("name", name);
//       formData.append("price", price);
//       formData.append("image", image);

//       await axios.post("http://localhost:8000/api/product/add", formData, {
//         withCredentials: true,
//       });

//       alert("Product added successfully");
//       onClose();
//     } catch (error) {
//       alert(error?.response?.data?.message || "Failed to upload product");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
//       <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

//         {/* Header */}
//         <div className="flex items-center justify-between p-6 border-b bg-gray-50/50">
//           <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
//             <Package className="w-5 h-5 text-[#ff4d2d]" />
//             Add New Product
//           </h2>
//           <button 
//             onClick={onClose} 
//             className="p-2 hover:bg-gray-200 rounded-full transition-colors"
//           >
//             <X className="w-5 h-5 text-gray-500" />
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="p-6 space-y-5">

//           {/* Product Name Input */}
//           <div className="space-y-1.5">
//             <label className="text-sm font-semibold text-gray-700 ml-1">Product Name</label>
//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="iPhone 15 Pro, Coffee Beans..."
//                 className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all outline-none"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//               />
//             </div>
//           </div>

//           {/* Price Input */}
//           <div className="space-y-1.5">
//             <label className="text-sm font-semibold text-gray-700 ml-1">Price</label>
//             <div className="relative">
//               <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
//               <input
//                 type="number"
//                 placeholder="0.00"
//                 className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all outline-none"
//                 value={price}
//                 onChange={(e) => setPrice(e.target.value)}
//               />
//             </div>
//           </div>

//           {/* Improved Image Upload Section */}
//           <div className="space-y-1.5">
//             <label className="text-sm font-semibold text-gray-700 ml-1">Product Image</label>
//             <div 
//               onClick={() => fileInputRef.current.click()}
//               className={`relative group cursor-pointer border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all overflow-hidden ${
//                 preview ? 'border-[#ff4d2d] h-48' : 'border-gray-300 h-40 hover:border-[#ff4d2d] hover:bg-orange-50'
//               }`}
//             >
//               {preview ? (
//                 <>
//                   <img src={preview} alt="Preview" className="w-full h-full object-cover" />
//                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium">
//                     Change Image
//                   </div>
//                 </>
//               ) : (
//                 <div className="flex flex-col items-center text-gray-400 group-hover:text-[#ff4d2d]">
//                   <Upload className="w-8 h-8 mb-2" />
//                   <p className="text-sm">Click to upload image</p>
//                   <p className="text-xs mt-1">PNG, JPG or WEBP</p>
//                 </div>
//               )}
//             </div>
//             <input
//               ref={fileInputRef}
//               type="file"
//               accept="image/*"
//               className="hidden"
//               onChange={handleImageChange}
//             />
//           </div>

//           {/* Action Buttons */}
//           <div className="flex gap-3 pt-2">
//             <button
//               type="button"
//               onClick={onClose}
//               className="flex-1 px-4 py-3 rounded-xl font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={loading}
//               className="flex-[2] bg-[#ff4d2d] text-white py-3 rounded-xl font-semibold shadow-lg shadow-orange-200 hover:bg-[#e63b2a] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//             >
//               {loading ? (
//                 <>
//                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                   Uploading...
//                 </>
//               ) : (
//                 "Publish Product"
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddProduct;

import React, { useState, useRef } from "react";
import axios from "axios";
import { X, Upload, Package, Star, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

const AddProduct = ({ onClose }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [rating, setRating] = useState(5); // 1. Added Rating State
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [shortDesc, setShortDesc] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !shortDesc || !image) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("rating", rating); // 2. Append Rating to FormData
      formData.append("image", image);
      formData.append("shortDesc", shortDesc);

      // Ensure this matches your deployed or local URL
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

      await axios.post(`${API_URL}/api/product/add`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Product published with custom rating!");
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to upload product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-white/20">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50/80">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Package className="w-6 h-6 text-yellow-500" />
            Add New <span className="text-yellow-600">Product</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-all active:scale-90"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product Name Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Product Identity</label>
              <input
                type="text"
                placeholder="Mustard Oil..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-500 transition-all outline-none font-medium"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Price Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Price (₹)</label>
              <input
                type="number"
                placeholder="0.00"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-500 transition-all outline-none font-mono font-bold"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>
          {/* Short Description Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">
              Short Description
            </label>
            <textarea
              placeholder="Write a short description about this product..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400/20 
               focus:border-yellow-500 transition-all outline-none font-medium resize-none h-24"
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
            ></textarea>
          </div>


          {/* Rating Slider Section - 3. Added the UI for rating */}
          <div className="bg-yellow-50/50 p-4 rounded-2xl border border-yellow-100/50">
            <div className="flex justify-between items-center mb-3">
              <label className="text-[10px] font-black uppercase text-yellow-700 tracking-widest flex items-center gap-1">
                <Star size={14} className="fill-yellow-500 text-yellow-500" /> Premium Rating
              </label>
              <span className="text-sm font-black text-yellow-700 bg-white px-3 py-1 rounded-full shadow-sm">{rating}.0</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="w-full h-2 bg-yellow-200 rounded-lg appearance-none cursor-pointer accent-yellow-600"
            />
          </div>

          {/* Image Upload Section */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Product Media</label>
            <div
              onClick={() => fileInputRef.current.click()}
              className={`relative group cursor-pointer border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all overflow-hidden ${preview ? 'border-yellow-500 h-44' : 'border-gray-200 h-32 hover:border-yellow-500 hover:bg-yellow-50/30'
                }`}
            >
              {preview ? (
                <>
                  <img src={preview} alt="Preview" className="w-full h-full object-contain p-2" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold uppercase tracking-widest">
                    Replace Image
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center text-gray-400 group-hover:text-yellow-600">
                  <Upload className="w-6 h-6 mb-2" />
                  <p className="text-xs font-bold uppercase tracking-tighter">Click to upload image</p>
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

          {/* Action Buttons */}
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-colors uppercase text-xs tracking-widest"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-xl hover:bg-yellow-500 hover:text-slate-900 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Publish Product"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;