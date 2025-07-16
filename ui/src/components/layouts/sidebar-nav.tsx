import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "../ui/sidebar";
import { FilesIcon, Image, LayoutDashboard, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import UserProfile from "@/modules/auth/UserProfile";
import ContentSize from "@/modules/content/content-size";
import UploadModal from "@/modules/content/upload/upload-modal";

interface NavigationItem {
  href: string;
  icon: React.ComponentType;
  label: string;
  tooltip: string;
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    href: "/",
    icon: LayoutDashboard,
    label: "Dashboard",
    tooltip: "Dashboard",
  },
];

const CONTENT_ITEMS: NavigationItem[] = [
  {
    href: "/images",
    icon: Image,
    label: "Images",
    tooltip: "Images",
  },
  {
    href: "/documents",
    icon: FilesIcon,
    label: "Documents",
    tooltip: "Documents",
  },
];

const ADMIN_ITEMS: NavigationItem[] = [
  {
    href: "/admin/user-management",
    icon: Users,
    label: "User Management",
    tooltip: "User Management",
  },
];

interface NavigationSectionProps {
  items: NavigationItem[];
  currentLocation: string;
}

const NavigationSection = ({
  items,
  currentLocation,
}: NavigationSectionProps) => (
  <SidebarMenu>
    {items.map(({ href, icon: Icon, label, tooltip }) => (
      <SidebarMenuItem key={href}>
        <SidebarMenuButton
          asChild
          isActive={currentLocation === href}
          tooltip={tooltip}
        >
          <Link to={href}>
            <Icon />
            {label}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ))}
  </SidebarMenu>
);

const SidebarNav = () => {
  const { state } = useSidebar();
  const [location] = useLocation();
  const { user } = useAuth();

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader
        className={cn("flex flex-row items-center justify-between", {
          "p-4": !isCollapsed,
        })}
      >
        <h1
          className={cn("text-xl font-bold", {
            hidden: isCollapsed,
            block: !isCollapsed,
          })}
        >
          Go-Fast CDN
        </h1>
        <SidebarTrigger />
      </SidebarHeader>

      <SidebarSeparator className="mx-0" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavigationSection
              items={NAVIGATION_ITEMS}
              currentLocation={location}
            />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Content</SidebarGroupLabel>
          <UploadModal />
          <SidebarGroupContent>
            <NavigationSection
              items={CONTENT_ITEMS}
              currentLocation={location}
            />
          </SidebarGroupContent>
        </SidebarGroup>

        {user?.role === "admin" && (
          <SidebarGroup>
            <SidebarGroupLabel>Master Data</SidebarGroupLabel>
            <SidebarGroupContent>
              <NavigationSection
                items={ADMIN_ITEMS}
                currentLocation={location}
              />
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        {!isCollapsed && <ContentSize />}
        <UserProfile />
      </SidebarFooter>
    </Sidebar>
  );
};

export default SidebarNav;
