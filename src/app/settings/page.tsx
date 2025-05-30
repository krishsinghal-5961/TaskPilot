
"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2, Cog } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  const { currentUser, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.replace("/login");
    }
  }, [currentUser, isLoading, router]);

  if (isLoading || !currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your application preferences and account settings."
      />
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cog className="h-6 w-6 text-primary" />
            Application Settings
          </CardTitle>
          <CardDescription>
            Customize your TaskPilot experience. More settings will be available soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-lg">Account Information</h3>
              <p className="text-muted-foreground">Name: {currentUser.name}</p>
              <p className="text-muted-foreground">Email: {currentUser.email}</p>
              <p className="text-muted-foreground">Role: {currentUser.role}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-lg">Theme Preferences</h3>
              <p className="text-muted-foreground">Theme settings (e.g., dark/light mode) will appear here.</p>
            </div>
             <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-lg">Notification Settings</h3>
              <p className="text-muted-foreground">Manage how you receive notifications.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
