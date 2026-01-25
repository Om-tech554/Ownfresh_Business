import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, CreditCard, Plus, Minus, Trash2 } from 'lucide-react';
import { addToCart, updateQuantity, removeFromCart } from '../redux/userslice';
import SLink from "../components/SLink";
const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.user.cartItems);
  const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-yellow-600 transition-colors font-bold uppercase text-xs tracking-widest">
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="text-3xl font-black text-gray-900 italic uppercase">Your <span className="text-yellow-500">Cart</span></h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
            <ShoppingBag className="text-gray-200 mx-auto mb-4" size={64} />
            <h2 className="text-xl font-bold text-gray-400">Empty Cart</h2>
            <button onClick={() => navigate("/")} className="mt-6 text-yellow-600 font-bold underline">Start Shopping</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item._id} className="bg-white p-5 rounded-2xl flex items-center gap-6 shadow-sm border border-gray-100 relative group">

                  {/* Trash Button - Positioned top-right of the card */}
                  <button
                    onClick={() => dispatch(removeFromCart(item._id))}
                    className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                    title="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>

                  <div className="w-24 h-24 bg-gray-50 rounded-xl p-2 flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                  </div>

                  <div className="flex-grow">
                    <h3 className="font-bold text-gray-800 text-lg pr-8">{item.name}</h3>
                    <p className="text-yellow-600 font-black mt-1">₹{item.price}</p>

                    <div className="flex items-center gap-4 mt-4 bg-gray-100 w-fit rounded-lg p-1">
                      <button
                        onClick={() => item.quantity > 1 && dispatch(updateQuantity({ id: item._id, quantity: item.quantity - 1 }))}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-md hover:bg-yellow-400 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-bold text-gray-800 min-w-[20px] text-center">{item.quantity}</span>
                      <button
                        onClick={() => dispatch(addToCart({ ...item, quantity: 1 }))}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-md hover:bg-yellow-400 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="text-right flex flex-col justify-end h-24 pb-2">
                    <p className="font-black text-xl text-gray-900">₹{item.price * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Sticky Summary Sidebox */}
            <div className="lg:col-span-1">
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 sticky top-32">
                <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Summary</h2>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-gray-500 font-medium">
                    <span>Subtotal</span>
                    <span>₹{totalPrice}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 font-medium">
                    <span>Shipping</span>
                    <span className="text-green-500 font-bold italic">FREE</span>
                  </div>
                  <div className="h-px bg-gray-100 my-4"></div>
                  <div className="flex justify-between items-end">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="text-3xl font-black text-yellow-500">₹{totalPrice}</span>
                  </div>
                </div>
                <SLink
                  to="/checkout"
                  className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-yellow-500 hover:text-gray-900 transition-all shadow-lg active:scale-95 uppercase tracking-widest block text-center"
                >
                  Checkout
                </SLink>


              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;