import React from 'react';
import { ShoppingBag, ShieldCheck, Zap, ArrowRight } from 'lucide-react';

const HeroSection = () => {
  return (
    <div className="relative w-full min-h-screen flex items-center overflow-hidden bg-[#fff9f6] pt-20">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] bg-yellow-400/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] bg-yellow-500/10 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 py-12">
        
        {/* Left Content - Brand Story & Manifesto */}
        <div className="flex flex-col space-y-7 animate-in slide-in-from-left duration-700">
          
          {/* Badge */}
          <div className="flex items-center gap-3 bg-white w-fit px-4 py-2 rounded-full shadow-sm border border-yellow-100">
            <ShieldCheck className="text-yellow-600" size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
              100% Botanic Purity • First Pressing
            </span>
          </div>

          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tighter">
              The Integral Part of 
              Cooking, the <span className="text-yellow-500 italic">Oils.</span>
            </h1>
            
            {/* Manifesto Quote */}
            <p className="text-lg md:text-xl font-bold text-slate-700 leading-relaxed italic border-l-4 border-yellow-400 pl-4 py-1">
              "Natural, Real, and of 100% Botanic Purity obtained from the first pressing."
            </p>
          </div>

          {/* Description */}
          <p className="text-base text-slate-500 font-medium max-w-lg leading-relaxed">
            We strive to remain loyal to your <span className="text-slate-900 font-bold">Tastes</span> and to your <span className="text-slate-900 font-bold">Health</span>. 
            Experience the essence of tradition with OwnyFresh.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button 
              onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-yellow-500 hover:text-slate-900 transition-all duration-300 shadow-xl shadow-slate-200 active:scale-95 group"
            >
              Shop Collection
              <ShoppingBag size={18} className="group-hover:-translate-y-1 transition-transform" />
            </button>
            
            <button className="bg-white text-slate-800 border-2 border-slate-100 px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:border-yellow-400 transition-all active:scale-95">
              Our Story
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Premium Slogan Footer */}
          <div className="pt-6 border-t border-slate-100">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
               Culture • Creation • Craving
             </p>
          </div>
        </div>

        {/* Right Content - Visual Showcase */}
        <div className="relative flex justify-center items-center animate-in zoom-in duration-1000">
          <div className="relative w-full aspect-square max-w-[500px]">
            {/* Geometric Accent */}
            <div className="absolute inset-0 bg-yellow-400 rounded-[3rem] rotate-6 scale-95 opacity-20"></div>
            
            {/* Image Frame */}
            <div className="absolute inset-0 bg-gradient-to-tr from-gray-100 to-white rounded-[3rem] border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden">
               <img 
                 src="https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=1000&auto=format&fit=crop" 
                 alt="Premium Cold Pressed Oil" 
                 className="w-full h-full object-cover mix-blend-multiply opacity-90 transition-transform duration-1000 hover:scale-110"
               />
            </div>

            {/* Floating Info Card */}
            <div className="absolute bottom-10 -left-10 bg-white p-5 rounded-3xl shadow-2xl border border-yellow-50 border-l-4 border-l-yellow-500 animate-bounce-slow hidden md:block">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-2 rounded-xl">
                  <Zap className="text-yellow-600" size={20} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-tighter">Healthy Vision</p>
                  <p className="text-sm font-bold text-slate-800">Across India</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;