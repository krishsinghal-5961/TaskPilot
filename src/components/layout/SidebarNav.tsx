
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListChecks,
  Wand2,
  Bell,
  Settings,
  Users,
  LogIn,
  Loader2,
  MessageSquare, // Added Chat Icon
} from "lucide-react";
import { AppLogo } from "@/components/layout/AppLogo";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";

export function SidebarNav() {
  const pathname = usePathname();
  const { open } = useSidebar();
  const { currentUser, isLoading } = useAuth();

  const commonNavItems = [
    { href: "/tasks", label: "Tasks", icon: ListChecks, roles: ["manager", "employee"] },
    { href: "/chat", label: "Chat", icon: MessageSquare, roles: ["manager", "employee"] }, // Added Chat Link
    { href: "/notifications", label: "Notifications", icon: Bell, roles: ["manager", "employee"] },
  ];

  const managerNavItems = [
    { href: "/dashboard/manager", label: "Dashboard", icon: LayoutDashboard, roles: ["manager"] },
    { href: "/assisted-assignment", label: "Assisted Assignment", icon: Wand2, roles: ["manager"] },
    { href: "/team", label: "Manage Team", icon: Users, roles: ["manager"] },
  ];

  const employeeNavItems = [
    { href: "/dashboard/employee", label: "My Dashboard", icon: LayoutDashboard, roles: ["employee"] },
  ];
  
  let navItems = [];
  if (currentUser) {
    if (currentUser.role === "manager") {
      navItems = [...managerNavItems, ...commonNavItems.filter(item => item.roles.includes("manager"))];
    } else {
      navItems = [...employeeNavItems, ...commonNavItems.filter(item => item.roles.includes("employee"))];
    }
    // Sort common items to be after role-specific items, if desired, or maintain order
    // For now, keeping manager items first, then common.
  }


  const bottomNavItems = [
    { href: "/settings", label: "Settings", icon: Settings, roles: ["manager", "employee"] },
  ];
  
  const filteredBottomNavItems = currentUser ? bottomNavItems.filter(item => item.roles.includes(currentUser.role)) : [];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <Link href="/" className="flex items-center gap-2 py-1">
         { open ? <AppLogo /> : <LayoutDashboard className="h-7 w-7 text-primary" />}
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex-1 p-2">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : currentUser ? (
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))}
                    tooltip={{ children: item.label, className: "capitalize"}}
                  >
                    <a>
                      <item.icon />
                      <span>{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/login" legacyBehavior passHref>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/login"}
                  tooltip={{ children: "Login", className: "capitalize"}}
                >
                  <a>
                    <LogIn />
                    <span>Login</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarContent>
      {currentUser && filteredBottomNavItems.length > 0 && (
        <>
          <Separator />
          <SidebarFooter className="p-2">
            <SidebarMenu>
              {filteredBottomNavItems.map((item) => (
                 <SidebarMenuItem key={item.href}>
                 <Link href={item.href} legacyBehavior passHref>
                   <SidebarMenuButton
                     asChild
                     isActive={pathname === item.href}
                     tooltip={{ children: item.label, className: "capitalize"}}
                   >
                     <a>
                       <item.icon />
                       <span>{item.label}</span>
                     </a>
                   </SidebarMenuButton>
                 </Link>
               </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarFooter>
        </>
      )}
    </Sidebar>
  );
}
