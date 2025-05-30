
"use client"; // Required for hooks

import { PageHeader } from "@/components/shared/PageHeader";
import { TaskDetailView } from "@/components/tasks/TaskDetailView";
import { mockTasks } from "@/lib/mock-data"; 
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { Task } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// No generateStaticParams for dynamic, auth-protected routes
// export async function generateStaticParams() {
//   return mockTasks.map(task => ({ id: task.id }));
// }

interface TaskPageProps {
  params: { id: string };
}

export default function TaskPage({ params }: TaskPageProps) {
  const { currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [task, setTask] = useState<Task | null | undefined>(undefined); // undefined for initial, null if not found
  const [loadingTask, setLoadingTask] = useState(true);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.replace("/login");
    }
  }, [currentUser, authLoading, router]);

  useEffect(() => {
    const foundTask = mockTasks.find(t => t.id === params.id);
    setTask(foundTask || null); // Set to null if not found
    setLoadingTask(false);
  }, [params.id]);

  useEffect(() => {
    if (!authLoading && !loadingTask && currentUser && task !== undefined) { // task can be null here
      if (task && currentUser.role === 'employee' && task.assigneeId !== currentUser.id) {
        // Employee trying to access a task not assigned to them
        router.replace("/tasks"); // Or an "Access Denied" page
      }
    }
  }, [currentUser, authLoading, task, loadingTask, router]);


  if (authLoading || loadingTask || currentUser === undefined) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
         <p className="text-muted-foreground">Loading task details...</p>
      </div>
    );
  }
  
  if (task === null) { // Task explicitly not found
     return (
      <div className="space-y-6">
        <PageHeader
          title="Task Not Found"
          description={`Could not find details for task ID: ${params.id}`}
        />
        <Card>
          <CardContent className="p-6 text-center">
            <p>The task you are looking for does not exist or you may not have permission to view it.</p>
            <Button onClick={() => router.push('/tasks')} className="mt-4">Go to Tasks</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // If an employee is trying to access a task not assigned to them (final check after task loaded)
  if (task && currentUser && currentUser.role === 'employee' && task.assigneeId !== currentUser.id) {
      return (
        <div className="space-y-6">
          <PageHeader
            title="Access Denied"
            description="You do not have permission to view this task."
          />
           <Card>
            <CardContent className="p-6 text-center">
                <Button onClick={() => router.push('/tasks')} className="mt-4">Go to My Tasks</Button>
            </CardContent>
          </Card>
        </div>
      );
  }
  
  const taskTitle = task ? task.title : "Task Details";
  
  return (
    <div className="space-y-6">
      <PageHeader
        title={taskTitle}
        description={`Viewing details for task ID: ${params.id}`}
      />
      <TaskDetailView taskId={params.id} />
    </div>
  );
}
