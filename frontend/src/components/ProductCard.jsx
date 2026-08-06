import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Star, ShieldCheck, ShoppingCart } from "lucide-react";
import SLink from "./SLink";

const ProductCard = ({ product, user, onAddToCart }) => {
  // Get active variants
  const activeVariants = useMemo(() => {
    return product.variants?.filter((v) => v.status === "Active") || [];
  }, [product.variants]);

  // Set initial selected variant
  const [selectedVariant, setSelectedVariant] = useState(() => {
    return activeVariants.length > 0 ? activeVariants[0] : null;
  }, [activeVariants]);

  const [isAdded, setIsAdded] = useState(false);

  // Compute discount and prices
  const priceDetails = useMemo(() => {
    const regPrice = selectedVariant ? selectedVariant.price : (product.price || 0);
    const salePrice = selectedVariant ? selectedVariant.salePrice : null;
    const isDiscounted = salePrice && salePrice < regPrice;
    const discountPercent = isDiscounted
      ? Math.round(((regPrice - salePrice) / regPrice) * 100)
      : 0;

    return {
      regPrice,
      salePrice,
      isDiscounted,
      discountPercent,
      displayPrice: isDiscounted ? salePrice : regPrice,
    };
  }, [selectedVariant, product.price]);

  // Ratings simulator (using product ID hash to make ratings stable/consistent per product)
  const ratingDetails = useMemo(() => {
    const hash = product._id ? product._id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) : 100;
    const rating = (4.5 + (hash % 6) * 0.1).toFixed(1); // 4.5 to 5.0
    const reviewsCount = 45 + (hash % 150); // 45 to 195 reviews
    return { rating: parseFloat(rating), reviewsCount };
  }, [product._id]);

  const handleCartClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!selectedVariant) return;

    onAddToCart(product, selectedVariant);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <SLink
      to={`/product/${product._id}`}
      className="group relative bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 transition-all duration-300 hover:shadow-2xl hover:border-yellow-400/80 flex flex-col cursor-pointer w-full text-left"
    >
      {/* Discount Tag */}
      {priceDetails.isDiscounted && (
        <span className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 bg-red-600 text-white text-[8px] sm:text-[10px] font-black px-2 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-wider z-10 shadow-sm">
          Save {priceDetails.discountPercent}%
        </span>
      )}

      {/* Pure Organic Badge */}
      <span className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[8px] sm:text-[9px] font-black px-2 sm:px-2.5 py-0.5 rounded-full uppercase tracking-wider z-10 flex items-center gap-0.5 sm:gap-1">
        <ShieldCheck className="w-3 h-3" /> Pure
      </span>

      {/* Product Image Wrapper */}
      <div className="relative h-32 sm:h-44 w-full rounded-xl sm:rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 mb-3 sm:mb-4 flex items-center justify-center p-2 sm:p-4">
        <img
          src={product.image}
          alt={product.name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786009742/products/banner.png";
          }}
          className="h-full w-auto object-contain transition-transform duration-500 group-hover:scale-105 mix-blend-multiply"
        />
        
        {/* Out of Stock Overlay */}
        {activeVariants.length === 0 && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="bg-red-50 text-red-600 border border-red-200 font-black uppercase text-[10px] sm:text-xs tracking-widest px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl">
              Out Of Stock
            </span>
          </div>
        )}
      </div>

      {/* Category */}
      <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 sm:mb-1.5">
        {product.category?.name || "Premium Oil"}
      </span>

      {/* Title */}
      <h3 className="text-xs sm:text-sm text-slate-900 font-extrabold leading-tight mb-1.5 sm:mb-2 uppercase line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem]">
        {product.name}
      </h3>

      {/* Ratings Row */}
      <div className="flex items-center gap-1 sm:gap-1.5 mb-2.5 sm:mb-3">
        <div className="flex items-center text-amber-500">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                i < Math.floor(ratingDetails.rating)
                  ? "fill-amber-500 stroke-amber-500"
                  : "stroke-slate-300"
              }`}
            />
          ))}
        </div>
        <span className="text-[10px] sm:text-xs font-bold text-slate-800">{ratingDetails.rating}</span>
        <span className="text-[8px] sm:text-[10px] text-slate-400 font-semibold">({ratingDetails.reviewsCount})</span>
      </div>

      {/* Variant Pills / Selectors */}
      {activeVariants.length > 1 && (
        <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-3 sm:mb-4" onClick={(e) => e.preventDefault()}>
          {activeVariants.map((variant) => {
            const isSelected = selectedVariant?._id === variant._id;
            return (
              <button
                key={variant._id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedVariant(variant);
                }}
                className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[8px] sm:text-[10px] font-black uppercase tracking-wider border transition-all ${
                  isSelected
                    ? "bg-slate-900 border-slate-900 text-white"
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:border-slate-300"
                }`}
              >
                {variant.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Spacer when no variant selector is present */}
      {activeVariants.length <= 1 && <div className="h-4"></div>}

      {/* Price & Cart CTA Block */}
      <div className="mt-auto pt-3 sm:pt-4 border-t border-slate-100 w-full">
        {/* Low Stock Warning */}
        {selectedVariant && selectedVariant.stockQuantity > 0 && selectedVariant.stockQuantity <= 10 && (
          <p className="text-[8px] sm:text-[10px] font-bold text-orange-600 mb-1.5 sm:mb-2 uppercase tracking-wide animate-pulse">
            Only {selectedVariant.stockQuantity} left - order soon.
          </p>
        )}

        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            {priceDetails.isDiscounted ? (
              <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5">
                <span className="text-red-600 font-black text-xs sm:text-sm">
                  -{priceDetails.discountPercent}%
                </span>
                <span className="text-slate-400 line-through text-[9px] sm:text-xs font-semibold">
                  ₹{priceDetails.regPrice}
                </span>
              </div>
            ) : null}
            <span className="text-lg sm:text-2xl font-black text-slate-900 font-mono">
              ₹{priceDetails.displayPrice}
            </span>
          </div>

          {activeVariants.length > 0 && (
            <button
              onClick={handleCartClick}
              disabled={isAdded || selectedVariant?.stockQuantity <= 0}
              className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 ${
                isAdded
                  ? "bg-green-500 text-white"
                  : selectedVariant?.stockQuantity <= 0
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-slate-900 text-white hover:bg-yellow-400 hover:text-black active:scale-95 shadow-md hover:shadow-lg hover:shadow-yellow-100"
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
