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
import Insurance from "@/pages/insurance/insurance_editor";
import Adjuster from "@/pages/adjuster/adjuster_editor";
import Vehicle from "@/pages/vechile/vechile_editor";
import Section from "@/pages/section33";
import SectionEditor from "@/pages/section33/components/section33_editor";
import Section33 from "@/pages/section33/components/section33_editor";
import LatEditor from "@/pages/lat/components/lat_editor";
import Lat from "@/pages/lat";
import AbCounselPage from "@/pages/ab_counsel/abCounsel_editor";
import TPInsurerForm from "@/pages/tp_insurance/tp_insurance_editor";
import TPAdjusterForm from "@/pages/tp_adjuster/tp_adjuster_editor";
import TpDriverInfoForm from "@/pages/tp_driverinfo/tp_driverinfo_editor";
import OwnerInfoForm from "@/pages/tp_ownerInfo/tp_ownerInfo_editor";
import VehicleInfoForm from "@/pages/tp_vechile/tpvechile_editor";
import Section28 from "@/pages/section258";
import Section258Form from "@/pages/section258/components/section28_editor";
import TpCounselForm from "@/pages/tp_counsel/tpCounsel_editor";
import SocForm from "@/pages/soc/soc_editor";
import StatementOfDefencePage from "@/pages/statement/statement_editor";

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
          <Route
            path="/dashboard/workstation/edit/:slug/insurance"
            element={<Insurance />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/adjuster"
            element={<Adjuster />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/vechile"
            element={<Vehicle />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/section-33-list"
            element={<Section />}
          />
          <Route path="/dashboard/section/:id" element={<Section33 />} />
          <Route path="/dashboard/section/add/:slug" element={<Section33 />} />
          <Route
            path="/dashboard/workstation/edit/:slug/lat"
            element={<Lat />}
          />
          <Route path="/dashboard/lat/add/:slug" element={<LatEditor />} />
          <Route path="/dashboard/lat/edit/:id" element={<LatEditor />} />
          <Route
            path="/dashboard/workstation/edit/:slug/ab-counsel"
            element={<AbCounselPage />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/tp-insurance"
            element={<TPInsurerForm />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/tp-adjuster"
            element={<TPAdjusterForm />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/tp-driverInfo"
            element={<TpDriverInfoForm />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/tp-ownerInfo"
            element={<OwnerInfoForm />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/tp-vehicleInfo"
            element={<VehicleInfoForm />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/section-258-list"
            element={<Section28 />}
          />
          <Route
            path="/dashboard/section258/add/:slug"
            element={<Section258Form />}
          />
          <Route
            path="/dashboard/section258/:id"
            element={<Section258Form />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/tp-counsel"
            element={<TpCounselForm />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/soc"
            element={<SocForm />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/sod"
            element={<StatementOfDefencePage />}
          />
          <Route path="/dashboard/contact-us" element={<ContactUs />} />
        </Route>
      </Route>
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
};

export default Router;
