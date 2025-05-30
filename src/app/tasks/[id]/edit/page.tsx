"use client"; // This page needs to be client component to find task

import { PageHeader } from "@/components/shared/PageHeader";
import { TaskForm } from "@/components/tasks/TaskForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockTasks } from "@/lib/mock-data";
import type { Task } from "@/types";
import { useEffect, useState } from "react";

interface EditTaskPageProps {
  params: { id: string };
}

export default function EditTaskPage({ params }: EditTaskPageProps) {
  const [task, setTask] = useState<Task | undefined>(undefined);

  useEffect(() => {
    const foundTask = mockTasks.find(t => t.id === params.id);
    setTask(foundTask);
  }, [params.id]);

  if (!task) {
    // Handle case where task is not found, perhaps show a loading or error state
    return (
      <div className="space-y-6">
        <PageHeader title="Edit Task" description="Loading task details..." />
        <Card>
          <CardContent className="p-6">
            <p>Loading task or task not found.</p>
          </CardContent>
        </Card>
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
