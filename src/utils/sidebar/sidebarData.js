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
} from "lucide-react";
import { getItem } from "../local_storage";

const userName = getItem("userName") || "Admin";
const userEmail = getItem("userEmail") || "admin@admin.com";

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

// Function to generate edit mode data with dynamic slug
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
      icon: LifeBuoy,
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
      ],
    },
  ],
  projects: [],
});
