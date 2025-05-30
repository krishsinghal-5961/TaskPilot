
"use client";

import type { ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Header } from "@/components/layout/Header";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { currentUser, isLoading } = useAuth();
  const pathname = usePathname();

  // Determine if sidebar should be shown. Hide on login page and initial welcome page if not logged in.
  const showNav = !isLoading && (!!currentUser || (pathname !== "/" && pathname !== "/login"));
  const isAuthPage = pathname === "/login";
  const isWelcomePage = pathname === "/" && !currentUser && !isLoading;


  if (isAuthPage || isWelcomePage) {
     return (
        <>
          <main className="flex-1"> {/* No padding for full-page auth/welcome */}
            {children}
          </main>
          <Toaster />
        </>
     );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      {showNav && <SidebarNav />}
      <SidebarInset>
        {showNav && <Header />}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">
          {children}
        </main>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
}
