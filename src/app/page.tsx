import { PageHeader } from "@/components/shared/PageHeader";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { mockTasks, mockUsers } from "@/lib/mock-data";
import { AlertTriangle, CheckCircle2, ListTodo, Users, PackageOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { TaskPriorityBadge, TaskStatusBadge } from "@/components/tasks/TaskBadges";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { format } from "date-fns";

export default function DashboardPage() {
  const totalTasks = mockTasks.length;
  const completedTasks = mockTasks.filter(task => task.status === "done").length;
  const overdueTasks = mockTasks.filter(task => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done").length;
  const highPriorityTasks = mockTasks.filter(task => task.priority === "high" && task.status !== "done").length;

  const recentTasks = [...mockTasks]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);
  
  const getUserById = (id?: string) => mockUsers.find(user => user.id === id);

  return (
    <div className="space-y-6">
      <PageHeader title="Manager Dashboard" description="Overview of project tasks and team performance." />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard title="Total Tasks" value={totalTasks} icon={PackageOpen} footerText="Across all projects" />
        <SummaryCard title="Completed Tasks" value={completedTasks} icon={CheckCircle2} footerText={`${Math.round((completedTasks/totalTasks)*100)}% completion`} />
        <SummaryCard title="Overdue Tasks" value={overdueTasks} icon={AlertTriangle} changeType={overdueTasks > 0 ? "negative" : undefined} />
        <SummaryCard title="High Priority Active" value={highPriorityTasks} icon={ListTodo} />
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
                          Due: {task.dueDate ? format(new Date(task.dueDate), "MMM dd, yyyy") : "N/A"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <TaskStatusBadge status={task.status} />
                        <TaskPriorityBadge priority={task.priority} />
                        {assignee && (
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={assignee.avatarUrl} alt={assignee.name} data-ai-hint="user avatar" />
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
            {mockUsers.slice(0,4).map(user => (
              <div key={user.id} className="flex items-center gap-3 p-2 bg-secondary/30 rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="team member avatar" />
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.name}</p>
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

       <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Welcome to TaskPilot</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p>
              TaskPilot helps you manage your projects with ease. Use the navigation on the left to explore different sections:
            </p>
            <ul>
              <li><strong>Dashboard:</strong> Get a quick overview of your project status.</li>
              <li><strong>Tasks:</strong> View, create, and manage all your tasks.</li>
              <li><strong>Assisted Assignment:</strong> Let AI help you find the best due dates for new tasks.</li>
              <li><strong>Notifications:</strong> Stay updated with important project events.</li>
            </ul>
            <div className="mt-6 flex gap-4">
                <Button asChild>
                    <Link href="/tasks/new">Create New Task</Link>
                </Button>
                <Button asChild variant="outline">
                    <Link href="/docs/getting-started">Read Documentation</Link>
                </Button>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
