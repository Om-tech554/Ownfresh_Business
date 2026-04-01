import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import SignUp from './pages/SignUp'
import Signin from './pages/Signin'
import ForgotPassword from './pages/ForgotPassword'
import Home from './pages/Home'
import useGetCurrentUser from './hooks/useGetCurrentUser'
import { Toaster } from "react-hot-toast";
import useGetCity from './hooks/useGetCity'
import BlogList from './components/admin/BlogList'
import AdminDashboard from './components/AdminDashboard';
import UserBlogDetails from "./pages/UserBlogDetails";
import CartPage from './pages/CartPage'
import AdminRoute from "./components/AdminRoute";
import AdminBlogDetails from './pages/BlogDetails'
import Shop from './components/Shop'
import OilInsights from './pages/OilInsights'
import CheckOut from './pages/CheckOut'
import Footer from './components/Footer'   // ✅ Import Footer
import AOS from 'aos';
import 'aos/dist/aos.css';

import WhyOwnFresh from './pages/WhyOwnFresh'
import ProductDetails from "./pages/ProductDetails";
import Contact from "./pages/Contact";
import GalleryPage from "./pages/GalleryPage";
import AdminBlogEditor from "./pages/admin/AdminBlogEditor";
import AdminProductEditor from "./pages/admin/AdminProductEditor";
import ReferralDashboard from "./pages/ReferralDashboard";
import MyOrders from "./pages/MyOrders"; // [NEW]

export const serverUrl = "http://localhost:8000"

const App = () => {
  // ...

  React.useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  useGetCurrentUser()
  useGetCity()

  const location = useLocation()
  const userData = useSelector((state) => state.user.userData);

  // ❌ Routes where footer should NOT appear
  const hideFooterRoutes = [
    "/signin",
    "/signup",
    "/forgot-password"
  ]

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
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/Oilinsights" element={<OilInsights />} />
        <Route path="/checkout" element={<CheckOut />} />
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
        <Route path="/referral" element={<ReferralDashboard />} />
        <Route path="/my-orders" element={<MyOrders />} />
      </Routes>

      {/* ✅ Footer will show on all pages except auth pages and admin panels */}
      {!hideFooterRoutes.includes(location.pathname) && 
       !location.pathname.startsWith("/admin") && 
       !location.pathname.startsWith("/blogs") && 
       !(location.pathname === "/" && (userData?.role === "admin" || userData?.role === "blogger")) &&
       <Footer />}
    </>
  )
}

export default App
