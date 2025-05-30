"use client";

import { useState, useEffect } from "react";
import type { Task, User } from "@/types";
import { mockTasks, mockUsers } from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { TaskStatusBadge, TaskPriorityBadge } from "./TaskBadges";
import { CalendarDays, UserCircle, Link as LinkIcon, Edit, Percent } from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { UpdateTaskProgressDialog } from "./UpdateTaskProgressDialog";
import { useToast } from "@/hooks/use-toast";
import { getInitials } from "@/lib/utils";

interface TaskDetailViewProps {
  taskId: string;
}

export function TaskDetailView({ taskId }: TaskDetailViewProps) {
  const [task, setTask] = useState<Task | null>(null);
  const [assignee, setAssignee] = useState<User | null>(null);
  const [dependencies, setDependencies] = useState<Task[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const foundTask = mockTasks.find(t => t.id === taskId);
    if (foundTask) {
      setTask(foundTask);
      if (foundTask.assigneeId) {
        setAssignee(mockUsers.find(u => u.id === foundTask.assigneeId) || null);
      }
      if (foundTask.dependencies && foundTask.dependencies.length > 0) {
        setDependencies(mockTasks.filter(t => foundTask.dependencies!.includes(t.id)));
      }
    }
  }, [taskId]);

  const handleUpdateProgress = (id: string, progress: number) => {
    if (task && task.id === id) {
      const updatedTask = { ...task, progress, status: progress === 100 ? 'done' : (progress > 0 && task.status === 'todo' ? 'in-progress' : task.status), updatedAt: new Date().toISOString() };
      setTask(updatedTask);
      // In a real app, update mockTasks or call API
      const taskIndex = mockTasks.findIndex(t => t.id === id);
      if (taskIndex !== -1) mockTasks[taskIndex] = updatedTask;

      toast({
        title: "Progress Updated",
        description: `Task "${task.title}" progress set to ${progress}%.`,
      });
    }
  };


  if (!task) {
    return <Card className="shadow-md"><CardContent><p className="p-6 text-center">Task not found.</p></CardContent></Card>;
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">{task.title}</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link href={`/tasks/${task.id}/edit`}> {/* Assuming an edit page */}
              <Edit className="mr-2 h-4 w-4" /> Edit Task
            </Link>
          </Button>
        </div>
        <CardDescription>
          Created: {format(parseISO(task.createdAt), "PPP p")} | Last updated: {format(parseISO(task.updatedAt), "PPP p")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-1">Status & Priority</h4>
            <div className="flex gap-2">
              <TaskStatusBadge status={task.status} />
              <TaskPriorityBadge priority={task.priority} />
            </div>
          </div>
          {task.dueDate && (
            <div>
              <h4 className="font-semibold mb-1 flex items-center"><CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />Due Date</h4>
              <p>{format(parseISO(task.dueDate), "PPP")}</p>
            </div>
          )}
        </div>

        {task.description && (
          <div>
            <h4 className="font-semibold mb-1">Description</h4>
            <p className="text-muted-foreground whitespace-pre-wrap">{task.description}</p>
          </div>
        )}

        {assignee && (
          <div>
            <h4 className="font-semibold mb-1 flex items-center"><UserCircle className="mr-2 h-4 w-4 text-muted-foreground" />Assignee</h4>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={assignee.avatarUrl} alt={assignee.name} data-ai-hint="user avatar" />
                <AvatarFallback>{getInitials(assignee.name)}</AvatarFallback>
              </Avatar>
              <span>{assignee.name}</span>
            </div>
          </div>
        )}

        <div>
          <h4 className="font-semibold mb-1 flex items-center"><Percent className="mr-2 h-4 w-4 text-muted-foreground" />Progress</h4>
          <div className="flex items-center gap-2">
            <Progress value={task.progress} className="flex-1 h-3" />
            <span>{task.progress}%</span>
            <UpdateTaskProgressDialog task={task} onUpdateProgress={handleUpdateProgress}>
              <Button variant="ghost" size="sm">Update</Button>
            </UpdateTaskProgressDialog>
          </div>
        </div>
        
        {dependencies.length > 0 && (
          <div>
            <h4 className="font-semibold mb-1 flex items-center"><LinkIcon className="mr-2 h-4 w-4 text-muted-foreground" />Dependencies</h4>
            <ul className="list-disc list-inside space-y-1">
              {dependencies.map(dep => (
                <li key={dep.id}>
                  <Link href={`/tasks/${dep.id}`} className="text-primary hover:underline">
                    {dep.title}
                  </Link>
                  <span className="ml-2 text-xs"> (<TaskStatusBadge status={dep.status} className="px-1 py-0 text-[10px]" />)</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-6">
        <p className="text-xs text-muted-foreground">Task ID: {task.id}</p>
      </CardFooter>
    </Card>
  );
}
