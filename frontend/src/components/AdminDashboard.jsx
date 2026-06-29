import React, { useState } from 'react';
import Navbar from './Navbar';
import ProductList from "./admin/ProductList";
import BlogList from './admin/BlogList';
import AdminOrders from './admin/AdminOrders'; // [NEW]
import { useSelector } from 'react-redux';
import { Package, BookOpen, Ticket, ShoppingCart, Layers, Users, Image as ImageIcon } from "lucide-react"; // Added Layers
import CouponManager from './admin/CouponManager';
import CategoryManager from './admin/CategoryManager';
import ReferralManager from './admin/ReferralManager';
import GalleryManager from './admin/GalleryManager';

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
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === "products"
                    ? "bg-[#24672E] text-white shadow-lg shadow-[#24672E]/20"
                    : "text-slate-500 hover:bg-slate-50"
                  }`}
              >
                <Package className="w-4 h-4" />
                Inventory
              </button>

              <button
                onClick={() => setActiveTab("orders")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === "orders"
                    ? "bg-[#24672E] text-white shadow-lg shadow-[#24672E]/20"
                    : "text-slate-500 hover:bg-slate-50"
                  }`}
              >
                <ShoppingCart className="w-4 h-4" />
                Orders
              </button>

              <button
                onClick={() => setActiveTab("categories")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === "categories"
                    ? "bg-[#24672E] text-white shadow-lg shadow-[#24672E]/20"
                    : "text-slate-500 hover:bg-slate-50"
                  }`}
              >
                <Layers className="w-4 h-4" />
                Categories
              </button>
            </>
          )}

          <button
            onClick={() => setActiveTab("blogs")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === "blogs"
                ? "bg-[#24672E] text-white shadow-lg shadow-[#24672E]/20"
                : "text-slate-500 hover:bg-slate-50"
              }`}
          >
            <BookOpen className="w-4 h-4" />
            Articles
          </button>

          {(userData?.role === "admin" || userData?.role === "blogger") && (
            <button
              onClick={() => setActiveTab("gallery")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === "gallery"
                  ? "bg-[#24672E] text-white shadow-lg shadow-[#24672E]/20"
                  : "text-slate-500 hover:bg-slate-50"
                }`}
            >
              <ImageIcon className="w-4 h-4" />
              Gallery
            </button>
          )}

          {userData?.role === "admin" && (
            <button
              onClick={() => setActiveTab("coupons")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === "coupons"
                  ? "bg-[#24672E] text-white shadow-lg shadow-[#24672E]/20"
                  : "text-slate-500 hover:bg-slate-50"
                }`}
            >
              <Ticket className="w-4 h-4" />
              Promotions
            </button>
          )}

          {userData?.role === "admin" && (
            <button
              onClick={() => setActiveTab("partners")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === "partners"
                  ? "bg-[#24672E] text-white shadow-lg shadow-[#24672E]/20"
                  : "text-slate-500 hover:bg-slate-50"
                }`}
            >
              <Users className="w-4 h-4" />
              Partners
            </button>
          )}
        </div>
      </div>

      <div className="mt-6">
        {activeTab === "products" && userData?.role === "admin" && <ProductList />}
        {activeTab === "blogs" && (userData?.role === "admin" || userData?.role === "blogger") && <BlogList />}
        {activeTab === "gallery" && (userData?.role === "admin" || userData?.role === "blogger") && <GalleryManager />}
        {activeTab === "coupons" && userData?.role === "admin" && <CouponManager />}
        {activeTab === "categories" && userData?.role === "admin" && <CategoryManager />}
        {activeTab === "orders" && userData?.role === "admin" && <AdminOrders />}
        {activeTab === "partners" && userData?.role === "admin" && <ReferralManager />}
      </div>
    </div>
  );
}

export default AdminDashboard;