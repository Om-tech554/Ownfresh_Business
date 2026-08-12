import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ShoppingCart } from "lucide-react";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/userslice";
import Navbar from "../components/Navbar";
import SLink from "../components/SLink";
import SEO from "../components/SEO";
import ProductReviews from "../components/ProductReviews";

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [recentProducts, setRecentProducts] = useState([]);

  // Variant Selector States
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedQty, setSelectedQty] = useState(1);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  /* Fetch Single Product */
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/product/${id}`)
      .then((res) => {
        const prod = res.data.product;
        setProduct(prod);
        if (prod.variants && prod.variants.length > 0) {
          // Preselect the first active variant
          const activeVariants = prod.variants.filter(v => v.status === 'Active');
          if (activeVariants.length > 0) setSelectedVariant(activeVariants[0]);
        }
      })
      .catch((err) => console.log(err));
  }, [id]);

  /* Fetch Recent Products */
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/product/all`)
      .then((res) => {
        const data = res.data.products || [];
        const filtered = data.filter((p) => p._id !== id).slice(0, 4);
        setRecentProducts(filtered);
      })
      .catch((err) => console.log(err));
  }, [id]);

  /* Final Quantity (for cart) */
  const finalQuantity = Number(selectedQty) || 1;

  /* --- Add To Cart --- */
  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error("Please select a variant size");
      return;
    }
    const cartItem = {
      ...product,
      _id: `${product._id}_${selectedVariant._id}`,
      productId: product._id,
      variantId: selectedVariant._id,
      name: `${product.name} - ${selectedVariant.name}`,
      variantName: selectedVariant.name,
      price: selectedVariant.salePrice || selectedVariant.price,
      quantity: finalQuantity,
    };
    dispatch(addToCart(cartItem));
  };

  /* --- Buy Now --- */
  const handleBuyNow = () => {
    if (!selectedVariant) {
      toast.error("Please select a variant size");
      return;
    }
    const cartItem = {
      ...product,
      _id: `${product._id}_${selectedVariant._id}`,
      productId: product._id,
      variantId: selectedVariant._id,
      name: `${product.name} - ${selectedVariant.name}`,
      variantName: selectedVariant.name,
      price: selectedVariant.salePrice || selectedVariant.price,
      quantity: finalQuantity,
    };
    dispatch(addToCart(cartItem));
    navigate("/checkout");
  };

  if (!product)
    return <div className="p-20 text-center text-xl font-semibold">Loading...</div>;

  const currentPrice = selectedVariant ? (selectedVariant.salePrice || selectedVariant.price) : product.price;

  // Schema Markup for Product
  const schemaMarkup = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.image,
    "description": product.shortDesc,
    "brand": {
      "@type": "Brand",
      "name": "Own Fresh"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://frontend-ownfresh.onrender.com/product/${product._id}`,
      "priceCurrency": "INR",
      "price": currentPrice,
      "availability": (product.variants && product.variants.filter(v => v.status === 'Active').length > 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    }
  };

  return (
    <>
      <SEO
        title={product.name}
        description={product.shortDesc}
        image={product.image}
        url={`/product/${product._id}`}
        type="product"
        schemaMarkup={schemaMarkup}
      />
      <Navbar />

      <div className="min-h-screen py-12 px-6 md:px-20 bg-[#fafafa]">
        <div className="grid md:grid-cols-2 gap-12">

          {/* LEFT — Product Image */}
          <div className="flex justify-center items-center bg-white p-10 rounded-3xl shadow-md">
            <img
              src={product.image}
              alt={product.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1786009742/products/banner.png";
              }}
              className="w-full max-w-lg object-contain rounded-2xl"
            />
          </div>

          {/* RIGHT — Product Details */}
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-bold text-slate-900">{product.name}</h1>
            <div className="flex gap-2 mt-2">
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-100 text-blue-700 uppercase tracking-widest">
                {product.category?.name || product.category || "General"}
              </span>
            </div>

            <div className="mt-4">
              <span className="text-5xl font-extrabold text-yellow-600">
                ₹{selectedVariant ? ((selectedVariant.salePrice || selectedVariant.price) * finalQuantity) : ((product.price || 0) * finalQuantity)}
              </span>

              {selectedVariant ? (
                <p className="text-sm mt-1 text-gray-500">
                  {selectedVariant.name} (x{finalQuantity})
                </p>
              ) : (
                <p className="text-sm mt-1 text-gray-500">
                  Standard Packaging (x{finalQuantity})
                </p>
              )}
            </div>

            <p className="mt-6 text-gray-600 text-lg leading-relaxed">
              {product.shortDesc}
            </p>

            {/* VARIANT SELECTOR */}
            <div className="mt-8">
              <h3 className="font-bold text-lg mb-3">Select Size</h3>
              <div className="flex gap-4 flex-wrap">
                {product.variants?.filter(v => v.status === 'Active').map(variant => (
                  <button
                    key={variant._id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`px-6 py-3 rounded-xl border font-semibold transition ${selectedVariant?._id === variant._id
                      ? "bg-yellow-500 text-white"
                      : "bg-white text-slate-900"
                      }`}
                  >
                    {variant.name}
                  </button>
                ))}
                {(!product.variants || product.variants.filter(v => v.status === 'Active').length === 0) && (
                  <p className="text-red-500 font-bold">Currently Out of Stock / No Variants Available</p>
                )}
              </div>
            </div>

            {/* QUANTITY SELECTOR */}
            <div className="mt-8">
              <h3 className="font-bold text-lg mb-3">Quantity</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))}
                  className="px-4 py-2 bg-slate-100 rounded-lg font-bold hover:bg-slate-200"
                >
                  -
                </button>
                <span className="text-xl font-bold">{selectedQty}</span>
                <button
                  onClick={() => setSelectedQty(selectedQty + 1)}
                  className="px-4 py-2 bg-slate-100 rounded-lg font-bold hover:bg-slate-200"
                >
                  +
                </button>
              </div>
            </div>

            {/* BUTTONS */}
            <div className="mt-10 flex gap-4">
              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                className="bg-slate-900 hover:bg-yellow-500 hover:text-slate-900 text-white px-10 py-4 rounded-2xl text-lg font-bold flex items-center gap-3 transition-all"
              >
                <ShoppingCart size={22} />
                Add to Cart
              </button>

              {/* Buy Now */}
              <button
                onClick={handleBuyNow}
                className="bg-yellow-500 text-slate-900 hover:bg-slate-900 hover:text-white px-10 py-4 rounded-2xl text-lg font-bold transition-all shadow-md"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>

        {/* PRODUCT REVIEWS SECTION */}
        <div className="mt-16">
          <ProductReviews productId={product._id} productName={product.name} />
        </div>

        {/* RECENT PRODUCTS */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold mb-8 text-slate-900">
            Recently Added Oils
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {recentProducts.map((p) => (
              <SLink
                key={p._id}
                to={`/product/${p._id}`}
                className="bg-white border border-white shadow-sm rounded-3xl p-6 hover:shadow-xl hover:-translate-y-2 transition-all cursor-pointer block"
              >
                <div className="h-48 bg-gray-50 rounded-2xl p-6 flex items-center justify-center overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                <h3 className="mt-4 text-lg font-semibold text-slate-800 line-clamp-2">
                  {p.name}
                </h3>

                <p className="text-yellow-600 font-extrabold mt-1 text-xl">
                  ₹{p.price}
                </p>
              </SLink>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetails;