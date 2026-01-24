import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  ShoppingCart,
  CheckCircle,
  Loader2,
  Check,
  Star,
  ArrowRight,
  SlidersHorizontal,
  Plus,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux"; 
import { useNavigate } from "react-router-dom";
import { addToCart } from "../redux/userslice";

const ProductSection = ({ limit = null }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedItems, setAddedItems] = useState({});
  const [visibleCount, setVisibleCount] = useState(6);
  const [category, setCategory] = useState("All");
  const [priceRange, setPriceRange] = useState(2000);

  const dispatch = useDispatch();
  const navigate = useNavigate();
const user = useSelector((state) => state.user.userData);
  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:8000";

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/product/all`);
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

  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => Number(p.price) <= priceRange);

    if (category !== "All") {
      result = result.filter(
        (p) =>
          p.category?.toLowerCase() === category.toLowerCase()
      );
    }

    return limit
      ? result.slice(0, limit)
      : result.slice(0, visibleCount);
  }, [products, category, priceRange, limit, visibleCount]);

  const handleBuyNow = (p) => {
  if (!user) {
    toast.error("Please sign in first", { duration: 1500 });

    setTimeout(() => {
      navigate("/signin");
    }, 500); // 0.5 sec delay so toast can display properly

    return;
  }
    const itemToAdd = { ...p, quantity: 1 };
    dispatch(addToCart(itemToAdd));

    setAddedItems((prev) => ({ ...prev, [p._id]: true }));
    setTimeout(
      () =>
        setAddedItems((prev) => ({ ...prev, [p._id]: false })),
      2000
    );

    toast.success(`${p.name} added to cart`, {
      icon: "🛒",
    });
  };

  const handleViewMore = () => {
    setVisibleCount((prev) => prev + 3);
  };

  const renderStars = (rating) => {
    const numericRating = Number(rating) || 5;
    return (
      <div className="flex items-center gap-0.5 mb-2">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={14}
            className={`${
              i < Math.floor(numericRating)
                ? "fill-yellow-500 text-yellow-500"
                : "text-gray-200"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen bg-[#fcfcfd] px-6 pb-20 md:px-12 lg:px-24 ${
        limit ? "pt-10" : "pt-28"
      }`}
    >
      <Toaster position="top-center" />

      <div className="flex flex-col items-center mb-12 text-center">
        <div className="flex items-center gap-2 mb-4 bg-yellow-400/20 px-4 py-1.5 rounded-full border border-yellow-500/30">
          <CheckCircle className="w-4 h-4 text-yellow-700" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-800">
            Cold Pressed & Pure
          </span>
        </div>

        {!limit ? (
          <div className="animate-in fade-in zoom-in duration-700">
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Switch to a{" "}
              <span className="text-yellow-600">Healthier Lifestyle</span>
            </h2>
            <p className="text-xl md:text-2xl font-medium text-slate-500 italic mt-2">
              with OwnFresh
            </p>
          </div>
        ) : (
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Our <span className="text-yellow-600 italic">Golden</span> Oil
            Selection
          </h2>
        )}

        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent mt-6 rounded-full"></div>
      </div>

      {/* Filter Bar */}
      {!limit && (
        <div className="sticky top-20 z-30 w-full bg-white/80 backdrop-blur-xl border border-white shadow-lg rounded-3xl px-6 py-4 mx-auto max-w-3xl">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-slate-400" />
              <select
                className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer px-3 py-1"
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="All">All Varieties</option>
                <option value="Mustard">Mustard Oil</option>
                <option value="Coconut">Coconut Oil</option>
                <option value="Groundnut">Groundnut Oil</option>
              </select>
            </div>

            <div className="flex flex-col min-w-[180px]">
              <span className="text-[10px] font-bold text-yellow-600 uppercase">
                Max Price: ₹{priceRange}
              </span>

              <input
                type="range"
                min="100"
                max="2000"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="accent-yellow-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-12 h-12 text-yellow-600 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredProducts.map((p) => (
              <div
                key={p._id}
                className="group relative bg-white border border-white shadow-sm rounded-[2.5rem] p-6 transition-all duration-500 hover:shadow-xl hover:-translate-y-2 flex flex-col"
              >
                <div className="relative h-60 w-full bg-gray-50 rounded-[2rem] overflow-hidden p-8 mb-4">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                  />
                </div>

                <div className="flex flex-col flex-grow">
                  {renderStars(p.rating)}

                  <h3 className="text-slate-500 text-[13px] leading-relaxed mb-4 line-clamp-2 italic">
                    {p.name}
                  </h3>

                  <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                    {p.shortDesc}
                  </p>

                  <div className="mt-auto flex items-end justify-between">
                    <div>
                      <span className="text-3xl font-black text-slate-900 block">
                        ₹{p.price}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        1L Bottle
                      </span>
                    </div>

                    <button
                      onClick={() => handleBuyNow(p)}
                      disabled={addedItems[p._id]}
                      className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-500 cursor-pointer shadow-lg active:scale-95 ${
                        addedItems[p._id]
                          ? "bg-green-600 text-white rotate-[360deg]"
                          : "bg-slate-900 text-white hover:bg-yellow-500 hover:text-slate-900 shadow-slate-200"
                      }`}
                    >
                      {addedItems[p._id] ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <ShoppingCart className="w-6 h-6" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 flex justify-center">
            {limit && products.length > limit ? (
              <button
                onClick={() => navigate("/shop")}
                className="group flex items-center gap-4 bg-slate-900 text-white px-12 py-5 rounded-2xl font-bold uppercase tracking-widest text-[14px] hover:bg-yellow-500 hover:text-slate-900 transition-all cursor-pointer shadow-2xl"
              >
                Explore Full Collection
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </button>
            ) : (
              !limit &&
              products.length > visibleCount && (
                <button
                  onClick={handleViewMore}
                  className="flex items-center gap-3 bg-slate-900 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-yellow-500 hover:text-slate-900 transition-all cursor-pointer shadow-xl"
                >
                  <Plus size={16} /> Load More Varieties
                </button>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ProductSection;
