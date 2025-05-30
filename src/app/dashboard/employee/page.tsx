
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ListChecks, CheckCircle } from "lucide-react";
import Link from "next/link";
import { mockTasks } from "@/lib/mock-data"; // Temporary for example
import { TaskStatusBadge, TaskPriorityBadge } from "@/components/tasks/TaskBadges";
import { format } from "date-fns";

export default function EmployeeDashboardPage() {
  const { currentUser, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!currentUser || currentUser.role !== "employee")) {
      router.replace("/login");
    }
  }, [currentUser, isLoading, router]);

  if (isLoading || !currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Filter tasks for the current employee - this will be improved later
  const myTasks = mockTasks.filter(task => task.assigneeId === currentUser.id);
  const myOpenTasks = myTasks.filter(task => task.status !== "done").length;
  const myCompletedTasks = myTasks.filter(task => task.status === "done").length;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="My Dashboard" 
        description={`Welcome back, ${currentUser.name}! Here are your tasks.`} 
        actions={<Button onClick={logout} variant="outline">Logout</Button>}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">My Open Tasks</CardTitle>
            <ListChecks className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{myOpenTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">Tasks assigned to you that are not yet completed.</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">My Completed Tasks</CardTitle>
            <CheckCircle className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{myCompletedTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">Tasks you have successfully completed.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>My Current Tasks</CardTitle>
          <CardDescription>A quick look at tasks assigned to you.</CardDescription>
        </CardHeader>
        <CardContent>
          {myTasks.length > 0 ? (
            <ul className="space-y-3">
              {myTasks.slice(0, 5).map(task => ( // Show first 5 tasks
                <li key={task.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <div>
                    <Link href={`/tasks/${task.id}`} className="font-medium text-primary hover:underline">{task.title}</Link>
                    <p className="text-xs text-muted-foreground">
                      Due: {task.dueDate ? format(new Date(task.dueDate), "MMM dd, yyyy") : "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <TaskStatusBadge status={task.status} />
                    <TaskPriorityBadge priority={task.priority} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">You have no tasks assigned to you currently.</p>
          )}
          <Button asChild variant="outline" size="sm" className="w-full mt-4">
            <Link href="/tasks">View All My Tasks</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
