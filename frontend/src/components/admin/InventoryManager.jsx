import React, { useEffect, useState } from "react";
import axios from "axios";
import { Package, Search, Plus, Edit3, Trash2, Tag, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { useConfirm } from "../../hooks/ConfirmContext.jsx";
import ImagePickerModal from "./ImagePickerModal";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:10000";

const InventoryManager = () => {
  const confirm = useConfirm();
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [categories, setCategories] = useState([]);

  const [showVariantModal, setShowVariantModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [formData, setFormData] = useState({
    product: "",
    name: "",
    size: "",
    sku: "",
    price: "",
    salePrice: "",
    stockQuantity: "",
    weight: "",
    image: "",
    status: "Active"
  });

  const [bulkData, setBulkData] = useState({ categoryId: "", percentageIncrease: "" });

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [stockStatus, setStockStatus] = useState("All");

  const fetchData = async () => {
    try {
      const [varRes, prodRes, catRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/inventory/variants/all`),
        axios.get(`${API_BASE_URL}/api/product/all?limit=1000`),
        axios.get(`${API_BASE_URL}/api/category/all`)
      ]);
      setVariants(varRes.data.variants || []);
      setProducts(prodRes.data.products || []);
      setCategories(catRes.data.categories || []);
    } catch (error) {
      toast.error("Failed to load inventory data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (variant = null) => {
    setSelectedVariant(variant);
    if (variant) {
      setFormData({
        product: variant.product?._id || variant.product,
        name: variant.name || "",
        size: variant.size || variant.name || "",
        sku: variant.sku || "",
        price: variant.price,
        salePrice: variant.salePrice || "",
        stockQuantity: variant.stockQuantity || "",
        weight: variant.weight || "",
        image: variant.image || (variant.images && variant.images[0]) || "",
        status: variant.status || "Active"
      });
    } else {
      setFormData({
        product: products[0]?._id || "",
        name: "1 Litre",
        size: "1L",
        sku: "",
        price: "",
        salePrice: "",
        stockQuantity: "100",
        weight: "1kg",
        image: "",
        status: "Active"
      });
    }
    setShowVariantModal(true);
  };

  const handleSaveVariant = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        productId: formData.product,
        name: formData.name,
        size: formData.size || formData.name,
        sku: formData.sku,
        price: Number(formData.price),
        salePrice: formData.salePrice ? Number(formData.salePrice) : null,
        stockQuantity: Number(formData.stockQuantity),
        weight: formData.weight,
        image: formData.image,
        images: formData.image ? [formData.image] : [],
        status: formData.status
      };

      if (selectedVariant) {
        await axios.put(`${API_BASE_URL}/api/inventory/variants/${selectedVariant._id}`, payload);
        toast.success("Variant updated successfully");
      } else {
        await axios.post(`${API_BASE_URL}/api/inventory/variants`, payload);
        toast.success("Variant added successfully");
      }
      setShowVariantModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDeleteVariant = async (id) => {
    const isConfirmed = await confirm({
      title: "Delete Variant?",
      message: "Are you sure you want to delete this variant?",
      type: "danger",
      confirmText: "Delete"
    });
    if (!isConfirmed) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/inventory/variants/${id}`);
      toast.success("Variant deleted");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete variant");
    }
  };

  const handleBulkUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${API_BASE_URL}/api/inventory/bulk-price-update`, {
        categoryId: bulkData.categoryId,
        percentageIncrease: Number(bulkData.percentageIncrease)
      });
      toast.success(res.data.message || "Bulk update complete");
      setShowBulkModal(false);
      fetchData();
    } catch (error) {
      toast.error("Bulk update failed");
    }
  };

  // Construct flat list of items to easily search/filter
  const displayItems = [];
  products.forEach((p) => {
    const productVariants = variants.filter((v) => (v.product?._id || v.product) === p._id);
    if (productVariants.length === 0) {
      displayItems.push({
        type: "legacy",
        id: p._id,
        productId: p._id,
        productName: p.name,
        category: p.category?._id || p.category,
        variantName: "Standard",
        sku: p.sku || "-",
        price: p.price || 0,
        salePrice: null,
        stockQuantity: "-",
        image: p.image,
        status: p.status || "Active",
        originalProduct: p
      });
    } else {
      productVariants.forEach((v) => {
        displayItems.push({
          type: "variant",
          id: v._id,
          productId: p._id,
          productName: p.name,
          category: p.category?._id || p.category,
          variantName: v.name,
          sku: v.sku || "-",
          price: v.price,
          salePrice: v.salePrice,
          stockQuantity: v.stockQuantity,
          image: v.image || (v.images && v.images[0]) || p.image,
          status: v.status || "Active",
          originalProduct: p,
          originalVariant: v
        });
      });
    }
  });

  const filteredItems = displayItems.filter((item) => {
    const matchesSearch =
      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.variantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;

    let matchesStock = true;
    if (stockStatus === "In Stock") {
      matchesStock = item.stockQuantity === "-" || item.stockQuantity > 10;
    } else if (stockStatus === "Low Stock") {
      matchesStock = item.stockQuantity !== "-" && item.stockQuantity > 0 && item.stockQuantity <= 10;
    } else if (stockStatus === "Out of Stock") {
      matchesStock = item.stockQuantity !== "-" && item.stockQuantity <= 0;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-[#1E971D]" />
            Bottle Size & Inventory Manager
          </h2>
          <p className="text-slate-500 text-sm mt-1">Manage individual bottle size stock, prices, and photos.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowBulkModal(true)}
            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-blue-100 transition-colors"
          >
            <Tag className="w-4 h-4" /> Bulk Price Update
          </button>
          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-[#1E971D] text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-[#167a17] shadow-md transition-all"
          >
            <Plus className="w-4 h-4" /> Add Bottle Size
          </button>
        </div>
      </div>

      {/* Search & Filters Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[280px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products, bottle sizes, SKUs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1E971D] text-sm outline-none"
          />
        </div>

        <div className="min-w-[180px]">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[180px]">
          <select
            value={stockStatus}
            onChange={(e) => setStockStatus(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none"
          >
            <option value="All">All Stock Levels</option>
            <option value="In Stock">In Stock (&gt; 10)</option>
            <option value="Low Stock">Low Stock (1-10)</option>
            <option value="Out of Stock">Out of Stock (0)</option>
          </select>
        </div>
      </div>

      {/* Variants Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-black uppercase tracking-wider">
                <th className="p-4">Photo</th>
                <th className="p-4">Product</th>
                <th className="p-4">Size Variation</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Price (₹)</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl p-1 border border-slate-200 flex items-center justify-center">
                      <img
                        src={item.image || "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786009742/products/banner.png"}
                        alt=""
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </div>
                  </td>
                  <td className="p-4 font-extrabold text-slate-800 text-sm">{item.productName}</td>
                  <td className="p-4">
                    <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider">
                      {item.variantName}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 text-xs font-mono">{item.sku || "-"}</td>
                  <td className="p-4 font-black text-slate-800 text-sm">
                    {item.salePrice ? (
                      <div>
                        <span className="text-emerald-600">₹{item.salePrice}</span>
                        <span className="text-slate-400 line-through text-xs ml-1.5">₹{item.price}</span>
                      </div>
                    ) : (
                      `₹${item.price}`
                    )}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                        item.stockQuantity > 10
                          ? "bg-emerald-50 text-emerald-700"
                          : item.stockQuantity > 0
                          ? "bg-amber-50 text-amber-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {item.stockQuantity} in stock
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                        item.status === "Active" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => openModal(item.originalVariant)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg mr-2 transition-colors cursor-pointer"
                      title="Edit Bottle Size"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {item.type === "variant" && (
                      <button
                        onClick={() => handleDeleteVariant(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Size"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-10 text-center text-slate-400 font-bold">
                    No products or variations matched your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Variant Modal */}
      <AnimatePresence>
        {showVariantModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowVariantModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden z-10"
            >
              <div className="p-6 bg-[#1E971D] text-white flex justify-between items-center">
                <h3 className="text-lg font-black uppercase tracking-wider">
                  {selectedVariant ? "Edit Bottle Size Variation" : "Add New Bottle Size"}
                </h3>
                <button onClick={() => setShowVariantModal(false)} className="text-white hover:rotate-90 transition-transform text-2xl">
                  &times;
                </button>
              </div>

              <form onSubmit={handleSaveVariant} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Parent Oil Product *
                  </label>
                  <select
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                    value={formData.product}
                    onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                    required
                  >
                    <option value="">Select a product...</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Bottle Size / Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 500ml, 5 Litre"
                      required
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value, size: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      SKU Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. OF-500ML"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Regular Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Sale Price (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Optional"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      value={formData.salePrice}
                      onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      value={formData.stockQuantity}
                      onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Status
                    </label>
                    <select
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Variation Bottle Image Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Bottle Photo for this Size
                  </label>
                  <div className="flex items-center gap-3">
                    {formData.image ? (
                      <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 p-1 shrink-0">
                        <img src={formData.image} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                      </div>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setShowImagePicker(true)}
                      className="flex-1 p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                      <ImageIcon size={14} /> {formData.image ? "Change Bottle Photo" : "Select Bottle Photo from Gallery"}
                    </button>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowVariantModal(false)}
                    className="px-5 py-2.5 text-slate-600 font-bold text-xs uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#1E971D] text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md hover:bg-[#167a17]"
                  >
                    {selectedVariant ? "Update Bottle Size" : "Create Bottle Size"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bulk Update Modal */}
      <AnimatePresence>
        {showBulkModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowBulkModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden z-10"
            >
              <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
                <h3 className="text-lg font-black uppercase tracking-wider">Bulk Price Update</h3>
                <button onClick={() => setShowBulkModal(false)} className="text-white hover:rotate-90 transition-transform text-2xl">
                  &times;
                </button>
              </div>
              <form onSubmit={handleBulkUpdate} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Category</label>
                  <select
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                    value={bulkData.categoryId}
                    onChange={(e) => setBulkData({ ...bulkData, categoryId: e.target.value })}
                    required
                  >
                    <option value="">Select a category...</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Percentage Increase (%)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 5 or -5"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                    value={bulkData.percentageIncrease}
                    onChange={(e) => setBulkData({ ...bulkData, percentageIncrease: e.target.value })}
                  />
                  <p className="text-xs text-slate-400 mt-1">Use a negative number to apply discounts across all bottle sizes.</p>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowBulkModal(false)}
                    className="px-5 py-2 text-slate-600 font-bold text-xs uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md hover:bg-blue-700"
                  >
                    Apply Update
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ImagePickerModal
        isOpen={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onSelect={(url) => {
          setFormData((prev) => ({ ...prev, image: url }));
          setShowImagePicker(false);
          toast.success("Bottle image selected!");
        }}
      />
    </div>
  );
};

export default InventoryManager;
