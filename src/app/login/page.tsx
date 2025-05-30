
"use client";

import { LoginForm } from "@/components/auth/LoginForm";
import { AppLogo } from "@/components/layout/AppLogo";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const { currentUser, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && currentUser) {
      // User is already logged in, redirect them
      if (currentUser.role === "manager") {
        router.replace("/dashboard/manager");
      } else {
        router.replace("/dashboard/employee");
      }
    }
  }, [currentUser, isLoading, router]);

  if (isLoading || (!isLoading && currentUser)) {
    // Show loader while checking auth state or if redirecting
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-background to-secondary/30">
      <div className="mb-8">
        <AppLogo />
      </div>
      <LoginForm />
    </div>
  );
}
