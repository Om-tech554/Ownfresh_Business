import React from 'react'
import { Route, Routes } from 'react-router-dom'
import SignUp from './pages/SignUp'
import Signin from './pages/Signin'
import ForgotPassword from './pages/ForgotPassword'
import Home from './pages/Home'   // ✅ IMPORT YOUR HOME PAGE
import useGetCurrentUser from './hooks/useGetCurrentUser'
import { Toaster } from "react-hot-toast";
import useGetCity from './hooks/useGetCity'
import BlogList from './components/admin/BlogList'
import UserBlogDetails from "./pages/UserBlogDetails";
import CartPage from './pages/CartPage'
export const serverUrl = "http://localhost:8000"
import AdminRoute from "./components/AdminRoute";
import AdminBlogDetails from './pages/BlogDetails'
import Shop from './components/Shop'
import OilInsights from './pages/OilInsights'
import 'aos/dist/aos.css';
import StaticBlogDetails from './pages/StaticBlogDetails'

const App = () => {
  useGetCurrentUser()
  useGetCity()
  return (
    <>
      <Toaster position="top-center" reverseOrder={false}
        toastOptions={{
          success: {
            duration: 5000,
          },
          error: {
            duration: 10000,
          },
        }} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/Oilinsights" element={<OilInsights />} />
        <Route path="/oil-insights/static/:id" element={<StaticBlogDetails />} />

        <Route
          path="/blogs"
          element={
            <AdminRoute>
              <BlogList />
            </AdminRoute>
          }
        /><Route
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
      </Routes>
      
    </>
  )
}

export default App
