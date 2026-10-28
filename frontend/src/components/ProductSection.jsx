import React, { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import { Loader2, ArrowRight, ChevronLeft, ChevronRight, LayoutGrid, SlidersHorizontal, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import SLink from "./SLink";
import { addToCart } from "../redux/userslice";
import ProductCard from "./ProductCard";
import { cleanProductName, getDynamicName } from "../utils/productUtils";

const ProductSection = ({ limit = null }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(8);
  const [activeCategory, setActiveCategory] = useState("All");
  
  // Mobile layout state: 'carousel' (2-tile snap carousel) or 'grid' (2-tile full grid)
  const [mobileLayout, setMobileLayout] = useState("carousel");
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const carouselRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.userData);

  const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:10000").replace(/\/+$/, "");

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [productRes, categoryRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/product/all?limit=1000`),
        axios.get(`${API_BASE_URL}/api/category/all`)
      ]);

      setProducts(productRes.data.products || []);

      if (categoryRes.data.success) {
        const catNames = categoryRes.data.categories.map(c => c.name);
        setCategories(["All", ...catNames]);
      }
    } catch (error) {
      toast.error("Technical error: Unable to load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const filteredProducts = useMemo(() => {
    let list = products;
    if (activeCategory !== "All") {
      list = products.filter(p => p.category?.name === activeCategory);
    }
    return limit ? list.slice(0, limit) : list.slice(0, visibleCount);
  }, [products, limit, visibleCount, activeCategory]);

  // Handle Carousel Scroll Check
  const updateScrollState = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    
    // Compute current page of 2-tile cards
    const step = clientWidth || 1;
    const page = Math.round(scrollLeft / step);
    setActiveSlideIndex(page);
  };

  useEffect(() => {
    updateScrollState();
  }, [filteredProducts]);

  // Smooth scroll carousel by 2 cards (1 container width on mobile)
  const scrollCarousel = (direction) => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const scrollAmount = container.clientWidth * 0.95;
    container.scrollBy({
      left: direction === "next" ? scrollAmount : -scrollAmount,
      behavior: "smooth"
    });
  };

  const handleAddToCart = (product, selectedVariant) => {
    if (!selectedVariant) {
      toast.error("This product is currently out of stock");
      return;
    }
    const displayName = getDynamicName(product.name, selectedVariant.name);

    const itemToAdd = {
      ...product,
      _id: `${product._id}_${selectedVariant._id}`,
      productId: product._id,
      variantId: selectedVariant._id,
      name: displayName,
      variantName: selectedVariant.name,
      price: selectedVariant.salePrice || selectedVariant.price,
      shippingWeight: selectedVariant.shippingWeight || 0,
      weight: selectedVariant.weight || selectedVariant.name || "",
      image: selectedVariant.image || (selectedVariant.images && selectedVariant.images[0]) || product.image,
      quantity: 1
    };
    dispatch(addToCart(itemToAdd));
    toast.success(`${displayName} added to cart!`);
  };

  // Compute number of 2-tile pages for dot indicators
  const totalPages = Math.ceil(filteredProducts.length / 2);

  return (
    <section id="products" className={`w-full bg-white dark:bg-[#0B0F14] px-3 xs:px-4 sm:px-8 md:px-12 lg:px-24 mx-auto transition-colors duration-250 ${limit ? "pt-10 sm:pt-12" : "pt-16 sm:pt-24"}`}>

      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-10 max-w-7xl mx-auto gap-4">
        <div>
          <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-[#1E971D] dark:text-[#FFD600] bg-emerald-100/60 dark:bg-[#1D2530] border border-emerald-200/80 dark:border-[#303B48] px-3 py-1 rounded-full inline-flex items-center gap-1.5 mb-2">
            <Sparkles size={12} className="text-[#1E971D] dark:text-[#FFD600]" /> Fresh Stone Pressed
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-black dark:text-[#F7F9FC] tracking-tight uppercase font-sans">
            {limit ? "Featured Products" : "All Products"}
          </h2>
          <div className="w-14 sm:w-16 h-1 bg-[#FFDD00] dark:bg-[#FFD600] mt-3 rounded-full"></div>
        </div>

        {/* CONTROLS (Desktop chevrons + Mobile view mode switch) */}
        <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
          {/* Mobile Carousel vs Grid Toggle */}
          <div className="flex md:hidden items-center bg-slate-100 dark:bg-[#171D26] p-1 rounded-xl border border-slate-200/80 dark:border-[#27313D]">
            <button
              onClick={() => setMobileLayout("carousel")}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                mobileLayout === "carousel"
                  ? "bg-white dark:bg-[#FFD600] text-black shadow-xs font-black"
                  : "text-slate-500 dark:text-[#818C9B]"
              }`}
            >
              🎠 Carousel
            </button>
            <button
              onClick={() => setMobileLayout("grid")}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                mobileLayout === "grid"
                  ? "bg-white dark:bg-[#FFD600] text-black shadow-xs font-black"
                  : "text-slate-500 dark:text-[#818C9B]"
              }`}
            >
              ⊞ 2-Grid
            </button>
          </div>

          {/* Carousel Next / Prev Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollCarousel("prev")}
              disabled={!canScrollLeft}
              aria-label="Previous Products"
              className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                canScrollLeft
                  ? "bg-white dark:bg-[#171D26] border-slate-200 dark:border-[#27313D] text-slate-900 dark:text-[#F5F7FA] hover:bg-slate-100 dark:hover:bg-[#202731] shadow-xs active:scale-95"
                  : "bg-slate-50 dark:bg-[#12161E] border-slate-100 dark:border-[#1E2530] text-slate-300 dark:text-[#4A5565] cursor-not-allowed opacity-50"
              }`}
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={() => scrollCarousel("next")}
              disabled={!canScrollRight}
              aria-label="Next Products"
              className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                canScrollRight
                  ? "bg-slate-900 dark:bg-[#FFD600] border-slate-900 dark:border-[#FFD600] text-white dark:text-[#111318] hover:bg-[#1E971D] dark:hover:bg-[#FFE45C] shadow-sm active:scale-95"
                  : "bg-slate-50 dark:bg-[#12161E] border-slate-100 dark:border-[#1E2530] text-slate-300 dark:text-[#4A5565] cursor-not-allowed opacity-50"
              }`}
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24 sm:py-32">
          <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-[#FFDD00] dark:text-[#FFD600] animate-spin" />
        </div>
      ) : (
        <>
          {/* CATEGORY FILTER BAR */}
          <div className="relative mb-6 sm:mb-8 max-w-7xl mx-auto">
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-2 sm:gap-3 pb-2 hide-scrollbar">
              {categories.map((cat, i) => (
                <button
                  key={i}
                  onClick={() => { setActiveCategory(cat); setVisibleCount(8); }}
                  className={`whitespace-nowrap px-4 sm:px-6 py-2 rounded-full font-bold uppercase tracking-wider text-[11px] sm:text-xs transition-all border snap-start cursor-pointer shrink-0 ${
                    activeCategory === cat
                      ? "bg-[#FFDD00] dark:bg-[#FFD600] text-black dark:text-[#111318] border-[#FFDD00] dark:border-[#FFD600] shadow-xs scale-102"
                      : "bg-white dark:bg-[#171D26] text-gray-500 dark:text-[#B7C1CE] border-gray-200 dark:border-[#27313D] hover:border-black dark:hover:border-[#FFD600] hover:text-black dark:hover:text-[#F5F7FA]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* PRODUCTS: 2-TILE CAROUSEL ON MOBILE, 4-COL GRID ON DESKTOP */}
          {filteredProducts.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-[#818C9B] font-bold w-full py-16">
              No products found for this category.
            </p>
          ) : (
            <div className="max-w-7xl mx-auto w-full">
              {/* MOBILE CAROUSEL MODE (2 Tiles per view) vs DESKTOP GRID */}
              <div
                ref={carouselRef}
                onScroll={updateScrollState}
                className={`${
                  mobileLayout === "carousel"
                    ? "flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-2.5 xs:gap-3 sm:gap-4 md:gap-6 lg:gap-8 overflow-x-auto md:overflow-visible snap-x snap-mandatory hide-scrollbar scroll-smooth pb-4 sm:pb-8 w-full"
                    : "grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2.5 xs:gap-3 sm:gap-4 md:gap-6 lg:gap-8 pb-4 sm:pb-8 w-full"
                }`}
              >
                {filteredProducts.map((p) => (
                  <div
                    key={p._id}
                    className={`${
                      mobileLayout === "carousel"
                        ? "w-[calc(50%-5px)] xs:w-[calc(50%-6px)] sm:w-[calc(50%-8px)] md:w-full flex-shrink-0 snap-start"
                        : "w-full"
                    }`}
                  >
                    <ProductCard
                      product={p}
                      user={user}
                      onAddToCart={handleAddToCart}
                    />
                  </div>
                ))}
              </div>

              {/* MOBILE CAROUSEL PAGINATION DOTS & SWIPE HINT */}
              {mobileLayout === "carousel" && (
                <div className="flex md:hidden items-center justify-between pt-2 pb-6 px-1">
                  <div className="flex items-center gap-1.5">
                    {[...Array(Math.min(totalPages, 6))].map((_, idx) => (
                      <span
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          idx === activeSlideIndex
                            ? "w-5 bg-[#1E971D] dark:bg-[#FFD600]"
                            : "w-1.5 bg-slate-300 dark:bg-[#27313D]"
                        }`}
                      />
                    ))}
                  </div>

                  <span className="text-[10px] font-bold text-slate-400 dark:text-[#818C9B] uppercase tracking-wider flex items-center gap-1">
                    Swipe 2 at a time <ArrowRight size={10} />
                  </span>
                </div>
              )}
            </div>
          )}

          {/* VIEW MORE SECTION */}
          {filteredProducts.length > 0 && (
            <div className="mt-4 sm:mt-8 mb-12 sm:mb-20 flex justify-center w-full px-2">
              {limit ? (
                <SLink
                  to="/shop"
                  className="group inline-flex items-center justify-center gap-2.5 bg-black dark:bg-[#FFD600] hover:bg-[#FFDD00] dark:hover:bg-[#FFE45C] text-white dark:text-[#111318] hover:text-black font-black uppercase tracking-widest text-xs px-8 py-3.5 sm:py-4 rounded-xl transition-all duration-300 shadow-sm active:scale-95 cursor-pointer w-full sm:w-auto"
                >
                  <span>Explore All Stone Pressed Oils</span>
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </SLink>
              ) : (
                products.filter(p => activeCategory === "All" || p.category === activeCategory).length > visibleCount && (
                  <button
                    onClick={() => setVisibleCount(v => v + 4)}
                    className="group inline-flex items-center justify-center gap-2.5 bg-black dark:bg-[#FFD600] hover:bg-[#FFDD00] dark:hover:bg-[#FFE45C] text-white dark:text-[#111318] hover:text-black font-black uppercase tracking-widest text-xs px-8 py-3.5 sm:py-4 rounded-xl transition-all duration-300 shadow-sm active:scale-95 cursor-pointer w-full sm:w-auto"
                  >
                    <span>Load More Oils</span>
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </button>
                )
              )}
            </div>
          )}
        </>
      )}

      {/* Helper CSS for hiding scrollbars on carousel */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </section>
  );
};

export default ProductSection;
