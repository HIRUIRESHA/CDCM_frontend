import React from "react";
import {
  Navigate,
  Outlet,
} from "react-router-dom";

const HospitalProtectedRoute = () => {
  const token = localStorage.getItem("token");

  const hospital = JSON.parse(
    localStorage.getItem("hospital") || "null"
  );

  if (!token || !hospital) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (hospital.role !== "HOSPITAL") {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  if (!hospital.verified) {
    return (
      <Navigate
        to="/hospital/verify-email"
        replace
      />
    );
  }

  if (hospital.mustChangePassword) {
    return (
      <Navigate
        to="/hospital/change-password"
        replace
      />
    );
  }

  return <Outlet />;
};

export default HospitalProtectedRoute;