
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Loader2, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockUsers } from "@/lib/mock-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

export default function TeamManagementPage() {
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
        <p className="text-muted-foreground">Verifying access...</p>
      </div>
    );
  }

  const teamMembers = mockUsers.filter(user => user.role === 'employee');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Team"
        description="View and manage your team members."
        actions={
          <Button disabled> {/* Placeholder for future "Add Member" functionality */}
            <Users className="mr-2 h-4 w-4" /> Add New Member
          </Button>
        }
      />
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Current Team Members</CardTitle>
          <CardDescription>List of all employees in your team.</CardDescription>
        </CardHeader>
        <CardContent>
          {teamMembers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamMembers.map(member => (
                <Card key={member.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.avatarUrl} alt={member.name} data-ai-hint="team member avatar" />
                      <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                      <p className="text-xs text-muted-foreground">Workload: {member.currentWorkload || 0}%</p>
                    </div>
                  </CardContent>
                  {/* Add actions like Edit/Remove member later */}
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No team members found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
