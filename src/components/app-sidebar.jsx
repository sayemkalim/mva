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
import { data, editModeData } from "@/utils/sidebar/sidebarData";
import { filterItemsByRole } from "@/utils/sidebar/filterItemsByRole";
import { useEffect, useState } from "react";
import { getItem } from "@/utils/local_storage";
import { useLocation } from "react-router-dom";

export function AppSidebar({ ...props }) {
  const location = useLocation();
  const [role, setRole] = useState(null);

  useEffect(() => {
    const storedRole = getItem("userRole");
    if (storedRole === "super_admin" || storedRole === "admin") {
      setRole(storedRole);
    }
  }, []);
  const isEditPage = location.pathname.includes("/dashboard/workstation/edit/");
  const sidebarData = isEditPage ? editModeData : data;

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
