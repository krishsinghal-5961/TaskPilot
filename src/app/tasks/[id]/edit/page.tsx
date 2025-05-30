
"use client"; 

import { PageHeader } from "@/components/shared/PageHeader";
import { TaskForm } from "@/components/tasks/TaskForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Task } from "@/types";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getTaskById } from "@/services/taskService";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";


interface EditTaskPageProps {
  params: { id: string };
}

export default function EditTaskPage({ params }: EditTaskPageProps) {
  const { currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const taskId = params.id;
  const { toast } = useToast();

  const { data: task, isLoading: taskLoading, error: taskError } = useQuery<Task | null>({
    queryKey: ['task', taskId],
    queryFn: () => getTaskById(taskId),
    enabled: !!taskId,
  });

  useEffect(() => {
    if (!authLoading && !taskLoading) {
      if (!currentUser) {
        router.replace("/login");
        return;
      }
      // If task is loaded, perform role check
      if (task) { // task could be null if not found
          if (currentUser.role !== 'manager' && task?.assigneeId !== currentUser.uid) {
            toast({ variant: "destructive", title: "Access Denied", description: "You do not have permission to edit this task." });
            router.replace("/tasks"); 
          }
      } else if (task === null && !taskError) { // Task specifically not found and no other loading error
         toast({ variant: "destructive", title: "Task Not Found", description: "The task you are trying to edit does not exist." });
         router.replace("/tasks");
      }
    }
  }, [currentUser, authLoading, task, taskLoading, taskError, router, toast]);


  if (authLoading || taskLoading || !currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading task...</p>
      </div>
    );
  }

  if (taskError) {
     return (
      <div className="space-y-6">
        <PageHeader title="Edit Task" description="Error loading task." />
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">Error: {(taskError as Error).message}</p>
            <Button onClick={() => router.push('/tasks')} className="mt-4">Go to Tasks</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!task) { // Handles case where task is null after loading (not found)
    return (
      <div className="space-y-6">
        <PageHeader title="Edit Task" description="Task not found." />
        <Card>
          <CardContent className="p-6">
            <p>The task you are trying to edit does not exist or could not be loaded.</p>
             <Button onClick={() => router.push('/tasks')} className="mt-4">Go to Tasks</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Final check after loading to ensure unauthorized users who might have briefly seen content are redirected.
  if (currentUser.role !== 'manager' && task?.assigneeId !== currentUser.uid) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4">
        <PageHeader title="Access Denied" description="You are not authorized to edit this task." />
         <Button onClick={() => router.push('/tasks')} className="mt-4">Go to Tasks</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit Task: ${task.title}`}
        description="Update the details for this task."
      />
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Task Details</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskForm task={task} />
        </CardContent>
      </Card>
    </div>
  );
}
