import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "@/auth/ProtectedRoute";
import PublicRoute from "@/auth/PublicRoute";
import Login from "@/pages/login";
import Layout from "@/layout";
import Dashboard from "@/pages/dashboard";

import ErrorPage from "@/components/404";

import ContactUs from "@/pages/contact_us";
import Signup from "@/pages/signup";
import ForgotPassword from "@/pages/forget-password";
import Matter from "@/pages/workstation";
import MatterEditor from "@/pages/workstation/components/mater_editor";

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<Dashboard />} />
          {/* ProductsRoute */}
          <Route path="/dashboard/workstation" element={<Matter />} />
          <Route path="/dashboard/workstation/add" element={<MatterEditor />} />
          {/* Blogs */}
          {/* <Route path="/dashboard/blogs" element={<Blogs />} />
          <Route path="/dashboard/blogs/add" element={<BlogEditor />} />
          <Route path="/dashboard/blogs/edit/:id" element={<BlogEditor />} /> */}
          {/* <Route path="/dashboard/blogs/:id" element={<BlogDetails />} /> */}
          <Route path="/dashboard/contact-us" element={<ContactUs />} />
        </Route>
      </Route>
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
};

export default Router;
