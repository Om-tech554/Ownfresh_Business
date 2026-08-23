import React, { useEffect, useState, useMemo } from 'react';
import Navbar from './Navbar';
import axios from 'axios';
import { Loader2, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { addToCart } from "../redux/userslice";
import SLink from "./SLink";
import SEO from "./SEO";
import ProductCard from "./ProductCard";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedItems, setAddedItems] = useState({});
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(12);
  const [priceRange, setPriceRange] = useState(5000);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useSelector((state) => state.user.userData);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/api/product/all?limit=1000`);
        setProducts(res.data.products || []);
      } catch (error) {
        toast.error("Technical error: Unable to load inventory");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
  }, [searchParams]);

  const categoriesMap = products.reduce((acc, curr) => {
    const cat = curr.category?.name || 'General';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const displayedProducts = useMemo(() => {
    let result = products;

    // Category Filter
    if (activeCategory !== "All") {
      result = result.filter(p => (p.category?.name || 'General') === activeCategory);
    }

    // Search Box Filter
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.category?.name && p.category.name.toLowerCase().includes(q))
      );
    }

    // Dynamic Price Filter (matching previous functionality)
    result = result.filter(p => Number(p.price) <= priceRange);

    return result;
  }, [products, activeCategory, searchQuery, priceRange]);

  const handleAddToCart = (product, selectedVariant) => {
    if (!user) {
      toast.error("Please sign in to add to cart", { duration: 1500 });
      setTimeout(() => navigate("/signin"), 500);
      return;
    }
    if (!selectedVariant) {
      toast.error("This product is currently out of stock");
      return;
    }
    const getDynamicName = (productName, variantName) => {
      if (!productName) return "";
      if (!variantName) return productName;
      const sizeRegex = /\b\d+(?:\.\d+)?\s*(?:ml|l|litre|liter|litres|liters|ltr|ltrs)\b/i;
      if (sizeRegex.test(productName)) {
        return productName.replace(sizeRegex, variantName);
      }
      return `${productName} - ${variantName}`;
    };
    const displayName = getDynamicName(product.name, selectedVariant.name);

    const itemToAdd = {
      ...product,
      _id: `${product._id}_${selectedVariant._id}`,
      productId: product._id,
      variantId: selectedVariant._id,
      name: displayName,
      variantName: selectedVariant.name,
      price: selectedVariant.salePrice || selectedVariant.price,
      quantity: 1
    };
    dispatch(addToCart(itemToAdd));
    toast.success(`${displayName} added to cart!`);
  };

  const sidebarContent = (
    <div className="flex flex-col gap-10">
      {/* SEARCH WIDGET */}
      <div className="bg-white p-6 border border-gray-200">
        <h3 className="text-lg font-black text-black uppercase mb-4 border-b border-gray-100 pb-2">Search</h3>
        <div className="flex w-full bg-gray-50 border border-gray-200 focus-within:border-black transition-colors">
          <input
            type="text"
            placeholder="Find products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 font-medium text-sm outline-none bg-transparent"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="px-3 text-gray-400 hover:text-black">✖</button>
          )}
        </div>
      </div>

      {/* PRICE FILTER WIDGET */}
      <div className="bg-white p-6 border border-gray-200">
        <h3 className="text-lg font-black text-black uppercase mb-4 border-b border-gray-100 pb-2">
          Max Price: ₹{priceRange}
        </h3>
        <input
          type="range"
          min="0"
          max="5000"
          step="100"
          value={priceRange}
          onChange={(e) => setPriceRange(Number(e.target.value))}
          className="w-full accent-[#FFDD00] cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-400 font-bold mt-2 uppercase tracking-widest">
          <span>₹0</span>
          <span>₹5000+</span>
        </div>
      </div>

      {/* CATEGORIES WIDGET */}
      <div className="bg-white p-6 border border-gray-200">
        <h3 className="text-lg font-black text-black uppercase mb-4 border-b border-gray-100 pb-2 flex justify-between items-center">
          Categories
          {activeCategory !== "All" && (
            <button onClick={() => setActiveCategory("All")} className="text-[10px] text-red-500 hover:underline">Reset</button>
          )}
        </h3>
        <ul className="flex flex-col gap-1 text-[11px] font-black text-gray-500 uppercase tracking-widest">
          <li
            onClick={() => { setActiveCategory("All"); setVisibleCount(12); setShowMobileFilters(false); }}
            className={`flex justify-between items-center p-2 rounded cursor-pointer transition-colors ${activeCategory === "All" ? "bg-[#FFDD00] text-black" : "hover:bg-gray-50"}`}
          >
            <span>All Products</span>
            <span className="bg-gray-100 text-gray-400 px-2 py-0.5 rounded">{products.length}</span>
          </li>
          {Object.entries(categoriesMap).map(([title, count], idx) => (
            <li
              key={idx}
              onClick={() => { setActiveCategory(title); setVisibleCount(12); setShowMobileFilters(false); }}
              className={`flex justify-between items-center p-2 rounded cursor-pointer transition-colors ${activeCategory === title ? "bg-[#FFDD00] text-black" : "hover:bg-gray-50 hover:text-black"}`}
            >
              <span>{title}</span>
              <span className="bg-gray-100 text-gray-400 px-2 py-0.5 rounded">{count}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <>
      <SEO
        title="Shop Stone Pressed Oils"
        description="Browse our collection of premium stone-pressed oils. Buy Premium Grade Pure Oil natural and organic oils online at the best prices."
        keywords="shop stone pressed oil, buy organic oil online, stone pressed cooking oil"
        url="/shop"
      />
      <Navbar />
      <div className="w-full bg-[#fcfcfc] min-h-screen py-12 px-6 md:px-12 lg:px-24">

        {/* HEADER */}
        <div className="max-w-7xl mx-auto flex flex-col items-center mb-16 text-center border-b border-gray-200 pb-12">
          <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight uppercase">
            OwnFresh <span className="text-[#FFDD00]">Shop</span>
          </h1>
          <p className="text-gray-500 mt-4 text-sm uppercase tracking-widest font-bold">
            Explore our collection of Premium Grade Pure Oil natural, stone-pressed botanic purity.
          </p>
        </div>

        {/* MOBILE FILTER TOGGLE */}
        <div className="lg:hidden max-w-7xl mx-auto mb-6 flex flex-col gap-4">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full bg-black text-white py-4 px-6 rounded-xl font-black uppercase tracking-widest text-[11px] flex justify-between items-center active:scale-95 transition-all shadow-lg shadow-gray-200"
          >
            <span>{showMobileFilters ? "Hide Filters" : `Filters (Selected: ${activeCategory})`}</span>
            <span className="text-[#FFDD00] text-lg">{showMobileFilters ? "-" : "+"}</span>
          </button>

          {showMobileFilters && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
              {sidebarContent}
            </div>
          )}
        </div>

        {/* 75/25 SPLIT LAYOUT */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">

          {/* LEFT COLUMN: SIDEBAR (Desktop) */}
          <div className="hidden lg:flex lg:col-span-1 flex-col sticky top-[100px] h-fit">
            {sidebarContent}
          </div>

          {/* RIGHT COLUMN: MAIN GRID (75%) */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center py-32"><Loader2 className="w-12 h-12 text-[#FFDD00] animate-spin" /></div>
            ) : displayedProducts.length === 0 ? (
              <div className="bg-white p-10 border border-gray-200 text-center text-gray-400 font-bold uppercase tracking-widest w-full">
                No products found matching your current filters.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mb-12">
                  {displayedProducts.slice(0, visibleCount).map((p) => (
                    <ProductCard
                      key={p._id}
                      product={p}
                      user={user}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>

                {/* LOAD MORE */}
                {displayedProducts.length > visibleCount && (
                  <div className="flex justify-center w-full">
                    <button
                      onClick={() => setVisibleCount(v => v + 6)}
                      className="flex items-center justify-center px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] bg-[#FFDD00] text-slate-900 shadow-xl shadow-yellow-200 transition-all duration-300 hover:bg-slate-900 hover:text-white active:scale-95 border-2 border-transparent hover:border-slate-800 cursor-pointer w-full md:w-auto group"
                    >
                      Load More Products
                      <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Shop;