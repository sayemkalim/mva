import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Input } from "./ui/input";
import { data, getEditModeData } from "@/utils/sidebar/sidebarData";
import { filterItemsByRole } from "@/utils/sidebar/filterItemsByRole";
import { useEffect, useState, useMemo } from "react";
import { getItem } from "@/utils/local_storage";
import { useLocation, useParams } from "react-router-dom";

export function AppSidebar({ ...props }) {
  const location = useLocation();
  const { slug } = useParams();
  const [role, setRole] = useState(null);
  const [activeSection, setActiveSection] = useState("Initial");

  // useEffect(() => {
  //   const storedRole = getItem("userRole");
  //   if (storedRole === "super_admin" || storedRole === "admin") {
  //     setRole(storedRole);
  //   }
  // }, []);

  const isEditPage = location.pathname.includes("/dashboard/workstation/edit/");
  useEffect(() => {
    if (isEditPage) {
      const hash = location.hash;
      if (hash === "#work-experience") {
        setActiveSection("Identification");
      } else if (hash === "#education") {
        setActiveSection("Employement");
      } else if (hash === "#documents") {
        setActiveSection("School or Caregiver");
      } else {
        setActiveSection("Initial");
      }
    }
  }, [location.hash, isEditPage]);
  const sidebarData = useMemo(() => {
    if (isEditPage && slug) {
      const editData = getEditModeData(slug);
      const modifiedEditData = {
        ...editData,
        navMain: editData.navMain.map((item) => ({
          ...item,
          isActive: item.title === activeSection,
          items: item.items?.map((subItem) => ({
            ...subItem,
            isActive: subItem.title === activeSection,
          })),
        })),
      };
      return modifiedEditData;
    }
    return data;
  }, [isEditPage, activeSection, slug]);
  const userInfo = sidebarData.user;
  const filteredNavMain = filterItemsByRole(sidebarData.navMain, role);
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent className="overflow-y-auto [&::-webkit-scrollbar]:hidden">
        <NavMain items={filteredNavMain} showHeader={false} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userInfo} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
