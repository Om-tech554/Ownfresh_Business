import React from 'react'
import Navbar from "../components/Navbar";
import BlogSection from "../components/BlogSection";
import ProductSection from "../components/ProductSection";
import HeroSection from './HeroSection';
import { OurStorySnippet, Gallery, FAQSection } from './HomeExtras';
import PartnersSection from './PartnersSection';
import FeaturesHighlights from './FeaturesHighlights';
import ContactSection from './ContactSection';

const UserDashboard = () => {
  return (
    <div className="w-full">
      <Navbar />
      <HeroSection />

      {/* Featured Products with Mobile Swiper & Filters */}
      <ProductSection limit={8} />

      {/* Inserted Homepage Extras replicating myownfresh.com */}
      <OurStorySnippet />
      <Gallery />
      <FAQSection />

      {/* Original Blog Section Integration */}
      <div className="bg-white">
        <BlogSection limit={3} />
      </div>

      {/* New Partners Section */}
      <PartnersSection />

      {/* Feature Highlights Section */}
      <FeaturesHighlights />

      {/* Responsive Promotional Banner */}
      <div className="w-full bg-white py-8 md:py-12 px-6 md:px-12 lg:px-24 flex flex-col justify-center items-center">
        <div className="max-w-7xl w-full mx-auto">
          <img
            src="https://res.cloudinary.com/dkhq2wlwg/image/upload/v1782894879/ownfresh_media/ba8ioytkwzznt3vsk1x2.png"
            alt="OwnFresh Banner"
            className="w-full h-auto object-contain rounded-[12px] md:rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
          />
        </div>
        
        {/* Centered Connection Message */}
        <div className="text-center mt-10 max-w-xl mx-auto px-4">
          <h3 className="text-2xl md:text-3xl font-black text-black mb-3 tracking-tight">
            We’re excited to connect!
          </h3>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
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