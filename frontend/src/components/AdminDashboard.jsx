import React, { useState } from 'react';
import Navbar from './Navbar';
import BusinessIntelligenceDashboard from './admin/BusinessIntelligenceDashboard';
import ProductList from "./admin/ProductList";
import BlogList from './admin/BlogList';
import AdminOrders from './admin/AdminOrders';
import AdminCustomers from './admin/AdminCustomers';
import { useSelector } from 'react-redux';
import { Package, BookOpen, Ticket, ShoppingCart, Layers, Users, Image as ImageIcon, Settings, BarChart3, Crown, Star, Sparkles, Tag } from "lucide-react";
import CouponManager from './admin/CouponManager';
import CampaignManager from './admin/CampaignManager';
import CategoryManager from './admin/CategoryManager';
import GalleryManager from './admin/GalleryManager';
import InventoryManager from './admin/InventoryManager';
import ReferralManager from './admin/ReferralManager';
import SettingsManager from './admin/SettingsManager';
import PrimeMembershipManager from './admin/PrimeMembershipManager';
import ReviewManager from './admin/ReviewManager';
import SupportTicketManager from './admin/SupportTicketManager';
import TagManager from './admin/TagManager';


function AdminDashboard() {
  const userData = useSelector((state) => state.user.userData);

  // Default to Blogs if they are only a blogger, otherwise default to Business Intelligence Dashboard
  const [activeTab, setActiveTab] = useState(
    userData?.role === "blogger" ? "blogs" : "dashboard"
  );

  return (
    <div className="min-h-screen bg-slate-50 admin-panel">
      <Navbar />

      {/* DASHBOARD TABS */}
      <div className="max-w-7xl mx-auto pt-32 px-6">
        <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 inline-flex items-center gap-1 overflow-x-auto max-w-full">
          {userData?.role === "admin" && (
            <>
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === "dashboard"
                    ? "bg-[#1E971D] text-white shadow-lg shadow-[#1E971D]/20 font-extrabold"
                    : "text-slate-500 hover:bg-slate-50"
                  }`}
              >
                <BarChart3 className="w-4 h-4 text-[#F9DD19]" />
                Dashboard
              </button>

              <button
                onClick={() => setActiveTab("products")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === "products"
                    ? "bg-[#1E971D] text-white shadow-lg shadow-[#1E971D]/20 font-extrabold"
                    : "text-slate-500 hover:bg-slate-50"
                  }`}
              >
                <Package className="w-4 h-4" />
                Products
              </button>

              <button
                onClick={() => setActiveTab("inventory")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === "inventory"
                    ? "bg-[#1E971D] text-white shadow-lg shadow-[#1E971D]/20"
                    : "text-slate-500 hover:bg-slate-50"
                  }`}
              >
                <Layers className="w-4 h-4" />
                Inventory
              </button>

              <button
                onClick={() => setActiveTab("orders")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === "orders"
                    ? "bg-[#1E971D] text-white shadow-lg shadow-[#1E971D]/20"
                    : "text-slate-500 hover:bg-slate-50"
                  }`}
              >
                <ShoppingCart className="w-4 h-4" />
                Orders
              </button>

              <button
                onClick={() => setActiveTab("customers")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === "customers"
                    ? "bg-[#1E971D] text-white shadow-lg shadow-[#1E971D]/20"
                    : "text-slate-500 hover:bg-slate-50"
                  }`}
              >
                <Users className="w-4 h-4" />
                Customers
              </button>

              <button
                onClick={() => setActiveTab("categories")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === "categories"
                    ? "bg-[#1E971D] text-white shadow-lg shadow-[#1E971D]/20"
                    : "text-slate-500 hover:bg-slate-50"
                  }`}
              >
                <Layers className="w-4 h-4" />
                Categories
              </button>

              <button
                onClick={() => setActiveTab("tags")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === "tags"
                    ? "bg-[#1E971D] text-white shadow-lg shadow-[#1E971D]/20"
                    : "text-slate-500 hover:bg-slate-50"
                  }`}
              >
                <Tag className="w-4 h-4" />
                Tags & Badges
              </button>


              <button
                onClick={() => setActiveTab("settings")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === "settings"
                    ? "bg-[#1E971D] text-white shadow-lg shadow-[#1E971D]/20"
                    : "text-slate-500 hover:bg-slate-50"
                  }`}
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </>
          )}

          <button
            onClick={() => setActiveTab("blogs")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === "blogs"
                ? "bg-[#1E971D] text-white shadow-lg shadow-[#1E971D]/20"
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
                  ? "bg-[#1E971D] text-white shadow-lg shadow-[#1E971D]/20"
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
                  ? "bg-[#1E971D] text-white shadow-lg shadow-[#1E971D]/20"
                  : "text-slate-500 hover:bg-slate-50"
                }`}
            >
              <Ticket className="w-4 h-4" />
              Promotions
            </button>
          )}

          {userData?.role === "admin" && (
            <button
              onClick={() => setActiveTab("campaigns")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === "campaigns"
                  ? "bg-[#1E971D] text-white shadow-lg shadow-[#1E971D]/20"
                  : "text-slate-500 hover:bg-slate-50"
                }`}
            >
              <Sparkles className="w-4 h-4 text-[#F9DD19]" />
              Festival Campaigns
            </button>
          )}

          {userData?.role === "admin" && (
            <button
              onClick={() => setActiveTab("prime")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === "prime"
                  ? "bg-[#1E971D] text-white shadow-lg shadow-[#1E971D]/20"
                  : "text-slate-500 hover:bg-slate-50"
                }`}
            >
              <Crown className="w-4 h-4 text-[#F9DD19]" />
              Prime 1%
            </button>
          )}

          {userData?.role === "admin" && (
            <button
              onClick={() => setActiveTab("reviews")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === "reviews"
                  ? "bg-[#1E971D] text-white shadow-lg shadow-[#1E971D]/20"
                  : "text-slate-500 hover:bg-slate-50"
                }`}
            >
              <Star className="w-4 h-4 text-[#F9DD19]" />
              Reviews
            </button>
          )}

          {userData?.role === "admin" && (
            <>
              <button
                onClick={() => setActiveTab("partners")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === "partners"
                    ? "bg-[#1E971D] text-white shadow-lg shadow-[#1E971D]/20"
                    : "text-slate-500 hover:bg-slate-50"
                  }`}
              >
                <Users className="w-4 h-4" />
                Partners
              </button>

              <button
                onClick={() => setActiveTab("tickets")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === "tickets"
                    ? "bg-[#1E971D] text-white shadow-lg shadow-[#1E971D]/20"
                    : "text-slate-500 hover:bg-slate-50"
                  }`}
              >
                <Ticket className="w-4 h-4" />
                Support Tickets
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-6">
        {activeTab === "dashboard" && userData?.role === "admin" && <BusinessIntelligenceDashboard />}
        {activeTab === "products" && userData?.role === "admin" && <ProductList />}
        {activeTab === "inventory" && userData?.role === "admin" && <InventoryManager />}
        {activeTab === "blogs" && (userData?.role === "admin" || userData?.role === "blogger") && <BlogList />}
        {activeTab === "gallery" && (userData?.role === "admin" || userData?.role === "blogger") && <GalleryManager />}
        {activeTab === "coupons" && userData?.role === "admin" && <CouponManager />}
        {activeTab === "campaigns" && userData?.role === "admin" && <CampaignManager />}
        {activeTab === "categories" && userData?.role === "admin" && <CategoryManager />}
        {activeTab === "tags" && userData?.role === "admin" && <TagManager />}
        {activeTab === "orders" && userData?.role === "admin" && <AdminOrders />}

        {activeTab === "customers" && userData?.role === "admin" && <AdminCustomers />}
        {activeTab === "prime" && userData?.role === "admin" && <PrimeMembershipManager />}
        {activeTab === "partners" && userData?.role === "admin" && <ReferralManager />}
        {activeTab === "reviews" && userData?.role === "admin" && <ReviewManager />}
        {activeTab === "settings" && userData?.role === "admin" && <SettingsManager />}
        {activeTab === "tickets" && userData?.role === "admin" && <SupportTicketManager />}
      </div>
    </div>
  );
}

export default AdminDashboard;