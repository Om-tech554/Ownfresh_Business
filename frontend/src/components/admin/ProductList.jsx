// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import EditProduct from "./EditProduct";

// const ProductList = () => {
//     const [products, setProducts] = useState([]);
//     const [currentPage, setCurrentPage] = useState(1);
//     const [editItem, setEditItem] = useState(null);

//     const productsPerPage = 6;

//     const fetchProducts = async () => {
//         try {
//             const res = await axios.get("http://localhost:8000/api/product/all");
//             setProducts(res.data.products);
//         } catch (error) {
//             alert("Failed to load products");
//         }
//     };

//     const deleteProduct = async (id) => {
//         if (!window.confirm("Are you sure you want to delete this product?"))
//             return;

//         try {
//             await axios.delete(
//                 `http://localhost:8000/api/product/delete/${id}`,
//                 { withCredentials: true }
//             );
//             fetchProducts();
//             alert("Product deleted");
//         } catch (error) {
//             alert("Failed to delete product");
//         }
//     };

//     useEffect(() => {
//         fetchProducts();
//     }, []);

//     // Pagination Logic
//     const indexOfLast = currentPage * productsPerPage;
//     const indexOfFirst = indexOfLast - productsPerPage;
//     const currentProducts = products.slice(indexOfFirst, indexOfLast);

//     const totalPages = Math.ceil(products.length / productsPerPage);

//     return (
//         <div className="w-full px-6 py-20">
//             <h2 className="text-2xl font-bold mb-6">Product List</h2>

//             {/* Products Grid */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {currentProducts.map((p) => (
//                     <div key={p._id} className="bg-white shadow-md rounded-xl p-4">
//                         <img
//                             src={p.image}
//                             alt={p.name}
//                             className="w-full h-48 object-cover rounded-lg"
//                         />

//                         <h3 className="text-lg font-semibold mt-3">{p.name}</h3>
//                         <p className="text-gray-600">₹{p.price}</p>

//                         <div className="flex justify-between mt-4">
//                             <button
//                                 className="bg-blue-500 text-white px-3 py-1 rounded"
//                                 onClick={() => setEditItem(p)}
//                             >
//                                 Edit
//                             </button>

//                             <button
//                                 className="bg-red-500 text-white px-3 py-1 rounded"
//                                 onClick={() => deleteProduct(p._id)}
//                             >
//                                 Delete
//                             </button>
//                         </div>
//                     </div>
//                 ))}
//             </div>

//             {/* Pagination */}
//             <div className="flex justify-center items-center gap-3 mt-8">
//                 <button
//                     disabled={currentPage === 1}
//                     onClick={() => setCurrentPage((p) => p - 1)}
//                     className="px-3 py-1 bg-gray-300 rounded disabled:opacity-40"
//                 >
//                     Prev
//                 </button>

//                 <span className="font-semibold">
//                     {currentPage} / {totalPages}
//                 </span>

//                 <button
//                     disabled={currentPage === totalPages}
//                     onClick={() => setCurrentPage((p) => p + 1)}
//                     className="px-3 py-1 bg-gray-300 rounded disabled:opacity-40"
//                 >
//                     Next
//                 </button>
//             </div>
//             {editItem && (
//                 <EditProduct
//                     product={editItem}
//                     onClose={() => setEditItem(null)}
//                     onUpdated={fetchProducts}
//                 />
//             )}

//         </div>
//     );
// };

// export default ProductList;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Trash2,
  Edit3,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Layers,
  Search,
  Filter
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const ProductList = () => {
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
      const res = await axios.get("http://localhost:8000/api/category/all");
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (error) {
      console.error("Failed to load categories", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/product/all", {
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
      toast.error("Systems offline: Failed to load inventory", {
        style: { background: "#1e293b", color: "#fff" }
      });
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Confirm deletion of this industrial asset?")) return;

    try {
      await axios.delete(`http://localhost:8000/api/product/delete/${id}`, {
        withCredentials: true,
      });
      fetchProducts();
      toast.success("Asset removed from database");
    } catch (error) {
      toast.error("Unauthorized: Deletion failed");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, search, category]);

  // server-side pagination handled by fetchProducts
  const currentProducts = products;

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12 md:px-12 lg:px-20">
      <Toaster position="bottom-right" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Layers className="text-[#1E971D] w-8 h-8" />
            Product <span className="text-[#1E971D]">Inventory</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">
            Asset Management & Logistics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 h-fit">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm font-bold text-slate-700">{totalProducts} Total Units</span>
          </div>
          <button
            onClick={() => navigate("/admin/product/editor/create")}
            className="flex items-center gap-2 bg-[#1E971D] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#1E971D]/90 transition-all shadow-lg shadow-[#1E971D]/20 h-fit"
          >
            <Edit3 className="w-4 h-4" />
            Create New Product
          </button>
        </div>
      </div>

      {/* FILTER/SEARCH BAR (UPDATED) */}
      <div className="max-w-7xl mb-10 p-4 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-[#1E971D]/20 outline-none"
            placeholder="Search inventory (name or description)..."
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
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {currentProducts.map((p) => (
          <div
            key={p._id}
            className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-[#1E971D]/50 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-300"
          >
            {/* Image Container: NEVER CUT OFF */}
            <div className="relative h-60 bg-slate-100 p-4 overflow-hidden">
              <img
                src={p.image}
                alt={p.name}
                className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-sm">
                <p className="text-[#1E971D] font-black text-sm">₹{p.price}</p>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-lg font-bold text-slate-800 line-clamp-1">
                  {p.name}
                </h3>
                <Package className="w-5 h-5 text-slate-300 shrink-0" />
              </div>
              <div className="flex gap-2 mb-4">
                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-100 text-blue-700 uppercase tracking-widest">
                  {p.category?.name || "General"}
                </span>
              </div>
              {/* Short Description */}
              <p className="text-slate-500 text-sm mt-1 line-clamp-2">
                {p.shortDesc}
              </p>
              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={() => navigate(`/admin/product/editor/${p._id}`)}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-600 font-bold py-2.5 rounded-xl transition-all duration-200 border border-slate-100"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => deleteProduct(p._id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white font-bold py-2.5 rounded-xl transition-all duration-200 border border-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Container */}
      {totalPages > 1 && (
        <div className="mt-16 flex justify-center items-center gap-6">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="p-3 bg-white border border-slate-200 rounded-full text-slate-600 hover:bg-[#1E971D] hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-slate-600 transition-all shadow-sm"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-2 font-mono">
            <span className="text-xl font-black text-slate-900">{currentPage}</span>
            <span className="text-slate-300 text-xl">/</span>
            <span className="text-slate-400 font-bold">{totalPages}</span>
          </div>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="p-3 bg-white border border-slate-200 rounded-full text-slate-600 hover:bg-[#1E971D] hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-slate-600 transition-all shadow-sm"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}

    </div>
  );
};

export default ProductList;