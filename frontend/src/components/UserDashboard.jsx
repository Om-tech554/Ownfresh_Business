import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom';
import Navbar from "../components/Navbar";
import BlogSection from "../components/BlogSection";
import ProductSection from "../components/ProductSection";
import HeroSection from './HeroSection';
import FestivalBanner from "./FestivalBanner";
import MarketingPopUp from "./MarketingPopUp";
import ShopByPurpose from './ShopByPurpose';
import StonePressProcessTimeline from './StonePressProcessTimeline';
import OilSelectionChart from './OilSelectionChart';
import { OurStorySnippet, Gallery, FAQSection } from './HomeExtras';
import PartnersSection from './PartnersSection';
import FeaturesHighlights from './FeaturesHighlights';
import ContactSection from './ContactSection';
import Testimonials from './Testimonials';
import SEO from './SEO';

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
      <MarketingPopUp />
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

      {/* Responsive Promotional Banner */}
      <div className="w-full bg-white dark:bg-[#0B0F14] py-8 md:py-12 px-6 md:px-12 lg:px-24 flex flex-col justify-center items-center transition-colors duration-200">
        <div className="max-w-7xl w-full mx-auto">
          <img
            src="https://res.cloudinary.com/dkhq2wlwg/image/upload/v1782894879/ownfresh_media/ba8ioytkwzznt3vsk1x2.png"
            alt="OwnFresh Banner"
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
      <ContactSection />

    </div>
  )
}

export default UserDashboard