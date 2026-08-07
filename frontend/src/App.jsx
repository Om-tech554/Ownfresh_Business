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
import AOS from 'aos';
import 'aos/dist/aos.css';

// Lazy-loaded routes for code splitting
const BlogList = lazy(() => import('./components/admin/BlogList'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const UserBlogDetails = lazy(() => import("./pages/UserBlogDetails"));
const CartPage = lazy(() => import('./pages/CartPage'));
const AdminBlogDetails = lazy(() => import('./pages/BlogDetails'));
const Shop = lazy(() => import('./components/Shop'));
const OilInsights = lazy(() => import('./pages/OilInsights'));
const CheckOut = lazy(() => import('./pages/CheckOut'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const WhyOwnFresh = lazy(() => import('./pages/WhyOwnFresh'));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Contact = lazy(() => import("./pages/Contact"));
const GalleryPage = lazy(() => import("./pages/GalleryPage"));
const AdminBlogEditor = lazy(() => import("./pages/admin/AdminBlogEditor"));
const AdminProductEditor = lazy(() => import("./pages/admin/AdminProductEditor"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const OrderDetails = lazy(() => import("./pages/OrderDetails"));
const ReferralDashboard = lazy(() => import("./pages/ReferralDashboard"));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'));
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'));
const ShippingPolicy = lazy(() => import('./pages/ShippingPolicy'));
const MembershipPage = lazy(() => import('./pages/MembershipPage'));

export const serverUrl = import.meta.env.VITE_API_URL || "http://localhost:10000";

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
  }, []);

  useGetCurrentUser();
  useGetCity();

  const location = useLocation();
  const userData = useSelector((state) => state.user.userData);

  const hideFooterRoutes = [
    "/signin",
    "/signup",
    "/forgot-password"
  ];

  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          success: {
            duration: 3000,
          },
          error: {
            duration: 4000,
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
    </>
  );
};

export default App;
