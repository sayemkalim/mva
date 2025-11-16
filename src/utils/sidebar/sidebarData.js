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

export const editModeData = {
  user: {
    name: userName,
    email: userEmail,
    avatar: "/user.jpg",
  },
  navMain: [
    {
      title: "Initial",
      url: "#initial",
      icon: FileText,
      isActive: true,
      items: [],
    },
    {
      title: "Applicant",
      url: "",
      icon: ListTodo,
      isActive: false,
      items: [
        {
          title: "Applicant Information",
          url: "",
          icon: User,
        },
        {
          title: "Identification",
          url: "#work-experience",
          icon: Briefcase,
        },
        {
          title: "Employement",
          url: "#education",
          icon: GraduationCap,
        },
        {
          title: "School or Caregiver",
          url: "#documents",
          icon: Upload,
        },
        // {
        //   title: "Review & Submit",
        //   url: "#review-submit",
        //   icon: FileCheck,
        // },
      ],
    },
  ],
  projects: [],
};
