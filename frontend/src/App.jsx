import React from 'react'
import { Route, Routes } from 'react-router-dom'
import SignUp from './pages/SignUp'
import Signin from './pages/Signin'
import ForgotPassword from './pages/ForgotPassword'
import Home from './pages/Home'   // ✅ IMPORT YOUR HOME PAGE
import useGetCurrentUser from './hooks/useGetCurrentUser'
import { Toaster } from "react-hot-toast";
import useGetCity from './hooks/useGetCity'

export const serverUrl = "http://localhost:8000"

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
        }}/>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </>
  )
}

export default App
