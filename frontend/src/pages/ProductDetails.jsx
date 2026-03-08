import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ShoppingCart } from "lucide-react";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/userslice";
import Navbar from "../components/Navbar";

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [recentProducts, setRecentProducts] = useState([]);

  // Quantity Selector States
  const [selectedQty, setSelectedQty] = useState("1");
  const [customQty, setCustomQty] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  /* Fetch Single Product */
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/product/${id}`)
      .then((res) => setProduct(res.data.product))
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
  const finalQuantity =
    selectedQty === "custom" ? Number(customQty) || 1 : Number(selectedQty);

  /* --- Add To Cart --- */
  const handleAddToCart = () => {
    dispatch(addToCart({ ...product, quantity: finalQuantity }));
  };

  /* --- Buy Now --- */
  const handleBuyNow = () => {
    dispatch(addToCart({ ...product, quantity: finalQuantity }));
    navigate("/checkout");
  };

  if (!product)
    return <div className="p-20 text-center text-xl font-semibold">Loading...</div>;

  return (
    <>
      <Navbar />

      <div className="min-h-screen py-16 px-6 md:px-20 bg-[#fafafa] mt-15">
        <div className="grid md:grid-cols-2 gap-12">

          {/* LEFT — Product Image */}
          <div className="flex justify-center items-center bg-white p-10 rounded-3xl shadow-md">
            <img
              src={product.image}
              alt={product.name}
              className="w-full max-w-lg object-contain rounded-2xl"
            />
          </div>

          {/* RIGHT — Product Details */}
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-bold text-slate-900">{product.name}</h1>

            <div className="mt-4">
              <span className="text-5xl font-extrabold text-yellow-600">
                ₹{product.price * finalQuantity}
              </span>

              <p className="text-sm mt-1 text-gray-500">
                ({finalQuantity} Litre{finalQuantity > 1 ? "s" : ""})
              </p>
            </div>

            <p className="mt-6 text-gray-600 text-lg leading-relaxed">
              {product.shortDesc}
            </p>

            {/* QUANTITY SELECTOR */}
            <div className="mt-8">
              <h3 className="font-bold text-lg mb-3">Select Quantity</h3>

              <div className="flex gap-4 flex-wrap">

                {/* 1 Litre */}
                <button
                  onClick={() => setSelectedQty("1")}
                  className={`px-6 py-3 rounded-xl border font-semibold transition ${
                    selectedQty === "1"
                      ? "bg-yellow-500 text-white"
                      : "bg-white text-slate-900"
                  }`}
                >
                  1L
                </button>

                {/* 2 Litre */}
                <button
                  onClick={() => setSelectedQty("2")}
                  className={`px-6 py-3 rounded-xl border font-semibold transition ${
                    selectedQty === "2"
                      ? "bg-yellow-500 text-white"
                      : "bg-white text-slate-900"
                  }`}
                >
                  2L
                </button>

                {/* 5 Litre */}
                <button
                  onClick={() => setSelectedQty("5")}
                  className={`px-6 py-3 rounded-xl border font-semibold transition ${
                    selectedQty === "5"
                      ? "bg-yellow-500 text-white"
                      : "bg-white text-slate-900"
                  }`}
                >
                  5L
                </button>

                {/* Custom */}
                <button
                  onClick={() => setSelectedQty("custom")}
                  className={`px-6 py-3 rounded-xl border font-semibold transition ${
                    selectedQty === "custom"
                      ? "bg-yellow-500 text-white"
                      : "bg-white text-slate-900"
                  }`}
                >
                  Custom
                </button>
              </div>

              {/* Custom Input */}
              {selectedQty === "custom" && (
                <input
                  type="number"
                  min="1"
                  placeholder="Enter quantity in litres"
                  value={customQty}
                  onChange={(e) => setCustomQty(e.target.value)}
                  className="mt-4 w-40 p-3 border rounded-xl"
                />
              )}
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

        {/* RECENT PRODUCTS */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold mb-8 text-slate-900">
            Recently Added Oils
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {recentProducts.map((p) => (
              <div
                key={p._id}
                onClick={() => navigate(`/product/${p._id}`)}
                className="bg-white border border-white shadow-sm rounded-3xl p-6 hover:shadow-xl hover:-translate-y-2 transition-all cursor-pointer"
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetails;