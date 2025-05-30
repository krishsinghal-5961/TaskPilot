
"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { TaskDetailView } from "@/components/tasks/TaskDetailView";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getTaskById } from "@/services/taskService";
import type { Task } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


interface TaskPageProps {
  params: { id: string };
}

export default function TaskPage({ params }: TaskPageProps) {
  const { currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const taskId = params.id;

  const { data: taskData, isLoading: taskLoading, error: taskError } = useQuery<Task | null>({
    queryKey: ['task', taskId],
    queryFn: () => getTaskById(taskId),
    enabled: !!taskId && !!currentUser, // Ensure currentUser is available before fetching
  });

  // Ensure taskData is plain if passing to client component
  // This helps prevent errors if taskData contains non-serializable types like Date objects
  const plainTaskData = taskData ? JSON.parse(JSON.stringify(taskData)) : null;

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.replace("/login");
    }
  }, [currentUser, authLoading, router]);

  useEffect(() => {
    if (!authLoading && !taskLoading && currentUser && plainTaskData) {
      if (currentUser.role === 'employee' && plainTaskData.assigneeId !== currentUser.uid) {
        router.replace("/tasks"); 
      }
    }
  }, [currentUser, authLoading, plainTaskData, taskLoading, router]);


  if (authLoading || taskLoading || currentUser === undefined) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
         <p className="text-muted-foreground">Loading task details...</p>
      </div>
    );
  }
  
  if (taskError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Error Loading Task"
          description={`Could not load details for task ID: ${params.id}`}
        />
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive">{(taskError as Error).message}</p>
            <Button onClick={() => router.push('/tasks')} className="mt-4">Go to Tasks</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (plainTaskData === null && !taskLoading) { // Check plainTaskData after potential loading/error
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
  
  // Final access check using plainTaskData
  if (plainTaskData && currentUser && currentUser.role === 'employee' && plainTaskData.assigneeId !== currentUser.uid) {
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
  
  const taskTitle = plainTaskData ? plainTaskData.title : "Task Details";
  
  return (
    <div className="space-y-6">
      <PageHeader
        title={taskTitle}
        description={`Viewing details for task ID: ${params.id}`}
      />
      {/* Pass plainTaskData (which could be null if task wasn't found) */}
      <TaskDetailView taskId={params.id} initialTask={plainTaskData} />
    </div>
  );
}
