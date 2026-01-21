import React from 'react'
import Navbar from "../components/Navbar";
import BlogSection from "../components/BlogSection";
import ProductSection from "../components/ProductSection";
const UserDashboard = () => {
  return (
    <div>
      <Navbar />
      <ProductSection />
      <BlogSection />
    </div>
  )
}

export default UserDashboard