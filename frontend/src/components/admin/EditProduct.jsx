// import React, { useState, useEffect } from "react";
// import axios from "axios";

// const EditProduct = ({ product, onClose, onUpdated }) => {
//   const [name, setName] = useState(product.name);
//   const [price, setPrice] = useState(product.price);
//   const [image, setImage] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const handleUpdate = async (e) => {
//     e.preventDefault();

//     try {
//       setLoading(true);

//       const formData = new FormData();
//       formData.append("name", name);
//       formData.append("price", price);

//       if (image) formData.append("image", image);

//       await axios.put(
//         `http://localhost:8000/api/product/update/${product._id}`,
//         formData,
//         { withCredentials: true }
//       );

//       alert("Product updated successfully");
//       onUpdated(); // reload list
//       onClose();   // close modal

//     } catch (error) {
//       alert("Update failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
//       <form
//         onSubmit={handleUpdate}
//         className="bg-white w-[90%] max-w-md p-6 rounded-xl flex flex-col gap-4"
//       >
//         <h2 className="text-xl font-bold">Edit Product</h2>

//         <input
//           type="text"
//           className="border p-2 rounded"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//         />

//         <input
//           type="number"
//           className="border p-2 rounded"
//           value={price}
//           onChange={(e) => setPrice(e.target.value)}
//         />

//         <img
//           src={product.image}
//           alt="old"
//           className="w-full h-40 object-cover rounded"
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
//           className="bg-blue-500 text-white p-2 rounded"
//         >
//           {loading ? "Updating..." : "Update Product"}
//         </button>

//         <button type="button" onClick={onClose} className="text-red-500">
//           Cancel
//         </button>
//       </form>
//     </div>
//   );
// };

// export default EditProduct;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, Package, DollarSign, Upload, RefreshCw, CheckCircle2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const EditProduct = ({ product, onClose, onUpdated }) => {
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(product.price);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle local preview for new image selection
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
      formData.append("name", name);
      formData.append("price", price);
      if (image) formData.append("image", image);

      await axios.put(
        `http://localhost:8000/api/product/update/${product._id}`,
        formData,
        { withCredentials: true }
      );

      toast.success("Product updated in inventory", {
        style: { background: "#1e293b", color: "#fff", borderLeft: "4px solid #ff4d2d" },
      });

      setTimeout(() => {
        onUpdated();
        onClose();
      }, 1000);
    } catch (error) {
      toast.error("Failed to update technical specifications");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <Toaster position="top-right" />
      
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 bg-slate-50 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#ff4d2d]/10 rounded-lg">
              <Package className="w-5 h-5 text-[#ff4d2d]" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Edit Product Specs</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleUpdate} className="p-6 space-y-5">
          {/* Product Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Product Designation</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#ff4d2d] focus:border-transparent outline-none transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Product Price */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Unit Price (USD)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="number"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#ff4d2d] outline-none transition-all"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>

          {/* Image Comparison Area */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Visual Assets</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-medium">Current Image</p>
                <div className="h-32 w-full bg-slate-100 rounded-lg border overflow-hidden">
                  <img src={product.image} className="w-full h-full object-contain p-1" alt="current" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-[#ff4d2d] font-medium">New Preview</p>
                <div className="h-32 w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center overflow-hidden">
                  {preview ? (
                    <img src={preview} className="w-full h-full object-contain p-1" alt="preview" />
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">No change</span>
                  )}
                </div>
              </div>
            </div>

            <label className="flex items-center justify-center gap-2 w-full py-3 bg-slate-100 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-200 transition-colors">
              <Upload className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-semibold text-slate-700">Upload New Image</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setImage(e.target.files[0])}
              />
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] bg-slate-900 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Updating...
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

export default EditProduct;