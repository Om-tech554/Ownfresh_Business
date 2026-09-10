import React, { useEffect, useState, useMemo } from 'react';
import Navbar from './Navbar';
import axios from 'axios';
import {
  Loader2,
  ArrowRight,
  Filter,
  SlidersHorizontal,
  Search,
  X,
  Check,
  Package,
  Layers,
  Sparkles,
  Utensils,
  Flame,
  Heart,
  Eye
} from "lucide-react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { addToCart } from "../redux/userslice";
import SLink from "./SLink";
import SEO from "./SEO";
import ProductCard from "./ProductCard";

const BOTTLE_SIZES = ["All", "250 ml", "500 ml", "1 Litre", "2 Litre", "5 Litre", "15 Litre"];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest Arrivals" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "bestseller", label: "Best Sellers & Top Rated" }
];

const PURPOSE_CHIPS = [
  { id: "all", label: "All Stone Pressed", icon: Sparkles },
  { id: "daily", label: "Daily Indian Cooking", icon: Utensils, keywords: ["groundnut", "sunflower", "safflower"] },
  { id: "frying", label: "Deep Frying & Puris", icon: Flame, keywords: ["groundnut", "mustard", "sunflower"] },
  { id: "hair_skin", label: "Hair & Skin Care", icon: Sparkles, keywords: ["coconut", "sesame", "mustard"] },
  { id: "heart", label: "Heart & Wellness", icon: Heart, keywords: ["safflower", "groundnut", "sunflower"] },
  { id: "tadka", label: "Tadka & Pickling", icon: Utensils, keywords: ["mustard", "sesame"] },
  { id: "combos", label: "Value Bundles", icon: Package, keywords: ["combo", "pack", "bundle"] }
];

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedPurpose, setSelectedPurpose] = useState("all");
  const [selectedSize, setSelectedSize] = useState("All");
  const [stockOnly, setStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(12);
  const [priceRange, setPriceRange] = useState(15000);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useSelector((state) => state.user.userData);

  const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:10000").replace(/\/+$/, "");

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

  /* Load Recently Viewed from localStorage */
  useEffect(() => {
    if (products.length > 0) {
      try {
        const stored = JSON.parse(localStorage.getItem("ownfresh_recently_viewed") || "[]");
        if (stored.length > 0) {
          const matched = stored
            .map((id) => products.find((p) => p._id === id))
            .filter(Boolean);
          setRecentlyViewed(matched);
        }
      } catch (e) {}
    }
  }, [products]);

  const categoriesMap = useMemo(() => {
    return products.reduce((acc, curr) => {
      const cat = curr.category?.name || 'General';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
  }, [products]);

  const displayedProducts = useMemo(() => {
    let result = [...products];

    // 1. Category Filter
    if (activeCategory !== "All") {
      result = result.filter(p => (p.category?.name || 'General') === activeCategory);
    }

    // 2. Purpose Intent Filter
    if (selectedPurpose !== "all") {
      const chip = PURPOSE_CHIPS.find(c => c.id === selectedPurpose);
      if (chip && chip.keywords) {
        result = result.filter(p => {
          const name = (p.name || "").toLowerCase();
          const desc = (p.shortDesc || "").toLowerCase();
          const cat = (p.category?.name || "").toLowerCase();
          return chip.keywords.some(k => name.includes(k) || desc.includes(k) || cat.includes(k));
        });
      }
    }

    // 3. Search Filter
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.shortDesc && p.shortDesc.toLowerCase().includes(q)) ||
        (p.category?.name && p.category.name.toLowerCase().includes(q))
      );
    }

    // 4. Bottle Size Filter
    if (selectedSize !== "All") {
      const sizeClean = selectedSize.toLowerCase().replace(/\s+/g, "");
      result = result.filter(p => {
        if (!p.variants || p.variants.length === 0) return false;
        return p.variants.some(v => {
          const vName = (v.name || "").toLowerCase().replace(/\s+/g, "");
          return vName.includes(sizeClean) || sizeClean.includes(vName);
        });
      });
    }

    // 5. In Stock Filter
    if (stockOnly) {
      result = result.filter(p => {
        if (!p.variants || p.variants.length === 0) return true;
        return p.variants.some(v => v.status === "Active" && (v.stockQuantity === undefined || v.stockQuantity > 0));
      });
    }

    // 6. Price Filter
    result = result.filter(p => Number(p.price) <= priceRange);

    // 7. Sorting
    if (sortBy === "price_asc") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "price_desc") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === "bestseller") {
      result.sort((a, b) => {
        const aHasBadge = a.badges?.includes("Best Seller") ? 1 : 0;
        const bHasBadge = b.badges?.includes("Best Seller") ? 1 : 0;
        return bHasBadge - aHasBadge || (b.rating || 5) - (a.rating || 5);
      });
    } else {
      // Newest
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return result;
  }, [products, activeCategory, selectedPurpose, searchQuery, selectedSize, stockOnly, priceRange, sortBy]);

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
    const itemImg = selectedVariant.image || (selectedVariant.images && selectedVariant.images[0]) || product.image;

    const itemToAdd = {
      ...product,
      _id: `${product._id}_${selectedVariant._id}`,
      productId: product._id,
      variantId: selectedVariant._id,
      name: displayName,
      variantName: selectedVariant.name,
      price: selectedVariant.salePrice || selectedVariant.price,
      image: itemImg,
      quantity: 1
    };
    dispatch(addToCart(itemToAdd));
    toast.success(`${displayName} added to cart!`);
  };

  const clearAllFilters = () => {
    setActiveCategory("All");
    setSelectedPurpose("all");
    setSelectedSize("All");
    setStockOnly(false);
    setSearchQuery("");
    setPriceRange(15000);
    setSortBy("newest");
    setVisibleCount(12);
  };

  const sidebarContent = (
    <div className="flex flex-col gap-6">
      
      {/* SEARCH WIDGET */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-3 flex items-center justify-between">
          <span>Search Oils</span>
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-[10px] text-red-500 font-bold hover:underline">
              Clear
            </button>
          )}
        </h3>
        <div className="flex items-center w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-[#1E971D] focus-within:bg-white transition-all">
          <Search size={16} className="text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search oils, categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-medium outline-none bg-transparent text-slate-800"
          />
        </div>
      </div>

      {/* BOTTLE SIZES FILTER */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Package size={14} className="text-[#1E971D]" /> Bottle Size
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {BOTTLE_SIZES.map((sz) => {
            const isSelected = selectedSize === sz;
            return (
              <button
                key={sz}
                onClick={() => setSelectedSize(sz)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#1E971D] border-[#1E971D] text-white shadow-xs scale-102"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {sz}
              </button>
            );
          })}
        </div>
      </div>

      {/* PRICE FILTER */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">
            Max Price
          </h3>
          <span className="text-xs font-black text-[#1E971D] font-mono">₹{priceRange.toLocaleString('en-IN')}</span>
        </div>
        <input
          type="range"
          min="100"
          max="15000"
          step="100"
          value={priceRange}
          onChange={(e) => setPriceRange(Number(e.target.value))}
          className="w-full accent-[#1E971D] cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest">
          <span>₹100</span>
          <span>₹15,000+</span>
        </div>
      </div>

      {/* AVAILABILITY FILTER */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={stockOnly}
            onChange={(e) => setStockOnly(e.target.checked)}
            className="w-4 h-4 text-[#1E971D] rounded cursor-pointer"
          />
          <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
            In Stock Only
          </span>
        </label>
      </div>

      {/* CATEGORIES WIDGET */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">
            Categories
          </h3>
          {activeCategory !== "All" && (
            <button onClick={() => setActiveCategory("All")} className="text-[10px] text-red-500 font-bold hover:underline">
              Reset
            </button>
          )}
        </div>
        <ul className="flex flex-col gap-1 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
          <li
            onClick={() => { setActiveCategory("All"); setVisibleCount(12); setShowMobileFilters(false); }}
            className={`flex justify-between items-center p-2 rounded-xl cursor-pointer transition-colors ${
              activeCategory === "All" ? "bg-[#1E971D] text-white font-black" : "hover:bg-slate-50"
            }`}
          >
            <span>All Oils</span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] ${activeCategory === "All" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"}`}>
              {products.length}
            </span>
          </li>
          {Object.entries(categoriesMap).map(([title, count], idx) => (
            <li
              key={idx}
              onClick={() => { setActiveCategory(title); setVisibleCount(12); setShowMobileFilters(false); }}
              className={`flex justify-between items-center p-2 rounded-xl cursor-pointer transition-colors ${
                activeCategory === title ? "bg-[#1E971D] text-white font-black" : "hover:bg-slate-50"
              }`}
            >
              <span>{title}</span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] ${activeCategory === title ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"}`}>
                {count}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* CLEAR ALL BUTTON */}
      <button
        onClick={clearAllFilters}
        className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
      >
        Clear All Filters
      </button>

    </div>
  );

  return (
    <>
      <SEO
        title="Shop Stone Pressed Oils | Multiple Bottle Sizes"
        description="Browse our collection of premium stone-pressed oils in 250ml, 500ml, 1 Litre, 2 Litre, and 5 Litre bottles. Traditional, unrefined, and chemical-free."
        keywords="shop stone pressed oil, buy organic oil online, 5 litre cooking oil, mustard oil 1 litre"
        url="/shop"
      />
      <Navbar />

      <div className="w-full bg-[#fafafa] min-h-screen py-10 pb-28 lg:pb-16 px-3 sm:px-8 md:px-12 lg:px-20 font-sans">

        {/* HEADER SECTION */}
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between mb-10 pb-8 border-b border-slate-200 gap-4">
          <div>
            <span className="text-[10px] font-black text-[#1E971D] uppercase tracking-widest bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full inline-block mb-2">
              Authentic Wood / Stone Churned
            </span>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase">
              Stone Pressed <span className="text-[#1E971D]">Oil Collection</span>
            </h1>
            <p className="text-slate-500 mt-1 text-xs sm:text-sm font-medium">
              Available in 250ml, 500ml, 1L, 2L, and 5L bottles with independent photos and stock.
            </p>
          </div>

          {/* SORTING CONTROLS */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#1E971D] cursor-pointer shadow-xs"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* SHOP BY PURPOSE FILTER CHIPS */}
        <div id="shop-purpose-section" className="max-w-7xl mx-auto mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            <span className="text-xs font-black uppercase tracking-wider text-slate-900 bg-[#FFDD00]/25 border border-[#FFDD00]/70 px-3 py-1.5 rounded-xl whitespace-nowrap mr-1 flex items-center gap-1.5 shadow-xs">
              <Sparkles size={13} className="text-slate-900" />
              <strong>PURPOSE:</strong>
            </span>
            {PURPOSE_CHIPS.map((chip) => {
              const Icon = chip.icon;
              const isSelected = selectedPurpose === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => {
                    setSelectedPurpose(chip.id);
                    setVisibleCount(12);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#1E971D] text-white shadow-md shadow-[#1E971D]/20 scale-102"
                      : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={14} className={isSelected ? "text-white" : "text-[#1E971D]"} />
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* MOBILE FILTER TOGGLE BUTTON */}
        <div className="lg:hidden max-w-7xl mx-auto mb-6">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full bg-slate-900 text-white py-3.5 px-5 rounded-2xl font-black uppercase tracking-widest text-xs flex justify-between items-center shadow-md active:scale-98 transition-all"
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-[#1E971D]" />
              {showMobileFilters ? "Hide Filters" : `Filters (${displayedProducts.length} Oils)`}
            </span>
            <span className="text-xs">{showMobileFilters ? "▲" : "▼"}</span>
          </button>

          {showMobileFilters && (
            <div className="mt-4 animate-in fade-in slide-in-from-top-4 duration-300">
              {sidebarContent}
            </div>
          )}
        </div>

        {/* MAIN LAYOUT */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* DESKTOP SIDEBAR */}
          <div className="hidden lg:block lg:col-span-1 sticky top-28 h-fit">
            {sidebarContent}
          </div>

          {/* PRODUCTS GRID */}
          <div className="lg:col-span-3">
            
            {/* Active Filters Summary Bar */}
            <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-2xl border border-slate-200/80 text-xs font-bold text-slate-500">
              <span>Showing <strong className="text-slate-900 font-black">{displayedProducts.length}</strong> matching oil products</span>
              {(activeCategory !== "All" || selectedPurpose !== "all" || selectedSize !== "All" || stockOnly || searchQuery) && (
                <button
                  onClick={clearAllFilters}
                  className="text-[#1E971D] hover:underline font-black uppercase text-[10px] tracking-wider"
                >
                  Reset Filters
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center py-32">
                <Loader2 className="w-12 h-12 text-[#1E971D] animate-spin" />
              </div>
            ) : displayedProducts.length === 0 ? (
              <div className="bg-white p-16 rounded-3xl border border-slate-200 text-center text-slate-400 font-bold uppercase tracking-widest">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p>No products match your current filters.</p>
                <button
                  onClick={clearAllFilters}
                  className="mt-4 px-6 py-2.5 bg-[#1E971D] text-white rounded-xl text-xs font-bold uppercase tracking-wider"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
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
                  <div className="flex justify-center mt-12">
                    <button
                      onClick={() => setVisibleCount((v) => v + 6)}
                      className="flex items-center justify-center px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs bg-[#FFDD00] text-slate-900 shadow-xl shadow-yellow-200 transition-all duration-300 hover:bg-slate-900 hover:text-white active:scale-95 border-2 border-transparent hover:border-slate-800 cursor-pointer group"
                    >
                      Load More Oils
                      <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                )}
              </>
            )}

          </div>

        </div>

        {/* RECENTLY VIEWED PRODUCTS TRAY */}
        {recentlyViewed.length > 0 && (
          <div className="max-w-7xl mx-auto mt-20 pt-16 border-t border-slate-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#1E971D] bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full inline-block mb-1">
                  Your Browsing History
                </span>
                <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
                  <Eye size={22} className="text-[#1E971D]" /> Recently Viewed Oils
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {recentlyViewed.slice(0, 4).map((p) => (
                <ProductCard
                  key={p._id}
                  product={p}
                  user={user}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default Shop;