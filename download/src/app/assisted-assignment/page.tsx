
"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { AssistedAssignmentClientPage } from "@/components/assisted-assignment/AssistedAssignmentClientPage";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AssistedAssignmentPage() {
  const { currentUser, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!currentUser || currentUser.role !== "manager") {
        router.replace("/login"); // Or an unauthorized page
      }
    }
  }, [currentUser, isLoading, router]);

  if (isLoading || !currentUser || currentUser.role !== "manager") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Checking access...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Assisted Task Assignment"
        description="Leverage AI to suggest optimal due dates for tasks based on team workload and task priority."
      />
      <AssistedAssignmentClientPage />
    </div>
  );
}
