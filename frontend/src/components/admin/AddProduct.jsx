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


import React, { useState, useRef } from "react";
import axios from "axios";
import { X, Upload, Package, DollarSign, Image as ImageIcon } from "lucide-react";

const AddProduct = ({ onClose }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file)); // Creates a local URL for the image preview
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !image) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("image", image);

      await axios.post("http://localhost:8000/api/product/add", formData, {
        withCredentials: true,
      });

      alert("Product added successfully");
      onClose();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to upload product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#ff4d2d]" />
            Add New Product
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Product Name Input */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 ml-1">Product Name</label>
            <div className="relative">
              <input
                type="text"
                placeholder="iPhone 15 Pro, Coffee Beans..."
                className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          {/* Price Input */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 ml-1">Price</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all outline-none"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>

          {/* Improved Image Upload Section */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 ml-1">Product Image</label>
            <div 
              onClick={() => fileInputRef.current.click()}
              className={`relative group cursor-pointer border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all overflow-hidden ${
                preview ? 'border-[#ff4d2d] h-48' : 'border-gray-300 h-40 hover:border-[#ff4d2d] hover:bg-orange-50'
              }`}
            >
              {preview ? (
                <>
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium">
                    Change Image
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center text-gray-400 group-hover:text-[#ff4d2d]">
                  <Upload className="w-8 h-8 mb-2" />
                  <p className="text-sm">Click to upload image</p>
                  <p className="text-xs mt-1">PNG, JPG or WEBP</p>
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
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] bg-[#ff4d2d] text-white py-3 rounded-xl font-semibold shadow-lg shadow-orange-200 hover:bg-[#e63b2a] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Uploading...
                </>
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