import React, { Suspense, lazy } from "react";
import { useSelector } from "react-redux";
import UserDashboard from "../components/UserDashboard";

const AdminDashboard = lazy(() => import("../components/AdminDashboard"));

function Home() {
  const { userData, loading } = useSelector((state) => state.user);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center font-bold text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <>
      {(!userData || userData?.role === "user") && <UserDashboard />}

      {(userData?.role === "admin" || userData?.role === "blogger") && (
        <Suspense fallback={<div className="p-10 text-center font-bold text-gray-500">Loading Admin Dashboard...</div>}>
          <AdminDashboard />
        </Suspense>
      )}
    </>
  );
}

export default Home;
