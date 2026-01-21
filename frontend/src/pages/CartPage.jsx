import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, updateQuantity } from '../redux/userslice';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

const CartPage = () => {
  const { cart } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleDelete = (id, name) => {
    dispatch(removeFromCart(id));
    toast.error(`${name} removed from cart`);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200 text-center max-w-md">
          <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800">Your cart is empty</h2>
          <p className="text-slate-500 mt-2">Looks like you haven't added any golden oil to your inventory yet.</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-8 w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-3 rounded-xl transition-all"
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-12 px-6 md:px-12 lg:px-24">
      <Toaster position="bottom-center" />
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3">
          <ShoppingBag className="text-yellow-500" /> My <span className="text-yellow-500">Cart</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item._id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
                {/* Image Frame - No Cut */}
                <div className="w-24 h-24 bg-slate-50 rounded-xl border border-slate-100 flex-shrink-0 p-2">
                  <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                </div>

                {/* Info */}
                <div className="flex-grow">
                  <h3 className="text-lg font-bold text-slate-800">{item.name}</h3>
                  <p className="text-yellow-600 font-bold text-sm">₹{item.price}</p>
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                      <button 
                        onClick={() => dispatch(updateQuantity({ id: item._id, amount: -1 }))}
                        className="p-2 hover:bg-slate-200 transition-colors"><Minus className="w-3 h-3" />
                      </button>
                      <span className="px-4 font-bold text-slate-700">{item.quantity}</span>
                      <button 
                        onClick={() => dispatch(updateQuantity({ id: item._id, amount: 1 }))}
                        className="p-2 hover:bg-slate-200 transition-colors"><Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Delete Button */}
                <button 
                  onClick={() => handleDelete(item._id, item.name)}
                  className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-3xl p-8 text-white sticky top-32">
              <h2 className="text-xl font-bold mb-6 border-b border-slate-700 pb-4">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="text-white font-bold">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Shipping</span>
                  <span className="text-green-400 font-bold">FREE</span>
                </div>
                <div className="pt-4 border-t border-slate-700 flex justify-between items-center">
                  <span className="text-lg font-bold">Total Amount</span>
                  <span className="text-2xl font-black text-yellow-400">₹{subtotal}</span>
                </div>
              </div>

              <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-black py-4 rounded-2xl mt-8 transition-all shadow-xl shadow-yellow-900/20 active:scale-95">
                PROCEED TO CHECKOUT
              </button>
              
              <button 
                onClick={() => navigate('/')}
                className="w-full flex items-center justify-center gap-2 text-slate-400 mt-4 text-sm font-bold hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;