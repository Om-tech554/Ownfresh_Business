import React, { useEffect, useState } from "react";
import axios from "axios";
import { Package, Search, Plus, Edit3, Trash2, Tag } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const InventoryManager = () => {
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
    if (!window.confirm("Are you sure you want to delete this variant?")) return;
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

  return (
    <div className="w-full">
      <Toaster position="bottom-right" />
      
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
              {products.map(p => {
                const productVariants = variants.filter(v => (v.product?._id || v.product) === p._id);
                
                if (productVariants.length === 0) {
                  return (
                    <tr key={p._id} className="hover:bg-slate-50 transition-colors bg-orange-50/30">
                      <td className="p-4 font-medium text-slate-800">{p.name}</td>
                      <td className="p-4 text-slate-400 italic">Standard</td>
                      <td className="p-4 text-slate-400">-</td>
                      <td className="p-4 text-orange-600 font-bold text-sm">₹{p.price || 0} <span className="text-xs font-normal text-slate-400">(Legacy)</span></td>
                      <td className="p-4 text-slate-400">-</td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded text-xs font-bold bg-slate-100 text-slate-600">
                          {p.status || "Active"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => {
                            setSelectedVariant(null);
                            setFormData({
                              product: p._id,
                              name: "Standard",
                              sku: p.sku || "",
                              price: p.price || 0,
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

                return productVariants.map(v => (
                  <tr key={v._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-800">{p.name}</td>
                    <td className="p-4 text-slate-600 font-medium">{v.name}</td>
                    <td className="p-4 text-slate-500 text-sm">{v.sku || "-"}</td>
                    <td className="p-4 font-bold text-slate-800">
                      {v.salePrice ? (
                        <div>
                          <span className="text-green-600">₹{v.salePrice}</span>
                          <span className="text-slate-400 line-through text-xs ml-2">₹{v.price}</span>
                        </div>
                      ) : (
                        `₹${v.price}`
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${v.stockQuantity > 10 ? 'bg-green-100 text-green-700' : v.stockQuantity > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {v.stockQuantity}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${v.status === 'Active' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => openModal(v)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg mr-2 transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteVariant(v._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ));
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">No products found. Add products from the catalog first.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Variant Modal */}
      {showVariantModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
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
          </div>
        </div>
      )}

      {/* Bulk Update Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
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
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManager;
