import { ChevronRight, Loader2, ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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
import { cn } from "@/lib/utils";

// Recursive component for nested menu item
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

  // Map of sidebar URLs to their related add/edit paths
  const relatedPaths = {
    "/lat": ["/dashboard/lat/add/", "/dashboard/lat/edit/"],
    "/section-33-list": ["/dashboard/section/add/", "/dashboard/section/"],
    "/section-258-list": [
      "/dashboard/section258/add/",
      "/dashboard/section258/",
    ],
    "/medical-centre": [
      "/dashboard/medical-centre/add/",
      "/dashboard/medical-centre/edit/",
    ],
    "/insurance": [
      "/dashboard/insurance-ownership/add/",
      "/dashboard/insurance-ownership/edit/",
    ],
    "/police-report": [
      "/dashboard/police-report/add/",
      "/dashboard/police-report/edit/",
    ],
    "/accounting": [
      "/dashboard/accounting/add/",
      "/dashboard/accounting/edit/",
    ],
    "/medical-report": [
      "/dashboard/medical-report/add/",
      "/dashboard/medical-report/edit/",
    ],
    "/client-correspondence": [
      "/dashboard/client-correspondence/add/",
      "/dashboard/client-correspondence/edit/",
    ],
    "/insurance-examination": [
      "/dashboard/insurance-examination/add/",
      "/dashboard/insurance-examnation/edit/",
    ],
    "/vsr-insurance-examination": [
      "/dashboard/vsr-insurance-examination/add/",
      "/dashboard/vsr-insurance-examination/edit/",
    ],
    "/cost-hard": ["/dashboard/cost-hard/add/", "/dashboard/cost-hard/edit/"],
    "/cost-soft": ["/dashboard/cost-soft/add/", "/dashboard/cost-soft/edit/"],
    "/cost-timecard": [
      "/dashboard/cost-timecard/add/",
      "/dashboard/cost-timecard/edit/",
    ],
    "/psychological": [
      "/dashboard/psychological/add/",
      "/dashboard/psychological/edit/",
    ],
    "/mva-production": [
      "/dashboard/mva-production/add/",
      "/dashboard/mva-production/edit/",
    ],
    "/soc-production": [
      "/dashboard/soc-prod/add/",
      "/dashboard/soc-prod/edit/",
    ],
    "/ocf1-production": [
      "/dashboard/ocf1-prod/add/",
      "/dashboard/ocf1-prod/edit/",
    ],
    "/ocf2-production": [
      "/dashboard/ocf2-prod/add/",
      "/dashboard/ocf2-prod/edit/",
    ],
    "/ocf5-production": [
      "/dashboard/ocf5-prod/add/",
      "/dashboard/ocf5-prod/edit/",
    ],
    "/ocf6-production": [
      "/dashboard/ocf6-prod/add/",
      "/dashboard/ocf6-prod/edit/",
    ],
    "/ocf10-production": [
      "/dashboard/ocf10-prod/add/",
      "/dashboard/ocf10-prod/edit/",
    ],
    "/conflict": [
      "/dashboard/conflict/add/",
      "/dashboard/conflict-search/edit/",
    ],
    "/client": ["/dashboard/client/add", "/dashboard/client/edit/"],
    "/task": ["/dashboard/task/add/", "/dashboard/task/edit/"],
  };

  const isItemActive = (url) => {
    if (!url) return false;
    if (location.pathname === url) return true;

    // Check if current path starts with the item url (for nested routes)
    if (url && location.pathname.startsWith(url)) return true;

    // Check related paths mapping
    for (const [key, paths] of Object.entries(relatedPaths)) {
      if (url.includes(key)) {
        if (paths.some((path) => location.pathname.includes(path))) {
          return true;
        }
      }
    }

    // Generic check: extract the base path and check for add/edit variations
    if (url) {
      const urlParts = url.split("/").filter(Boolean);
      const lastPart = urlParts[urlParts.length - 1];
      if (lastPart && lastPart !== "edit" && lastPart !== "add") {
        // Check if current path contains this segment in an add/edit context
        if (
          location.pathname.includes(`/${lastPart}/add`) ||
          location.pathname.includes(`/${lastPart}/edit`)
        ) {
          return true;
        }
      }
    }

    return false;
  };

  return (
    <>
      {items.map((subItem, index) => {
        const itemId = `${subItem.title}-${index}-${depth}`;
        const hasChildren = subItem.items && subItem.items.length > 0;
        const isActive = isItemActive(subItem.url);
        const isLoading = loadingId === itemId;

        // Recursive check for any active descendant
        const checkActiveDescendant = (items) => {
          if (!items || items.length === 0) return false;
          return items.some((child) => {
            if (isItemActive(child.url)) return true;
            if (child.items) return checkActiveDescendant(child.items);
            return false;
          });
        };
        const hasActiveDescendant = checkActiveDescendant(subItem.items);

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
                  <SidebarMenuSubButton
                    className="text-xs"
                    isActive={hasActiveDescendant}
                  >
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

// children panel that renders to the right of the sidebar
function ChildrenPanel({ item, onClose }) {
  const panelRef = useRef(null);

  // Shift main content when panel opens
  useEffect(() => {
    const mainContent = document.querySelector('[data-slot="sidebar-inset"]');
    if (mainContent) {
      mainContent.style.transition = "margin-left 0.2s ease";
      mainContent.style.marginLeft = "12rem";
    }
    return () => {
      if (mainContent) {
        mainContent.style.marginLeft = "";
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        const sidebar = document.querySelector('[data-slot="sidebar"]');
        if (sidebar && sidebar.contains(e.target)) return;
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const sidebarContainer = document.querySelector(
    '[data-slot="sidebar-container"]',
  );
  if (!sidebarContainer) return null;
  const sidebarRect = sidebarContainer.getBoundingClientRect();

  return createPortal(
    <div
      ref={panelRef}
      className="fixed inset-y-0 z-[15] flex flex-col border-r border-sidebar-border shadow-lg bg-[#a8dfc5] dark:bg-sidebar"
      style={{ left: `${sidebarRect.right}px`, width: "12rem" }}
    >
      <div className="flex items-center gap-3 px-2 py-4 border-b border-sidebar-border bg-green-500 dark:bg-sidebar-primary">
        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-sidebar-accent transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-sidebar-foreground" />
        </button>
        <span className="text-base font-semibold text-sidebar-primary-foreground truncate">
          {item.title}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 [&::-webkit-scrollbar]:hidden bg-[#a8dfc5] dark:bg-sidebar">
        <SidebarMenuSub className="ml-0 pl-3 mr-1 border-l-0">
          <RecursiveMenuItems items={item.items} depth={1} />
        </SidebarMenuSub>
      </div>
    </div>,
    document.body,
  );
}

export function NavMain({ items, showHeader = false, header }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [loadingId, setLoadingId] = useState(null);
  const [expandedItem, setExpandedItem] = useState(null); // track which parent's panel is open

  const handleItemClick = async (e, url, title, itemId) => {
    if (!url) return;

    e.preventDefault();

    if (isApiUrl(url)) {
      setLoadingId(itemId);
      await handleFileDownload(url, title);
      setLoadingId(null);
    } else {
      navigate(url);
    }
  };
  // Map of sidebar URLs to their related add/edit paths (same as RecursiveMenuItems)
  const relatedPaths = {
    "/lat": ["/dashboard/lat/add/", "/dashboard/lat/edit/"],
    "/section-33-list": ["/dashboard/section/add/", "/dashboard/section/"],
    "/section-258-list": [
      "/dashboard/section258/add/",
      "/dashboard/section258/",
    ],
    "/medical-centre": [
      "/dashboard/medical-centre/add/",
      "/dashboard/medical-centre/edit/",
    ],
    "/insurance": [
      "/dashboard/insurance-ownership/add/",
      "/dashboard/insurance-ownership/edit/",
    ],
    "/police-report": [
      "/dashboard/police-report/add/",
      "/dashboard/police-report/edit/",
    ],
    "/accounting": [
      "/dashboard/accounting/add/",
      "/dashboard/accounting/edit/",
    ],
    "/medical-report": [
      "/dashboard/medical-report/add/",
      "/dashboard/medical-report/edit/",
    ],
    "/client-correspondence": [
      "/dashboard/client-correspondence/add/",
      "/dashboard/client-correspondence/edit/",
    ],
    "/insurance-examination": [
      "/dashboard/insurance-examination/add/",
      "/dashboard/insurance-examnation/edit/",
    ],
    "/vsr-insurance-examination": [
      "/dashboard/vsr-insurance-examination/add/",
      "/dashboard/vsr-insurance-examination/edit/",
    ],
    "/cost-hard": ["/dashboard/cost-hard/add/", "/dashboard/cost-hard/edit/"],
    "/cost-soft": ["/dashboard/cost-soft/add/", "/dashboard/cost-soft/edit/"],
    "/cost-timecard": [
      "/dashboard/cost-timecard/add/",
      "/dashboard/cost-timecard/edit/",
    ],
    "/psychological": [
      "/dashboard/psychological/add/",
      "/dashboard/psychological/edit/",
    ],
    "/mva-production": [
      "/dashboard/mva-production/add/",
      "/dashboard/mva-production/edit/",
    ],
    "/soc-production": [
      "/dashboard/soc-prod/add/",
      "/dashboard/soc-prod/edit/",
    ],
    "/ocf1-production": [
      "/dashboard/ocf1-prod/add/",
      "/dashboard/ocf1-prod/edit/",
    ],
    "/ocf2-production": [
      "/dashboard/ocf2-prod/add/",
      "/dashboard/ocf2-prod/edit/",
    ],
    "/ocf5-production": [
      "/dashboard/ocf5-prod/add/",
      "/dashboard/ocf5-prod/edit/",
    ],
    "/ocf6-production": [
      "/dashboard/ocf6-prod/add/",
      "/dashboard/ocf6-prod/edit/",
    ],
    "/ocf10-production": [
      "/dashboard/ocf10-prod/add/",
      "/dashboard/ocf10-prod/edit/",
    ],
    "/conflict": [
      "/dashboard/conflict/add/",
      "/dashboard/conflict-search/edit/",
    ],
    "/client": ["/dashboard/client/add", "/dashboard/client/edit/"],
    "/task": ["/dashboard/task/add/", "/dashboard/task/edit/"],
  };

  const isUrlActive = (url) => {
    if (!url) return false;
    if (location.pathname === url) return true;

    // Check if current path starts with the item url (for nested routes)
    if (url && location.pathname.startsWith(url)) return true;

    // Check related paths mapping
    for (const [key, paths] of Object.entries(relatedPaths)) {
      if (url.includes(key)) {
        if (paths.some((path) => location.pathname.includes(path))) {
          return true;
        }
      }
    }

    // Generic check: extract the base path and check for add/edit variations
    if (url) {
      const urlParts = url.split("/").filter(Boolean);
      const lastPart = urlParts[urlParts.length - 1];
      if (lastPart && lastPart !== "edit" && lastPart !== "add") {
        // Check if current path contains this segment in an add/edit context
        if (
          location.pathname.includes(`/${lastPart}/add`) ||
          location.pathname.includes(`/${lastPart}/edit`)
        ) {
          return true;
        }
      }
    }

    return false;
  };

  const hasActiveChild = (items) => {
    if (!items || items.length === 0) return false;
    return items.some((item) => {
      if (isUrlActive(item.url)) return true;
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
          const isPanelOpen = expandedItem?.title === item.title;

          if (hasChildren) {
            return (
              <SidebarMenuItem key={itemId}>
                <SidebarMenuButton
                  tooltip={item.title}
                  className="text-sm cursor-pointer"
                  isActive={hasActiveDescendant || isPanelOpen}
                  onClick={() => setExpandedItem(isPanelOpen ? null : item)}
                >
                  {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
                  <span className="truncate">{item.title}</span>
                  <ChevronRight
                    className={cn(
                      "ml-auto h-4 w-4 shrink-0 transition-transform duration-200",
                      isPanelOpen && "rotate-90",
                    )}
                  />
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          return (
            <SidebarMenuItem key={itemId}>
              <SidebarMenuButton
                tooltip={item.title}
                onClick={(e) => {
                  setExpandedItem(null);
                  handleItemClick(e, item.url, item.title, itemId);
                }}
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

      {/* Full-height children panel to the right */}
      {expandedItem && (
        <ChildrenPanel
          item={expandedItem}
          onClose={() => setExpandedItem(null)}
        />
      )}
    </SidebarGroup>
  );
}
