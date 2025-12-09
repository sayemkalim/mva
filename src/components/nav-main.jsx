import { ChevronRight, Circle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
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
function RecursiveMenuItems({ items, depth = 1 }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      {items.map((subItem) => {
        const hasChildren = subItem.items && subItem.items.length > 0;
        const isActive = location.pathname === subItem.url;
        const hasActiveDescendant = subItem.items?.some(
          (child) => location.pathname === child.url
        );

        if (hasChildren) {
          return (
            <Collapsible
              key={subItem.title}
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
          <SidebarMenuSubItem key={subItem.title}>
            <SidebarMenuSubButton
              asChild
              isActive={isActive}
              className="text-xs"
            >
              <a
                onClick={(e) => {
                  e.preventDefault();
                  navigate(subItem.url);
                }}
                className="cursor-pointer flex items-center gap-2 pl-2"
              >
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
        {items.map((item) => {
          const hasChildren = item.items && item.items.length > 0;
          const isActive = location.pathname === item.url;
          const hasActiveDescendant = hasActiveChild(item.items);

          if (hasChildren) {
            return (
              <Collapsible
                key={item.title}
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
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                onClick={() => navigate(item.url)}
                isActive={isActive}
                className="text-sm"
              >
                {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
                <span className="truncate">{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
