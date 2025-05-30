import { AppLogo } from "@/components/layout/AppLogo";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { UserMenu } from "@/components/layout/UserMenu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-4 shadow-sm backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <SidebarTrigger />
      </div>
      <div className="hidden md:block">
        <Link href="/">
          <AppLogo />
        </Link>
      </div>
      
      <div className="flex flex-1 items-center justify-end gap-2 sm:gap-4">
        {/* Add search or other actions here if needed */}
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}
