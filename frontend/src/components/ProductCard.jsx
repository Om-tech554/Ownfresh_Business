import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Star, ShoppingCart, Award, Leaf, ShieldCheck, Tag as TagIcon, Sparkles, Crown } from "lucide-react";
import { useSelector } from "react-redux";
import { isUserActivePrime, calculateItemPricing } from "../utils/primeUtils";
import SLink from "./SLink";
import { cleanProductName, getDynamicName } from "../utils/productUtils";
import { trackAddToCart } from "../utils/analytics";

const ProductCard = ({ product, user, onAddToCart }) => {
  const reduxUser = useSelector((state) => state.user?.userData);
  const currentUser = user || reduxUser;
  const isPrime = isUserActivePrime(currentUser);
  // Get active variants
  const activeVariants = useMemo(() => {
    return product.variants?.filter((v) => v.status === "Active" && !v.name?.toLowerCase().includes("gift") && !v.name?.toLowerCase().includes("eco packaging")) || [];
  }, [product.variants]);

  // Set initial selected variant
  const [selectedVariant, setSelectedVariant] = useState(null);

  React.useEffect(() => {
    if (activeVariants.length > 0) {
      const nameLower = (product.name || "").toLowerCase();
      let matched = null;
      if (nameLower.includes("250")) {
        matched = activeVariants.find(v => v.name.toLowerCase().includes("250"));
      } else if (nameLower.includes("500")) {
        matched = activeVariants.find(v => v.name.toLowerCase().includes("500"));
      } else if (nameLower.includes("1 l") || nameLower.includes("1l") || nameLower.includes("1-l") || nameLower.includes("1 liter") || nameLower.includes("1 litre")) {
        matched = activeVariants.find(v => v.name.toLowerCase().includes("1 l") || v.name.toLowerCase().includes("1l") || v.name.toLowerCase().includes("1 liter") || v.name.toLowerCase().includes("1 litre"));
      } else if (nameLower.includes("5 l") || nameLower.includes("5l") || nameLower.includes("5-l") || nameLower.includes("5 liter") || nameLower.includes("5 litre")) {
        matched = activeVariants.find(v => v.name.toLowerCase().includes("5 l") || v.name.toLowerCase().includes("5l") || v.name.toLowerCase().includes("5 liter") || v.name.toLowerCase().includes("5 litre"));
      } else if (nameLower.includes("15 l") || nameLower.includes("15l") || nameLower.includes("15-l") || nameLower.includes("15 liter") || nameLower.includes("15 litre")) {
        matched = activeVariants.find(v => v.name.toLowerCase().includes("15 l") || v.name.toLowerCase().includes("15l") || v.name.toLowerCase().includes("15 liter") || v.name.toLowerCase().includes("15 litre"));
      }
      setSelectedVariant(matched || activeVariants[0]);
    } else {
      setSelectedVariant(null);
    }
  }, [activeVariants, product.name]);

  const [isAdded, setIsAdded] = useState(false);

  // Compute dynamic image based on selected bottle size
  const displayImage = useMemo(() => {
    if (selectedVariant && selectedVariant.image) {
      return selectedVariant.image;
    }
    if (selectedVariant && selectedVariant.images && selectedVariant.images.length > 0) {
      return selectedVariant.images[0];
    }
    return product.image || "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786009742/products/banner.png";
  }, [selectedVariant, product.image]);

  // Compute dynamic name based on selected variant size
  const displayName = useMemo(() => {
    return getDynamicName(product.name, selectedVariant);
  }, [product.name, selectedVariant]);

  // Compute discount and prices
  const priceDetails = useMemo(() => {
    const regPrice = selectedVariant ? (selectedVariant.listingPrice || selectedVariant.price) : (product.price || 0);
    const salePrice = selectedVariant ? (selectedVariant.sellingPrice || selectedVariant.salePrice) : null;
    const isDiscounted = salePrice && salePrice < regPrice;
    const discountPercent = selectedVariant?.discountPercent || (isDiscounted
      ? Math.round(((regPrice - salePrice) / regPrice) * 100)
      : 0);

    return {
      regPrice,
      salePrice,
      isDiscounted,
      discountPercent,
      displayPrice: isDiscounted ? salePrice : regPrice,
    };
  }, [selectedVariant, product.price]);

  // Ratings simulator
  const ratingDetails = useMemo(() => {
    // Genuine product rating from database
    const rating = product.rating || 5;
    return { rating: Number(rating).toFixed(1), hasGenuineReviews: product.reviewCount > 0 };
  }, [product.rating, product.reviewCount]);

  const handleCartClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!selectedVariant) return;

    if (onAddToCart) {
      onAddToCart(product, selectedVariant);
    }
    trackAddToCart(product, selectedVariant, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const renderBadgeIcon = (iconName, size = 10) => {
    switch (iconName) {
      case "Award": return <Award size={size} />;
      case "Leaf": return <Leaf size={size} />;
      case "ShieldCheck": return <ShieldCheck size={size} />;
      case "Sparkles": return <Sparkles size={size} />;
      case "Star": return <Star size={size} />;
      default: return null;
    }
  };

  return (
    <SLink
      to={`/product/${product.slug || product._id}`}
      className="group relative bg-white dark:bg-[#171D26] border border-slate-200/90 dark:border-[#27313D] rounded-xl xs:rounded-2xl sm:rounded-3xl p-2.5 xs:p-3 sm:p-5 transition-all duration-300 hover:shadow-xl hover:dark:bg-[#1C232D] hover:dark:border-[#34404E] hover:border-[#1E971D]/60 flex flex-col justify-between cursor-pointer w-full text-left h-full active:scale-[0.98]"
    >
      {/* BADGES */}
      <div className="absolute top-1.5 left-1.5 xs:top-2 xs:left-2 sm:top-3.5 sm:left-3.5 flex flex-col gap-1 z-10 max-w-[85%]">
        {/* Dynamic Product Badges */}
        {product.tags && product.tags.slice(0, 2).map((tag, idx) => {
          if (!tag) return null;
          const rawName = typeof tag === 'object' ? tag.name : tag;
          const tagName = rawName && typeof rawName === 'string' ? rawName.trim() : "";
          const tagBg = typeof tag === 'object' ? tag.bgColor : "#1E971D";
          const tagColor = typeof tag === 'object' ? tag.textColor : "#ffffff";
          const rawIcon = typeof tag === 'object' ? tag.icon : null;
          const tagIcon = rawIcon === "Flame" ? null : rawIcon;
          const tagImage = typeof tag === 'object' ? tag.imageUrl : null;

          if (!tagName && !tagImage && !tagIcon) return null;

          return (
            <span
              key={idx}
              style={{ backgroundColor: tagBg, color: tagColor }}
              className={`inline-flex items-center justify-center font-black shadow-xs ${tagName
                ? "gap-1 text-[8px] sm:text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider"
                : "w-5 h-5 sm:w-6 sm:h-6 rounded-full p-0 aspect-square shrink-0"
                }`}
            >
              {tagImage ? (
                <img
                  src={tagImage}
                  alt=""
                  className={tagName ? "w-3 h-3 object-contain rounded" : "w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain rounded-full"}
                />
              ) : (
                tagIcon && renderBadgeIcon(tagIcon, tagName ? 10 : 12)
              )}
              {tagName && <span>{tagName}</span>}
            </span>
          );
        })}
      </div>

      {/* Product Image Wrapper */}
      <div className="relative h-28 xs:h-36 sm:h-48 w-full rounded-lg xs:rounded-xl sm:rounded-2xl overflow-hidden bg-slate-50 dark:bg-[#151B23] border border-slate-100 dark:border-[#202832] mb-2 sm:mb-4 flex items-center justify-center p-1.5 xs:p-2 sm:p-4">
        <img
          key={displayImage}
          src={displayImage}
          alt={displayName}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786009742/products/banner.png";
          }}
          className="h-full w-auto object-contain transition-transform duration-500 group-hover:scale-105 mix-blend-multiply dark:mix-blend-normal"
        />

        {/* Out of Stock Overlay */}
        {activeVariants.length === 0 && (
          <div className="absolute inset-0 bg-white/80 dark:bg-[#0B0F14]/80 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="bg-red-50 dark:bg-rose-950/70 text-red-600 dark:text-[#FF5C6C] border border-red-200 dark:border-[#FF5C6C]/40 font-black uppercase text-[10px] sm:text-xs tracking-widest px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl">
              Out Of Stock
            </span>
          </div>
        )}
      </div>

      {/* Category */}
      <span className="text-[8px] xs:text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-[#818C9B] uppercase tracking-widest mb-0.5 sm:mb-1.5 truncate block">
        {product.category?.name || "Traditional Stone Pressed"}
      </span>

      {/* Title */}
      <h3 className="text-[11px] xs:text-xs sm:text-sm text-slate-900 dark:text-[#F5F7FA] font-sans font-semibold leading-tight mb-1 sm:mb-2 uppercase line-clamp-2 min-h-[1.75rem] xs:min-h-[2rem] sm:min-h-[2.5rem]">
        {displayName}
      </h3>

      {/* Ratings Row */}
      <div className="flex items-center gap-1 sm:gap-1.5 mb-2.5 sm:mb-3">
        <div className="flex items-center text-amber-500">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${i < Math.floor(ratingDetails.rating)
                ? "fill-amber-500 stroke-amber-500"
                : "stroke-slate-300 dark:stroke-slate-600"
                }`}
            />
          ))}
        </div>
        <span className="text-[10px] sm:text-xs font-bold text-slate-800 dark:text-[#F5F7FA]">{ratingDetails.rating}</span>
        <span className="text-[8px] sm:text-[10px] text-emerald-700 dark:text-[#FFD600] font-bold">100% PURE</span>
      </div>



      {/* Price & Cart CTA Block */}
      <div className="mt-auto pt-2 xs:pt-2.5 sm:pt-4 border-t border-slate-100 dark:border-[#27313D] w-full">
        {/* Low Stock Warning */}
        {selectedVariant && selectedVariant.stockQuantity > 0 && selectedVariant.stockQuantity <= 10 && (
          <p className="text-[8px] sm:text-[10px] font-bold text-orange-600 dark:text-[#FFD600] mb-1.5 uppercase tracking-wide animate-pulse">
            Only {selectedVariant.stockQuantity} left in stock
          </p>
        )}

        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            {priceDetails.isDiscounted ? (
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-slate-400 dark:text-[#7F8997] line-through text-[10px] sm:text-xs font-semibold" title="Original / Listing Price">
                  ₹{Math.round(priceDetails.regPrice)}
                </span>
                <span className="text-emerald-700 dark:text-[#FFD600] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-[#FFD600]/30 font-black text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                  {priceDetails.discountPercent}% OFF
                </span>
              </div>
            ) : null}
            <span className="text-sm xs:text-base sm:text-2xl font-black text-slate-900 dark:text-[#F5F7FA] font-mono leading-none">
              ₹{Math.round(priceDetails.displayPrice)}
            </span>
          </div>

          {activeVariants.length > 0 && (
            <button
              onClick={handleCartClick}
              disabled={isAdded || selectedVariant?.stockQuantity <= 0}
              className={`p-1.5 xs:p-2 sm:p-3 rounded-lg xs:rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 cursor-pointer shrink-0 ${isAdded
                ? "bg-green-600 dark:bg-[#19C37D] text-white"
                : selectedVariant?.stockQuantity <= 0
                  ? "bg-slate-100 dark:bg-[#1D2530] text-slate-400 dark:text-[#5E6875] cursor-not-allowed"
                  : "bg-slate-900 dark:bg-[#FFD600] text-white dark:text-[#111318] hover:bg-[#1E971D] dark:hover:bg-[#FFE45C] hover:text-white active:scale-95 shadow-sm hover:shadow-md"
                }`}
              title={selectedVariant?.stockQuantity <= 0 ? "Out of Stock" : "Add to Cart"}
            >
              <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>
      </div>
    </SLink>
  );
};

export default ProductCard;
