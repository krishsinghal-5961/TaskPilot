
"use client"; 

import { PageHeader } from "@/components/shared/PageHeader";
import { TaskForm } from "@/components/tasks/TaskForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Task } from "@/types";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { mockTasks } from "@/lib/mock-data"; // Using mock data
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
  const [taskData, setTaskData] = useState<Task | null | undefined>(undefined);

  useEffect(() => {
    if (!authLoading) {
      if (!currentUser) {
        router.replace("/login");
        return;
      }
      
      const foundTask = mockTasks.find(t => t.id === taskId);
      setTaskData(foundTask || null);

      if (foundTask) {
        if (currentUser.role !== 'manager' && foundTask.assigneeId !== currentUser.uid) {
          toast({ variant: "destructive", title: "Access Denied", description: "You do not have permission to edit this task." });
          router.replace("/tasks");
        }
      } else if (foundTask === undefined && !authLoading) { // task not found and not loading
         toast({ variant: "destructive", title: "Task Not Found", description: "The task you are trying to edit does not exist." });
         router.replace("/tasks");
      }
    }
  }, [currentUser, authLoading, taskId, router, toast]);


  if (authLoading || taskData === undefined || !currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading task...</p>
      </div>
    );
  }
  
  if (taskData === null) { 
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
  
  // Final access check after loading
  if (currentUser.role !== 'manager' && taskData.assigneeId !== currentUser.uid) {
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
        title={`Edit Task: ${taskData.title}`}
        description="Update the details for this task."
      />
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Task Details</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskForm task={taskData} />
        </CardContent>
      </Card>
    </div>
  );
}
