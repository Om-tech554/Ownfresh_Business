import React from 'react'
import Navbar from './Navbar'
import ProductList from "./admin/ProductList";
import BlogList from './admin/BlogList';


function AdminDashboard() {
  return (
    <div>
    <Navbar/> 
    <ProductList />
    <BlogList />
    
    </div>
  )
}

export default AdminDashboard