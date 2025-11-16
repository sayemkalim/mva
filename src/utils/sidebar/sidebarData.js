import {
  ContactIcon,
  FileText,
  LayoutDashboard,
  CheckSquare,
  PlusSquare,
  ListTodo,
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
      items: [
        {
          title: "Intial",
          name: "Intial",
          url: "/dashboard/workstation",
        },
        {
          title: "Applicant",
          name: "All Tasks",
          url: "/dashboard/tasks/all",
        },
      ],
    },
    // {
    //   title: "Admin",
    //   url: "/dashboard/admins",
    //   icon: Users2,
    //   isActive: true,
    //   items: [],
    //   roles: ["super_admin"],
    // },
  ],

  projects: [
    // {
    //   title: "Contact us form",
    //   name: "Contact us form",
    //   url: "/dashboard/contact-us",
    //   icon: ContactIcon,
    //   roles: ["super_admin", "admin"],
    // },
    // {
    //   title: "Info & Policy",
    //   name: "Info & Policy",
    //   url: "/dashboard/info-policy",
    //   icon: BadgeInfo,
    //   roles: ["super_admin", "admin"],
    //   items: [
    //     {
    //       title: "Terms & Conditions",
    //       name: "Terms & Conditions",
    //       url: "/dashboard/info-policy/terms-conditions",
    //     },
    //     {
    //       title: "Privacy Policy",
    //       name: "Privacy Policy",
    //       url: "/dashboard/info-policy/privacy-policy",
    //     },
    //     {
    //       title: "FAQ",
    //       name: "FAQ",
    //       url: "/dashboard/info-policy/faq",
    //     },
    //   ],
    // },
    // {
    //   title: "Testimonial",
    //   name: "Testimonial",
    //   url: "/dashboard/testimonials",
    //   icon: MessageSquarePlus,
    //   roles: ["super_admin", "admin"],
    // },
  ],
};
