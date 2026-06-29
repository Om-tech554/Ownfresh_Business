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

      {/* New Contact Form Section */}
      <ContactSection />

    </div>
  )
}

export default UserDashboard