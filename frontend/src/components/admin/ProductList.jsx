import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:10000";
import {
  Package,
  Trash2,
  Edit3,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Layers,
  Search,
  Filter,
  Star,
  Tag
} from "lucide-react";
import toast from "react-hot-toast";
import { useConfirm } from "../../hooks/ConfirmContext.jsx";

const ProductList = () => {
  const confirm = useConfirm();
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [totalProducts, setTotalProducts] = useState(0);
  const navigate = useNavigate();

  const productsPerPage = 6;
  const [categories, setCategories] = useState([]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/category/all`);
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (error) {
      console.error("Failed to load categories", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/product/all`, {
        params: {
          page: currentPage,
          limit: productsPerPage,
          search: search,
          category: category
        }
      });
      setProducts(res.data.products || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalProducts(res.data.totalProducts || 0);
    } catch (error) {
      toast.error("Systems offline: Failed to load inventory");
    }
  };

  const deleteProduct = async (id) => {
    const isConfirmed = await confirm({
      title: "Delete Product?",
      message: "Are you sure you want to permanently delete this product and all its variations?",
      type: "danger",
      confirmText: "Delete"
    });
    if (!isConfirmed) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/product/delete/${id}`, {
        withCredentials: true,
      });
      fetchProducts();
      toast.success("Product removed from catalog");
    } catch (error) {
      toast.error("Deletion failed");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, search, category]);

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8 md:px-12 lg:px-20 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Layers className="text-[#1E971D] w-8 h-8" />
            Product <span className="text-[#1E971D]">Catalog</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">
            Manage oil products, bottle variations, and images
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl shadow-xs border border-slate-200 h-fit">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-xs font-bold text-slate-700">{totalProducts} Products</span>
          </div>
          <button
            onClick={() => navigate("/admin/product/editor/create")}
            className="flex items-center gap-2 bg-[#1E971D] text-white hover:bg-[#167a17] px-6 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-md shadow-[#1E971D]/20 cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            Create New Product
          </button>
        </div>
      </div>

      {/* FILTER / SEARCH BAR */}
      <div className="max-w-7xl mb-8 p-4 bg-white rounded-2xl shadow-xs border border-slate-200 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1E971D] text-sm outline-none font-medium"
            placeholder="Search products by title or description..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="relative w-full md:w-72">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <select
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none cursor-pointer"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((p) => (
          <div
            key={p._id}
            className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 hover:border-[#1E971D]/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Image Container */}
              <div className="relative h-60 bg-slate-50 p-6 flex items-center justify-center overflow-hidden border-b border-slate-100">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                />

                {/* Status & Rating */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1 max-w-[70%]">
                  <span
                    className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      p.status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {p.status || "Active"}
                  </span>
                  {p.tags && p.tags.map((tag, i) => {
                    const tagName = typeof tag === 'object' ? tag.name : tag;
                    if (!tagName) return null;
                    const tagBg = typeof tag === 'object' ? tag.bgColor : "#1E971D";
                    const tagColor = typeof tag === 'object' ? tag.textColor : "#ffffff";
                    return (
                      <span
                        key={i}
                        style={{ backgroundColor: tagBg, color: tagColor }}
                        className="text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs truncate max-w-[120px]"
                      >
                        {tagName}
                      </span>
                    );
                  })}
                </div>

                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1 text-amber-500">
                  <Star size={12} className="fill-amber-500" />
                  <span className="text-xs font-black text-slate-800">{p.rating || 5}.0</span>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-50 text-blue-700 uppercase tracking-widest">
                    {p.category?.name || "General"}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">
                    {p.sku || "-"}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 line-clamp-1 mb-2">
                  {p.name}
                </h3>

                <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed mb-4">
                  {p.shortDesc}
                </p>

                {/* Bottle Size Variations Count & Pills */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Package size={12} /> Variations ({p.variants?.length || 0})
                    </span>
                    <span className="text-xs font-black text-[#1E971D] font-mono">
                      Starting at ₹{p.price || 0}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {p.variants?.map((v) => (
                      <span
                        key={v._id}
                        className="px-2 py-0.5 bg-slate-100 rounded-md text-[9px] font-black text-slate-700 uppercase"
                      >
                        {v.name}
                      </span>
                    ))}
                    {(!p.variants || p.variants.length === 0) && (
                      <span className="text-[10px] text-orange-500 italic">No variants added</span>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Actions Bar */}
            <div className="p-6 pt-0 flex items-center gap-3">
              <button
                onClick={() => navigate(`/admin/product/editor/${p._id}`)}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-[#1E971D] text-white font-bold py-3 rounded-2xl text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Product & Sizes
              </button>
              <button
                onClick={() => deleteProduct(p._id)}
                className="p-3 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl transition-all duration-200 cursor-pointer"
                title="Delete Product"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Container */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center items-center gap-6">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="p-3 bg-white border border-slate-200 rounded-full text-slate-600 hover:bg-[#1E971D] hover:text-white disabled:opacity-30 transition-all shadow-xs cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 font-mono">
            <span className="text-lg font-black text-slate-900">{currentPage}</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-400 font-bold">{totalPages}</span>
          </div>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="p-3 bg-white border border-slate-200 rounded-full text-slate-600 hover:bg-[#1E971D] hover:text-white disabled:opacity-30 transition-all shadow-xs cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductList;