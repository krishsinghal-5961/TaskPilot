
"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { TaskDetailView } from "@/components/tasks/TaskDetailView";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { Task } from "@/types";
import { mockTasks } from "@/lib/mock-data"; // Using mock data
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


interface TaskPageProps {
  params: { id: string };
}

export default function TaskPage({ params }: TaskPageProps) {
  const { currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const taskId = params.id;
  const [taskData, setTaskData] = useState<Task | null | undefined>(undefined); // undefined initially

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.replace("/login");
    }
  }, [currentUser, authLoading, router]);

  useEffect(() => {
    if (taskId && currentUser) { // Ensure currentUser is available before trying to find task
      const foundTask = mockTasks.find(t => t.id === taskId);
      if (foundTask) {
        if (currentUser.role === 'employee' && foundTask.assigneeId !== currentUser.uid) {
          // Employee trying to access task not assigned to them
          router.replace("/tasks"); 
        } else {
          setTaskData(foundTask);
        }
      } else {
        setTaskData(null); // Task not found
      }
    }
  }, [taskId, currentUser, authLoading, router]);


  if (authLoading || taskData === undefined || currentUser === undefined) { // Check for undefined taskData
     return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
         <p className="text-muted-foreground">Loading task details...</p>
      </div>
    );
  }
  
  if (taskData === null) { // Task was searched for but not found
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
  
  // Final access check if taskData is loaded (already handled in effect, but good for clarity)
  if (currentUser && currentUser.role === 'employee' && taskData.assigneeId !== currentUser.uid) {
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
  
  const taskTitle = taskData ? taskData.title : "Task Details";
  
  return (
    <div className="space-y-6">
      <PageHeader
        title={taskTitle}
        description={`Viewing details for task ID: ${params.id}`}
      />
      <TaskDetailView taskId={params.id} initialTask={taskData} />
    </div>
  );
}
