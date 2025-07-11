import React from "react";
import { useAuth } from "../../../contexts/AuthContext";
import {
  LogOut,
  User as UserIcon,
  Settings as SettingsIcon,
  ChevronUp,
} from "lucide-react";
import { Link } from "wouter";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../../ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { cn } from "@/lib/utils";

const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const { state } = useSidebar();

  if (!user) return null;
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full">
            <SidebarMenuButton className="h-auto gap-2.5" tooltip="Profile">
              {state === "collapsed" ? (
                <UserIcon />
              ) : (
                <div
                  className={cn(
                    "rounded-full flex items-center justify-center",
                    {
                      "size-8 bg-blue-600": state === "expanded",
                    }
                  )}
                >
                  <UserIcon
                    className={cn({
                      "text-white": state === "expanded",
                    })}
                    size={18}
                  />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.email}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user.role} </p>
              </div>
              <ChevronUp className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side={state === "collapsed" ? "right" : "top"}
            align="end"
            className="w-[--radix-popper-anchor-width]"
          >
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <SettingsIcon />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default UserProfile;
