import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Loader2, ArrowRight } from "lucide-react";
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
  const [addedItems, setAddedItems] = useState({});
  const [visibleCount, setVisibleCount] = useState(8);
  const [activeCategory, setActiveCategory] = useState("All");

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

  return (
    <div id="products" className={`w-full bg-white dark:bg-[#0B0F14] px-0 md:px-12 lg:px-24 mx-auto transition-colors duration-250 ${limit ? "pt-12" : "pt-24"}`}>

      {/* HEADER */}
      <div className="flex flex-col items-center mb-10 text-center px-6">
        <h2 className="text-3xl md:text-5xl font-black text-black dark:text-[#F7F9FC] tracking-tight uppercase font-serif">
          {limit ? "Featured Products" : "All Products"}
        </h2>
        <div className="w-16 h-1 bg-[#FFDD00] dark:bg-[#FFD600] mt-6 rounded-full"></div>
      </div>

      {loading ? (
        <div className="flex justify-center py-32"><Loader2 className="w-12 h-12 text-[#FFDD00] dark:text-[#FFD600] animate-spin" /></div>
      ) : (
        <>
          {/* CATEGORY FILTER BAR */}
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 mb-10 px-6 max-w-7xl mx-auto hide-scrollbar">
            {categories.map((cat, i) => (
              <button
                key={i}
                onClick={() => { setActiveCategory(cat); setVisibleCount(8); }}
                className={`whitespace-nowrap px-6 py-2 rounded-full font-bold uppercase tracking-wider text-xs transition-colors border snap-start cursor-pointer ${activeCategory === cat
                  ? "bg-[#FFDD00] dark:bg-[#FFD600] text-black dark:text-[#111318] border-[#FFDD00] dark:border-[#FFD600]"
                  : "bg-white dark:bg-[#171D26] text-gray-500 dark:text-[#B7C1CE] border-gray-200 dark:border-[#27313D] hover:border-black dark:hover:border-[#FFD600] hover:text-black dark:hover:text-[#F5F7FA]"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* PRODUCTS CAROUSEL/GRID */}
          {filteredProducts.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-[#818C9B] font-bold w-full pb-20">No products found for this category.</p>
          ) : (
            <div className="max-w-7xl mx-auto w-full">
              <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 overflow-x-auto snap-x snap-mandatory hide-scrollbar px-6 md:px-0 pb-12 w-full">
                {filteredProducts.map((p) => (
                  <div key={p._id} className="w-[260px] md:w-full flex-shrink-0 snap-start">
                    <ProductCard
                      product={p}
                      user={user}
                      onAddToCart={handleAddToCart}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW MORE SECTION */}
          {filteredProducts.length > 0 && (
            <div className="mt-8 mb-20 flex justify-center w-full px-6">
              {limit ? (
                <SLink
                  to="/shop"
                  className="group inline-flex items-center justify-center gap-3 bg-black dark:bg-[#FFD600] hover:bg-[#FFDD00] dark:hover:bg-[#FFE45C] text-white dark:text-[#111318] hover:text-black font-black uppercase tracking-widest text-xs px-8 py-4 rounded-xl transition-all duration-300 shadow-md dark:shadow-none active:scale-95 cursor-pointer w-full sm:w-auto"
                >
                  <span>View All Products</span>
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </SLink>
              ) : (
                products.filter(p => activeCategory === "All" || p.category === activeCategory).length > visibleCount && (
                  <button
                    onClick={() => setVisibleCount(v => v + 4)}
                    className="group inline-flex items-center justify-center gap-3 bg-black dark:bg-[#FFD600] hover:bg-[#FFDD00] dark:hover:bg-[#FFE45C] text-white dark:text-[#111318] hover:text-black font-black uppercase tracking-widest text-xs px-8 py-4 rounded-xl transition-all duration-300 shadow-md dark:shadow-none active:scale-95 cursor-pointer w-full sm:w-auto"
                  >
                    <span>Load More</span>
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </button>
                )
              )}
            </div>
          )}
        </>
      )}

      {/* Helper CSS for hiding scrollbars strictly on the carousel */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default ProductSection;