import React, { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ShoppingBag, Crown, Plus, Minus, Trash2, 
  Droplets, Sparkles, ShieldCheck, CheckCircle2, MapPin, Tag, Check 
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { addToCart, updateQuantity, removeFromCart } from '../redux/userslice';
import SLink from "../components/SLink";
import { motion, AnimatePresence } from 'framer-motion';
import SmokyOilSpillBackground from '../components/cart/SmokyOilSpillBackground';
import CartLocationModal from '../components/cart/CartLocationModal';
import { calculateClientShipping } from '../utils/shippingCalculator';
import { trackViewCart, trackRemoveFromCart, trackBeginCheckout } from '../utils/analytics';
import ReviewUpsellCarousel from '../components/checkout/ReviewUpsellCarousel';

const serverUrl = import.meta.env.VITE_API_URL || "http://localhost:10000";

// ── MEMOIZED HIGH-PERFORMANCE COUPON WIDGET (ISOLATED TYPING STATE) ──
const CouponSection = memo(({
  couponDetails,
  onApply,
  onRemove,
  isSpecialCoupon,
  discount
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [validating, setValidating] = useState(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!couponInput.trim()) return toast.error("Please enter a coupon code");
    setValidating(true);
    const success = await onApply(couponInput.trim().toUpperCase());
    setValidating(false);
    if (success) setCouponInput('');
  };

  return (
    <div className="pt-1 pb-1">
      {!couponDetails?.isApplied ? (
        <form onSubmit={handleSubmit} className="p-3 sm:p-3.5 rounded-2xl bg-[#0c1017]/80 border border-white/10 shadow-inner">
          <label className="block text-[10px] font-black uppercase text-amber-300 tracking-wider mb-2 flex items-center gap-1.5">
            <Tag size={13} className="text-amber-400" /> Have a Coupon Code?
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="ENTER CODE"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              className="flex-1 min-w-0 px-3 py-2 bg-white/5 border border-white/15 focus:border-amber-400 rounded-xl text-xs font-bold text-white uppercase tracking-wider placeholder-slate-500 outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={validating || !couponInput.trim()}
              className="px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md active:scale-95 flex items-center justify-center shrink-0 touch-manipulation"
            >
              {validating ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                "Apply"
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-3 sm:p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Check size={13} className="stroke-[3]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-mono font-black text-xs text-emerald-300 uppercase tracking-wider">
                    {couponDetails.code}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Applied
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200 font-semibold mt-0.5">
                  Saved ₹{discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onRemove}
              className="text-[10px] font-black uppercase tracking-wider text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-3 py-1.5 rounded-xl transition-colors cursor-pointer shrink-0 touch-manipulation"
            >
              Remove
            </button>
          </div>
          {isSpecialCoupon && (
            <p className="text-[10px] text-amber-300 font-bold mt-2 pt-2 border-t border-emerald-500/20 leading-relaxed">
              🚚 Standard delivery charges apply for exclusive promo "{couponDetails.code}".
            </p>
          )}
        </div>
      )}
    </div>
  );
});

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.user.cartItems);
  const reduxDestination = useSelector((state) => state.user.deliveryDestination);
  const user = useSelector((state) => state.user.userData);

  const [showLocationModal, setShowLocationModal] = useState(false);

  // Stored coupon details state
  const [couponDetails, setCouponDetails] = useState(() => {
    try {
      const saved = localStorage.getItem("oil_applied_coupon");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.isApplied) return parsed;
      }
    } catch (e) {}
    return null;
  });

  const saveCouponDetails = useCallback((details) => {
    setCouponDetails(details);
    if (details && details.isApplied) {
      localStorage.setItem("oil_applied_coupon", JSON.stringify(details));
    } else {
      localStorage.removeItem("oil_applied_coupon");
    }
  }, []);

  // Delivery destination state (persisted in localStorage, source of truth for shipping)
  const [destination, setDestination] = useState(() => {
    try {
      const savedDest = localStorage.getItem("oil_delivery_destination");
      if (savedDest) {
        const parsed = JSON.parse(savedDest);
        if (parsed && (parsed.state || parsed.city || parsed.address || parsed.latitude)) return parsed;
      }
      const savedShip = localStorage.getItem("oil_shipping_details");
      if (savedShip) {
        const parsed = JSON.parse(savedShip);
        if (parsed && (parsed.state || parsed.city || parsed.address || parsed.latitude)) return parsed;
      }
    } catch (e) {}
    return null;
  });

  // Sync with global location events
  useEffect(() => {
    const handleDestChange = () => {
      try {
        const saved = localStorage.getItem("oil_delivery_destination");
        if (saved) setDestination(JSON.parse(saved));
      } catch (e) {}
    };
    window.addEventListener("deliveryDestinationChanged", handleDestChange);
    return () => window.removeEventListener("deliveryDestinationChanged", handleDestChange);
  }, []);

  useEffect(() => {
    if (reduxDestination) {
      setDestination(reduxDestination);
    }
  }, [reduxDestination]);

  // ── HIGH-PERFORMANCE MEMOIZED CALCULATIONS ──
  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, [cartItems]);

  const hasDestination = useMemo(() => {
    return Boolean(destination && (destination.city || destination.state || destination.address || destination.latitude));
  }, [destination]);

  const isSpecialCoupon = useMemo(() => {
    return Boolean(
      couponDetails?.isApplied && (
        couponDetails.requiresDeliveryCharge || 
        couponDetails.isSpecialCoupon ||
        couponDetails.applicableUsers === 'SELECTED_USERS' ||
        couponDetails.applicableUsers === 'SPECIAL_MEMBER'
      )
    );
  }, [couponDetails]);

  const shippingInfo = useMemo(() => {
    return calculateClientShipping({
      cartItems,
      subtotal,
      destination: hasDestination ? destination : null,
      disableFreeDelivery: isSpecialCoupon
    });
  }, [cartItems, subtotal, hasDestination, destination, isSpecialCoupon]);

  const isFreeDelivery = shippingInfo.isFreeDelivery;
  const deliveryCharge = hasDestination ? shippingInfo.deliveryCost : (isFreeDelivery ? 0 : null);
  const effectiveDeliveryCharge = deliveryCharge !== null ? deliveryCharge : 0;
  const totalBeforeDiscount = subtotal + effectiveDeliveryCharge;

  // Authoritative discount calculation based on total including delivery charges
  const discount = useMemo(() => {
    if (!couponDetails?.isApplied) return 0;
    if (couponDetails.discountType === "PERCENTAGE" || couponDetails.discountType === "percentage") {
      let disc = (totalBeforeDiscount * Number(couponDetails.discountValue || 0)) / 100;
      if (couponDetails.maximumDiscountAmount) {
        disc = Math.min(disc, couponDetails.maximumDiscountAmount);
      }
      return Math.min(disc, totalBeforeDiscount);
    }
    return Math.min(Number(couponDetails.discountValue || couponDetails.discount || 0), totalBeforeDiscount);
  }, [couponDetails, totalBeforeDiscount]);

  const finalTotal = Math.max(0, totalBeforeDiscount - discount);
  const netGoods = Math.max(0, finalTotal - effectiveDeliveryCharge);

  // Prices are inclusive of 5% GST (2.5% CGST + 2.5% SGST) on goods
  const taxableAmount = Math.round((netGoods / 1.05) * 100) / 100;
  const cgst = Math.round(taxableAmount * 0.025 * 100) / 100;
  const sgst = Math.round(taxableAmount * 0.025 * 100) / 100;
  const totalTax = cgst + sgst;

  // Dynamic coupon recalculation when cart items or delivery change
  useEffect(() => {
    if (!couponDetails || !couponDetails.isApplied) return;
    if (cartItems.length === 0) {
      saveCouponDetails(null);
      return;
    }
    if (couponDetails.minimumOrderAmount && subtotal < couponDetails.minimumOrderAmount) {
      toast.error(`Order total is below minimum ₹${couponDetails.minimumOrderAmount} for code ${couponDetails.code}. Coupon removed.`);
      saveCouponDetails(null);
      return;
    }
    if (couponDetails.discountType === "PERCENTAGE" || couponDetails.discountType === "percentage") {
      let newDiscount = (totalBeforeDiscount * Number(couponDetails.discountValue || 0)) / 100;
      if (couponDetails.maximumDiscountAmount) {
        newDiscount = Math.min(newDiscount, couponDetails.maximumDiscountAmount);
      }
      newDiscount = Math.min(newDiscount, totalBeforeDiscount);
      if (Math.abs(newDiscount - (couponDetails.discount || 0)) > 0.01) {
        const updated = { ...couponDetails, discount: newDiscount };
        setCouponDetails(updated);
        localStorage.setItem("oil_applied_coupon", JSON.stringify(updated));
      }
    } else {
      if (couponDetails.discount > totalBeforeDiscount) {
        const updated = { ...couponDetails, discount: totalBeforeDiscount };
        setCouponDetails(updated);
        localStorage.setItem("oil_applied_coupon", JSON.stringify(updated));
      }
    }
  }, [subtotal, totalBeforeDiscount, cartItems.length, couponDetails, saveCouponDetails]);

  // GA4: Track Cart View once per cart composition
  useEffect(() => {
    if (cartItems.length > 0) {
      trackViewCart(cartItems, finalTotal);
    }
  }, [cartItems.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Memoized action handlers
  const handleRemove = useCallback((item) => {
    dispatch(removeFromCart(item._id));
    trackRemoveFromCart(item, { name: item.variantName, price: item.price }, item.quantity);
  }, [dispatch]);

  const handleProceedToCheckout = useCallback(() => {
    trackBeginCheckout(cartItems, finalTotal);
    navigate('/checkout');
  }, [cartItems, finalTotal, navigate]);

  const handleApplyCoupon = useCallback(async (code) => {
    try {
      const { data } = await axios.post(`${serverUrl}/api/coupon/validate`, {
        code,
        amount: subtotal,
        shippingCost: effectiveDeliveryCharge,
        userId: user?._id || undefined
      }, { withCredentials: true });

      if (data.success) {
        const reqDeliv = Boolean(
          data.requiresDeliveryCharge || 
          data.isSpecialCoupon || 
          data.applicableUsers === "SELECTED_USERS" ||
          data.applicableUsers === "SPECIAL_MEMBER"
        );
        const details = {
          code: code.toUpperCase(),
          discount: data.discountAmount,
          discountType: data.discountType,
          discountValue: data.discountValue,
          maximumDiscountAmount: data.maximumDiscountAmount,
          minimumOrderAmount: data.minimumOrderAmount || 0,
          isApplied: true,
          requiresDeliveryCharge: reqDeliv,
          isSpecialCoupon: Boolean(data.isSpecialCoupon || data.applicableUsers === "SPECIAL_MEMBER"),
          applicableUsers: data.applicableUsers
        };
        saveCouponDetails(details);
        if (reqDeliv) {
          toast.success(data.message || `Exclusive promo ${details.code} applied! Saved ₹${data.discountAmount}. (Standard delivery charges apply)`);
        } else {
          toast.success(`Coupon applied! Saved ₹${data.discountAmount}`);
        }
        return true;
      }
      return false;
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid or ineligible coupon code");
      return false;
    }
  }, [subtotal, effectiveDeliveryCharge, user?._id, saveCouponDetails]);

  const handleRemoveCoupon = useCallback(() => {
    saveCouponDetails(null);
    toast.success("Coupon removed");
  }, [saveCouponDetails]);

  return (
    <div className="min-h-screen bg-[#0c1017] text-slate-100 pt-6 pb-32 sm:py-12 px-3.5 sm:px-6 relative overflow-hidden font-sans">
      
      {/* ── HARDWARE-ACCELERATED 60FPS BACKGROUND ── */}
      <SmokyOilSpillBackground />

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* ── HEADER WITH LUXURY GLASS VIBE ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-8 sm:mb-10 pb-5 sm:pb-6 border-b border-white/10">
          <div className="flex items-center gap-3 sm:gap-4">
            <SLink to="/" className="group shrink-0">
              <img
                src="https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png"
                alt="OwnFresh Logo"
                className="h-9 sm:h-11 w-auto object-contain cursor-pointer transition-transform duration-200 group-hover:scale-105 drop-shadow-[0_4px_16px_rgba(253,224,71,0.25)]"
              />
            </SLink>
            <div className="h-7 w-px bg-white/15 hidden sm:block"></div>
            <div>
              <h1 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-1.5 sm:gap-2">
                Your <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-200 bg-clip-text text-transparent">Shopping Cart</span>
              </h1>
              <p className="text-[10px] text-amber-300/80 uppercase tracking-widest font-bold hidden sm:block">
                Premium Stone-Pressed • Direct from Traditional Kolhu
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors font-black uppercase text-[10px] tracking-widest bg-white/10 hover:bg-white/15 py-2.5 px-4 sm:px-5 rounded-full shadow-md border border-white/15 cursor-pointer self-start sm:self-auto active:scale-95 touch-manipulation"
          >
            <ArrowLeft size={13} /> Continue Shopping
          </button>
        </div>

        {cartItems.length === 0 ? (
          /* ── ELEGANT EMPTY CART STATE WITH LIQUID SPILL RIPPLE ── */
          <div className="bg-[#0f141d]/90 rounded-3xl p-10 sm:p-16 text-center shadow-2xl border border-amber-500/20 relative overflow-hidden">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-6 flex items-center justify-center">
              <div 
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-white shadow-xl shadow-amber-500/40"
                style={{
                  background: "radial-gradient(circle at 35% 30%, #FDE047 0%, #F59E0B 45%, #D97706 80%, #92400E 100%)"
                }}
              >
                <Droplets size={32} className="text-white drop-shadow-lg stroke-[2.2]" />
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-widest">Your Cart is Empty</h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mt-2 font-medium leading-relaxed">
              Experience the authentic aroma, rich gold clarity, and untouched nutrients of cold stone-pressed oils.
            </p>
            <SLink
              to="/shop"
              className="mt-7 inline-flex items-center gap-2.5 px-7 py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-transform uppercase text-[11px] tracking-widest cursor-pointer touch-manipulation"
            >
              <Sparkles size={14} /> Explore Fresh Oils Catalog
            </SLink>
          </div>
        ) : (
          <>
            {/* ── FREE DELIVERY PROGRESS BANNER ── */}
            <div
              className={`mb-6 p-3.5 sm:p-4 rounded-2xl border transition-colors duration-200 ${
                shippingInfo.isFreeDelivery
                  ? 'bg-emerald-950/40 border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                  : 'bg-[#0f141d]/90 border-amber-500/30 shadow-lg shadow-amber-500/10'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg">
                    {shippingInfo.isFreeDelivery ? '🎉' : '🚚'}
                  </span>
                  <p className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                    {shippingInfo.isFreeDelivery ? (
                      <span className="bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">
                        Free Delivery Unlocked!
                      </span>
                    ) : (
                      <>
                        Add <span className="text-amber-300 font-mono font-black">₹{shippingInfo.amountNeededForFreeDelivery.toLocaleString('en-IN')}</span> more for <span className="text-emerald-400 font-black">FREE delivery</span>
                      </>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider self-start sm:self-auto">
                  <span>📦 Shipment: <strong className="text-amber-300 font-mono">{shippingInfo.totalWeight} kg</strong></span>
                </div>
              </div>

              {/* Progress track */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-white/5">
                <div
                  style={{ width: `${shippingInfo.progressPercentage}%` }}
                  className={`h-full rounded-full transition-all duration-300 ${
                    shippingInfo.isFreeDelivery
                      ? 'bg-gradient-to-r from-emerald-400 to-green-300 shadow-[0_0_10px_rgba(52,211,153,0.5)]'
                      : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              
              {/* ── CART ITEMS LIST (LUXURY FROSTED OBSIDIAN CARDS - PURE 60FPS) ── */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-3.5 sm:space-y-4">
                {cartItems.map((item) => (
                  <div 
                    key={item._id} 
                    className="bg-[#0f141d]/90 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-4 sm:gap-5 shadow-lg border border-white/10 hover:border-amber-400/35 relative group transition-colors duration-150"
                  >
                    {/* Trash Button */}
                    <button
                      onClick={() => handleRemove(item)}
                      className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-full transition-colors cursor-pointer touch-manipulation"
                      title="Remove item"
                    >
                      <Trash2 size={15} />
                    </button>

                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/5 rounded-xl p-2 shrink-0 flex items-center justify-center border border-white/10">
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        className="w-full h-full object-contain drop-shadow-md transition-transform duration-200 group-hover:scale-105"
                      />
                    </div>

                    <div className="flex-grow w-full text-center sm:text-left pr-8 sm:pr-0">
                      <div className="inline-block px-2.5 py-0.5 mb-1 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30 text-[9px] font-black uppercase tracking-wider">
                        {item.variantName || 'Standard'}
                      </div>
                      <h3 className="font-extrabold text-white text-xs sm:text-base leading-snug mb-1 uppercase tracking-tight">
                        {item.name}
                      </h3>
                      <p className="text-xs text-amber-400 font-extrabold font-mono">
                        ₹{item.price.toLocaleString('en-IN')} / unit
                      </p>

                      {/* Responsive Stepper Row */}
                      <div className="flex items-center justify-between sm:justify-start gap-4 mt-3 pt-2.5 border-t border-white/5 sm:border-t-0 sm:pt-0">
                        <div className="flex items-center gap-2.5 bg-black/50 rounded-xl p-1 border border-white/10 shadow-inner">
                          <button
                            onClick={() => item.quantity > 1 && dispatch(updateQuantity({ id: item._id, quantity: item.quantity - 1 }))}
                            className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center bg-white/10 border border-white/10 rounded-lg hover:bg-amber-400 hover:text-slate-950 transition-colors active:scale-90 text-slate-200 cursor-pointer touch-manipulation"
                            title="Decrease quantity"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="font-black text-white min-w-[22px] text-center text-xs sm:text-sm font-mono select-none">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => dispatch(addToCart({ ...item, quantity: 1 }))}
                            className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center bg-white/10 border border-white/10 rounded-lg hover:bg-amber-400 hover:text-slate-950 transition-colors active:scale-90 text-slate-200 cursor-pointer touch-manipulation"
                            title="Increase quantity"
                          >
                            <Plus size={11} />
                          </button>
                        </div>

                        {/* Mobile line total (shown inline with stepper on small screens) */}
                        <div className="sm:hidden text-right">
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total</span>
                          <span className="font-black text-base text-amber-300 font-mono">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Desktop line total */}
                    <div className="hidden sm:flex w-auto text-right flex-col justify-end shrink-0 pl-2">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Total</p>
                      <p className="font-black text-lg text-amber-300 font-mono">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))}

                {/* ── ADD MORE TO YOUR ORDER UPSELL CAROUSEL ── */}
                <div className="pt-2">
                  <ReviewUpsellCarousel
                    cartItems={cartItems}
                    couponDetails={couponDetails}
                    theme="dark"
                  />
                </div>
              </div>

              {/* ── STICKY SUMMARY SIDEBOX (OPTIMIZED OBSIDIAN GLASS) ── */}
              <div className="lg:col-span-5 xl:col-span-4">
                <div className="bg-[#0f141d]/95 p-5 sm:p-7 rounded-[2rem] shadow-2xl border border-amber-500/20 lg:sticky lg:top-28 text-white overflow-hidden relative">
                  {/* Hardware-friendly ambient glowing gradient */}
                  <div 
                    className="absolute top-0 right-0 w-60 h-60 rounded-full pointer-events-none opacity-40"
                    style={{ background: "radial-gradient(circle, rgba(245, 158, 11, 0.14) 0%, transparent 70%)" }}
                  />
                  
                  <h2 className="text-[11px] font-black text-[#EFDB27] uppercase tracking-[0.2em] mb-5 relative z-10 flex items-center gap-2 pb-3 border-b border-white/10">
                    <Droplets size={14} className="text-amber-400" /> Order Summary
                  </h2>
                  
                  {/* Free delivery prompt banner */}
                  {!shippingInfo.isFreeDelivery && (
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-[11px] text-amber-300 font-bold mb-4 relative z-10 shadow-sm">
                      <div className="flex justify-between items-center mb-1.5">
                        <span>🚚 Free Delivery over Rs. 1,500/- OR 2 Kg</span>
                        <span className="font-mono text-amber-200">Add ₹{shippingInfo.amountNeededForFreeDelivery.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-2">
                        <div
                          className="bg-gradient-to-r from-amber-400 to-yellow-300 h-full rounded-full transition-all duration-300"
                          style={{ width: `${shippingInfo.progressPercentage}%` }}
                        />
                      </div>
                      <div className="pt-2 border-t border-amber-400/20 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-slate-300 font-medium">Under Rs. 1,500 / 2 Kg?</span>
                        <SLink
                          to="/membership"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FFD600] hover:bg-[#FFE45C] text-[#111318] font-black text-[10px] uppercase tracking-wider transition-all shadow-xs cursor-pointer touch-manipulation"
                        >
                          👑 Prime 1% Free Delivery
                        </SLink>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3.5 sm:space-y-4 mb-6 relative z-10 text-xs font-semibold text-slate-300">
                    {/* Destination Detection & Selection Header */}
                    {hasDestination ? (
                      <div className="flex justify-between items-center pb-2.5 border-b border-white/10">
                        <div className="flex flex-col min-w-0 pr-2">
                          <span className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Deliver To:</span>
                          <span className="text-white font-bold text-xs truncate max-w-[190px]" title={destination.address || destination.city}>
                            📍 {destination.city || destination.district || destination.address || "Destination Selected"}
                            {destination.state ? `, ${destination.state}` : ""}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowLocationModal(true)}
                          className="text-amber-400 hover:text-yellow-300 text-[11px] font-bold underline cursor-pointer transition-colors flex-shrink-0 touch-manipulation"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs mb-3">
                        <div className="flex items-start gap-2.5">
                          <MapPin size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-slate-200 font-bold text-xs leading-snug">
                              Select your delivery location to calculate delivery charges.
                            </p>
                            <button
                              type="button"
                              onClick={() => setShowLocationModal(true)}
                              className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 via-[#FFDD00] to-amber-600 text-slate-950 font-black rounded-xl text-[10px] uppercase tracking-wider shadow hover:brightness-110 active:scale-95 transition-all cursor-pointer touch-manipulation"
                            >
                              <MapPin size={12} /> Choose Location
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── HIGH PERFORMANCE ISOLATED COUPON COMPONENT ── */}
                    <CouponSection
                      couponDetails={couponDetails}
                      onApply={handleApplyCoupon}
                      onRemove={handleRemoveCoupon}
                      isSpecialCoupon={isSpecialCoupon}
                      discount={discount}
                    />

                    <div className="flex justify-between items-center pt-1 text-sm">
                      <span className="text-slate-300">Items Subtotal (Incl. GST)</span>
                      <span className="text-white font-mono font-bold">₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <div>
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <span>Delivery</span>
                          {shippingInfo.totalWeightKg > 0 && (
                            <span className="text-[10px] text-slate-400 font-mono font-normal">({shippingInfo.totalWeightKg} kg)</span>
                          )}
                        </div>
                        <span className="text-[10px] text-amber-400 font-semibold block">
                          {hasDestination ? shippingInfo.deliveryMethodName : (isFreeDelivery ? "Free Delivery Unlocked" : "Awaiting location")}
                        </span>
                      </div>
                      {isFreeDelivery ? (
                        <span className="text-emerald-400 font-extrabold tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                          FREE
                        </span>
                      ) : hasDestination ? (
                        <div className="text-right">
                          <span className="text-amber-300 font-extrabold font-mono block">
                            ₹{deliveryCharge.toLocaleString('en-IN')}
                          </span>
                          <SLink
                            to="/membership"
                            className="text-[10px] text-[#FFD600] font-bold hover:underline block mt-0.5 cursor-pointer touch-manipulation"
                          >
                            👑 Prime 1% Free Delivery
                          </SLink>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowLocationModal(true)}
                          className="text-amber-400 hover:underline text-xs font-bold cursor-pointer touch-manipulation"
                        >
                          Select Location
                        </button>
                      )}
                    </div>

                    {/* Total including delivery charges before coupon */}
                    <div className="flex justify-between items-center text-xs py-1.5 px-3 rounded-xl bg-white/[0.04] border border-white/5 my-0.5">
                      <span className="text-slate-300 font-semibold">Total (Items + Delivery)</span>
                      <span className="font-mono text-white font-bold text-sm">₹{totalBeforeDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between items-center text-emerald-400 font-bold text-sm">
                        <span className="flex items-center gap-1.5">
                          <Tag size={12} className="text-emerald-400 shrink-0" />
                          <span>Coupon Discount ({couponDetails?.code})</span>
                        </span>
                        <span className="font-mono text-emerald-300">-₹{discount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-slate-400 text-xs">
                      <span>CGST (2.5% - Incl.)</span>
                      <span className="font-mono">₹{cgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400 text-xs">
                      <span>SGST (2.5% - Incl.)</span>
                      <span className="font-mono">₹{sgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    
                    <div className="h-px bg-white/10 my-3"></div>
                    
                    <div className="flex justify-between items-baseline">
                      <div>
                        <span className="block font-bold text-slate-400 text-[10px] uppercase tracking-wider mb-1">Grand Total</span>
                      </div>
                      <span className="text-2xl sm:text-3xl font-black text-[#EFDB27] tracking-tight font-mono">
                        ₹{finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleProceedToCheckout}
                    className="hidden lg:flex w-full relative z-10 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 py-3.5 sm:py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-center overflow-hidden border-0 cursor-pointer shadow-lg shadow-amber-500/20 active:scale-98 transition-transform touch-manipulation items-center justify-center gap-2"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Proceed to Checkout <ArrowLeft className="rotate-180 w-4 h-4" />
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* ── STICKY MOBILE BOTTOM BAR (CLEAN 60FPS WITH SAFE-AREA-INSET) ── */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c1017]/95 border-t border-white/10 p-3.5 sm:p-4 shadow-[0_-10px_25px_rgba(0,0,0,0.6)] flex items-center justify-between gap-4 pb-[max(0.85rem,env(safe-area-inset-bottom))]">
              <div>
                <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">Total</span>
                <span className="block text-lg sm:text-xl font-black text-[#EFDB27] font-mono leading-tight">
                  ₹{finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <button
                onClick={handleProceedToCheckout}
                className="flex-1 py-3 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform text-center cursor-pointer touch-manipulation"
              >
                Checkout Now <ArrowLeft className="rotate-180 w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── CART LOCATION PICKER MODAL ── */}
      <CartLocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        currentDestination={destination}
        onSelectDestination={(newDest) => setDestination(newDest)}
      />
    </div>
  );
};

export default CartPage;
