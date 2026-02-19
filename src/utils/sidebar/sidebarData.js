import {
  ContactIcon,
  FileText,
  LayoutDashboard,
  CheckSquare,
  PlusSquare,
  ListTodo,
  User,
  Briefcase,
  GraduationCap,
  FileCheck,
  Upload,
  IdCard,
  Users,
  School,
  UserCheck,
  Heart,
  AlertTriangle,
  ShieldAlert,
  Ambulance,
  AmbulanceIcon,
  LifeBuoy,
  HeartHandshake,
  ActivityIcon,
  Radar,
  Stethoscope,
  HeartPulse,
  Syringe,
  FileUp,
  FilePlus,
  ScanSearch,
  Receipt,
  LocateFixed,
  MessageSquare,
  BadgeCheck,
  BookCheck,
  ClipboardList,
  Calendar,
  Download,
  FolderOpen,
  FileOutput,
  Shield,
  Hospital,
  Pill,
  Building2,
  CalendarIcon,
  Mail,
  FileChartColumn,
  LogOutIcon,
  Wallet,
  Banknote,
  File,
} from "lucide-react";
import { getItem } from "../local_storage";

const BASE_URL = "https://mva-backend.vsrlaw.ca";
const userName = getItem("userName") || "Admin";
const userEmail = getItem("userEmail") || "admin@admin.com";
export const isApiUrl = (url) => {
  return url && url.startsWith("/api");
};
export const handleFileDownload = async (url, fileName = "document") => {
  try {
    const fullUrl = url.startsWith("/api") ? `${BASE_URL}${url}` : url;
    const token = getItem("token");

    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    console.log("Downloading file...", fileName);

    const response = await fetch(fullUrl, {
      method: "GET",
      headers: headers,
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(
          "File not found. The document may not have been generated yet."
        );
      } else if (response.status === 401) {
        throw new Error("Unauthorized. Please log in again.");
      } else if (response.status === 403) {
        throw new Error(
          "Access denied. You don't have permission to download this file."
        );
      } else if (response.status === 500) {
        throw new Error("Server error. Please try again later.");
      } else {
        throw new Error(`Download failed with status: ${response.status}`);
      }
    }

    const blob = await response.blob();
    if (!blob || blob.size === 0) {
      throw new Error("Downloaded file is empty.");
    }
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    const contentDisposition = response.headers.get("Content-Disposition");
    let downloadFileName = fileName;

    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(
        /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
      );
      if (fileNameMatch && fileNameMatch[1]) {
        downloadFileName = fileNameMatch[1].replace(/['"]/g, "");
      }
    }
    if (!downloadFileName.includes(".")) {
      const contentType = response.headers.get("Content-Type");
      if (contentType) {
        if (contentType.includes("pdf")) {
          downloadFileName += ".pdf";
        } else if (
          contentType.includes("word") ||
          contentType.includes("document")
        ) {
          downloadFileName += ".docx";
        } else if (
          contentType.includes("excel") ||
          contentType.includes("spreadsheet")
        ) {
          downloadFileName += ".xlsx";
        } else {
          downloadFileName += ".pdf";
        }
      } else {
        downloadFileName += ".pdf";
      }
    }

    link.setAttribute("download", downloadFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    return true;
  } catch (error) {
    console.error("Error downloading file:", error);
    const errorMessage =
      error.message || "Failed to download file. Please try again.";
    alert(errorMessage);

    return false;
  }
};

export const EDIT_MODE_PATHS = [
  "/dashboard/workstation/edit/",
  "/dashboard/section/",
  "/dashboard/lat/add/",
  "/dashboard/lat/edit/",
  "/dashboard/section258/add/",
  "/dashboard/section258/",
  "/dashboard/conflict/add/",
  "/dashboard/conflict-search/edit/",
  "/dashboard/client/add",
  "/dashboard/medical-centre/add/",
  "/dashboard/insurance-ownership/add/",
  "/dashboard/police-report/add/",
  "/dashboard/accounting/add/",
  "/dashboard/medical-report/add/",
  "/dashboard/client-correspondence/add/",
  "/dashboard/client-correspondence/edit/",
  "/dashboard/insurance-examination/add/",
  "/dashboard/insurance-examnation/edit/",
  "/dashboard/vsr-insurance-examination/add/",
  "/dashboard/vsr-insurance-examination/edit/",
  "/dashboard/cost-hard/add/",
  "/dashboard/cost-soft/add/",
  "/dashboard/cost-timecard/add/",
  "dashboard/task/add/",
  " /dashboard/psychological/edit/",
  "/dashboard/psychological/add/",
  "/dashboard/mva-production/add/",
  "/dashboard/mva-production/edit/",
  "/dashboard/soc-prod/add/",
  "/dashboard/soc-prod/edit/",
  "/dashboard/ocf10-prod/add/",
  "/dashboard/ocf10-prod/edit/",
  "/dashboard/ocf6-prod/add/",
  "/dashboard/ocf6-prod/edit/",
  "/dashboard/ocf5-prod/add/",
  "/dashboard/ocf5-prod/edit/",
  "/dashboard/ocf2-prod/add/",
  "/dashboard/ocf2-prod/edit/",
  "/dashboard/ocf1-prod/add/",
  "/dashboard/ocf1-prod/edit/",
  "/dashboard/soc-prod/add/",
  "dashboard/soc-prod/edit/",
];

export const data = {
  user: {
    name: userName,
    email: userEmail,
    avatar: "/user.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboard,
      isActive: true,
      items: [],
    },
    {
      title: "WorkStation",
      url: "/dashboard/workstation",
      icon: CheckSquare,
      isActive: false,
      items: [],
      permission: "workstation",
    },
    {
      title: "Task",
      url: "/dashboard/task",
      icon: ClipboardList,
      isActive: false,
      items: [],
      permission: "task",
    },
    {
      title: "Event",
      url: "/dashboard/event",
      icon: CheckSquare,
      isActive: false,
      items: [],
      permission: "event",
    },
    {
      title: "Emails",
      url: "/dashboard/email",
      icon: Mail,
      isActive: false,
      items: [],
      permission: "emails",
    },
    {
      title: "Reports",
      url: "/dashboard/report",
      icon: FileChartColumn,
      isActive: false,
      items: [],
      permission: "reports",
    },
    {
      title: "Generate Reports",
      url: ``,
      icon: Download,
      permission: "reports",
      items: [
        {
          title: "Applicant Information",
          url: `/dashboard/export-applicant-information`,
          icon: User,
        },
        {
          title: "File Assigned info",
          url: `/dashboard/export-file-assigned-info`,
          icon: User,
        },
        {
          title: "List of Files",
          url: `/dashboard/export-list-of-files`,
          icon: User,
        },
        {
          title: "Applicant Contact Information",
          url: `/dashboard/export-applicant-contact-information`,
          icon: User,
        },
        {
          title: "Applicant Accident Detail",
          url: `/dashboard/export-applicant-accident-detail`,
          icon: User,
        },
        {
          title: "MVA Cases by Medical Centre",
          url: `/dashboard/export-mva-cases-by-medical-centre`,
          icon: User,
        },
        {
          title: "Vehicle Ownership Information",
          url: `/dashboard/export-vehicle-ownership-information`,
          icon: User,
        },
        {
          title: "LAT Files",
          url: `/dashboard/export-lat-files`,
          icon: User,
        },
        {
          title: "S33 Request",
          url: `/dashboard/export-s33-request`,
          icon: User,
        },
        {
          title: "S258 Request",
          url: `/dashboard/export-s258-request`,
          icon: User,
        },
        {
          title: "Opposing Counsel",
          url: `/dashboard/export-opposing-counsel`,
          icon: User,
        },
        {
          title: "Adjusters on Files",
          url: `/dashboard/export-adjusters-on-files`,
          icon: User,
        },
        {
          title: "List of Police Stations",
          url: `/dashboard/export-list-of-police-stations`,
          icon: User,
        },
        {
          title: "VSR Examination",
          url: `/dashboard/export-vsr-examination`,
          icon: User,
        },
      ],
    },
    {
      title: "Setup",
      url: `/dashboard/setup`,
      icon: FileText,
      items: [
        {
          title: "User",
          url: "/dashboard/setup/user",
          icon: User,
        },
        {
          title: "Roles",
          url: "/dashboard/setup/roles",
          icon: Shield,
        },
        {
          title: "Firm",
          url: "/dashboard/setup/firm",
          icon: Building2,
        },
        {
          title: "Master Data",
          url: "/dashboard/setup/master",
          icon: "",
          items: [
            {
              title: "File Status",
              url: "/dashboard/setup/master/initial-info-file-status",
            },
            {
              title: "Non Engagement Issued",
              url: "/dashboard/setup/master/initial-info-non-engagement-issued",
            },
            {
              title: "Claim Status",
              url: "/dashboard/setup/master/initial-info-claim-status",
            },
            {
              title: "Claim Type",
              url: "/dashboard/setup/master/initial-info-claim-type",
            },
            {
              title: "MIG Status",
              url: "/dashboard/setup/master/initial-info-mig-status",
            },
            {
              title: "AB Claim Settlement Approx",
              url: "/dashboard/setup/master/initial-info-ab-claim-settlement-approx",
            },
            {
              title: "Tort Claim Settlement Approx",
              url: "/dashboard/setup/master/initial-info-tort-claim-settlement-approx",
            },
            {
              title: "LTD Claim Settlement Approx",
              url: "/dashboard/setup/master/initial-info-ltd-claim-settlement-approx",
            },
            {
              title: "Property Damage Claim Settlement",
              url: "/dashboard/setup/master/initial-info-property-damage-claim-settlem",
            },
            {
              title: "Category",
              url: "/dashboard/setup/master/initial-info-category",
            },
            {
              title: "First Party Status",
              url: "/dashboard/setup/master/initial-info-first-party-status",
            },
            {
              title: "Third Party Status",
              url: "/dashboard/setup/master/initial-info-third-party-status",
            },
          ],
        },
      ],
    },
  ],
  projects: [],
};

export const getEditModeData = (slug) => ({
  user: {
    name: userName,
    email: userEmail,
    avatar: "/user.jpg",
  },
  navMain: [
    {
      title: "EXIT FILE",
      url: `/dashboard`,
      icon: FileOutput,
      items: [],
    },
    {
      title: "Initial Info",
      url: `/dashboard/workstation/edit/${slug}`,
      icon: FileText,
      items: [],
      permission: "initial",
    },
    {
      title: "Applicant",
      url: "",
      icon: ListTodo,
      permission: "applicant_info",
      items: [
        {
          title: "Applicant Information",
          url: `/dashboard/workstation/edit/${slug}/applicant-information`,
          icon: User,
          permission: "applicant_info",
        },
        {
          title: "Identification",
          url: `/dashboard/workstation/edit/${slug}/identification`,
          icon: IdCard,
          permission: "identification",
        },
        {
          title: "Employment",
          url: `/dashboard/workstation/edit/${slug}/employment`,
          icon: Briefcase,
          permission: "employment",
        },
        {
          title: "School or Caregiver",
          url: `/dashboard/workstation/edit/${slug}/school-caregiver`,
          icon: School,
          permission: "school_or_caregiver",
        },
        {
          title: "Representative Referral",
          url: `/dashboard/workstation/edit/${slug}/representative-referral`,
          icon: UserCheck,
          permission: "representive_referral",
        },
        {
          title: "Primary EHC",
          url: `/dashboard/workstation/edit/${slug}/primary-ehc`,
          icon: Heart,
          permission: "primary_ehc",
        },
        {
          title: "Secondary EHC",
          url: `/dashboard/workstation/edit/${slug}/secondary-ehc`,
          icon: Heart,
          permission: "secondary_ehc",
        },
      ],
    },
    {
      title: "Accident Detail",
      url: ``,
      icon: AlertTriangle,
      permission: "accident_information",
      items: [
        {
          title: "Accident Information",
          url: `/dashboard/workstation/edit/${slug}/accident-information`,
          icon: User,
          permission: "accident_information",
        },
      ],
    },
    {
      title: "Accident Benefit",
      url: ``,
      icon: LifeBuoy,
      items: [
        {
          title: "Insurance",
          url: `/dashboard/workstation/edit/${slug}/insurance`,
          icon: User,
          permission: "insurance",
        },
        {
          title: "Adjuster",
          url: `/dashboard/workstation/edit/${slug}/adjuster`,
          icon: User,
          permission: "adjuster",
        },
        {
          title: "Vehicle",
          url: `/dashboard/workstation/edit/${slug}/vechile`,
          icon: User,
          permission: "vehicle",
        },
        {
          title: "Section 33",
          url: `/dashboard/workstation/edit/${slug}/section-33-list`,
          icon: User,
          permission: "section_33",
        },
        {
          title: "LAT",
          url: `/dashboard/workstation/edit/${slug}/lat`,
          icon: User,
          permission: "lat_ab_counsel",
        },
        {
          title: "AB Counsel",
          url: `/dashboard/workstation/edit/${slug}/ab-counsel`,
          icon: User,
          permission: "lat_ab_counsel",
        },
      ],
    },
    {
      title: "Third Party",
      url: ``,
      icon: HeartHandshake,
      items: [
        {
          title: "Insurance",
          url: `/dashboard/workstation/edit/${slug}/tp-insurance`,
          icon: User,
          permission: "insurance",
        },
        {
          title: "Adjuster",
          url: `/dashboard/workstation/edit/${slug}/tp-adjuster`,
          icon: User,
          permission: "adjuster",
        },
        {
          title: "Driver Information",
          url: `/dashboard/workstation/edit/${slug}/tp-driverInfo`,
          icon: User,
          permission: "driver_information",
        },
        {
          title: "Owner Information",
          url: `/dashboard/workstation/edit/${slug}/tp-ownerInfo`,
          icon: User,
          permission: "owner_information",
        },
        {
          title: "Vehicle Information",
          url: `/dashboard/workstation/edit/${slug}/tp-vehicleInfo`,
          icon: User,
          permission: "vehicle_information",
        },
        {
          title: "Section 258",
          url: `/dashboard/workstation/edit/${slug}/section-258-list`,
          icon: User,
          permission: "section_528",
        },
        {
          title: "TP Counsel",
          url: `/dashboard/workstation/edit/${slug}/tp-counsel`,
          icon: User,
          permission: "tp_counsel",
        },
      ],
    },
    {
      title: "SOC",
      url: ``,
      icon: Radar,
      permission: "soc",
      items: [
        {
          title: "SOC",
          url: `/dashboard/workstation/edit/${slug}/soc`,
          icon: User,
          permission: "soc",
        },
        {
          title: "Statement of Defence",
          url: `/dashboard/workstation/edit/${slug}/sod`,
          icon: User,
          permission: "statement_of_defence",
        },
      ],
    },
    {
      title: "Discovery",
      url: ``,
      icon: ScanSearch,
      items: [
        {
          title: "Scheduled",
          url: `/dashboard/workstation/edit/${slug}/scheduled`,
          icon: User,
          permission: "scheduled",
        },
        {
          title: "AOD",
          url: `/dashboard/workstation/edit/${slug}/aod`,
          icon: User,
          permission: "aod",
        },
        {
          title: "Undertaking",
          url: `/dashboard/workstation/edit/${slug}/undertaking`,
          icon: User,
          permission: "undertaking",
        },
      ],
    },
    {
      title: "Medical Centre",
      url: `/dashboard/workstation/edit/${slug}/medical-centre`,
      icon: Syringe,
      items: [],
      permission: "medical_centre",
    },
    {
      title: "Production",
      url: ``,
      icon: FolderOpen,
      permission: "production",
      items: [
        {
          title: "Appendix A",
          url: `/api/v2/file/production/appendixA/${slug}`,
          icon: FileText,
        },
        {
          title: "Appendix B",
          url: `/api/v2/file/production/appendix-b/${slug}`,
          icon: FileText,
        },
        {
          title: "SOC",
          url: `/dashboard/workstation/edit/${slug}/soc-production`,
          icon: FileCheck,
        },
        {
          title: "Pre-screen",
          url: "",
          icon: ClipboardList,
          items: [
            {
              title: "Psychological Pre-screen",
              url: `/dashboard/workstation/edit/${slug}/psychological`,
              icon: HeartPulse,
            },
          ],
        },
        {
          title: "Intake",
          url: "",
          icon: FileUp,
          items: [
            {
              title: "MVA Intake Form",
              url: `/dashboard/workstation/edit/${slug}/mva-production`,
              icon: FileText,
            },
          ],
        },
        {
          title: "OCF",
          url: "",
          icon: FilePlus,
          items: [
            {
              title: "OCF-1",
              url: `/dashboard/workstation/edit/${slug}/ocf1-production`,
              icon: FileText,
            },
            {
              title: "OCF-2",
              url: `/dashboard/workstation/edit/${slug}/ocf2-production`,
              icon: FileText,
            },
            {
              title: "OCF-5",
              url: `/dashboard/workstation/edit/${slug}/ocf5-production`,
              icon: FileText,
            },
            {
              title: "OCF-6",
              url: `/dashboard/workstation/edit/${slug}/ocf6-production`,
              icon: FileText,
            },
            {
              title: "OCF-10",
              url: `/dashboard/workstation/edit/${slug}/ocf10-production`,
              icon: FileText,
            },
          ],
        },
        {
          title: "AB Adjuster",
          url: "",
          icon: Shield,
          items: [
            {
              title: "Authorization",
              url: "",
              icon: BadgeCheck,
              items: [
                {
                  title: "Authorization",
                  url: `/api/v2/file/production/generate-word-document/AuthorizationtoInsuranceABAdjuster/${slug}`,
                  icon: FileText,
                },
                {
                  title: "Consent, Dir & Authz",
                  url: `/api/v2/file/production/generate-word-document/ConsentDirectionAuthorizationtoInsuranceABAdjuster/${slug}`,
                  icon: FileText,
                },
                {
                  title: "Direction & Authorization",
                  url: `/api/v2/file/production/generate-word-document/DirectionAuthorizationtoInsuranceABAdjuster/${slug}`,
                  icon: FileText,
                },
                {
                  title: "Notice of Change of Address",
                  url: `/api/v2/file/production/generate-word-document/NoticeofChangeofAddresstoInsuranceABAdjuster/${slug}`,
                  icon: FileText,
                },
              ],
            },
            {
              title: "Letters to AB",
              url: "",
              icon: MessageSquare,
              items: [
                {
                  title: "Representation Documents",
                  url: `/api/v2/file/production/generate-word-document/LettertoInsuranceenclosingOCF1representationDocuments/${slug}`,
                  icon: FileText,
                },
                {
                  title: "Encl. OCF-3",
                  url: `/api/v2/file/production/generate-word-document/LettertoInsuranceenclosingOCF3/${slug}`,
                  icon: FileText,
                },
                {
                  title: "Encl. OCF-6",
                  url: `/api/v2/file/production/generate-word-document/LettertoInsuranceenclosingOCF6/${slug}`,
                  icon: FileText,
                },
                {
                  title: "Encl. OCF-10",
                  url: `/api/v2/file/production/generate-word-document/LettertoInsuranceenclosingOCF10/${slug}`,
                  icon: FileText,
                },
                {
                  title: "Encl. Statutory Declaration",
                  url: `/api/v2/file/production/generate-word-document/LettertoInsuranceenclosingStatutoryDeclaration/${slug}`,
                  icon: FileText,
                },
                {
                  title: "Encl. CNR - Family Physician",
                  url: `/api/v2/file/production/generate-word-document/LettertoInsuranceenclosingCNRFamilyPhysician/${slug}`,
                  icon: FileText,
                },
                {
                  title: "Encl. CNR - Walk-in-Clinic",
                  url: `/api/v2/file/production/generate-word-document/LettertoInsuranceenclosingCNRWalkinClinic/${slug}`,
                  icon: FileText,
                },
                {
                  title: "Encl. CNR - Physiotherapy",
                  url: `/api/v2/file/production/generate-word-document/LettertoInsuranceenclosingCNRPhysio/${slug}`,
                  icon: FileText,
                },
                {
                  title: "Encl. CNR - Pharmacy",
                  url: `/api/v2/file/production/generate-word-document/LettertoInsuranceenclosingPrescriptionSummaryPharmacy/${slug}`,
                  icon: FileText,
                },
                {
                  title: "Encl. OHIP Decoded Summary",
                  url: `/api/v2/file/production/generate-word-document/LettertoInsuranceenclosingOHIPSummary/${slug}`,
                  icon: FileText,
                },
                {
                  title: "Information Provided Soon",
                  url: `/api/v2/file/production/generate-word-document/LettertoInsuranceInformationprovidingsoon/${slug}`,
                  icon: FileText,
                },
                {
                  title: "Client Return Back to Work",
                  url: `/api/v2/file/production/generate-word-document/LettertoInsuranceinformclientreturnbacktowork/${slug}`,
                  icon: FileText,
                },
                {
                  title: "Request AB File",
                  url: `/api/v2/file/production/generate-word-document/LettertoInsurancerequestingABfile/${slug}`,
                  icon: FileText,
                },
                {
                  title: "Full and Final Release",
                  url: `/api/v2/file/production/generate-word-document/LettertoInsurancerequestingFullandFinalRelease/${slug}`,
                  icon: FileText,
                },
                {
                  title: "Outstanding Payment",
                  url: `/api/v2/file/production/generate-word-document/LettertoInsurancerequestingOustandingPayment/${slug}`,
                  icon: FileText,
                },
              ],
            },
          ],
        },
        {
          title: "Client",
          url: "",
          icon: User,
          items: [
            {
              title: "Issue Non Engagement",
              url: `/api/v2/file/production/generate-word-document/NonEngagementletterfinal/${slug}`,
              icon: FileText,
            },
          ],
        },
        {
          title: "Letters to Sue",
          url: "",
          icon: MessageSquare,
          items: [
            {
              title: "Third Party - Driver",
              url: `/api/v2/file/production/generate-word-document/LettertoSueotherPartyDriver/${slug}`,
              icon: FileText,
            },
            {
              title: "Third Party - Owner",
              url: `/api/v2/file/production/generate-word-document/LettertoSueotherPartyOwner/${slug}`,
              icon: FileText,
            },
          ],
        },
        {
          title: "Medical Documents",
          url: "",
          icon: Stethoscope,
          items: [
            {
              title: "Hospital",
              url: "",
              icon: Hospital,
              items: [
                {
                  title: "Req for Medical Records",
                  url: `/api/v2/file/production/generate-word-document/hospital/${slug}`,
                  icon: FileText,
                },
                {
                  title: "Encl. Payment",
                  url: `/api/v2/file/production/generate-word-document/LettertoHospitalenclosingpayment/${slug}`,
                  icon: FileText,
                },
              ],
            },
            {
              title: "Ambulance",
              url: "",
              icon: Ambulance,
              items: [
                {
                  title: "Req for CNR",
                  url: `/api/v2/file/production/generate-word-document/LettertoAmbulancerequestingCNR/${slug}`,
                  icon: FileText,
                },
              ],
            },
            {
              title: "Physiotherapy",
              url: "",
              icon: ActivityIcon,
              items: [
                {
                  title: "Req for CNR",
                  url: `/api/v2/file/production/generate-word-document/LettertoPhysioRequestforCNR/${slug}`,
                  icon: FileText,
                },
                {
                  title: "Encl. Payment",
                  url: `/api/v2/file/production/generate-word-document/LettertoPhysioenclosingpayment/${slug}`,
                  icon: FileText,
                },
              ],
            },
            {
              title: "Pharmacy",
              url: "",
              icon: Pill,
              items: [
                {
                  title: "Req for CNR",
                  url: `/api/v2/file/production/generate-word-document/LettertoPharmacyrequestingPrescriptionSummary/${slug}`,
                  icon: FileText,
                },
                {
                  title: "Encl. Payment",
                  url: `/api/v2/file/production/generate-word-document/LettertoPharmacyenclosingpayment/${slug}`,
                  icon: FileText,
                },
              ],
            },
          ],
        },
        {
          title: "Tort Adjuster",
          url: "",
          icon: Shield,
          items: [],
        },
        {
          title: "Police",
          url: "",
          icon: ShieldAlert,
          items: [
            {
              title: "Settlement Memorandum",
              url: `/api/v2/file/production/generate-word-document/LettertoPeelRegionalPolicerequestingPoliceReportdatedJanuary/${slug}`,
              icon: FileText,
            },
          ],
        },
      ],
    },
    {
      title: "Documents",
      url: ``,
      icon: FilePlus,
      permission: "documents",
      items: [
        {
          title: "Conflict Search",
          url: `/dashboard/workstation/edit/${slug}/conflict`,
          icon: User,
        },
        {
          title: "Client Documents",
          url: `/dashboard/workstation/edit/${slug}/client-documents`,
          icon: User,
        },
        {
          title: "Insurance Ownership",
          url: `/dashboard/workstation/edit/${slug}/insurance-ownership`,
          icon: User,
        },
        {
          title: "Police Report",
          url: `/dashboard/workstation/edit/${slug}/police-report`,
          icon: User,
        },
        {
          title: "Medical Report",
          url: `/dashboard/workstation/edit/${slug}/medical-report`,
          icon: User,
        },
        {
          title: "Accounting",
          url: `/dashboard/workstation/edit/${slug}/accounting`,
          icon: User,
        },
      ],
    },
    {
      title: "Documents I",
      url: `/dashboard/workstation/edit/${slug}/documents-i`,
      icon: File,
      items: [],
      permission: "documents",
    },
    {
      title: "Correspondence",
      url: ``,
      icon: MessageSquare,
      permission: "correspondence",
      items: [
        {
          title: "Client",
          url: `/dashboard/workstation/edit/${slug}/client-correspondence`,
          icon: User,
        },
      ],
    },
    {
      title: "Assessments",
      url: ``,
      icon: ClipboardList,
      items: [
        {
          title: "Insurance Examination",
          url: `/dashboard/workstation/edit/${slug}/insurance-examination`,
          icon: BadgeCheck,
          permission: "insurance_examination",
        },
        {
          title: "VSR Insurance Examination",
          url: `/dashboard/workstation/edit/${slug}/vsr-insurance-examination`,
          icon: BookCheck,
          permission: "vsr_insurance_examination",
        },
      ],
    },
    {
      title: "Tracking",
      url: ``,
      icon: LocateFixed,
      permission: "tracking",
      items: [
        {
          title: "OCF's Production",
          url: `/dashboard/workstation/edit/${slug}/ocf-production`,
          icon: User,
        },
        {
          title: "OCF 1",
          url: `/dashboard/workstation/edit/${slug}/ocf1`,
          icon: User,
        },
        {
          title: "OCF 2",
          url: `/dashboard/workstation/edit/${slug}/ocf2`,
          icon: User,
        },
        {
          title: "OCF 3",
          url: `/dashboard/workstation/edit/${slug}/ocf3`,
          icon: User,
        },
        {
          title: "OCF 5",
          url: `/dashboard/workstation/edit/${slug}/ocf5`,
          icon: User,
        },
        {
          title: "OCF 6",
          url: `/dashboard/workstation/edit/${slug}/ocf6`,
          icon: User,
        },
        {
          title: "OCF 10",
          url: `/dashboard/workstation/edit/${slug}/ocf10`,
          icon: User,
        },
        {
          title: "OHIP Decoded Summary",
          url: `/dashboard/workstation/edit/${slug}/ohip-decorded-summary`,
          icon: User,
        },
        {
          title: "Police Report",
          url: `/dashboard/workstation/edit/${slug}/police-report-summary`,
          icon: User,
        },
        {
          title: "Hospital Report",
          url: `/dashboard/workstation/edit/${slug}/hospital-report`,
          icon: User,
        },
        {
          title: "Ambulance Report",
          url: `/dashboard/workstation/edit/${slug}/ambulance-report`,
          icon: User,
        },
        {
          title: "Family Doctor CNR",
          url: `/dashboard/workstation/edit/${slug}/family-doctor`,
          icon: User,
        },
        {
          title: "Pharmacy Prescription Summary",
          url: `/dashboard/workstation/edit/${slug}/pharmacy-prescription-summary`,
          icon: User,
        },
        {
          title: "Physiotherapy CNR",
          url: `/dashboard/workstation/edit/${slug}/physiotherapy-cnr`,
          icon: User,
        },
        {
          title: "Walk in CNR",
          url: `/dashboard/workstation/edit/${slug}/walk-in-cnr`,
          icon: User,
        },
        {
          title: "Statutory Declaration",
          url: `/dashboard/workstation/edit/${slug}/statutory-declaration`,
          icon: User,
        },
        {
          title: "Tax Return",
          url: `/dashboard/workstation/edit/${slug}/tax-return`,
          icon: User,
        },
        {
          title: "Bank Statement",
          url: `/dashboard/workstation/edit/${slug}/bank-statement`,
          icon: User,
        },
        {
          title: "Sue to Driver Owner",
          url: `/dashboard/workstation/edit/${slug}/sue`,
          icon: User,
        },
        {
          title: "Non Engagement",
          url: `/dashboard/workstation/edit/${slug}/non-engagement`,
          icon: User,
        },
      ],
    },
    {
      title: "Accounting",
      url: ``,
      icon: Receipt,
      permission: "accounting",
      items: [
        {
          title: "Billing",
          url: `/dashboard/workstation/edit/${slug}/billing`,
          icon: Wallet,
          items: [
            {
              title: "Client Memo Settlement",
              url: `/dashboard/workstation/edit/${slug}/client-memo-settlement`,
              icon: User,
            },
            {
              title: "Cost",
              url: `/dashboard/workstation/edit/${slug}/cost`,
              icon: User,
            },
            {
              title: "Invoice",
              url: `/dashboard/workstation/edit/${slug}/invoice`,
              icon: User,
            },
          ],
        },
        {
          title: "Banking",
          url: ``,
          icon: Banknote,
          items: [
            {
              title: "Bank Transaction",
              url: `/dashboard/workstation/edit/${slug}/bank-transaction`,
              icon: User,
            },
            {
              title: "Third Party Invoice",
              url: `/dashboard/workstation/edit/${slug}/third-party-invoice`,
              icon: User,
            },
            {
              title: "Final Settlement",
              url: `/dashboard/workstation/edit/${slug}/final-settlement`,
              icon: User,
            }
          ],
        },
      ],
    },
    {
      title: "Task",
      url: `/dashboard/workstation/edit/${slug}/task`,
      icon: ClipboardList,
      items: [],
      permission: "task",
    },
    {
      title: "Event",
      url: `/dashboard/workstation/edit/${slug}/event`,
      icon: CalendarIcon,
      items: [],
      permission: "event",
    },
    {
      title: "Email",
      url: `/dashboard/workstation/edit/${slug}/email`,
      icon: Mail,
      permission: "emails",
      items: [
        {
          title: "Inbox",
          url: `/dashboard/workstation/edit/${slug}/inbox`,
          icon: User,
        },
        {
          title: "Sent",
          url: `/dashboard/workstation/edit/${slug}/sent`,
          icon: User,
        },
        {
          title: "Draft",
          url: `/dashboard/workstation/edit/${slug}/draft`,
          icon: User,
        },
      ],
      items: [],
    },
  ],
  projects: [],
});
