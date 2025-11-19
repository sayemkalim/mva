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
import ApplicantInformation from "@/pages/applicantInfo/applicantInfo_editor";
import Identification from "@/pages/identification/identification_editor";
import Employment from "@/pages/employment/employment_editor";
import SchoolCaregiver from "@/pages/schoolOrCaregiver/schoolOrCaregiver_editor";
import RepresentativeReferral from "@/pages/representative-referral/representative-referral_editor";
import PrimaryEhc from "@/pages/primary-ehc/primary-ehc_editor";
import SecondaryEhc from "@/pages/secondary-ehc/secondary-ehc_editor";
import AccidentalInformation from "@/pages/accidentInfo/accidentInfo_editor";

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
          <Route path="/dashboard/workstation" element={<Matter />} />
          <Route path="/dashboard/workstation/add" element={<MatterEditor />} />
          <Route
            path="/dashboard/workstation/edit/:slug"
            element={<MatterEditor />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/applicant-information"
            element={<ApplicantInformation />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/identification"
            element={<Identification />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/employment"
            element={<Employment />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/school-caregiver"
            element={<SchoolCaregiver />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/representative-referral"
            element={<RepresentativeReferral />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/primary-ehc"
            element={<PrimaryEhc />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/secondary-ehc"
            element={<SecondaryEhc />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/accident-information"
            element={<AccidentalInformation />}
          />
          <Route path="/dashboard/contact-us" element={<ContactUs />} />
        </Route>
      </Route>
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
};

export default Router;
