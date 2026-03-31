import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Loader2, ArrowRight } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import SLink from "./SLink";
import { addToCart } from "../redux/userslice";

const ProductSection = ({ limit = null }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedItems, setAddedItems] = useState({});
  const [visibleCount, setVisibleCount] = useState(8); 
  const [activeCategory, setActiveCategory] = useState("All");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.userData);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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

  useEffect(() => {
    fetchProducts();
  }, []);

  const categories = ["All", ...new Set(products.map(p => p.category).filter(Boolean))];

  const filteredProducts = useMemo(() => {
    let list = products;
    if (activeCategory !== "All") {
      list = products.filter(p => p.category === activeCategory);
    }
    return limit ? list.slice(0, limit) : list.slice(0, visibleCount);
  }, [products, limit, visibleCount, activeCategory]);

  const handleAddToCart = (product) => {
    if (!user) {
      toast.error("Please sign in to add to cart", { duration: 1500 });
      setTimeout(() => navigate("/signin"), 500);
      return;
    }
    const itemToAdd = { ...product, quantity: 1 };
    dispatch(addToCart(itemToAdd));
    setAddedItems((prev) => ({ ...prev, [product._id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [product._id]: false }));
    }, 2000);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className={`w-full bg-white px-0 md:px-12 lg:px-24 mx-auto ${limit ? "pt-12" : "pt-24"}`}>
      <Toaster position="top-center" />

      {/* HEADER */}
      <div className="flex flex-col items-center mb-10 text-center px-6">
        <h2 className="text-3xl md:text-5xl font-black text-black tracking-tight uppercase">
          {limit ? "Featured Products" : "All Products"}
        </h2>
        <div className="w-16 h-1 bg-[#F9DD19] mt-6"></div>
      </div>

      {loading ? (
           <div className="flex justify-center py-32"><Loader2 className="w-12 h-12 text-[#F9DD19] animate-spin" /></div>
      ) : (
        <>
          {/* CATEGORY FILTER BAR */}
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 mb-10 px-6 max-w-7xl mx-auto hide-scrollbar">
              {categories.map((cat, i) => (
                  <button
                      key={i}
                      onClick={() => { setActiveCategory(cat); setVisibleCount(8); }}
                      className={`whitespace-nowrap px-6 py-2 rounded-full font-bold uppercase tracking-wider text-xs transition-colors border snap-start ${
                          activeCategory === cat 
                          ? "bg-[#F9DD19] text-black border-[#F9DD19]" 
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
                    <SLink
                      to={`/product/${p._id}`}
                      key={p._id}
                      className="group relative bg-[#F8F8F8] border border-transparent rounded-lg p-5 transition-all duration-300 hover:shadow-xl hover:bg-white hover:border-gray-200 flex flex-col items-center text-center cursor-pointer snap-center min-w-[260px] md:min-w-[auto] max-w-[300px] md:max-w-none w-full flex-shrink-0"
                    >
                      <div className="relative h-48 w-full rounded-md overflow-hidden bg-transparent mb-4 flex items-center justify-center">
                        <img src={p.image} alt={p.name} className="h-full w-auto object-contain transition-transform duration-500 group-hover:scale-105 mix-blend-multiply" />
                        {Number(p.price) < 500 && <span className="absolute top-2 left-2 bg-[#F9DD19] text-black text-[10px] font-bold px-2 py-1 uppercase tracking-widest">Sale</span>}
                      </div>

                      <div className="flex flex-col flex-grow w-full items-center">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">{p.category || "Premium Oil"}</span>
                        <h3 className="text-base text-black font-bold leading-tight mb-2 line-clamp-2 uppercase">{p.name}</h3>
                        
                        <div className="mt-auto pt-4 w-full flex flex-col items-center gap-3">
                          <span className="text-xl font-black text-black">₹{p.price}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleAddToCart(p); }}
                            disabled={addedItems[p._id]}
                            className={`w-full py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${addedItems[p._id] ? "bg-green-500 text-white" : "bg-black text-white hover:bg-[#F9DD19] hover:text-black"}`}
                          >
                            {addedItems[p._id] ? "Added to Cart" : "Add to Cart"}
                          </button>
                        </div>
                      </div>
                    </SLink>
                  ))}
                </div>
             </div>
          )}

          {/* VIEW MORE SECTION */}
          {filteredProducts.length > 0 && (
             <div className="mt-8 mb-20 flex justify-center w-full px-6">
               {limit ? (
                 <SLink to="/shop" className="flex items-center justify-center px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] bg-[#F9DD19] text-slate-900 shadow-xl shadow-yellow-200 transition-all duration-300 hover:bg-slate-900 hover:text-white active:scale-95 border-2 border-transparent hover:border-slate-800 cursor-pointer w-full md:w-auto group">
                    View All Products
                    <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
                 </SLink>
               ) : (
                 products.filter(p => activeCategory === "All" || p.category === activeCategory).length > visibleCount && (
                     <button onClick={() => setVisibleCount(v=>v+4)} className="flex items-center justify-center px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] bg-[#F9DD19] text-slate-900 shadow-xl shadow-yellow-200 transition-all duration-300 hover:bg-slate-900 hover:text-white active:scale-95 border-2 border-transparent hover:border-slate-800 cursor-pointer w-full md:w-auto group">
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
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default ProductSection;