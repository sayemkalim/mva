"use client";

import { BadgeCheck, ChevronsUpDown, LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { removeItem, getItem } from "@/utils/local_storage";
import { clearPermissions } from "@/utils/permissions";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";
import { BACKEND_URL } from "@/utils/url";

const fetchCurrentUser = async () => {
  const userId = getItem("userId");
  if (!userId) return null;

  const response = await apiService({
    endpoint: `${endpoints.showUser}/${userId}`,
    method: "GET",
  });
  return response?.response?.data || response?.response;
};

export function NavUser({ user }) {
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const onLogout = () => {
    removeItem("token");
    removeItem("userId");
    removeItem("userRole");
    clearPermissions();
    navigate("/login", { replace: true });
  };

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: fetchCurrentUser,
    staleTime: 1000 * 60 * 5, // 5 min
  });

  const getAvatarUrl = () => {
    if (currentUser?.profile_picture) {
      if (currentUser.profile_picture.startsWith("http")) {
        return currentUser.profile_picture;
      }
      const cleanPath = currentUser.profile_picture.replace(/\\/g, "/");
      return `${BACKEND_URL}/storage/${cleanPath}`;
    }
    return user.avatar;
  };

  const avatarUrl = getAvatarUrl();
  const userName = currentUser
    ? `${currentUser.first_name || ""} ${currentUser.last_name || ""}`.trim() ||
      user.name
    : user.name;
  const userEmail = currentUser?.email || user.email;
  const initials = currentUser
    ? `${currentUser.first_name?.[0] || ""}${currentUser.last_name?.[0] || ""}`.toUpperCase() ||
      "U"
    : "CN";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={avatarUrl}
                  alt={userName}
                  className="object-cover"
                />
                <AvatarFallback className="rounded-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{userName}</span>
                <span className="truncate text-xs">{userEmail}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={avatarUrl}
                    alt={userName}
                    className="object-cover"
                  />
                  <AvatarFallback className="rounded-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{userName}</span>
                  <span className="truncate text-xs">{userEmail}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => navigate("/dashboard/account")}>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
