
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { AppLogo } from "@/components/layout/AppLogo";

export default function WelcomePage() {
  const { currentUser, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && currentUser) {
      if (currentUser.role === "manager") {
        router.replace("/dashboard/manager");
      } else {
        router.replace("/dashboard/employee");
      }
    }
  }, [currentUser, isLoading, router]);

  if (isLoading || currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading your experience...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center space-y-8">
      <AppLogo />
      <PageHeader
        title="Welcome to TaskPilot"
        description="Your ultimate solution for efficient task management and AI-assisted project coordination."
      />
      <div className="prose prose-lg dark:prose-invert">
        <p>
          Streamline your workflow, collaborate effectively, and achieve your project goals faster than ever.
        </p>
      </div>
      <Button asChild size="lg">
        <Link href="/login">Get Started - Login</Link>
      </Button>
    </div>
  );
}
