
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Loader2 } from "lucide-react";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { AlertTriangle, CheckCircle2, ListTodo, Users, PackageOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { TaskPriorityBadge, TaskStatusBadge } from "@/components/tasks/TaskBadges";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { mockTasks, mockUsers } from "@/lib/mock-data"; // Using mock data
import type { Task, UserProfile } from "@/types";

export default function ManagerDashboardPage() {
  const { currentUser, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<UserProfile[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!currentUser || currentUser.role !== "manager") {
        router.replace("/login");
      } else {
        // Load mock data when user is confirmed as manager
        setTasks([...mockTasks]);
        setTeamMembers([...mockUsers]);
        setIsDataLoading(false);
      }
    }
  }, [currentUser, authLoading, router]);

  const dashboardStats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === "done").length;
    const overdueTasks = tasks.filter(task => task.dueDate && parseISO(task.dueDate) < new Date() && task.status !== "done").length;
    const highPriorityTasks = tasks.filter(task => task.priority === "high" && task.status !== "done").length;
    return { totalTasks, completedTasks, overdueTasks, highPriorityTasks };
  }, [tasks]);

  const recentTasks = useMemo(() => 
    [...tasks]
    .sort((a, b) => parseISO(b.updatedAt).getTime() - parseISO(a.updatedAt).getTime())
    .slice(0, 5), 
  [tasks]);
  
  const getUserById = (id?: string | null) => teamMembers.find(user => user.uid === id);

  if (authLoading || isDataLoading || !currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Manager Dashboard" 
        description={`Welcome, ${currentUser.name}! Overview of project tasks and team performance.`}
        actions={<Button onClick={logout} variant="outline">Logout</Button>} 
      />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard title="Total Tasks" value={dashboardStats.totalTasks} icon={PackageOpen} footerText="Across all projects" />
        <SummaryCard title="Completed Tasks" value={dashboardStats.completedTasks} icon={CheckCircle2} footerText={`${dashboardStats.totalTasks > 0 ? Math.round((dashboardStats.completedTasks/dashboardStats.totalTasks)*100) : 0}% completion`} />
        <SummaryCard title="Overdue Tasks" value={dashboardStats.overdueTasks} icon={AlertTriangle} changeType={dashboardStats.overdueTasks > 0 ? "negative" : undefined} />
        <SummaryCard title="High Priority Active" value={dashboardStats.highPriorityTasks} icon={ListTodo} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link href="/tasks">View All Tasks</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentTasks.length > 0 ? (
              <ul className="space-y-4">
                {recentTasks.map(task => {
                  const assignee = getUserById(task.assigneeId);
                  return (
                    <li key={task.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                      <div>
                        <Link href={`/tasks/${task.id}`} className="font-medium text-primary hover:underline">{task.title}</Link>
                        <p className="text-xs text-muted-foreground">
                          Due: {task.dueDate ? format(parseISO(task.dueDate), "MMM dd, yyyy") : "N/A"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <TaskStatusBadge status={task.status} />
                        <TaskPriorityBadge priority={task.priority} />
                        {assignee && (
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={assignee.avatarUrl} alt={assignee.name} data-ai-hint="user avatar"/>
                            <AvatarFallback>{getInitials(assignee.name)}</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-muted-foreground">No recent task activity.</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Team Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
             {teamMembers.filter(u => u.role === 'employee').slice(0,4).map(user => ( 
              <div key={user.uid} className="flex items-center gap-3 p-2 bg-secondary/30 rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="team member avatar" />
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.name}</p>
                  {user.designation && <p className="text-xs text-muted-foreground">{user.designation}</p>}
                  <p className="text-xs text-muted-foreground">Workload: {user.currentWorkload || 0}%</p>
                </div>
              </div>
            ))}
             <Button asChild variant="outline" size="sm" className="w-full mt-2">
              <Link href="/team">Manage Team</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
