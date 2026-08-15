import React, { useEffect, useState } from "react";
import axios from "axios";
import { Package, Search, Plus, Edit3, Trash2, Tag } from "lucide-react";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { useConfirm } from "../../hooks/ConfirmContext.jsx";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const InventoryManager = () => {
  const confirm = useConfirm();
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [formData, setFormData] = useState({
    product: "",
    name: "",
    sku: "",
    price: "",
    salePrice: "",
    stockQuantity: "",
    status: "Active"
  });

  const [bulkData, setBulkData] = useState({ categoryId: "", percentageIncrease: "" });
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [stockStatus, setStockStatus] = useState("All"); // "All", "In Stock", "Low Stock" (1-10), "Out of Stock" (<= 0)

  const fetchData = async () => {
    try {
      const [varRes, prodRes, catRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/inventory/variants/all`),
        axios.get(`${API_BASE_URL}/api/product/all?limit=1000`), // Get all for dropdown
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
        product: variant.product._id || variant.product,
        name: variant.name,
        sku: variant.sku || "",
        price: variant.price,
        salePrice: variant.salePrice || "",
        stockQuantity: variant.stockQuantity || "",
        status: variant.status || "Active"
      });
    } else {
      setFormData({
        product: products[0]?._id || "",
        name: "Standard",
        sku: "",
        price: "",
        salePrice: "",
        stockQuantity: "100",
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
        sku: formData.sku,
        price: Number(formData.price),
        salePrice: formData.salePrice ? Number(formData.salePrice) : null,
        stockQuantity: Number(formData.stockQuantity),
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
  products.forEach(p => {
    const productVariants = variants.filter(v => (v.product?._id || v.product) === p._id);
    if (productVariants.length === 0) {
      displayItems.push({
        type: 'legacy',
        id: p._id,
        productId: p._id,
        productName: p.name,
        category: p.category?._id || p.category,
        variantName: 'Standard',
        sku: p.sku || '-',
        price: p.price || 0,
        salePrice: null,
        stockQuantity: '-',
        status: p.status || 'Active',
        originalProduct: p
      });
    } else {
      productVariants.forEach(v => {
        displayItems.push({
          type: 'variant',
          id: v._id,
          productId: p._id,
          productName: p.name,
          category: p.category?._id || p.category,
          variantName: v.name,
          sku: v.sku || '-',
          price: v.price,
          salePrice: v.salePrice,
          stockQuantity: v.stockQuantity,
          status: v.status || 'Active',
          originalProduct: p,
          originalVariant: v
        });
      });
    }
  });

  // Apply Search & Filter Conditions
  const filteredItems = displayItems.filter(item => {
    // 1. Search Query Match
    const matchesSearch = 
      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.variantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Category Match
    const matchesCategory = 
      selectedCategory === "All" || 
      item.category === selectedCategory;

    // 3. Stock Status Match
    let matchesStock = true;
    if (stockStatus === "In Stock") {
      matchesStock = item.stockQuantity === '-' || item.stockQuantity > 10;
    } else if (stockStatus === "Low Stock") {
      matchesStock = item.stockQuantity !== '-' && item.stockQuantity > 0 && item.stockQuantity <= 10;
    } else if (stockStatus === "Out of Stock") {
      matchesStock = item.stockQuantity !== '-' && item.stockQuantity <= 0;
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
            Variant & Pricing Manager
          </h2>
          <p className="text-slate-500 text-sm mt-1">Manage product variants, prices, and stock.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowBulkModal(true)}
            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-100"
          >
            <Tag className="w-4 h-4" /> Bulk Update
          </button>
          <button 
            onClick={() => openModal()}
            className="px-4 py-2 bg-[#1E971D] text-white rounded-lg font-bold flex items-center gap-2 hover:bg-[#1E971D]/90 shadow-md"
          >
            <Plus className="w-4 h-4" /> Add Variant
          </button>
        </div>
      </div>

      {/* Search & Filters Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-wrap items-center gap-4">
        {/* Search Bar */}
        <div className="flex-1 min-w-[280px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products, variants, SKUs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1E971D] focus:border-[#1E971D] transition-all text-sm outline-none"
          />
        </div>

        {/* Category Filter */}
        <div className="min-w-[180px]">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#1E971D] focus:border-[#1E971D] transition-all outline-none"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Stock Filter */}
        <div className="min-w-[180px]">
          <select
            value={stockStatus}
            onChange={(e) => setStockStatus(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#1E971D] focus:border-[#1E971D] transition-all outline-none"
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
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                <th className="p-4 font-semibold">Product</th>
                <th className="p-4 font-semibold">Variant Name</th>
                <th className="p-4 font-semibold">SKU</th>
                <th className="p-4 font-semibold">Price (₹)</th>
                <th className="p-4 font-semibold">Stock</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map(item => {
                if (item.type === 'legacy') {
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors bg-orange-50/30">
                      <td className="p-4 font-medium text-slate-800">{item.productName}</td>
                      <td className="p-4 text-slate-400 italic">{item.variantName}</td>
                      <td className="p-4 text-slate-400">-</td>
                      <td className="p-4 text-orange-600 font-bold text-sm">₹{item.price} <span className="text-xs font-normal text-slate-400">(Legacy)</span></td>
                      <td className="p-4 text-slate-400">-</td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded text-xs font-bold bg-slate-100 text-slate-600">
                          {item.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => {
                            setSelectedVariant(null);
                            setFormData({
                              product: item.productId,
                              name: "Standard",
                              sku: item.originalProduct.sku || "",
                              price: item.price,
                              salePrice: "",
                              stockQuantity: "100",
                              status: "Active"
                            });
                            setShowVariantModal(true);
                          }} 
                          className="px-3 py-1.5 bg-[#1E971D] text-white text-xs font-bold rounded-lg hover:bg-[#1E971D]/90"
                        >
                          Convert to Variant
                        </button>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-800">{item.productName}</td>
                    <td className="p-4 text-slate-600 font-medium">{item.variantName}</td>
                    <td className="p-4 text-slate-500 text-sm">{item.sku || "-"}</td>
                    <td className="p-4 font-bold text-slate-800">
                      {item.salePrice ? (
                        <div>
                          <span className="text-green-600">₹{item.salePrice}</span>
                          <span className="text-slate-400 line-through text-xs ml-2">₹{item.price}</span>
                        </div>
                      ) : (
                        `₹${item.price}`
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${item.stockQuantity > 10 ? 'bg-green-100 text-green-700' : item.stockQuantity > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {item.stockQuantity}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${item.status === 'Active' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => openModal(item.originalVariant)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg mr-2 transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteVariant(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">No products or variants matched your search criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Variant Modal */}
      <AnimatePresence>
        {showVariantModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setShowVariantModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden z-10"
            >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold">{selectedVariant ? "Edit Variant" : "New Variant"}</h3>
              <button onClick={() => setShowVariantModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleSaveVariant} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Parent Product</label>
                <select 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                  value={formData.product}
                  onChange={e => setFormData({...formData, product: e.target.value})}
                  required
                >
                  <option value="">Select a product...</option>
                  {products.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Variant Name</label>
                  <input type="text" placeholder="e.g. 500ml" required
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">SKU</label>
                  <input type="text" placeholder="Optional"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                    value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Regular Price</label>
                  <input type="number" required min="0"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                    value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Sale Price</label>
                  <input type="number" min="0" placeholder="Optional"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                    value={formData.salePrice} onChange={e => setFormData({...formData, salePrice: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Stock Qty</label>
                  <input type="number" required min="0"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                    value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Status</label>
                  <select 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                    value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowVariantModal(false)} className="px-5 py-2 text-slate-600 font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#1E971D] text-white rounded-xl font-bold shadow-md hover:bg-[#1E971D]/90">
                  {selectedVariant ? "Update Variant" : "Create Variant"}
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
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setShowBulkModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden z-10"
            >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold">Bulk Price Update</h3>
              <button onClick={() => setShowBulkModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleBulkUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                <select 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                  value={bulkData.categoryId}
                  onChange={e => setBulkData({...bulkData, categoryId: e.target.value})}
                  required
                >
                  <option value="">Select a category...</option>
                  {categories.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Percentage Increase (%)</label>
                <input type="number" required placeholder="e.g. 5 or -5"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                  value={bulkData.percentageIncrease} onChange={e => setBulkData({...bulkData, percentageIncrease: e.target.value})} />
                <p className="text-xs text-slate-500 mt-1">Use a negative number to decrease prices.</p>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowBulkModal(false)} className="px-5 py-2 text-slate-600 font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700">
                  Apply Update
                </button>
              </div>
            </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InventoryManager;
