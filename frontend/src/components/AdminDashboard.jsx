import React, { useState } from 'react';
import Navbar from './Navbar';
import ProductList from "./admin/ProductList";
import BlogList from './admin/BlogList';
import { useSelector } from 'react-redux';
import { Package, BookOpen } from "lucide-react";

function AdminDashboard() {
  const userData = useSelector((state) => state.user.userData);
  
  // Default to Blogs if they are only a blogger
  const [activeTab, setActiveTab] = useState(
    userData?.role === "blogger" ? "blogs" : "products"
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* DASHBOARD TABS */}
      <div className="max-w-7xl mx-auto pt-24 px-6">
        <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 inline-flex items-center gap-1">
          {userData?.role === "admin" && (
            <button
              onClick={() => setActiveTab("products")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
                activeTab === "products"
                  ? "bg-[#1E971D] text-white shadow-lg shadow-[#1E971D]/20"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <Package className="w-4 h-4" />
              Inventory
            </button>
          )}
          
          <button
            onClick={() => setActiveTab("blogs")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
              activeTab === "blogs"
                ? "bg-[#1E971D] text-white shadow-lg shadow-[#1E971D]/20"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Articles
          </button>
        </div>
      </div>

      <div>
        {activeTab === "products" && userData?.role === "admin" && <ProductList />}
        {activeTab === "blogs" && (userData?.role === "admin" || userData?.role === "blogger") && <BlogList />}
      </div>
    </div>
  );
}

export default AdminDashboard