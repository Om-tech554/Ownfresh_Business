import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Plus, Minus, Trash2, Droplets, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { addToCart, updateQuantity, removeFromCart } from '../redux/userslice';
import SLink from "../components/SLink";
import { motion, AnimatePresence } from 'framer-motion';
import SmokyOilSpillBackground from '../components/cart/SmokyOilSpillBackground';

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
    <div className="min-h-screen bg-[#0c1017] text-slate-100 py-10 sm:py-14 px-4 sm:px-6 relative overflow-hidden font-sans">
      
      {/* ── SMOOTH 60FPS SMOKY OIL SPILL & RIPPLE BACKGROUND ── */}
      <SmokyOilSpillBackground />

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* ── HEADER WITH LUXURY GLASS VIBE ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <SLink to="/" className="group">
              <img
                src="https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png"
                alt="OwnFresh Logo"
                className="h-10 md:h-12 w-auto object-contain cursor-pointer transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_4px_16px_rgba(253,224,71,0.25)]"
              />
            </SLink>
            <div className="h-8 w-px bg-white/15 hidden sm:block"></div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                Your <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-200 bg-clip-text text-transparent">Shopping Cart</span>
              </h1>
              <p className="text-[10px] text-amber-300/80 uppercase tracking-widest font-bold hidden sm:block">
                100% Stone-Pressed • Direct from Traditional Kolhu
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-all font-black uppercase text-[10px] tracking-widest bg-white/10 hover:bg-white/15 backdrop-blur-md py-2.5 px-5 rounded-full shadow-lg border border-white/15 cursor-pointer self-start sm:self-auto active:scale-95"
          >
            <ArrowLeft size={13} /> Continue Shopping
          </button>
        </div>

        {cartItems.length === 0 ? (
          /* ── ELEGANT EMPTY CART STATE WITH LIQUID SPILL RIPPLE ── */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900/60 backdrop-blur-2xl rounded-3xl p-12 sm:p-16 text-center shadow-2xl border border-amber-500/20 relative overflow-hidden"
          >
            {/* Liquid Spill Ripple Center Effect */}
            <div className="relative w-28 h-28 mx-auto mb-6 flex items-center justify-center">
              {/* Concentric expanding ripples */}
              <div 
                className="absolute inset-0 rounded-full border border-amber-400/50 pointer-events-none"
                style={{ animation: "oilRippleRing 3s cubic-bezier(0.1, 0.8, 0.3, 1) infinite" }}
              />
              <div 
                className="absolute inset-0 rounded-full border border-yellow-300/30 pointer-events-none"
                style={{ animation: "oilRippleRing 3s cubic-bezier(0.1, 0.8, 0.3, 1) infinite 1.5s" }}
              />

              {/* Viscous Liquid Golden Drop Orb */}
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center text-white shadow-2xl shadow-amber-500/40"
                style={{
                  background: "radial-gradient(circle at 35% 30%, #FDE047 0%, #F59E0B 45%, #D97706 80%, #92400E 100%)",
                  animation: "oilSpillFlow1 8s ease-in-out infinite"
                }}
              >
                <Droplets size={36} className="text-white drop-shadow-lg stroke-[2.2]" />
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-widest">Your Cart is Empty</h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mt-2.5 font-medium leading-relaxed">
              Experience the authentic aroma, rich gold clarity, and untouched nutrients of cold stone-pressed oils.
            </p>
            <SLink
              to="/shop"
              className="mt-8 inline-flex items-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black rounded-2xl shadow-xl shadow-amber-500/20 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all uppercase text-[11px] tracking-widest cursor-pointer"
            >
              <Sparkles size={15} /> Explore Fresh Oils Catalog
            </SLink>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* ── CART ITEMS LIST (LUXURY FROSTED OBSIDIAN CARDS) ── */}
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
                      className="bg-slate-900/60 backdrop-blur-xl p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-5 shadow-xl border border-white/10 hover:border-amber-400/40 relative group transition-all duration-300 hover:shadow-amber-500/10"
                    >
                      {/* Trash Button */}
                      <button
                        onClick={() => dispatch(removeFromCart(item._id))}
                        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-full transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 size={15} />
                      </button>

                      <div className="w-24 h-24 bg-white/5 rounded-xl p-2 shrink-0 flex items-center justify-center border border-white/10">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>

                      <div className="flex-grow w-full text-center sm:text-left">
                        <div className="inline-block px-2.5 py-0.5 mb-1.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30 text-[9px] font-black uppercase tracking-wider">
                          {item.variantName || 'Standard'}
                        </div>
                        <h3 className="font-extrabold text-white text-sm sm:text-base leading-tight mb-1 uppercase tracking-tight">
                          {item.name}
                        </h3>
                        <p className="text-xs text-amber-400 font-extrabold font-mono">
                          ₹{item.price.toLocaleString('en-IN')} / unit
                        </p>

                        <div className="flex items-center justify-center sm:justify-start gap-3 mt-3.5 bg-black/40 w-fit mx-auto sm:mx-0 rounded-xl p-1.5 border border-white/10 shadow-inner">
                          <button
                            onClick={() => item.quantity > 1 && dispatch(updateQuantity({ id: item._id, quantity: item.quantity - 1 }))}
                            className="w-7 h-7 flex items-center justify-center bg-white/10 border border-white/10 rounded-lg hover:bg-amber-400 hover:text-slate-950 transition-all active:scale-95 text-slate-300 cursor-pointer"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="font-black text-white min-w-[20px] text-center text-sm font-mono">{item.quantity}</span>
                          <button
                            onClick={() => dispatch(addToCart({ ...item, quantity: 1 }))}
                            className="w-7 h-7 flex items-center justify-center bg-white/10 border border-white/10 rounded-lg hover:bg-amber-400 hover:text-slate-950 transition-all active:scale-95 text-slate-300 cursor-pointer"
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                      </div>

                      <div className="w-full sm:w-auto text-center sm:text-right flex flex-col justify-end pt-4 sm:pt-0 border-t sm:border-t-0 border-white/5 mt-4 sm:mt-0">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5 hidden sm:block">Total</p>
                        <p className="font-black text-lg text-amber-300 font-mono">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* ── STICKY SUMMARY SIDEBOX (SMOKY GLASS) ── */}
              <motion.div 
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="lg:col-span-5 xl:col-span-4"
              >
                <div className="bg-slate-900/80 backdrop-blur-2xl p-7 rounded-[2rem] shadow-2xl border border-amber-500/20 sticky top-32 text-white overflow-hidden relative group">
                  {/* Glowing amber aura behind summary */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                  
                  <h2 className="text-[11px] font-black text-[#EFDB27] uppercase tracking-[0.2em] mb-6 relative z-10 flex items-center gap-2 pb-3 border-b border-white/10">
                    <Droplets size={14} className="text-amber-400" /> Order Summary
                  </h2>
                  
                  <div className="space-y-4 mb-8 relative z-10 text-xs font-semibold text-slate-300">
                    <div className="flex justify-between items-center">
                      <span>Subtotal</span>
                      <span className="text-white font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>CGST (2.5%)</span>
                      <span className="font-mono">₹{cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>SGST (2.5%)</span>
                      <span className="font-mono">₹{sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Delivery</span>
                      <span className="text-emerald-400 font-extrabold tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                        FREE
                      </span>
                    </div>
                    
                    <div className="h-px bg-white/10 my-4"></div>
                    
                    <div className="flex justify-between items-baseline">
                      <div>
                        <span className="block font-bold text-slate-400 text-[10px] uppercase tracking-wider mb-1">Grand Total</span>
                      </div>
                      <span className="text-3xl font-black text-[#EFDB27] tracking-tight font-mono">
                        ₹{finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  
                  <SLink
                    to="/checkout"
                    className="w-full relative z-10 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 py-4 rounded-2xl font-black text-xs hover:shadow-2xl hover:shadow-amber-500/30 active:scale-98 transition-all duration-300 uppercase tracking-widest block text-center overflow-hidden border-0 cursor-pointer shadow-lg shadow-amber-500/20"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Proceed to Checkout <ArrowLeft className="rotate-180 w-4 h-4" />
                    </span>
                  </SLink>
                </div>
              </motion.div>
            </div>

            {/* ── STICKY MOBILE BOTTOM BAR (SMOKY GLASS) ── */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0c1017]/90 backdrop-blur-xl border-t border-white/10 p-4 shadow-[0_-10px_25px_rgba(0,0,0,0.5)] flex items-center justify-between gap-4">
              <div>
                <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">Total</span>
                <span className="block text-xl font-black text-[#EFDB27] font-mono">₹{finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <SLink
                to="/checkout"
                className="flex-1 py-3.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all text-center"
              >
                Checkout Now <ArrowLeft className="rotate-180 w-4 h-4" />
              </SLink>
            </div>
          </>
        )}
      </div>

      {/* ── SMOOTH LIQUID OIL SPILL BACKGROUND IS PRESERVED ── */}
    </div>
  );
};

export default CartPage;