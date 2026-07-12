import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, CreditCard, Plus, Minus, Trash2 } from 'lucide-react';
import { addToCart, updateQuantity, removeFromCart } from '../redux/userslice';
import SLink from "../components/SLink";
import { motion, AnimatePresence } from 'framer-motion';

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.user.cartItems);
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const taxableAmount = subtotal; 
  const cgst = taxableAmount * 0.025;
  const sgst = taxableAmount * 0.025;
  const totalTax = cgst + sgst;
  const finalTotal = taxableAmount + totalTax;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-yellow-100/60 to-transparent pointer-events-none"></div>
      <div className="absolute -top-24 -right-24 w-[500px] h-[500px] bg-yellow-400/20 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute top-1/2 -left-32 w-[400px] h-[400px] bg-orange-300/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute -bottom-32 right-1/4 w-[600px] h-[600px] bg-yellow-200/30 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-10">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-yellow-600 transition-colors font-bold uppercase text-xs tracking-widest bg-white py-2 px-4 rounded-full shadow-sm hover:shadow-md border border-gray-100">
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tight drop-shadow-sm">Your <span className="text-yellow-500">Cart</span></h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
            <ShoppingBag className="text-gray-200 mx-auto mb-4" size={64} />
            <h2 className="text-xl font-bold text-gray-400">Empty Cart</h2>
            <button onClick={() => navigate("/")} className="mt-6 text-yellow-600 font-bold underline">Start Shopping</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative perspective-1000">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, staggerChildren: 0.1 }}
              className="lg:col-span-7 xl:col-span-8 space-y-6"
            >
              <AnimatePresence>
                {cartItems.map((item, idx) => (
                  <motion.div 
                    key={item._id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white p-5 md:p-6 rounded-3xl flex flex-col sm:flex-row items-center gap-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 relative group hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out z-10 hover:z-20 transform-gpu"
                  >

                    {/* Trash Button */}
                    <button
                      onClick={() => dispatch(removeFromCart(item._id))}
                      className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-100 sm:opacity-0 group-hover:opacity-100"
                      title="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>

                    <div className="w-full sm:w-32 h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-3 flex-shrink-0 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain drop-shadow-md" />
                    </div>

                    <div className="flex-grow w-full text-center sm:text-left">
                      <div className="inline-block px-3 py-1 mb-2 rounded-full bg-yellow-50 text-yellow-700 text-[10px] font-black uppercase tracking-wider">
                        {item.variantName || 'Standard'}
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg sm:text-xl pr-0 sm:pr-8 leading-tight mb-1">{item.name}</h3>
                      <p className="text-gray-500 font-medium">₹{item.price} / unit</p>

                      <div className="flex items-center justify-center sm:justify-start gap-4 mt-4 bg-gray-50/80 w-fit mx-auto sm:mx-0 rounded-xl p-1.5 border border-gray-100 shadow-sm">
                        <button
                          onClick={() => item.quantity > 1 && dispatch(updateQuantity({ id: item._id, quantity: item.quantity - 1 }))}
                          className="w-8 h-8 flex items-center justify-center bg-white rounded-lg hover:bg-yellow-400 hover:shadow-md transition-all active:scale-95 text-gray-700 hover:text-black"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="font-black text-gray-900 min-w-[24px] text-center text-lg">{item.quantity}</span>
                        <button
                          onClick={() => dispatch(addToCart({ ...item, quantity: 1 }))}
                          className="w-8 h-8 flex items-center justify-center bg-white rounded-lg hover:bg-yellow-400 hover:shadow-md transition-all active:scale-95 text-gray-700 hover:text-black"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto text-center sm:text-right flex flex-col justify-end pb-2 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100 mt-4 sm:mt-0">
                      <p className="text-sm text-gray-400 font-medium mb-1 hidden sm:block">Item Total</p>
                      <p className="font-black text-2xl text-gray-900 bg-clip-text">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Sticky Summary Sidebox */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-5 xl:col-span-4"
            >
              <div className="bg-gradient-to-b from-gray-900 to-gray-800 p-8 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.2)] border border-gray-700 sticky top-32 text-white overflow-hidden relative group transform-gpu transition-transform duration-500 hover:rotate-y-[-2deg] hover:rotate-x-[2deg]">
                {/* Decorative background blur */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-opacity duration-500 group-hover:opacity-100 opacity-50"></div>
                
                <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.3em] mb-8 relative z-10 flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full inline-block"></span>
                  Order Summary
                </h2>
                
                <div className="space-y-5 mb-8 relative z-10">
                  <div className="flex justify-between text-gray-300 font-medium">
                    <span>Subtotal</span>
                    <span className="text-white">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400 font-medium text-sm">
                    <span>CGST (2.5%)</span>
                    <span>₹{cgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400 font-medium text-sm">
                    <span>SGST (2.5%)</span>
                    <span>₹{sgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300 font-medium">
                    <span>Shipping</span>
                    <span className="text-yellow-400 font-bold italic tracking-wide">FREE</span>
                  </div>
                  
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent my-6"></div>
                  
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="block font-medium text-gray-400 text-sm mb-1">Total Amount</span>
                      <span className="block text-[10px] text-gray-500 leading-none">Incl. of all taxes</span>
                    </div>
                    <span className="text-4xl font-black text-yellow-500 drop-shadow-md tracking-tight">₹{finalTotal.toFixed(2)}</span>
                  </div>
                </div>
                
                <SLink
                  to="/checkout"
                  className="w-full relative z-10 bg-yellow-500 text-gray-900 py-5 rounded-2xl font-black text-lg hover:bg-yellow-400 transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] active:scale-95 active:shadow-inner uppercase tracking-widest block text-center overflow-hidden group/btn"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Checkout Now <ArrowLeft className="rotate-180 w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 h-full w-0 bg-white/20 transition-all duration-300 ease-out group-hover/btn:w-full z-0"></div>
                </SLink>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;