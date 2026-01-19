import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import UserDashboard from "../components/UserDashboard";
import AdminDashboard from "../components/admindashboard";

function Home() {
  const navigate = useNavigate();
  const { userData, loading } = useSelector((state) => state.user);

  useEffect(() => {
    // 🔒 Redirect ONLY after user fetch is completed
    if (!loading && !userData) {
      navigate("/signin", { replace: true });
    }
  }, [userData, loading, navigate]);

  // ⏳ While checking session
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }
  // 🚫 Not logged in (redirect already triggered)
  if (!userData) return null;

  return (
    <>
      {userData.role === "admin" && <AdminDashboard />}
      {userData.role === "user" && <UserDashboard />}
    </>
  );
}

export default Home;
