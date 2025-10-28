import React from "react";
import { NavLink, Outlet, Routes } from "react-router-dom";
import Navbar from "../components/auth/Navbar";

const Auth = () => {
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Navbar />
      <Outlet />
    </div>
  );
};

export default Auth;
