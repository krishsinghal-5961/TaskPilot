
"use client"; 

import { PageHeader } from "@/components/shared/PageHeader";
import { TaskForm } from "@/components/tasks/TaskForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockTasks } from "@/lib/mock-data";
import type { Task } from "@/types";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface EditTaskPageProps {
  params: { id: string };
}

export default function EditTaskPage({ params }: EditTaskPageProps) {
  const [task, setTask] = useState<Task | undefined>(undefined);
  const [loadingTask, setLoadingTask] = useState(true);
  const { currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const foundTask = mockTasks.find(t => t.id === params.id);
    setTask(foundTask);
    setLoadingTask(false);
  }, [params.id]);

  useEffect(() => {
    if (!authLoading && !loadingTask) {
      if (!currentUser) {
        router.replace("/login");
        return;
      }
      if (currentUser.role !== 'manager' && task?.assigneeId !== currentUser.id) {
        // If not manager and task not assigned to current employee, deny access
        toast({ variant: "destructive", title: "Access Denied", description: "You do not have permission to edit this task." });
        router.replace("/tasks"); // Or an unauthorized page
      }
    }
  }, [currentUser, authLoading, task, loadingTask, router]);


  if (authLoading || loadingTask || !currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading task...</p>
      </div>
    );
  }
  
  if (!task) {
    return (
      <div className="space-y-6">
        <PageHeader title="Edit Task" description="Task not found." />
        <Card>
          <CardContent className="p-6">
            <p>The task you are trying to edit does not exist or could not be loaded.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Final check after loading to ensure unauthorized users who might have briefly seen content are redirected.
  if (currentUser.role !== 'manager' && task?.assigneeId !== currentUser.id) {
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

// Added imports that might be missing
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
