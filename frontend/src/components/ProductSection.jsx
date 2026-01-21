import React, { useEffect, useState } from "react";
import axios from "axios";
import { ShoppingCart, Package, Info, CheckCircle, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// Redux Imports
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/userslice';

const ProductSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Initialize dispatch to fix the "ReferenceError: dispatch is not defined"
  const dispatch = useDispatch();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Ensure this URL is updated to your deployed backend URL before shipping
      const res = await axios.get("http://localhost:8000/api/product/all");
      setProducts(res.data.products || []);
    } catch (error) {
      toast.error("Technical error: Unable to load oil inventory", {
        style: { borderRadius: '10px', background: '#333', color: '#fff' }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleBuyNow = (product) => {
  // Pass the whole product object so the cart knows the ID, price, and image
  dispatch(addToCart(product)); 

  toast.success(`${product.name} added to cart`, {
    icon: '🛒',
    style: { border: '1px solid #facc15', padding: '16px' }
  });
};

  return (
    <div className="min-h-screen bg-[#f3f4f6] px-6 pt-28 pb-12 md:px-12 lg:px-24">
      <Toaster position="top-center" />
      
      {/* Section Header */}
      <div className="flex flex-col items-center mb-16 text-center">
        <div className="flex items-center gap-2 mb-2 bg-yellow-400/10 px-4 py-1 rounded-full border border-yellow-500/20">
          <CheckCircle className="w-4 h-4 text-yellow-600" />
          <span className="text-xs font-bold uppercase tracking-widest text-yellow-700">Premium Grade</span>
        </div>
        <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">
          Our <span className="text-yellow-500">Golden</span> Oil Selection
        </h2>
        <div className="w-20 h-1.5 bg-yellow-400 mt-4 rounded-full"></div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
          <p className="mt-4 text-slate-500 font-medium">Refining product data...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-md mx-auto">
          <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-lg italic">Inventory is currently being updated.</p>
        </div>
      ) : (
        /* Medium Card Sizing Layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((p) => (
            <div
              key={p._id}
              className="group relative bg-white border border-slate-200 rounded-2xl p-4 transition-all duration-300 hover:shadow-2xl hover:border-yellow-400 hover:-translate-y-1 flex flex-col"
            >
              {/* Image Frame: Full view, object-contain ensures no cutting */}
              <div className="relative h-44 w-full bg-slate-50 rounded-xl overflow-hidden p-2">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Info className="w-4 h-4" />
                </div>
              </div>

              {/* Content Section */}
              <div className="mt-4 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-slate-800 line-clamp-1 group-hover:text-yellow-600 transition-colors">
                  {p.name}
                </h3>
                
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-800 font-mono">₹{p.price}</span>
                  <span className="text-xs text-slate-400 font-medium">/ unit</span>
                </div>

                <div className="mt-auto pt-5">
                  <button 
                    onClick={() => handleBuyNow(p.name)}
                    className="group/btn flex items-center justify-center gap-2 w-full bg-slate-800 hover:bg-yellow-500 text-white hover:text-slate-900 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-slate-200"
                  >
                    <ShoppingCart className="w-4 h-4 transition-transform group-hover/btn:-translate-y-0.5" />
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductSection;