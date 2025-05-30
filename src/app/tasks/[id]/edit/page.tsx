
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

  const { data: taskData, isLoading: taskLoading, error: taskError } = useQuery<Task | null>({
    queryKey: ['task', taskId],
    queryFn: () => getTaskById(taskId),
    enabled: !!taskId && !!currentUser,
  });

  // Ensure taskData is plain if passing to client component
  const plainTaskData = taskData ? JSON.parse(JSON.stringify(taskData)) : null;

  useEffect(() => {
    if (!authLoading && !taskLoading) {
      if (!currentUser) {
        router.replace("/login");
        return;
      }
      if (plainTaskData) { 
          if (currentUser.role !== 'manager' && plainTaskData.assigneeId !== currentUser.uid) {
            toast({ variant: "destructive", title: "Access Denied", description: "You do not have permission to edit this task." });
            router.replace("/tasks"); 
          }
      } else if (plainTaskData === null && !taskError && !taskLoading) { 
         toast({ variant: "destructive", title: "Task Not Found", description: "The task you are trying to edit does not exist." });
         router.replace("/tasks");
      }
    }
  }, [currentUser, authLoading, plainTaskData, taskLoading, taskError, router, toast]);


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
  
  if (!plainTaskData && !taskLoading) { 
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
  
  // This check should catch cases where plainTaskData becomes null due to error or not found
  if (!plainTaskData) {
     return ( // Or some other loading/error state if taskLoading is still true but plainTaskData is null
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Preparing task data...</p>
      </div>
    );
  }

  // Final check after loading to ensure unauthorized users who might have briefly seen content are redirected.
  if (currentUser.role !== 'manager' && plainTaskData.assigneeId !== currentUser.uid) {
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
        title={`Edit Task: ${plainTaskData.title}`}
        description="Update the details for this task."
      />
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Task Details</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskForm task={plainTaskData} />
        </CardContent>
      </Card>
    </div>
  );
}
