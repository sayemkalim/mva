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
} from "lucide-react";
import { getItem } from "../local_storage";

const userName = getItem("userName") || "Admin";
const userEmail = getItem("userEmail") || "admin@admin.com";

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
      title: "Initial Info",
      url: `/dashboard/workstation/edit/${slug}`,
      icon: FileText,
      items: [],
    },
    {
      title: "Applicant",
      url: "",
      icon: ListTodo,
      items: [
        {
          title: "Applicant Information",
          url: `/dashboard/workstation/edit/${slug}/applicant-information`,
          icon: User,
        },
        {
          title: "Identification",
          url: `/dashboard/workstation/edit/${slug}/identification`,
          icon: IdCard,
        },
        {
          title: "Employment",
          url: `/dashboard/workstation/edit/${slug}/employment`,
          icon: Briefcase,
        },
        {
          title: "School or Caregiver",
          url: `/dashboard/workstation/edit/${slug}/school-caregiver`,
          icon: School,
        },
        {
          title: "Representative Referral",
          url: `/dashboard/workstation/edit/${slug}/representative-referral`,
          icon: UserCheck,
        },
        {
          title: "Primary Ehc",
          url: `/dashboard/workstation/edit/${slug}/primary-ehc`,
          icon: Heart,
        },
        {
          title: "Secondary Ehc",
          url: `/dashboard/workstation/edit/${slug}/secondary-ehc`,
          icon: Heart,
        },
      ],
    },
    {
      title: "Accident Detail",
      url: ``,
      icon: AlertTriangle,
      items: [
        {
          title: "Accident Information",
          url: `/dashboard/workstation/edit/${slug}/accident-information`,
          icon: User,
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
        },
        {
          title: "Adjuster",
          url: `/dashboard/workstation/edit/${slug}/adjuster`,
          icon: User,
        },
        {
          title: "Vechile",
          url: `/dashboard/workstation/edit/${slug}/vechile`,
          icon: User,
        },
        {
          title: "Section 33",
          url: `/dashboard/workstation/edit/${slug}/section-33-list`,
          icon: User,
        },
        {
          title: "LAT",
          url: `/dashboard/workstation/edit/${slug}/lat`,
          icon: User,
        },
        {
          title: "AB Counsel",
          url: `/dashboard/workstation/edit/${slug}/ab-counsel`,
          icon: User,
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
        },
        {
          title: "Adjuster",
          url: `/dashboard/workstation/edit/${slug}/tp-adjuster`,
          icon: User,
        },
        {
          title: "Driver Information",
          url: `/dashboard/workstation/edit/${slug}/tp-driverInfo`,
          icon: User,
        },
        {
          title: "Owner Information",
          url: `/dashboard/workstation/edit/${slug}/tp-ownerInfo`,
          icon: User,
        },
        {
          title: "Vehicle Information",
          url: `/dashboard/workstation/edit/${slug}/tp-vehicleInfo`,
          icon: User,
        },
        {
          title: "Section 258",
          url: `/dashboard/workstation/edit/${slug}/section-258-list`,
          icon: User,
        },
        {
          title: "TP Counsel",
          url: `/dashboard/workstation/edit/${slug}/tp-counsel`,
          icon: User,
        },
      ],
    },
    {
      title: "SOC",
      url: ``,
      icon: Radar,
      items: [
        {
          title: "SOC",
          url: `/dashboard/workstation/edit/${slug}/soc`,
          icon: User,
        },
        {
          title: "Statement of Defence",
          url: `/dashboard/workstation/edit/${slug}/sod`,
          icon: User,
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
        },
        {
          title: "AOD",
          url: `/dashboard/workstation/edit/${slug}/aod`,
          icon: User,
        },
        {
          title: "Undertaking",
          url: `/dashboard/workstation/edit/${slug}/undertaking`,
          icon: User,
        },
      ],
    },
    {
      title: "Medical Centre",
      url: `/dashboard/workstation/edit/${slug}/medical-centre`,
      icon: Syringe,
      items: [],
    },
    {
      title: "Documents",
      url: ``,
      icon: FilePlus,
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
      title: "Correspondence",
      url: ``,
      icon: FilePlus,
      items: [
        {
          title: "Client",
          url: `/dashboard/workstation/edit/${slug}/client-correspondence`,
          icon: User,
        },
      ],
    },
  ],
  projects: [],
});
