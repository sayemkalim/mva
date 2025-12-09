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
import {
  data,
  getEditModeData,
  EDIT_MODE_PATHS,
} from "@/utils/sidebar/sidebarData";
import { filterItemsByRole } from "@/utils/sidebar/filterItemsByRole";
import { useEffect, useState, useMemo } from "react";
import { getItem } from "@/utils/local_storage";
import { useLocation, useParams } from "react-router-dom";

export function AppSidebar({ ...props }) {
  const location = useLocation();
  const { slug, id } = useParams();
  const [role, setRole] = useState(null);
  const [activeSection, setActiveSection] = useState("Initial");

  const isEditMode = useMemo(() => {
    return EDIT_MODE_PATHS.some((path) => location.pathname.includes(path));
  }, [location.pathname]);

  const routeParam = slug || id;

  useEffect(() => {
    if (isEditMode) {
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
  }, [location.hash, isEditMode]);

  const sidebarData = useMemo(() => {
    if (isEditMode && routeParam) {
      const editData = getEditModeData(routeParam);
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
  }, [isEditMode, activeSection, routeParam]);

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
