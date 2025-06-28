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
} from "./ui/sidebar";
import { FilesIcon, Image, LayoutDashboard } from "lucide-react";
import ContentSize from "./content-size";
import { cn } from "@/lib/utils";
import UploadModal from "./upload/upload-modal";

const SidebarNav = () => {
  const { state } = useSidebar();
  const [location] = useLocation();
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader
        className={cn("flex flex-row items-center justify-between", {
          "p-4": state !== "collapsed",
        })}
      >
        <h1
          className={cn("text-xl font-bold", {
            hidden: state === "collapsed",
            block: state !== "collapsed",
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
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === "/"}>
                  <Link to="/">
                    <LayoutDashboard />
                    Dashboard
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Content</SidebarGroupLabel>
          <UploadModal />
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === "/images"}>
                  <Link to="/images">
                    <Image />
                    Images
                  </Link>
                </SidebarMenuButton>
                {/* <SidebarMenuBadge>0</SidebarMenuBadge> */}
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === "/documents"}>
                  <Link to="/documents">
                    <FilesIcon />
                    Documents
                  </Link>
                </SidebarMenuButton>
                {/* <SidebarMenuBadge>0</SidebarMenuBadge> */}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>{state !== "collapsed" && <ContentSize />}</SidebarFooter>
    </Sidebar>
  );
};

export default SidebarNav;
