import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import SignUp from './pages/SignUp'
import Signin from './pages/Signin'
import ForgotPassword from './pages/ForgotPassword'
import Home from './pages/Home'
import useGetCurrentUser from './hooks/useGetCurrentUser'
import { Toaster } from "react-hot-toast";
import useGetCity from './hooks/useGetCity'
import BlogList from './components/admin/BlogList'
import UserBlogDetails from "./pages/UserBlogDetails";
import CartPage from './pages/CartPage'
import AdminRoute from "./components/AdminRoute";
import AdminBlogDetails from './pages/BlogDetails'
import Shop from './components/Shop'
import OilInsights from './pages/OilInsights'
import StaticBlogDetails from './pages/StaticBlogDetails'
import CheckOut from './pages/CheckOut'
import Footer from './components/Footer'   // ✅ Import Footer
import 'aos/dist/aos.css';
import WhyOwnFresh from './pages/WhyOwnFresh'
import ProductDetails from "./pages/ProductDetails";
export const serverUrl = "http://localhost:8000"

const App = () => {

  useGetCurrentUser()
  useGetCity()

  const location = useLocation()

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
            duration: 5000,
          },
          error: {
            duration: 10000,
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/Oilinsights" element={<OilInsights />} />
        <Route path="/oil-insights/static/:id" element={<StaticBlogDetails />} />
        <Route path="/checkout" element={<CheckOut />} />
        <Route path="/product/:id" element={<ProductDetails />} />
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
        <Route path="/shop" element={<Shop />} />
        <Route path="/blog/:id" element={<UserBlogDetails />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/whyownfresh" element={<WhyOwnFresh />} />
      </Routes>

      {/* ✅ Footer will show on all pages except auth pages */}
      {!hideFooterRoutes.includes(location.pathname) && <Footer />}
    </>
  )
}

export default App
