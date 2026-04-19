import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SLink from './SLink';

const slides = [
  {
    id: 1,
    layout: "split",
    bgColor: "bg-gray-50",
    image: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774199707/ownfresh_media/caqc2ep5nmgdf9cnknlu.png",
    subtitle: "Farm to Bottle",
    title: "PREMIUM <br/> <span class='text-[#F9DD19]'>STONE-PRESSED</span> QUALITY",
    description: "Experience the richness of unrefined oils packed with natural nutrients for a healthier lifestyle and pure taste.",
    cta1: "Shop Now",
    cta2: "Learn More"
  },
  {
    id: 2,
    layout: "full",
    bgColor: "bg-gray-100",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=2000&auto=format&fit=crop",
    subtitle: "Welcome to OwnFresh",
    title: "100% PURE <br/> <span class='text-[#F9DD19]'>BOTANIC</span> OIL",
    description: "Natural, Real, and extracted from the earliest pressing. Rooted in tradition, prioritizing your health and taste.",
    cta1: "Explore Range",
    cta2: "Our Story"
  }
];

const HeroSection = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  return (
    <div className="w-full flex flex-col pt-0 group relative">

      {/* CAROUSEL CONTAINER */}
      <div className="relative w-full h-auto min-h-[85vh] md:min-h-[600px] lg:min-h-[75vh] flex items-center justify-center overflow-hidden mx-auto border-b border-gray-100">

        {slides.map((slide, index) => {
          const isActive = index === currentSlide;

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'} ${slide.bgColor || 'bg-white'}`}
            >

              {/* === FULL LAYOUT (Classic Mode) === */}
              {slide.layout === "full" && (
                <>
                  <div className="absolute inset-0 z-0 text-black">
                    <img
                      src={slide.image}
                      alt="Banner Background"
                      className={`w-full h-full object-cover object-center transition-transform duration-[10000ms] ${isActive ? 'scale-105' : 'scale-100'}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-transparent"></div>
                  </div>

                  <div className={`relative z-10 max-w-7xl mx-auto px-6 lg:px-16 w-full h-full flex flex-col justify-center items-start gap-4 transition-all duration-1000 delay-300 ${isActive ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}`}>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-[0.3em] mb-2 border-l-4 border-[#F9DD19] pl-3 shadow-sm">
                      {slide.subtitle}
                    </p>
                    <h1
                      className="text-5xl md:text-7xl font-black text-black leading-[1.1] tracking-tighter uppercase max-w-2xl drop-shadow-sm"
                      dangerouslySetInnerHTML={{ __html: slide.title }}
                    />
                    <p className="text-lg md:text-xl font-medium text-gray-800 max-w-lg mt-4 mb-8">
                      {slide.description}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 bg-[#F9DD19] text-black text-sm font-bold uppercase tracking-widest hover:bg-[#181818] hover:text-[#F9DD19] transition-colors duration-300 shadow-xl border border-transparent hover:border-[#F9DD19]">
                        {slide.cta1}
                      </button>
                      <SLink to="/whyownfresh" className="px-8 py-4 bg-transparent border-2 border-black text-black text-sm font-bold uppercase tracking-widest hover:bg-[#181818] hover:text-white transition-colors duration-300 flex items-center justify-center">
                        {slide.cta2}
                      </SLink>
                    </div>
                  </div>
                </>
              )}

              {/* === SPLIT LAYOUT (Modern E-Commerce Mode for PNGs) === */}
              {slide.layout === "split" && (
                <div className={`relative z-10 max-w-7xl mx-auto px-6 lg:px-16 w-full h-full flex flex-col-reverse md:flex-row items-center justify-center md:justify-between pt-12 pb-24 md:py-0`}>

                  {/* Left Content */}
                  <div className={`w-full md:w-1/2 flex flex-col justify-center items-start gap-4 mt-8 md:mt-0 transition-all duration-1000 delay-300 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-[0.3em] mb-2 border-l-4 border-black pl-3 shadow-sm">
                      {slide.subtitle}
                    </p>
                    <h1
                      className="text-5xl md:text-6xl lg:text-7xl font-black text-black leading-[1.1] tracking-tighter uppercase max-w-2xl drop-shadow-sm"
                      dangerouslySetInnerHTML={{ __html: slide.title }}
                    />
                    <p className="text-lg md:text-xl font-medium text-gray-600 max-w-lg mt-4 mb-8">
                      {slide.description}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                      <button onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })} className="w-full sm:w-auto px-8 py-4 bg-[#F9DD19] text-black border border-[#F9DD19] text-sm font-bold uppercase tracking-widest hover:bg-[#181818] hover:text-[#F9DD19] transition-colors duration-300 shadow-xl">
                        {slide.cta1}
                      </button>
                      <SLink to="/whyownfresh" className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-black text-black text-sm font-bold uppercase tracking-widest hover:bg-[#181818] hover:text-white transition-colors duration-300 flex items-center justify-center">
                        {slide.cta2}
                      </SLink>
                    </div>
                  </div>

                  {/* Right Image */}
                  <div className={`w-full md:w-1/2 h-[450px] sm:h-[550px] md:h-full flex items-center justify-center transition-all duration-1000 delay-500 ${isActive ? 'scale-110 opacity-100' : 'scale-95 opacity-0'}`}>
                    <img
                      src={slide.image}
                      alt="Product Showcase"
                      className="w-full h-full object-contain object-center drop-shadow-2xl"
                    />
                  </div>
                </div>
              )}

            </div>
          );
        })}

        {/* Carousel Prev/Next Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-30 p-2 md:p-3 bg-white/80 hover:bg-[#F9DD19] text-black border border-gray-200 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-4 md:-translate-x-8 group-hover:translate-x-0 shadow-lg"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-30 p-2 md:p-3 bg-white/80 hover:bg-[#F9DD19] text-black border border-gray-200 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 md:translate-x-8 group-hover:translate-x-0 shadow-lg"
        >
          <ChevronRight size={24} />
        </button>

        {/* Pagination Dots */}
        <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`transition-all duration-300 rounded-full cursor-pointer ${idx === currentSlide ? 'w-8 h-2.5 bg-[#F9DD19] shadow-md border border-black/10' : 'w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400'}`}
            />
          ))}
        </div>

      </div>

      {/* SECONDARY MESSAGE BAR */}
      <div className="w-full bg-[#F9DD19] py-4 md:py-6 px-4 md:px-12 flex items-center justify-center shadow-inner z-20">
        <p className="text-center text-black font-extrabold uppercase tracking-widest text-xs md:text-sm lg:text-base selection:bg-[#181818] selection:text-[#F9DD19]">
          Nourishing India With Stone-Pressed Whole Nut Quality
        </p>
      </div>

    </div>
  );
};

export default HeroSection;