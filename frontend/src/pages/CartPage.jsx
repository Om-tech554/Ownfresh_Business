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
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-yellow-100/60 to-transparent pointer-events-none"></div>
      <div className="absolute -top-24 -right-24 w-[500px] h-[500px] bg-yellow-400/20 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute top-1/2 -left-32 w-[400px] h-[400px] bg-orange-300/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute -bottom-32 right-1/4 w-[600px] h-[600px] bg-yellow-200/30 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* HEADER WITH LOGO */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 pb-6 border-b border-slate-200/50">
          <div className="flex items-center gap-4">
            <SLink to="/">
              <img
                src="https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png"
                alt="OwnFresh Logo"
                className="h-10 md:h-12 w-auto object-contain cursor-pointer transition-transform duration-300 hover:scale-105"
              />
            </SLink>
            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">Your <span className="text-[#24672E]">Shopping Cart</span></h1>
          </div>

          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-[#24672E] transition-colors font-black uppercase text-[10px] tracking-widest bg-white py-2.5 px-5 rounded-full shadow-xs hover:shadow-sm border border-slate-100 cursor-pointer self-start sm:self-auto">
            <ArrowLeft size={13} /> Continue Shopping
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-xs border border-slate-100/80">
            <ShoppingBag className="text-slate-200 mx-auto mb-4" size={64} />
            <h2 className="text-lg font-black text-slate-400 uppercase tracking-widest">Your Cart is Empty</h2>
            <SLink to="/shop" className="mt-6 inline-block px-8 py-3.5 bg-[#24672E] text-white font-extrabold rounded-xl shadow-md hover:bg-black transition-colors uppercase text-[10px] tracking-wider">
              Start Shopping
            </SLink>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* CART ITEMS LIST */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="lg:col-span-7 xl:col-span-8 space-y-4"
              >
                <AnimatePresence>
                  {cartItems.map((item, idx) => (
                    <motion.div 
                      key={item._id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-5 shadow-xs border border-slate-100 relative group hover:shadow-md transition-all duration-300"
                    >
                      {/* Trash Button */}
                      <button
                        onClick={() => dispatch(removeFromCart(item._id))}
                        className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 size={15} />
                      </button>

                      <div className="w-24 h-24 bg-slate-50/50 rounded-xl p-2 shrink-0 flex items-center justify-center border border-slate-100">
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                      </div>

                      <div className="flex-grow w-full text-center sm:text-left">
                        <div className="inline-block px-2.5 py-0.5 mb-1.5 rounded-full bg-emerald-50 text-[#24672E] border border-emerald-100 text-[9px] font-black uppercase tracking-wider">
                          {item.variantName || 'Standard'}
                        </div>
                        <h3 className="font-black text-slate-800 text-sm sm:text-base leading-tight mb-1 uppercase tracking-tight">{item.name}</h3>
                        <p className="text-xs text-slate-400 font-extrabold">₹{item.price.toLocaleString('en-IN')} / unit</p>

                        <div className="flex items-center justify-center sm:justify-start gap-3 mt-3.5 bg-slate-50/50 w-fit mx-auto sm:mx-0 rounded-xl p-1.5 border border-slate-100 shadow-xs">
                          <button
                            onClick={() => item.quantity > 1 && dispatch(updateQuantity({ id: item._id, quantity: item.quantity - 1 }))}
                            className="w-7 h-7 flex items-center justify-center bg-white border border-slate-150 rounded-lg hover:bg-[#24672E] hover:text-white hover:border-[#24672E] transition-all active:scale-95 text-slate-500 cursor-pointer"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="font-black text-slate-800 min-w-[20px] text-center text-sm">{item.quantity}</span>
                          <button
                            onClick={() => dispatch(addToCart({ ...item, quantity: 1 }))}
                            className="w-7 h-7 flex items-center justify-center bg-white border border-slate-150 rounded-lg hover:bg-[#24672E] hover:text-white hover:border-[#24672E] transition-all active:scale-95 text-slate-500 cursor-pointer"
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                      </div>

                      <div className="w-full sm:w-auto text-center sm:text-right flex flex-col justify-end pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-50 mt-4 sm:mt-0">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5 hidden sm:block">Total</p>
                        <p className="font-black text-lg text-slate-800">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* STICKY SUMMARY SIDEBOX */}
              <motion.div 
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="lg:col-span-5 xl:col-span-4"
              >
                <div className="bg-slate-900 p-7 rounded-[2rem] shadow-xl border border-slate-800 sticky top-32 text-white overflow-hidden relative group">
                  {/* Decorative background blur */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-opacity duration-500 opacity-50"></div>
                  
                  <h2 className="text-[10px] font-black text-[#EFDB27] uppercase tracking-[0.2em] mb-6 relative z-10 flex items-center gap-2 pb-3 border-b border-white/10">
                    Order Summary
                  </h2>
                  
                  <div className="space-y-4 mb-8 relative z-10 text-xs font-semibold text-gray-300">
                    <div className="flex justify-between items-center">
                      <span>Subtotal</span>
                      <span className="text-white">₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-400">
                      <span>CGST (2.5%)</span>
                      <span>₹{cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-400">
                      <span>SGST (2.5%)</span>
                      <span>₹{sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Delivery</span>
                      <span className="text-emerald-400 font-extrabold tracking-wider">FREE</span>
                    </div>
                    
                    <div className="h-px bg-white/10 my-4"></div>
                    
                    <div className="flex justify-between items-baseline">
                      <div>
                        <span className="block font-bold text-gray-400 text-[10px] uppercase tracking-wider mb-1">Grand Total</span>
                      </div>
                      <span className="text-3xl font-black text-[#EFDB27] tracking-tight">₹{finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                  
                  <SLink
                    to="/checkout"
                    className="w-full relative z-10 bg-[#EFDB27] hover:bg-white text-gray-900 py-4 rounded-2xl font-black text-sm hover:shadow-xl hover:shadow-emerald-500/10 active:scale-98 transition-all duration-300 uppercase tracking-widest block text-center overflow-hidden border-0 cursor-pointer"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Checkout Now <ArrowLeft className="rotate-180 w-4 h-4" />
                    </span>
                  </SLink>
                </div>
              </motion.div>
            </div>

            {/* STICKY MOBILE BOTTOM BAR */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-100 p-4 shadow-[0_-10px_25px_rgba(0,0,0,0.05)] flex items-center justify-between gap-4">
              <div>
                <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">Total</span>
                <span className="block text-xl font-black text-slate-800">₹{finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <SLink
                to="/checkout"
                className="flex-1 py-3.5 bg-[#EFDB27] text-gray-900 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all text-center"
              >
                Checkout Now <ArrowLeft className="rotate-180 w-4 h-4" />
              </SLink>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartPage;