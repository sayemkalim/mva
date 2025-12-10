import { ChevronRight, Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { handleFileDownload, isApiUrl } from "@/utils/sidebar/sidebarData";

// Recursive component for nested menu items
function RecursiveMenuItems({ items, depth = 1 }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [loadingId, setLoadingId] = useState(null);

  // Handle click for both navigation and download
  const handleItemClick = async (e, url, title, itemId) => {
    if (!url) return;

    e.preventDefault();
    e.stopPropagation();

    if (isApiUrl(url)) {
      // It's an API endpoint - download the file
      setLoadingId(itemId);
      await handleFileDownload(url, title);
      setLoadingId(null);
    } else {
      // Regular navigation
      navigate(url);
    }
  };

  return (
    <>
      {items.map((subItem, index) => {
        const itemId = `${subItem.title}-${index}-${depth}`;
        const hasChildren = subItem.items && subItem.items.length > 0;
        const isActive = location.pathname === subItem.url;
        const isLoading = loadingId === itemId;
        const hasActiveDescendant = subItem.items?.some(
          (child) => location.pathname === child.url
        );

        if (hasChildren) {
          return (
            <Collapsible
              key={itemId}
              asChild
              defaultOpen={hasActiveDescendant}
              className="group/collapsible"
            >
              <SidebarMenuSubItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuSubButton className="text-xs">
                    {subItem.icon && (
                      <subItem.icon className="h-3.5 w-3.5 shrink-0" />
                    )}
                    <span className="truncate">{subItem.title}</span>
                    <ChevronRight className="ml-auto h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuSubButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub className="ml-0 pl-4 border-l-2 border-sidebar-border">
                    <RecursiveMenuItems
                      items={subItem.items}
                      depth={depth + 1}
                    />
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuSubItem>
            </Collapsible>
          );
        }

        return (
          <SidebarMenuSubItem key={itemId}>
            <SidebarMenuSubButton
              asChild
              isActive={isActive}
              className="text-xs"
              disabled={isLoading}
            >
              <a
                href={subItem.url || "#"}
                onClick={(e) =>
                  handleItemClick(e, subItem.url, subItem.title, itemId)
                }
                className="cursor-pointer flex items-center gap-2 pl-2"
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : null}
                <span className="truncate">{subItem.title}</span>
              </a>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        );
      })}
    </>
  );
}

export function NavMain({ items, showHeader = false, header }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [loadingId, setLoadingId] = useState(null);

  // Handle click for top-level items
  const handleItemClick = async (e, url, title, itemId) => {
    if (!url) return;

    e.preventDefault();

    if (isApiUrl(url)) {
      // It's an API endpoint - download the file
      setLoadingId(itemId);
      await handleFileDownload(url, title);
      setLoadingId(null);
    } else {
      // Regular navigation
      navigate(url);
    }
  };

  // Check if any child is active
  const hasActiveChild = (items) => {
    if (!items || items.length === 0) return false;
    return items.some((item) => {
      if (item.url === location.pathname) return true;
      if (item.items) return hasActiveChild(item.items);
      return false;
    });
  };

  return (
    <SidebarGroup>
      {showHeader && <SidebarGroupLabel>{header}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item, index) => {
          const itemId = `${item.title}-${index}`;
          const hasChildren = item.items && item.items.length > 0;
          const isActive = location.pathname === item.url;
          const isLoading = loadingId === itemId;
          const hasActiveDescendant = hasActiveChild(item.items);

          if (hasChildren) {
            return (
              <Collapsible
                key={itemId}
                asChild
                defaultOpen={hasActiveDescendant || item.isActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title} className="text-sm">
                      {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
                      <span className="truncate">{item.title}</span>
                      <ChevronRight className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="ml-0 pl-6 border-l-2 border-sidebar-border mr-2">
                      <RecursiveMenuItems items={item.items} depth={1} />
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          }

          return (
            <SidebarMenuItem key={itemId}>
              <SidebarMenuButton
                tooltip={item.title}
                onClick={(e) =>
                  handleItemClick(e, item.url, item.title, itemId)
                }
                isActive={isActive}
                className="text-sm cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                ) : (
                  item.icon && <item.icon className="h-4 w-4 shrink-0" />
                )}
                <span className="truncate">{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
