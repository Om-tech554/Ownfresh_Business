import React, { Suspense, lazy } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import SignUp from './pages/SignUp';
import Signin from './pages/Signin';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import useGetCurrentUser from './hooks/useGetCurrentUser';
import { Toaster } from "react-hot-toast";
import useGetCity from './hooks/useGetCity';
import AdminRoute from "./components/AdminRoute";
import Footer from './components/Footer';
import FloatingContact from './components/FloatingContact';
import MobileBottomNav from './components/MobileBottomNav';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Resilient lazy loader with auto-retry for dynamic imports
const lazyRetry = (componentImport) =>
  lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      console.warn("Dynamic import failed, retrying once...", error);
      // If module failed to load due to stale cache/HMR, retry loading
      return await componentImport();
    }
  });

// Lazy-loaded routes for code splitting
const BlogList = lazyRetry(() => import('./components/admin/BlogList'));
const AdminDashboard = lazyRetry(() => import('./components/AdminDashboard'));
const UserBlogDetails = lazyRetry(() => import("./pages/UserBlogDetails"));
const CartPage = lazyRetry(() => import('./pages/CartPage'));
const AdminBlogDetails = lazyRetry(() => import('./pages/BlogDetails'));
const Shop = lazyRetry(() => import('./components/Shop'));
const OilInsights = lazyRetry(() => import('./pages/OilInsights'));
const CheckOut = lazyRetry(() => import('./pages/CheckOut'));
const OrderSuccess = lazyRetry(() => import('./pages/OrderSuccess'));
const WhyOwnFresh = lazyRetry(() => import('./pages/WhyOwnFresh'));
const ProductDetails = lazyRetry(() => import("./pages/ProductDetails"));
const Contact = lazyRetry(() => import("./pages/Contact"));
const GalleryPage = lazyRetry(() => import("./pages/GalleryPage"));
const AdminBlogEditor = lazyRetry(() => import("./pages/admin/AdminBlogEditor"));
const AdminProductEditor = lazyRetry(() => import("./pages/admin/AdminProductEditor"));
const MyOrders = lazyRetry(() => import("./pages/MyOrders"));
const OrderDetails = lazyRetry(() => import("./pages/OrderDetails"));
const ReferralDashboard = lazyRetry(() => import("./pages/ReferralDashboard"));
const PrivacyPolicy = lazyRetry(() => import('./pages/PrivacyPolicy'));
const TermsAndConditions = lazyRetry(() => import('./pages/TermsAndConditions'));
const RefundPolicy = lazyRetry(() => import('./pages/RefundPolicy'));
const ShippingPolicy = lazyRetry(() => import('./pages/ShippingPolicy'));
const MembershipPage = lazyRetry(() => import('./pages/MembershipPage'));
const CategoryLandingPage = lazyRetry(() => import('./pages/CategoryLandingPage'));

import { initGA, trackPageView } from './utils/analytics';

export const serverUrl = (import.meta.env.VITE_API_URL || "http://localhost:10000").replace(/\/+$/, "");

const LoadingFallback = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50">
    <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4" />
    <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Loading OwnFresh...</span>
  </div>
);

const App = () => {
  React.useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
    initGA();
  }, []);

  useGetCurrentUser();
  useGetCity();

  const location = useLocation();
  const userData = useSelector((state) => state.user.userData);

  // Track SPA page view on route transitions
  React.useEffect(() => {
    trackPageView(location.pathname + location.search);
    window.scrollTo(0, 0);
  }, [location]);

  const hideFooterRoutes = [
    "/signin",
    "/signup",
    "/forgot-password",
    "/cart",
    "/checkout",
    "/order-success"
  ];

  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 3500,
          style: {
            background: '#181818',
            color: '#ffffff',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: '600',
            padding: '12px 18px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(255, 221, 0, 0.3)',
            zIndex: 99999,
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#FFDD00',
              secondary: '#000000',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/Oilinsights" element={<OilInsights />} />
          <Route path="/oilinsights" element={<OilInsights />} />
          <Route path="/checkout" element={<CheckOut />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/blogs"
            element={
              <AdminRoute>
                <BlogList />
              </AdminRoute>
            }
          />
          <Route
            path="/blogs/:id"
            element={
              <AdminRoute>
                <AdminBlogDetails />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/blog/editor/:id"
            element={
              <AdminRoute>
                <AdminBlogEditor />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/product/editor/:id"
            element={
              <AdminRoute>
                <AdminProductEditor />
              </AdminRoute>
            }
          />
          <Route path="/shop" element={<Shop />} />
          
          {/* SEO Category Landing Routes */}
          <Route path="/oils" element={<CategoryLandingPage />} />
          <Route path="/category/:slug" element={<CategoryLandingPage />} />
          <Route path="/groundnut-oil" element={<CategoryLandingPage defaultCategory="Groundnut Oil" />} />
          <Route path="/sesame-oil" element={<CategoryLandingPage defaultCategory="Sesame Oil" />} />
          <Route path="/mustard-oil" element={<CategoryLandingPage defaultCategory="Mustard Oil" />} />
          <Route path="/coconut-oil" element={<CategoryLandingPage defaultCategory="Coconut Oil" />} />
          <Route path="/sunflower-oil" element={<CategoryLandingPage defaultCategory="Sunflower Oil" />} />
          <Route path="/almond-oil" element={<CategoryLandingPage defaultCategory="Almond Oil" />} />

          <Route path="/blog/:id" element={<UserBlogDetails />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/whyownfresh" element={<WhyOwnFresh />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/order-details/:id" element={<OrderDetails />} />
          <Route path="/referral" element={<ReferralDashboard />} />
          <Route path="/membership" element={<MembershipPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/shipping-policy" element={<ShippingPolicy />} />
          {/* Catch-all route to prevent blank screens on unmatched paths */}
          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>

      {/* ✅ Footer will show on all pages except auth pages and admin panels */}
      {!hideFooterRoutes.includes(location.pathname) &&
        !location.pathname.startsWith("/admin") &&
        !location.pathname.startsWith("/blogs") &&
        !(location.pathname === "/" && (userData?.role === "admin" || userData?.role === "blogger")) &&
        <Footer />}

      {/* ✅ Floating Contact Button will show on all pages except auth pages and admin panels */}
      {!hideFooterRoutes.includes(location.pathname) &&
        !location.pathname.startsWith("/admin") &&
        !location.pathname.startsWith("/blogs") &&
        !(location.pathname === "/" && (userData?.role === "admin" || userData?.role === "blogger")) &&
        <FloatingContact />}

      {/* ✅ Native Mobile Bottom Navigation Bar (iOS / Android) */}
      <MobileBottomNav />
    </>
  );
};

export default App;
