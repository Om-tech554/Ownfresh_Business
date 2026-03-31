// src/components/AdminRoute.jsx
import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {
  const userData = useSelector((state) => state.user.userData);

  if (!userData) {
    return <Navigate to="/signin" replace />;
  }

  if (userData.role !== "admin" && userData.role !== "blogger") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRoute;
