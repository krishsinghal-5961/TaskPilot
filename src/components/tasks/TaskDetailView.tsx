
"use client";

import { useState, useEffect, useMemo } from "react";
import type { Task, UserProfile } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { TaskStatusBadge, TaskPriorityBadge } from "./TaskBadges";
import { CalendarDays, UserCircle, Link as LinkIcon, Edit, Percent, Loader2 } from "lucide-react";
import Link from "next/link";
import { format, parseISO, formatISO } from "date-fns";
import { UpdateTaskProgressDialog } from "./UpdateTaskProgressDialog";
import { useToast } from "@/hooks/use-toast";
import { getInitials } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { mockTasks, mockUsers } from "@/lib/mock-data"; // Using mock data
import { notifyManagerOfProgressChange, notifyManagerOfTaskCompletion, checkAndNotifyForDependentTasks } from "@/lib/notificationService";


interface TaskDetailViewProps {
  taskId: string;
  initialTask?: Task | null; 
}

export function TaskDetailView({ taskId, initialTask }: TaskDetailViewProps) {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [task, setTask] = useState<Task | null | undefined>(initialTask);
  const [assignee, setAssignee] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(!initialTask);
  const [refreshKey, setRefreshKey] = useState(0); // For re-fetching/re-calculating

  useEffect(() => {
    if (!initialTask || refreshKey > 0) { // Fetch if no initial task or if refresh is triggered
      setIsLoading(true);
      const foundTask = mockTasks.find(t => t.id === taskId);
      setTask(foundTask || null);
      if (foundTask?.assigneeId) {
        const foundAssignee = mockUsers.find(u => u.uid === foundTask.assigneeId);
        setAssignee(foundAssignee || null);
      } else {
        setAssignee(null);
      }
      setIsLoading(false);
    } else if (initialTask) { // Use initial task if provided
      setTask(initialTask);
      if (initialTask.assigneeId) {
        const foundAssignee = mockUsers.find(u => u.uid === initialTask.assigneeId);
        setAssignee(foundAssignee || null);
      } else {
        setAssignee(null);
      }
      setIsLoading(false);
    }
  }, [taskId, initialTask, refreshKey]);
  
  const dependencies = useMemo(() => {
    if (!task || !task.dependencies || task.dependencies.length === 0) return [];
    return mockTasks.filter(t => task.dependencies!.includes(t.id));
  }, [task]);


  const handleUpdateProgress = (id: string, newProgress: number) => {
    if (!task) return;
    const taskIndex = mockTasks.findIndex(t => t.id === id);
    if (taskIndex !== -1) {
      const oldStatus = mockTasks[taskIndex].status;
      const newStatus = newProgress === 100 ? 'done' : (newProgress > 0 && mockTasks[taskIndex].status === 'todo' ? 'in-progress' : mockTasks[taskIndex].status);
      
      mockTasks[taskIndex] = {
        ...mockTasks[taskIndex],
        progress: newProgress,
        status: newStatus,
        updatedAt: formatISO(new Date())
      };
      
      setRefreshKey(prev => prev + 1); // Trigger re-fetch/re-render of this component's data
      
      toast({
        title: "Progress Updated",
        description: `Task "${mockTasks[taskIndex].title}" progress set to ${newProgress}%.`,
      });

      if (newStatus === 'done' && oldStatus !== 'done') {
        notifyManagerOfTaskCompletion(mockTasks[taskIndex], currentUser?.name);
        checkAndNotifyForDependentTasks(mockTasks[taskIndex]);
      } else if (mockTasks[taskIndex].progress !== task.progress || newStatus !== oldStatus) { // Check if actual progress or status changed
         notifyManagerOfProgressChange(mockTasks[taskIndex], currentUser?.name);
      }
    } else {
      toast({ variant: "destructive", title: "Update Failed", description: "Task not found for update." });
    }
  };

  if (isLoading || task === undefined) {
    return <Card className="shadow-md"><CardContent><p className="p-6 text-center">Loading task details...</p></CardContent></Card>;
  }

  if (!task) {
    return <Card className="shadow-md"><CardContent><p className="p-6 text-center">Task not found.</p></CardContent></Card>;
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">{task.title}</CardTitle>
          {(currentUser?.role === 'manager' || currentUser?.uid === task.assigneeId) && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/tasks/${task.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" /> Edit Task
              </Link>
            </Button>
          )}
        </div>
        <CardDescription>
          Created: {task.createdAt ? format(parseISO(task.createdAt), "PPP p") : 'N/A'} | 
          Last updated: {task.updatedAt ? format(parseISO(task.updatedAt), "PPP p") : 'N/A'}
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
        {!assignee && task.assigneeId && <p>Assignee details not found.</p>}


        <div>
          <h4 className="font-semibold mb-1 flex items-center"><Percent className="mr-2 h-4 w-4 text-muted-foreground" />Progress</h4>
          <div className="flex items-center gap-2">
            <Progress value={task.progress} className="flex-1 h-3" />
            <span>{task.progress}%</span>
            {(currentUser?.role === 'manager' || currentUser?.uid === task.assigneeId) && (
                <UpdateTaskProgressDialog task={task} onUpdateProgress={handleUpdateProgress}>
                <Button variant="ghost" size="sm">
                    Update
                </Button>
                </UpdateTaskProgressDialog>
            )}
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
         {task.dependencies && task.dependencies.length > 0 && dependencies.length === 0 && <p>Loading dependencies...</p>}
      </CardContent>
      <CardFooter className="border-t pt-6">
        <p className="text-xs text-muted-foreground">Task ID: {task.id}</p>
      </CardFooter>
    </Card>
  );
}
