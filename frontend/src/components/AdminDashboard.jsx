import React, { useState } from 'react';
import Navbar from './Navbar';
import ProductList from "./admin/ProductList";
import BlogList from './admin/BlogList';
import AdminOrders from './admin/AdminOrders'; // [NEW]
import { useSelector } from 'react-redux';
import { Package, BookOpen, Ticket, ShoppingCart } from "lucide-react"; // Added ShoppingCart
import CouponManager from './admin/CouponManager';

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
      <div className="max-w-7xl mx-auto pt-32 px-6">
        <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 inline-flex items-center gap-1 overflow-x-auto max-w-full">
          {userData?.role === "admin" && (
            <>
              <button
                onClick={() => setActiveTab("products")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                  activeTab === "products"
                    ? "bg-[#1E971D] text-white shadow-lg shadow-[#1E971D]/20"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Package className="w-4 h-4" />
                Inventory
              </button>

              <button
                onClick={() => setActiveTab("orders")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                  activeTab === "orders"
                    ? "bg-[#1E971D] text-white shadow-lg shadow-[#1E971D]/20"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                Orders
              </button>
            </>
          )}
          
          <button
            onClick={() => setActiveTab("blogs")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${
              activeTab === "blogs"
                ? "bg-[#1E971D] text-white shadow-lg shadow-[#1E971D]/20"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Articles
          </button>

          {userData?.role === "admin" && (
            <button
              onClick={() => setActiveTab("coupons")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                activeTab === "coupons"
                  ? "bg-[#1E971D] text-white shadow-lg shadow-[#1E971D]/20"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <Ticket className="w-4 h-4" />
              Promotions
            </button>
          )}
        </div>
      </div>

      <div className="mt-6">
        {activeTab === "products" && userData?.role === "admin" && <ProductList />}
        {activeTab === "blogs" && (userData?.role === "admin" || userData?.role === "blogger") && <BlogList />}
        {activeTab === "coupons" && userData?.role === "admin" && <CouponManager />}
        {activeTab === "orders" && userData?.role === "admin" && <AdminOrders />} 
      </div>
    </div>
  );
}

export default AdminDashboard;