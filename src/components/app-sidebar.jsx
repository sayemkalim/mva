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
import { filterItemsByPermissions } from "@/utils/sidebar/filterItemsByRole";
import { getPermissions } from "@/utils/permissions";
import { useEffect, useState, useMemo } from "react";
import { getItem } from "@/utils/local_storage";
import { useLocation, useParams } from "react-router-dom";

export function AppSidebar({ ...props }) {
  const location = useLocation();
  const { slug, id } = useParams();
  const [permissions, setPermissions] = useState([]);
  const [activeSection, setActiveSection] = useState("Initial");

  const isEditMode = useMemo(() => {
    return EDIT_MODE_PATHS.some((path) => location.pathname.includes(path));
  }, [location.pathname]);

  const routeParam = slug || id;

  // Load permissions from localStorage
  useEffect(() => {
    const userPermissions = getPermissions();
    setPermissions(userPermissions);

    // Listen for permission updates
    const handlePermissionsUpdated = (event) => {
      const { permissions: newPermissions } = event.detail;
      setPermissions(newPermissions);
    };

    window.addEventListener("permissionsUpdated", handlePermissionsUpdated);

    return () => {
      window.removeEventListener("permissionsUpdated", handlePermissionsUpdated);
    };
  }, []);

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
  const filteredNavMain = filterItemsByPermissions(
    sidebarData.navMain,
    permissions
  );

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
