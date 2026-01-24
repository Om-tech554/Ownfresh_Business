import React from 'react'
import Navbar from "../components/Navbar";
import BlogSection from "../components/BlogSection";
import ProductSection from "../components/ProductSection";
import HeroSection from './HeroSection';
const UserDashboard = () => {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <ProductSection limit={6} />
     <BlogSection limit={3} />
    </div>
  )
}

export default UserDashboard