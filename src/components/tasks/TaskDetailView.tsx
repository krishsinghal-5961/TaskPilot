
"use client";

import { useState, useEffect } from "react";
import type { Task, UserProfile } from "@/types";
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
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTaskById, updateTaskInFirestore, getAllTasks } from "@/services/taskService";
import { getUserProfile } from "@/services/userService";
// import {
//   notifyManagerOfProgressChange,
//   notifyManagerOfTaskCompletion,
//   checkAndNotifyForDependentTasks
// } from "@/lib/notificationService"; // Needs update for Firestore

interface TaskDetailViewProps {
  taskId: string;
  initialTask?: Task | null; // Allow pre-fetched task
}

export function TaskDetailView({ taskId, initialTask }: TaskDetailViewProps) {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  const { data: task, isLoading: taskLoading, error: taskError } = useQuery<Task | null>({
    queryKey: ['task', taskId],
    queryFn: () => getTaskById(taskId),
    initialData: initialTask, // Use pre-fetched data if available
    enabled: !!taskId,
  });

  const { data: assignee, isLoading: assigneeLoading } = useQuery<UserProfile | null>({
    queryKey: ['userProfile', task?.assigneeId],
    queryFn: () => task?.assigneeId ? getUserProfile(task.assigneeId) : null,
    enabled: !!task?.assigneeId,
  });
  
  const { data: allTasksForDeps = [] } = useQuery<Task[]>({
    queryKey: ['tasks', 'allForDeps'], // A broader key for all tasks if needed for dependencies
    queryFn: () => getAllTasks(undefined, 'manager'), // Fetch all tasks for dep resolution
    enabled: !!task?.dependencies && task.dependencies.length > 0,
  });

  const dependencies = useMemo(() => {
    if (!task || !task.dependencies || task.dependencies.length === 0) return [];
    return allTasksForDeps.filter(t => task.dependencies!.includes(t.id));
  }, [task, allTasksForDeps]);


  const updateProgressMutation = useMutation({
    mutationFn: (variables: { progress: number }) => {
        if (!task) throw new Error("Task not loaded");
        const newStatus = variables.progress === 100 ? 'done' : (variables.progress > 0 && task.status === 'todo' ? 'in-progress' : task.status);
        return updateTaskInFirestore(taskId, { progress: variables.progress, status: newStatus });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] }); // Invalidate list view
      toast({
        title: "Progress Updated",
        description: `Task "${task?.title}" progress set to ${variables.progress}%.`,
      });
      // TODO: Add notification logic
    },
    onError: (error: Error) => {
        toast({ variant: "destructive", title: "Update Failed", description: error.message });
    }
  });

  const handleUpdateProgress = (id: string, progress: number) => {
    // id is task.id, already available as taskId
    updateProgressMutation.mutate({ progress });
  };

  if (taskLoading) {
    return <Card className="shadow-md"><CardContent><p className="p-6 text-center">Loading task details...</p></CardContent></Card>;
  }
  if (taskError) {
    return <Card className="shadow-md"><CardContent><p className="p-6 text-center text-destructive">Error: {(taskError as Error).message}</p></CardContent></Card>;
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

        {assigneeLoading && <p>Loading assignee...</p>}
        {assignee && (
          <div>
            <h4 className="font-semibold mb-1 flex items-center"><UserCircle className="mr-2 h-4 w-4 text-muted-foreground" />Assignee</h4>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={assignee.avatarUrl} alt={assignee.name} data-ai-hint="user avatar"/>
                <AvatarFallback>{getInitials(assignee.name)}</AvatarFallback>
              </Avatar>
              <span>{assignee.name}</span>
            </div>
          </div>
        )}
        {!assignee && !assigneeLoading && task.assigneeId && <p>Assignee details not found.</p>}


        <div>
          <h4 className="font-semibold mb-1 flex items-center"><Percent className="mr-2 h-4 w-4 text-muted-foreground" />Progress</h4>
          <div className="flex items-center gap-2">
            <Progress value={task.progress} className="flex-1 h-3" />
            <span>{task.progress}%</span>
            {(currentUser?.role === 'manager' || currentUser?.uid === task.assigneeId) && (
                <UpdateTaskProgressDialog task={task} onUpdateProgress={handleUpdateProgress}>
                <Button variant="ghost" size="sm" disabled={updateProgressMutation.isPending}>
                    {updateProgressMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
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
