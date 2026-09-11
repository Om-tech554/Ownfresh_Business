import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SLink from './SLink';

const slides = [
  {
    id: 1,
    layout: "split",
    bgColor: "bg-gray-50 dark:bg-[#0B0F14]",
    image: "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774199707/ownfresh_media/caqc2ep5nmgdf9cnknlu.png",
    subtitle: "By Ancient Method",
    title: "STONE PRESSED <br/> <span class='text-[#24672E] dark:text-[#FFD600]'>WHOLE NUT</span> OIL",
    description: "We produce the integral part of cooking, the Oils'<br/>These Oils are Natural, Real, and of Premium Grade Pure Oil Botanic Purity obtained from the first pressing<br/>We strive to remain loyal to your Tastes and to your Health<br/>After all, Food is Culture, Creation and Craving.",
    cta1: "Shop Now",
    cta2: "Learn More"
  },
  {
    id: 2,
    layout: "full",
    bgColor: "bg-white dark:bg-[#0B0F14]",
    image: "/hero-slide-2.png",
    subtitle: "Welcome to OwnFresh",
    title: "PREMIUM GRADE PURE OIL <br/> <span class='text-[#24672E] dark:text-[#FFD600] font-black'>BOTANIC</span> OIL",
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
    <div className="w-full flex flex-col pt-0 group relative transition-colors duration-250">

      {/* CAROUSEL CONTAINER */}
      <div className="relative w-full h-auto min-h-[85vh] md:min-h-[650px] lg:min-h-[700px] flex items-center justify-center overflow-hidden mx-auto border-b border-gray-100 dark:border-[#202731] bg-white dark:bg-[#0B0F14]">

        {slides.map((slide, index) => {
          const isActive = index === currentSlide;

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'} ${slide.bgColor || 'bg-white dark:bg-[#0B0F14]'}`}
            >

              {/* === FULL LAYOUT (Classic Mode) === */}
              {slide.layout === "full" && (
                <>
                  <div className="absolute inset-0 z-0">
                    <img
                      src={slide.image}
                      alt="Banner Background"
                      className={`w-full h-full object-cover object-center transition-transform duration-[10000ms] ${isActive ? 'scale-105' : 'scale-100'}`}
                    />
                    {/* Light Mode Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent dark:hidden pointer-events-none" />
                    
                    {/* Dark Mode Overlay: Preserves product photo vibrancy on right, darkens left for text legibility */}
                    <div
                      className="absolute inset-0 hidden dark:block pointer-events-none"
                      style={{
                        background: 'linear-gradient(90deg, rgba(11,15,20,0.96) 0%, rgba(11,15,20,0.85) 38%, rgba(11,15,20,0.38) 68%, rgba(11,15,20,0.08) 100%)'
                      }}
                    />
                  </div>

                  <div className={`relative z-10 max-w-7xl mx-auto px-6 lg:px-16 w-full h-full flex flex-col justify-center items-start gap-4 transition-all duration-1000 delay-300 ${isActive ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}`}>
                    <p className="text-sm font-bold text-gray-700 dark:text-[#B7C1CE] uppercase tracking-[0.3em] mb-2 border-l-4 border-black dark:border-[#FFD600] pl-3 shadow-sm">
                      {slide.subtitle}
                    </p>
                    <h1
                      className="text-3xl sm:text-5xl md:text-7xl font-black text-black dark:text-[#F5F7FA] leading-[1.1] tracking-tighter uppercase max-w-2xl drop-shadow-sm"
                      dangerouslySetInnerHTML={{ __html: slide.title }}
                    />
                    <p
                      className="text-xs sm:text-base md:text-lg font-medium text-gray-800 dark:text-[#B7C1CE] max-w-xl mt-4 mb-4 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: slide.description }}
                    />
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 bg-[#FFDD00] dark:bg-[#FFD600] text-black dark:text-[#111318] text-sm font-bold uppercase tracking-widest hover:bg-[#181818] hover:text-[#FFDD00] dark:hover:bg-[#FFE45C] transition-colors duration-300 shadow-xl border border-transparent">
                        {slide.cta1}
                      </button>
                      <SLink to="/whyownfresh" className="px-8 py-4 bg-transparent dark:bg-[#171D26] border-2 border-black dark:border-[#303B48] text-black dark:text-[#F5F7FA] text-sm font-bold uppercase tracking-widest hover:bg-[#181818] hover:text-white dark:hover:bg-[#222B37] transition-colors duration-300 flex items-center justify-center shadow-sm">
                        {slide.cta2}
                      </SLink>
                    </div>
                  </div>
                </>
              )}

              {/* === SPLIT LAYOUT (Modern E-Commerce Mode for PNGs) === */}
              {slide.layout === "split" && (
                <div className={`relative z-10 max-w-[95%] mx-auto px-6 lg:px-12 w-full h-full flex flex-col-reverse md:flex-row items-center justify-center md:justify-between pt-12 pb-24 md:py-0`}>

                  {/* Left Content */}
                  <div className={`w-full md:w-[35%] pr-4 md:pr-6 lg:pr-8 flex flex-col justify-center items-start gap-3 mt-8 md:mt-0 transition-all duration-1000 delay-300 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                    <p className="text-xs sm:text-sm font-bold text-gray-600 dark:text-[#B7C1CE] uppercase tracking-[0.3em] mb-1 border-l-4 border-black dark:border-[#FFD600] pl-3 shadow-sm">
                      {slide.subtitle}
                    </p>
                    <h1
                      className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-black dark:text-[#F5F7FA] leading-[1.1] tracking-tighter uppercase max-w-2xl drop-shadow-sm"
                      dangerouslySetInnerHTML={{ __html: slide.title }}
                    />
                    <p
                      className="text-xs sm:text-sm md:text-base font-medium text-gray-600 dark:text-[#B7C1CE] max-w-xl mt-3 mb-4 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: slide.description }}
                    />
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                      <button onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })} className="w-full sm:w-auto px-8 py-4 bg-[#FFDD00] dark:bg-[#FFD600] text-black dark:text-[#111318] border border-[#FFDD00] dark:border-transparent text-sm font-bold uppercase tracking-widest hover:bg-[#181818] hover:text-[#FFDD00] dark:hover:bg-[#FFE45C] transition-colors duration-300 shadow-xl">
                        {slide.cta1}
                      </button>
                      <SLink to="/whyownfresh" className="w-full sm:w-auto px-8 py-4 bg-transparent dark:bg-[#171D26] border-2 border-black dark:border-[#303B48] text-black dark:text-[#F5F7FA] text-sm font-bold uppercase tracking-widest hover:bg-[#181818] hover:text-white dark:hover:bg-[#222B37] transition-colors duration-300 flex items-center justify-center shadow-sm">
                        {slide.cta2}
                      </SLink>
                    </div>
                  </div>

                  {/* Right Image */}
                  <div className={`w-full md:w-[65%] h-[300px] sm:h-[350px] md:h-[520px] lg:h-[580px] max-h-[580px] flex items-center justify-center transition-all duration-1000 delay-500 ${isActive ? 'scale-105 opacity-100' : 'scale-95 opacity-0'}`}>
                    <img
                      src={slide.image}
                      alt="Product Showcase"
                      className="w-full h-full max-h-full object-contain object-center drop-shadow-6xl dark:mix-blend-normal"
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
          className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-30 p-2 md:p-3 bg-white/80 dark:bg-[#1D2530]/90 hover:bg-[#FFDD00] dark:hover:bg-[#FFD600] text-black dark:text-[#F5F7FA] hover:dark:text-[#111318] border border-gray-200 dark:border-[#303B48] rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-4 md:-translate-x-8 group-hover:translate-x-0 shadow-lg"
          aria-label="Previous Slide"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-30 p-2 md:p-3 bg-white/80 dark:bg-[#1D2530]/90 hover:bg-[#FFDD00] dark:hover:bg-[#FFD600] text-black dark:text-[#F5F7FA] hover:dark:text-[#111318] border border-gray-200 dark:border-[#303B48] rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 md:translate-x-8 group-hover:translate-x-0 shadow-lg"
          aria-label="Next Slide"
        >
          <ChevronRight size={24} />
        </button>

        {/* Pagination Dots */}
        <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`transition-all duration-300 rounded-full cursor-pointer ${idx === currentSlide ? 'w-8 h-2.5 bg-[#FFDD00] dark:bg-[#FFD600] shadow-md border border-black/10 dark:border-transparent' : 'w-2.5 h-2.5 bg-gray-300 dark:bg-[#27313D] hover:bg-gray-400 dark:hover:bg-[#34404E]'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>

      {/* SECONDARY MESSAGE BAR */}
      <div className="w-full bg-[#FFDD00] dark:bg-[#111720] border-y dark:border-[#202832] py-4 md:py-6 px-4 md:px-12 flex items-center justify-center shadow-inner z-20 transition-colors duration-250">
        <p className="text-center text-[#101318] dark:text-[#FFD600] font-extrabold uppercase tracking-widest text-xs md:text-sm lg:text-base selection:bg-[#181818] selection:text-[#FFDD00]">
          Nourishing India With Stone-Pressed Whole Nut Quality
        </p>
      </div>

    </div>
  );
};

export default HeroSection;