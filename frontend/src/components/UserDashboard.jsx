import React, { useEffect, Suspense, lazy } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from "../components/Navbar";
import HeroSection from './HeroSection';
import FestivalBanner from "./FestivalBanner";
import ShopByPurpose from './ShopByPurpose';
import ProductSection from "./ProductSection";
import { OurStorySnippet, Gallery, FAQSection } from './HomeExtras';
import SEO from './SEO';
import { optimizeCloudinaryUrl } from '../utils/imageOptimizer';

// Lazy-loaded below-the-fold components to reduce initial main thread execution
const StonePressProcessTimeline = lazy(() => import('./StonePressProcessTimeline'));
const OilSelectionChart = lazy(() => import('./OilSelectionChart'));
const PartnersSection = lazy(() => import('./PartnersSection'));
const FeaturesHighlights = lazy(() => import('./FeaturesHighlights'));
const ContactSection = lazy(() => import('./ContactSection'));
const Testimonials = lazy(() => import('./Testimonials'));
const MarketingPopUp = lazy(() => import("./MarketingPopUp"));
const BlogSection = lazy(() => import("../components/BlogSection"));

const UserDashboard = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash === "#purpose-section") {
      const timer = setTimeout(() => {
        const el = document.getElementById("purpose-section");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [location.hash, location.pathname]);

  return (
    <div className="w-full">
      <Suspense fallback={null}>
        <MarketingPopUp />
      </Suspense>

      <SEO
        title="OwnFresh | Premium Quality Stone Pressed Cooking Oils (Wood & Granite Churned)"
        description="Buy authentic stone pressed cooking oils online in India. Premium quality unrefined Groundnut, Sesame, Mustard, Coconut, Safflower & Sunflower oils. Churned slowly below 45°C in granite stone mills without chemicals. Free delivery ₹1,000+."
        keywords="stone pressed oil, stone pressed groundnut oil, kacchi ghani mustard oil, stone pressed sesame oil, stone pressed coconut oil, stone pressed safflower oil, unrefined cooking oil india, traditional stone churned oil, best cooking oil india, healthy edible oil, buy stone pressed oil online, OwnFresh"
        url="/"
        schemaMarkup={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "OwnFresh",
          "url": "https://myownfresh.com/",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://myownfresh.com/shop?search={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }}
      />
      <Navbar />
      <HeroSection />
      <FestivalBanner />

      {/* 1. Shop By Purpose Intent Cards */}
      <ShopByPurpose />

      {/* 2. Featured Products with Mobile Swiper & Filters */}
      <ProductSection limit={8} />

      {/* 3. Our Story Snippet */}
      <OurStorySnippet />

      {/* Lazy Below-The-Fold Sections */}
      <Suspense fallback={<div className="w-full py-8" />}>
        {/* 4. Traditional Stone-Pressing Farm-to-Bottle Process Timeline */}
        <StonePressProcessTimeline />

        {/* 5. Testimonials & Customer Moments */}
        <Testimonials />

        {/* 6. Photo & Video Gallery */}
        <Gallery />

        {/* 7. Oil Smoke Point & Selection Guide */}
        <OilSelectionChart />

        {/* 8. Frequently Asked Questions */}
        <FAQSection />

        {/* Original Blog Section Integration */}
        <div className="bg-white dark:bg-[#0B0F14] transition-colors duration-200">
          <BlogSection limit={3} />
        </div>

        {/* New Partners Section */}
        <PartnersSection />

        {/* Feature Highlights Section */}
        <FeaturesHighlights />
      </Suspense>

      {/* Responsive Promotional Banner */}
      <div className="w-full bg-white dark:bg-[#0B0F14] py-8 md:py-12 px-6 md:px-12 lg:px-24 flex flex-col justify-center items-center transition-colors duration-200">
        <div className="max-w-7xl w-full mx-auto">
          <img
            src={optimizeCloudinaryUrl("https://res.cloudinary.com/dkhq2wlwg/image/upload/v1782894879/ownfresh_media/ba8ioytkwzznt3vsk1x2.png", 1200)}
            alt="OwnFresh Banner"
            width="1200"
            height="400"
            loading="lazy"
            decoding="async"
            className="w-full h-auto object-contain rounded-[12px] md:rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
          />
        </div>

        {/* Centered Connection Message */}
        <div className="text-center mt-10 max-w-xl mx-auto px-4">
          <h3 className="text-2xl md:text-3xl font-black text-black dark:text-[#F7F9FC] mb-3 tracking-tight">
            We’re excited to connect!
          </h3>
          <p className="text-gray-600 dark:text-[#B7C1CE] text-sm md:text-base leading-relaxed">
            Fill out the form below to join our trusted Distributor Team
          </p>
        </div>
      </div>

      {/* New Contact Form Section */}
      <Suspense fallback={<div className="w-full py-8" />}>
        <ContactSection />
      </Suspense>
    </div>
  );
};

export default UserDashboard;