import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { ChevronLeft, ChevronRight, Plus, Minus, Check, Sparkles, Tag, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import { addToCart, updateQuantity, removeFromCart } from '../../redux/userslice';
import { getDynamicName } from '../../utils/productUtils';
import { trackAddToCart } from '../../utils/analytics';

const serverUrl = import.meta.env.VITE_API_URL || "http://localhost:10000";

const ReviewUpsellCarousel = ({ cartItems = [], couponDetails = null, theme = "auto" }) => {
  const dispatch = useDispatch();
  const scrollRef = useRef(null);

  const isDark = theme === "dark";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Fetch products for recommendations
  useEffect(() => {
    let isMounted = true;
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${serverUrl}/api/product/all?limit=24`, { timeout: 10000 });
        if (isMounted && res.data?.products) {
          // Filter products that have active variants
          const valid = res.data.products.filter(p => {
            const hasVariants = Array.isArray(p.variants) && p.variants.some(v => v.status === "Active" && !v.name?.toLowerCase().includes("gift"));
            return hasVariants || p.price > 0;
          });
          setProducts(valid);

          // Initialize default selected variants (prefer 500ml or 1L)
          const initialVariants = {};
          valid.forEach(p => {
            const activeVars = p.variants?.filter(v => v.status === "Active" && !v.name?.toLowerCase().includes("gift")) || [];
            if (activeVars.length > 0) {
              const preferred = activeVars.find(v => v.name?.toLowerCase().includes("1 l") || v.name?.toLowerCase().includes("500")) || activeVars[0];
              initialVariants[p._id] = preferred;
            }
          });
          setSelectedVariants(initialVariants);
        }
      } catch (err) {
        console.warn("Could not load recommendation carousel items:", err?.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchRecommendations();
    return () => { isMounted = false; };
  }, []);

  // Check scroll position
  const updateScrollButtons = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', updateScrollButtons);
      updateScrollButtons();
      return () => el.removeEventListener('scroll', updateScrollButtons);
    }
  }, [products]);

  const handleScroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = direction === 'left' ? -280 : 280;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  // Coupon discount percentage if percentage type applied
  const couponPercentage = useMemo(() => {
    if (!couponDetails?.isApplied) return 0;
    if (couponDetails.discountType === 'PERCENTAGE' || couponDetails.discountType === 'percentage') {
      return Number(couponDetails.discountValue) || 0;
    }
    return 0;
  }, [couponDetails]);

  const handleSelectVariant = (productId, variant) => {
    setSelectedVariants(prev => ({ ...prev, [productId]: variant }));
  };

  const handleAddProduct = (product) => {
    const activeVariants = product.variants?.filter(v => v.status === "Active" && !v.name?.toLowerCase().includes("gift")) || [];
    const selectedVariant = selectedVariants[product._id] || activeVariants[0];

    const variantId = selectedVariant?._id || "default";
    const variantName = selectedVariant?.name || "Standard";
    const itemId = `${product._id}_${variantId}`;
    const displayName = getDynamicName(product.name, variantName);
    const itemImg = selectedVariant?.image || (selectedVariant?.images && selectedVariant.images[0]) || product.image;
    const itemPrice = selectedVariant ? (selectedVariant.salePrice || selectedVariant.price) : product.price;

    const itemToAdd = {
      ...product,
      _id: itemId,
      productId: product._id,
      variantId,
      name: displayName,
      variantName,
      price: itemPrice,
      shippingWeight: selectedVariant?.shippingWeight || 1,
      weight: selectedVariant?.weight || variantName || "",
      image: itemImg,
      quantity: 1
    };

    dispatch(addToCart(itemToAdd));
    trackAddToCart(product, selectedVariant, 1);

    if (couponPercentage > 0) {
      const savedAmount = Math.round(((itemPrice * couponPercentage) / 100) * 100) / 100;
      toast.success(
        `Added ${displayName} to order! Saved ₹${savedAmount} with coupon ${couponDetails.code}!`,
        { icon: '🎉', duration: 3000 }
      );
    } else {
      toast.success(`Added ${displayName} to order!`, { icon: '🛒', duration: 2500 });
    }
  };

  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <div className={`rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5 transition-colors duration-200 ${
      isDark 
        ? "bg-[#0f141d]/90 border border-white/10 shadow-xl" 
        : "bg-white dark:bg-[#171D26] border border-slate-200/90 dark:border-[#27313D]"
    }`}>
      {/* ── HEADER WITH COUPON HIGHLIGHT ── */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b ${
        isDark ? "border-white/10" : "border-slate-100 dark:border-[#27313D]"
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#FFD600] shrink-0" />
            <h3 className={`font-extrabold text-xs sm:text-sm uppercase tracking-wider ${
              isDark ? "text-white" : "text-slate-900 dark:text-[#F7F9FC]"
            }`}>
              Add More To Your Order
            </h3>
            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-[#FFD600] border border-amber-300/40">
              Direct Add
            </span>
          </div>
          
          {couponPercentage > 0 ? (
            <p className="text-[11px] text-emerald-400 font-bold mt-1 flex items-center gap-1.5">
              <Tag size={12} className="shrink-0" />
              <span>
                Promo <strong>{couponDetails.code}</strong> active! Extra <strong>{couponPercentage}% OFF</strong> applies automatically to any item added below!
              </span>
            </p>
          ) : (
            <p className={`text-[11px] font-medium mt-0.5 ${
              isDark ? "text-slate-400" : "text-slate-500 dark:text-[#818C9B]"
            }`}>
              Pure stone-pressed oils directly from our Kolhu. Free shipping on orders 2 Kg+
            </p>
          )}
        </div>

        {/* Carousel Arrow Controls */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            className={`w-8 h-8 rounded-xl flex items-center justify-center border disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-95 shadow-2xs ${
              isDark 
                ? "bg-white/10 border-white/10 text-slate-300 hover:text-white hover:bg-white/15" 
                : "bg-slate-50 dark:bg-[#151B23] border-slate-200 dark:border-[#27313D] text-slate-700 dark:text-[#B7C1CE] hover:text-black dark:hover:text-[#F5F7FA] hover:bg-slate-100 dark:hover:bg-[#1E2632]"
            }`}
            title="Previous"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            className={`w-8 h-8 rounded-xl flex items-center justify-center border disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-95 shadow-2xs ${
              isDark 
                ? "bg-white/10 border-white/10 text-slate-300 hover:text-white hover:bg-white/15" 
                : "bg-slate-50 dark:bg-[#151B23] border-slate-200 dark:border-[#27313D] text-slate-700 dark:text-[#B7C1CE] hover:text-black dark:hover:text-[#F5F7FA] hover:bg-slate-100 dark:hover:bg-[#1E2632]"
            }`}
            title="Next"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* ── CAROUSEL SCROLLER ── */}
      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto scroll-smooth py-1 px-0.5 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {loading ? (
          // Loading skeletons
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`w-[200px] sm:w-[220px] shrink-0 border rounded-2xl p-3 animate-pulse space-y-3 ${
                isDark ? "bg-[#141b24] border-white/10" : "bg-slate-50 dark:bg-[#151B23] border-slate-200/80 dark:border-[#27313D]"
              }`}
            >
              <div className={`w-full h-28 rounded-xl ${isDark ? "bg-white/5" : "bg-slate-200 dark:bg-[#202936]"}`} />
              <div className={`h-3.5 rounded w-3/4 ${isDark ? "bg-white/5" : "bg-slate-200 dark:bg-[#202936]"}`} />
              <div className={`h-3 rounded w-1/2 ${isDark ? "bg-white/5" : "bg-slate-200 dark:bg-[#202936]"}`} />
              <div className={`h-8 rounded-xl ${isDark ? "bg-white/5" : "bg-slate-200 dark:bg-[#202936]"}`} />
            </div>
          ))
        ) : (
          products.map((product) => {
            const activeVariants = product.variants?.filter(v => v.status === "Active" && !v.name?.toLowerCase().includes("gift")) || [];
            const selectedVariant = selectedVariants[product._id] || activeVariants[0];

            const variantId = selectedVariant?._id || "default";
            const cartItemId = `${product._id}_${variantId}`;
            const itemInCart = cartItems.find(i => i._id === cartItemId);

            const originalPrice = selectedVariant ? (selectedVariant.salePrice || selectedVariant.price) : product.price;
            
            // Calculate discounted amount with respect to coupon code
            let effectivePrice = originalPrice;
            let couponSavings = 0;
            if (couponPercentage > 0) {
              couponSavings = Math.round(((originalPrice * couponPercentage) / 100) * 100) / 100;
              effectivePrice = Math.max(0, originalPrice - couponSavings);
            }

            const productImage = selectedVariant?.image || (selectedVariant?.images && selectedVariant.images[0]) || product.image;
            const displayName = getDynamicName(product.name, selectedVariant?.name || "");

            return (
              <div
                key={product._id}
                className={`w-[200px] sm:w-[220px] shrink-0 snap-start border rounded-2xl p-3 flex flex-col justify-between transition-all duration-200 shadow-2xs group ${
                  isDark
                    ? "bg-[#141b24] border-white/10 hover:border-amber-400/50"
                    : "bg-slate-50 dark:bg-[#151B23] border-slate-200/80 dark:border-[#27313D] hover:border-amber-400/50 dark:hover:border-amber-400/40"
                }`}
              >
                <div>
                  {/* Product Image */}
                  <div className={`relative w-full h-24 sm:h-28 rounded-xl border p-2 flex items-center justify-center overflow-hidden mb-2.5 ${
                    isDark
                      ? "bg-[#1c2430] border-white/10"
                      : "bg-white dark:bg-[#1A222D] border-slate-100 dark:border-[#27313D]"
                  }`}>
                    <img
                      src={productImage}
                      alt={displayName}
                      className={`w-full h-full object-contain ${
                        isDark ? 'mix-blend-normal' : 'mix-blend-multiply dark:mix-blend-normal'
                      } transition-transform duration-300 group-hover:scale-105`}
                      loading="lazy"
                    />
                    {couponPercentage > 0 && (
                      <span className="absolute top-1.5 left-1.5 bg-emerald-500 text-white font-mono font-black text-[9px] px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-0.5">
                        <Tag size={9} /> -{couponPercentage}%
                      </span>
                    )}
                  </div>

                  {/* Product Title */}
                  <h4 className={`font-extrabold text-xs line-clamp-2 leading-snug tracking-tight mb-2 ${
                    isDark ? "text-white" : "text-slate-900 dark:text-[#F5F7FA]"
                  }`}>
                    {displayName}
                  </h4>

                  {/* Variant Size Pills (if multiple variants exist) */}
                  {activeVariants.length > 1 && (
                    <div className="flex flex-wrap gap-1 mb-2.5">
                      {activeVariants.slice(0, 3).map((v) => {
                        const isSelected = selectedVariant?._id === v._id;
                        return (
                          <button
                            key={v._id}
                            type="button"
                            onClick={() => handleSelectVariant(product._id, v)}
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-amber-400/20 text-amber-300 dark:text-[#FFD600] border-amber-400/50 dark:border-[#FFD600]/50'
                                : isDark
                                ? 'bg-white/5 text-slate-300 border-white/10 hover:text-white'
                                : 'bg-white dark:bg-[#1D2530] text-slate-500 dark:text-[#818C9B] border-slate-200 dark:border-[#2A3440] hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            {v.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Pricing & Add to Cart Section */}
                <div className={`pt-2 border-t mt-2 space-y-2 ${
                  isDark ? "border-white/10" : "border-slate-200/60 dark:border-[#27313D]"
                }`}>
                  <div>
                    {couponPercentage > 0 ? (
                      <div className="space-y-0.5">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm sm:text-base font-black text-amber-400 font-mono leading-none">
                            ₹{effectivePrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-[10px] text-slate-400 line-through font-mono">
                            ₹{originalPrice.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <p className="text-[9px] text-emerald-400 font-bold flex items-center gap-0.5">
                          <span>Save ₹{couponSavings.toLocaleString('en-IN', { minimumFractionDigits: 2 })} with {couponDetails.code}</span>
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-1.5">
                        <span className={`text-sm sm:text-base font-black font-mono ${
                          isDark ? "text-amber-400" : "text-slate-900 dark:text-[#F5F7FA]"
                        }`}>
                          ₹{originalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                        {selectedVariant?.listingPrice && selectedVariant.listingPrice > originalPrice && (
                          <span className="text-[10px] text-slate-400 line-through font-mono">
                            ₹{selectedVariant.listingPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Button / Stepper */}
                  {itemInCart ? (
                    <div className="flex items-center justify-between border border-amber-400/40 rounded-xl bg-amber-500/10 p-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (itemInCart.quantity <= 1) {
                            dispatch(removeFromCart(itemInCart._id));
                            toast.success(`Removed ${displayName} from order`);
                          } else {
                            dispatch(updateQuantity({ id: itemInCart._id, quantity: itemInCart.quantity - 1 }));
                          }
                        }}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition cursor-pointer active:scale-95 shadow-xs ${
                          isDark
                            ? "bg-white/10 text-slate-200 hover:text-white"
                            : "bg-white dark:bg-[#171D26] text-slate-700 dark:text-[#B7C1CE] hover:text-black dark:hover:text-[#F5F7FA]"
                        }`}
                        title="Reduce quantity"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="text-xs font-black text-amber-300 font-mono px-2">
                        {itemInCart.quantity} in order
                      </span>
                      <button
                        type="button"
                        onClick={() => dispatch(updateQuantity({ id: itemInCart._id, quantity: itemInCart.quantity + 1 }))}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition cursor-pointer active:scale-95 shadow-xs ${
                          isDark
                            ? "bg-white/10 text-slate-200 hover:text-white"
                            : "bg-white dark:bg-[#171D26] text-slate-700 dark:text-[#B7C1CE] hover:text-black dark:hover:text-[#F5F7FA]"
                        }`}
                        title="Add one more"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleAddProduct(product)}
                      className="w-full py-2 px-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer touch-manipulation"
                    >
                      <Plus size={13} className="stroke-[3]" />
                      <span>Add to Order</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ReviewUpsellCarousel;
