import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Loader2, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import SLink from "./SLink";
import { addToCart } from "../redux/userslice";
import ProductCard from "./ProductCard";

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

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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

  return (
    <div id="products" className={`w-full bg-white px-0 md:px-12 lg:px-24 mx-auto ${limit ? "pt-12" : "pt-24"}`}>

      {/* HEADER */}
      <div className="flex flex-col items-center mb-10 text-center px-6">
        <h2 className="text-3xl md:text-5xl font-black text-black tracking-tight uppercase">
          {limit ? "Featured Products" : "All Products"}
        </h2>
        <div className="w-16 h-1 bg-[#FFDD00] mt-6"></div>
      </div>

      {loading ? (
        <div className="flex justify-center py-32"><Loader2 className="w-12 h-12 text-[#FFDD00] animate-spin" /></div>
      ) : (
        <>
          {/* CATEGORY FILTER BAR */}
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 mb-10 px-6 max-w-7xl mx-auto hide-scrollbar">
            {categories.map((cat, i) => (
              <button
                key={i}
                onClick={() => { setActiveCategory(cat); setVisibleCount(8); }}
                className={`whitespace-nowrap px-6 py-2 rounded-full font-bold uppercase tracking-wider text-xs transition-colors border snap-start ${activeCategory === cat
                  ? "bg-[#FFDD00] text-black border-[#FFDD00]"
                  : "bg-white text-gray-500 border-gray-200 hover:border-black hover:text-black"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* PRODUCTS CAROUSEL/GRID */}
          {filteredProducts.length === 0 ? (
            <p className="text-center text-gray-500 font-bold w-full pb-20">No products found for this category.</p>
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
                <SLink to="/shop" className="flex items-center justify-center px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] bg-[#FFDD00] text-slate-900 shadow-xl shadow-yellow-200 transition-all duration-300 hover:bg-slate-900 hover:text-white active:scale-95 border-2 border-transparent hover:border-slate-800 cursor-pointer w-full md:w-auto group">
                  View All Products
                  <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
                </SLink>
              ) : (
                products.filter(p => activeCategory === "All" || p.category === activeCategory).length > visibleCount && (
                  <button onClick={() => setVisibleCount(v => v + 4)} className="flex items-center justify-center px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] bg-[#FFDD00] text-slate-900 shadow-xl shadow-yellow-200 transition-all duration-300 hover:bg-slate-900 hover:text-white active:scale-95 border-2 border-transparent hover:border-slate-800 cursor-pointer w-full md:w-auto group">
                    Load More
                    <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
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