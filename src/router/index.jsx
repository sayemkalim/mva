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
import ScheduledPage from "@/pages/scheduled/scheduled_editor";
import AodPage from "@/pages/aod/aod_editor";
import UndertakingPage from "@/pages/undertaking/undertaking_editor";
import MedicalCentrePage from "@/pages/medical_centre/medical_editor";
import Conflict from "@/pages/conflict";
import ConflictSearchPage from "@/pages/conflict/components/conflictt_editor";
import Client from "@/pages/client";
import ClientDocumentPage from "@/pages/client/components/client_editor";
import InsuranceOwner from "@/pages/insurance_ownership";
import InsuranceDocPage from "@/pages/insurance_ownership/components/insurancedoc_editor";
import PoliceReport from "@/pages/police";
import PoliceReportPage from "@/pages/police/components/insurancedoc_editor";
import Accounting from "@/pages/accounting";
import AccountingPage from "@/pages/accounting/components/accounting_editor";
import MedicalReport from "@/pages/medical";
import MedicalPage from "@/pages/medical/components/medical_editor";
import ClientCorrespondence from "@/pages/client_correspondence";
import ClientCorrespondencePage from "@/pages/client_correspondence/components/client_editor";
import InsuranceExaminationPage from "@/pages/insurance-examination/components/insurance-examination-editor";
import InsExam from "@/pages/insurance-examination";
import VsrInsExam from "@/pages/vsr-insurance-examination";
import VSRAssessmentPage from "@/pages/vsr-insurance-examination/components/insurance-examination-editor";
import OcfPage from "@/pages/ocf/ocf_editor";
import Ocf1Page from "@/pages/ocf1/ocf_editor";
import Ocf2Page from "@/pages/ocf2/ocf_editor";
import Ocf3Page from "@/pages/ocf3/ocf_editor";
import Ocf5Page from "@/pages/ocf4/ocf_editor";
import Ocf6Page from "@/pages/ocf6/ocf_editor";
import Ocf10Page from "@/pages/ocf10/ocf_editor";
import OhipPage from "@/pages/OHIP/ohif_editor";
import PoliceRecordPage from "@/pages/police_report/police_editor";
import HospitalReportPage from "@/pages/hospital_report/hospital_editor";
import AmbulanceReportPage from "@/pages/ambulance_report/ambulance_editor";
import FamilyDoctorPage from "@/pages/familydoctor/familydoctor_editor";
import PharmacyPage from "@/pages/pharmacy/pharmacy_editor";
import PhysiotherapyPage from "@/pages/physiotherapy/physiotherapy_editor";
import WalkPage from "@/pages/walkin/walk_editor";
import StatutoryPage from "@/pages/statutory/statutory_editor";
import TaxPage from "@/pages/tax/tax_editor";
import BankPage from "@/pages/bank/bank_editor";
import SuePage from "@/pages/sue/sue_editor";
import NonEngagementPage from "@/pages/non_engagement/nonEngagement_editor";
import ClientSettlementPage from "@/pages/clientSettlement/clientSettlement_editor";
import Cost from "@/pages/cost";
import SoftCostPage from "@/pages/cost/components/soft_editor";
import HardCostPage from "@/pages/cost/components/hard_editor";
import TimeCardPage from "@/pages/cost/components/timeline_editor";
import TaskPage from "@/pages/task/components/task_editor";
import Task from "@/pages/task";
import CommentPage from "@/pages/task/components/comment_editor";
import OcfProd from "@/pages/ocf-prod";
import OCFProdPage from "@/pages/ocf-prod/components/ocf-prod_editor";
import Calender from "@/pages/calender";
import OcfProd2 from "@/pages/ocf-prod2";
import OCFProd2Page from "@/pages/ocf-prod2/components/ocf-prod2_editor";
import OcfProd3 from "@/pages/ocf-prod3";
import OCFProd5Page from "@/pages/ocf-prod3/components/ocf-prod3_editor";
import OcfProd6 from "@/pages/ocf-prod6";
import OCFProd6Page from "@/pages/ocf-prod6/components/ocf-prod6_editor";
import OcfProd10 from "@/pages/ocf-prod10";
import OCFProd10Page from "@/pages/ocf-prod10/components/ocf-prod10_editor";
import InternalCalendar from "@/pages/internal_calendar";
import SocProd from "@/pages/soc-prod";
import SocProdPage from "@/pages/soc-prod/components/soc-prod_editor";
import MvaProd from "@/pages/mva-prod";
import MvaPage from "@/pages/mva-prod/components/mva-prod_editor";
import PsychologicalPage from "@/pages/psychological/components/psychological_editor";
import Psychological from "@/pages/psychological";
import ReportPage from "@/pages/report";
import Draft from "@/pages/email/draft_editor";
import ExportApplicantInfo from "@/pages/generate_report/applicant_information";
import ExportFileAssignedInfo from "@/pages/generate_report/assigned_file_info";
import ExportListOfFiles from "@/pages/generate_report/list_of_files";
import ExportApplicantContactInfo from "@/pages/generate_report/applicant_contact_information";
import ExportApplicantAccidentDetail from "@/pages/generate_report/applicant_accident_detail";
import ExportMvaCasesByMedicalCentre from "@/pages/generate_report/mva_cases_by_medical_centre";
import ExportVehicleOwnershipInfo from "@/pages/generate_report/vehicle_ownership_information";
import ExportLatFiles from "@/pages/generate_report/lat_files";
import ExportSectionRequest from "@/pages/generate_report/section_request";
import ExportS258Request from "@/pages/generate_report/s258_request";
import ExportOpposingCounsel from "@/pages/generate_report/opposing_counsel";
import ExportAdjustersOnFiles from "@/pages/generate_report/adjusters_on_files";
import ExportListOfPoliceStations from "@/pages/generate_report/list_of_police_stations";
import ExportVsrExamination from "@/pages/generate_report/vsr_examination";
import Email from "@/pages/email";

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
          <Route
            path="/dashboard/workstation/edit/:slug/scheduled"
            element={<ScheduledPage />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/aod"
            element={<AodPage />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/undertaking"
            element={<UndertakingPage />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/medical-centre"
            element={<MedicalCentrePage />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/conflict"
            element={<Conflict />}
          />
          <Route
            path="/dashboard/conflict-search/edit/:id"
            element={<ConflictSearchPage />}
          />
          <Route
            path="/dashboard/conflict/add/:slug"
            element={<ConflictSearchPage />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/client-documents"
            element={<Client />}
          />
          <Route
            path="/dashboard/client/add/:slug"
            element={<ClientDocumentPage />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/insurance-ownership"
            element={<InsuranceOwner />}
          />
          <Route
            path="/dashboard/insurance-ownership/add/:slug"
            element={<InsuranceDocPage />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/police-report"
            element={<PoliceReport />}
          />
          <Route
            path="/dashboard/police-report/add/:slug"
            element={<PoliceReportPage />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/accounting"
            element={<Accounting />}
          />
          <Route
            path="/dashboard/accounting/add/:slug"
            element={<AccountingPage />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/medical-report"
            element={<MedicalReport />}
          />
          <Route
            path="/dashboard/medical-report/add/:slug"
            element={<MedicalPage />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/client-correspondence"
            element={<ClientCorrespondence />}
          />
          <Route
            path="/dashboard/client-correspondence/add/:slug"
            element={<ClientCorrespondencePage />}
          />
          <Route
            path="/dashboard/client-correspondence/edit/:id"
            element={<ClientCorrespondencePage />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/insurance-examination"
            element={<InsExam />}
          />
          <Route
            path="/dashboard/insurance-examination/add/:slug"
            element={<InsuranceExaminationPage />}
          />
          <Route
            path="/dashboard/insurance-examnation/edit/:id"
            element={<InsuranceExaminationPage />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/vsr-insurance-examination"
            element={<VsrInsExam />}
          />
          <Route
            path="/dashboard/vsr-insurance-examination/add/:slug"
            element={<VSRAssessmentPage />}
          />
          <Route
            path="/dashboard/insurance-examnation/edit/:id"
            element={<VSRAssessmentPage />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/ocf-production"
            element={<OcfPage />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/ocf1"
            element={<Ocf1Page />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/ocf2"
            element={<Ocf2Page />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/ocf3"
            element={<Ocf3Page />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/ocf5"
            element={<Ocf5Page />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/ocf6"
            element={<Ocf6Page />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/ocf10"
            element={<Ocf10Page />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/ohip-decorded-summary"
            element={<OhipPage />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/police-report-summary"
            element={<PoliceRecordPage />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/hospital-report"
            element={<HospitalReportPage />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/ambulance-report"
            element={<AmbulanceReportPage />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/family-doctor"
            element={<FamilyDoctorPage />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/pharmacy-prescription-summary"
            element={<PharmacyPage />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/physiotherapy-cnr"
            element={<PhysiotherapyPage />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/walk-in-cnr"
            element={<WalkPage />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/statutory-declaration"
            element={<StatutoryPage />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/tax-return"
            element={<TaxPage />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/bank-statement"
            element={<BankPage />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/sue"
            element={<SuePage />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/non-engagement"
            element={<NonEngagementPage />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/client-memo-settlement"
            element={<ClientSettlementPage />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/cost"
            element={<Cost />}
          />
          <Route
            path="/dashboard/cost-soft/add/:slug"
            element={<SoftCostPage />}
          />
          <Route
            path="/dashboard/cost-hard/add/:slug"
            element={<HardCostPage />}
          />
          <Route
            path="/dashboard/cost-timecard/add/:slug"
            element={<TimeCardPage />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/task"
            element={<Task />}
          />
          <Route path="/dashboard/task" element={<Task />} />
          <Route path="/dashboard/task/add/:slug" element={<TaskPage />} />
          <Route path="/dashboard/task/add" element={<TaskPage />} />
          <Route path="/dashboard/tasks/edit/:id" element={<TaskPage />} />
          <Route
            path="/dashboard/tasks/comments/:id"
            element={<CommentPage />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/ocf1-production"
            element={<OcfProd />}
          />
          <Route
            path="/dashboard/ocf1-prod/add/:slug"
            element={<OCFProdPage />}
          />
          <Route
            path="/dashboard/ocf1-prod/edit/:id"
            element={<OCFProdPage />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/ocf2-production"
            element={<OcfProd2 />}
          />
          <Route
            path="/dashboard/ocf2-prod/add/:slug"
            element={<OCFProd2Page />}
          />
          <Route
            path="/dashboard/ocf2-prod/edit/:id"
            element={<OCFProd2Page />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/ocf5-production"
            element={<OcfProd3 />}
          />
          <Route
            path="/dashboard/ocf5-prod/add/:slug"
            element={<OCFProd5Page />}
          />
          <Route
            path="/dashboard/ocf5-prod/edit/:id"
            element={<OCFProd5Page />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/ocf6-production"
            element={<OcfProd6 />}
          />
          <Route
            path="/dashboard/ocf6-prod/add/:slug"
            element={<OCFProd6Page />}
          />
          <Route
            path="/dashboard/ocf6-prod/edit/:id"
            element={<OCFProd6Page />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/ocf10-production"
            element={<OcfProd10 />}
          />
          <Route
            path="/dashboard/ocf10-prod/add/:slug"
            element={<OCFProd10Page />}
          />
          <Route
            path="/dashboard/ocf10-prod/edit/:id"
            element={<OCFProd10Page />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/soc-production"
            element={<SocProd />}
          />
          <Route
            path="/dashboard/soc-prod/add/:slug"
            element={<SocProdPage />}
          />
          <Route
            path="/dashboard/soc-prod/edit/:id"
            element={<SocProdPage />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/mva-production"
            element={<MvaProd />}
          />
          <Route
            path="/dashboard/mva-production/add/:slug"
            element={<MvaPage />}
          />
          <Route
            path="/dashboard/mva-production/edit/:id"
            element={<MvaPage />}
          />
          <Route
            path="/dashboard/workstation/edit/:slug/psychological"
            element={<Psychological />}
          />
          <Route
            path="/dashboard/psychological/add/:slug"
            element={<PsychologicalPage />}
          />
          <Route
            path="/dashboard/psychological/edit/:id"
            element={<PsychologicalPage />}
          />
          <Route path="/dashboard/event" element={<Calender />} />
          <Route path="/dashboard/email" element={<Email />} />
          <Route
            path="/dashboard/workstation/edit/:slug/event"
            element={<InternalCalendar />}
          />
          <Route path="/dashboard/report" element={<ReportPage />} />
          <Route
            path="/dashboard/export-applicant-information"
            element={<ExportApplicantInfo />}
          />
          <Route
            path="/dashboard/export-file-assigned-info"
            element={<ExportFileAssignedInfo />}
          />
          <Route
            path="/dashboard/export-list-of-files"
            element={<ExportListOfFiles />}
          />
          <Route
            path="/dashboard/export-applicant-contact-information"
            element={<ExportApplicantContactInfo />}
          />
          <Route
            path="/dashboard/export-applicant-accident-detail"
            element={<ExportApplicantAccidentDetail />}
          />
          <Route
            path="/dashboard/export-mva-cases-by-medical-centre"
            element={<ExportMvaCasesByMedicalCentre />}
          />
          <Route
            path="/dashboard/export-vehicle-ownership-information"
            element={<ExportVehicleOwnershipInfo />}
          />
          <Route
            path="/dashboard/export-lat-files"
            element={<ExportLatFiles />}
          />
          <Route
            path="/dashboard/export-s33-request"
            element={<ExportSectionRequest />}
          />
          <Route
            path="/dashboard/export-s258-request"
            element={<ExportS258Request />}
          />
          <Route
            path="/dashboard/export-opposing-counsel"
            element={<ExportOpposingCounsel />}
          />
          <Route
            path="/dashboard/export-adjusters-on-files"
            element={<ExportAdjustersOnFiles />}
          />
          <Route
            path="/dashboard/export-list-of-police-stations"
            element={<ExportListOfPoliceStations />}
          />
          <Route
            path="/dashboard/export-vsr-examination"
            element={<ExportVsrExamination />}
          />
        </Route>
      </Route>
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
};

export default Router;
