

import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import UserDashboard from "../components/UserDashboard";
import AdminDashboard from "../components/AdminDashboard";

function Home() {
  const navigate = useNavigate();
  const { userData, loading } = useSelector((state) => state.user);

  // ⏳ While fetching session
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <>
      {/* 🔥 Not logged in → show normal public homepage */}
      {!userData && <UserDashboard />}

      {/* 🔥 Logged-in normal user */}
      {userData?.role === "user" && <UserDashboard />}

      {/* 🔥 Logged-in admin or blogger (but NO redirect) */}
      {(userData?.role === "admin" || userData?.role === "blogger") && <AdminDashboard />}
    </>
  );
}

export default Home;


