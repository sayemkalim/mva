import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar";
import { PlusSquare } from "lucide-react";
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
import { useLocation, useParams, useNavigate } from "react-router-dom";

export function AppSidebar({ ...props }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { slug, id } = useParams();
  const [permissions, setPermissions] = useState([]);
  const [activeSection, setActiveSection] = useState("Initial");

  const isEditMode = useMemo(() => {
    return EDIT_MODE_PATHS.some((path) => location.pathname.includes(path));
  }, [location.pathname]);

  // Persist file slug to localStorage when available
  const routeParam = useMemo(() => {
    // If we have a slug from URL params, use it and save to localStorage
    if (slug) {
      localStorage.setItem("currentFileSlug", slug);
      return slug;
    }
    // If we have an id but no slug, try to get slug from localStorage
    if (id && isEditMode) {
      const savedSlug = localStorage.getItem("currentFileSlug");
      return savedSlug || id;
    }
    return id;
  }, [slug, id, isEditMode]);

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
  const filteredNavMain = useMemo(() => {
    const filtered = filterItemsByPermissions(sidebarData.navMain, permissions);

    // If "Dashboard" exists, inject "Add Matter" right after it
    if (permissions.includes("workstation") && filtered.length > 0 && filtered[0].title === "Dashboard") {
      const addMatterItem = {
        title: "Add Matter",
        url: "/dashboard/workstation/add",
        icon: PlusSquare,
        isActive: location.pathname === "/dashboard/workstation/add",
        items: [],
      };
      return [filtered[0], addMatterItem, ...filtered.slice(1)];
    }

    return filtered;
  }, [sidebarData.navMain, permissions, location.pathname]);

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
