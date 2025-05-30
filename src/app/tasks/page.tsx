
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { PlusCircle, ArrowUpDown, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TaskFilterControls } from "@/components/tasks/TaskFilterControls";
import { TaskActions } from "@/components/tasks/TaskActions";
import { TaskStatusBadge, TaskPriorityBadge } from "@/components/tasks/TaskBadges";
import type { Task, TaskStatus, TaskPriority, UserProfile } from "@/types";
import { format, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { getInitials } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllTasks, deleteTaskFromFirestore, updateTaskStatusInFirestore } from "@/services/taskService";
import { getAllUsers } from "@/services/userService"; // To get assignee names
// import {
//   notifyManagerOfTaskCompletion,
//   checkAndNotifyForDependentTasks,
//   notifyManagerOfProgressChange
// } from "@/lib/notificationService"; // Notification service needs update for Firestore

type SortConfig = {
  key: keyof Task | "assigneeName" | null;
  direction: "ascending" | "descending";
};

export default function TasksPage() {
  const { toast } = useToast();
  const { currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "createdAt", direction: "descending" });

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.replace("/login");
    }
  }, [currentUser, authLoading, router]);

  const { data: tasks = [], isLoading: tasksLoading, error: tasksError } = useQuery<Task[]>({
    queryKey: ['tasks', currentUser?.uid, currentUser?.role],
    queryFn: () => getAllTasks(currentUser?.uid, currentUser?.role),
    enabled: !!currentUser, // Only fetch if currentUser is available
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<UserProfile[]>({
    queryKey: ['users'],
    queryFn: getAllUsers,
    enabled: currentUser?.role === 'manager', // Only managers might need all users for filtering/display
  });
  
  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const deleteMutation = useMutation({
    mutationFn: deleteTaskFromFirestore,
    onSuccess: (data, taskId) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      const taskToDelete = tasks.find(t => t.id === taskId);
      toast({
        title: "Task Deleted",
        description: `Task "${taskToDelete?.title || 'selected task'}" has been deleted.`,
        variant: "destructive",
      });
    },
    onError: (error) => {
        toast({
          title: "Error Deleting Task",
          description: error.message,
          variant: "destructive",
        });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: (variables: { taskId: string; status: TaskStatus; progress?: number }) => 
                 updateTaskStatusInFirestore(variables.taskId, variables.status, variables.progress),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Task Updated",
        description: `Task status changed to ${variables.status}.`,
      });
      // TODO: Re-integrate notification logic with Firestore
      // if (variables.status === 'done') {
      //   const updatedTask = tasks.find(t => t.id === variables.taskId);
      //   if (updatedTask) {
      //     // notifyManagerOfTaskCompletion(updatedTask, currentUser?.name);
      //     // checkAndNotifyForDependentTasks(updatedTask);
      //   }
      // }
    },
     onError: (error) => {
        toast({
          title: "Error Updating Status",
          description: error.message,
          variant: "destructive",
        });
    }
  });

  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;

    // Permissions check should ideally be backend, but client-side for now
    if (currentUser?.role === 'manager' || (currentUser?.role === 'employee' && taskToDelete.assigneeId === currentUser.uid )) {
       deleteMutation.mutate(taskId);
    } else {
        toast({
          title: "Permission Denied",
          description: "You do not have permission to delete this task.",
          variant: "destructive",
        });
    }
  };

  const handleUpdateStatus = (taskId: string, status: TaskStatus) => {
    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (!taskToUpdate) return;

    if (currentUser?.role === 'manager' || taskToUpdate.assigneeId === currentUser?.uid) {
      const progress = status === 'done' ? 100 : (status === 'in-progress' && taskToUpdate.progress === 0 ? 10 : taskToUpdate.progress);
      updateStatusMutation.mutate({ taskId, status, progress });
    } else {
       toast({
        title: "Permission Denied",
        description: "You cannot update this task's status.",
        variant: "destructive",
      });
    }
  };
  
  const getUserById = useCallback((assigneeId?: string | null) => {
    if (!assigneeId || usersLoading || users.length === 0) return null;
    return users.find(user => user.uid === assigneeId);
  }, [users, usersLoading]);

  const filteredTasks = useMemo(() => {
    let currentTasksToShow = [...tasks]; 
    
    if (filters.searchTerm) {
      currentTasksToShow = currentTasksToShow.filter(task =>
        task.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }
    if (filters.status && filters.status !== "all") {
      currentTasksToShow = currentTasksToShow.filter(task => task.status === filters.status);
    }
    if (filters.priority && filters.priority !== "all") {
      currentTasksToShow = currentTasksToShow.filter(task => task.priority === filters.priority);
    }
    if (filters.assignee && filters.assignee !== "all" && currentUser?.role === 'manager') {
      currentTasksToShow = currentTasksToShow.filter(task => task.assigneeId === filters.assignee);
    }
    return currentTasksToShow;
  }, [tasks, filters, currentUser?.role]); 
  
  const sortedTasks = useMemo(() => {
    let sortableTasks = [...filteredTasks];
    if (sortConfig.key !== null) {
      sortableTasks.sort((a, b) => {
        let aValue, bValue;
        if (sortConfig.key === "assigneeName") {
          aValue = getUserById(a.assigneeId)?.name || "";
          bValue = getUserById(b.assigneeId)?.name || "";
        } else if (sortConfig.key === "dueDate" || sortConfig.key === "createdAt" || sortConfig.key === "updatedAt") {
          aValue = a[sortConfig.key as keyof Task] ? parseISO(a[sortConfig.key as keyof Task] as string).getTime() : 0;
          bValue = b[sortConfig.key as keyof Task] ? parseISO(b[sortConfig.key as keyof Task] as string).getTime() : 0;
        } else {
          aValue = a[sortConfig.key as keyof Task];
          bValue = b[sortConfig.key as keyof Task];
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        if (aValue === null || aValue === undefined) aValue = sortConfig.direction === 'ascending' ? Infinity : -Infinity;
        if (bValue === null || bValue === undefined) bValue = sortConfig.direction === 'ascending' ? Infinity : -Infinity;

        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableTasks;
  }, [filteredTasks, sortConfig, getUserById]);

  const requestSort = (key: keyof Task | "assigneeName") => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };
  
  const SortableHeader = ({ children, sortKey }: { children: React.ReactNode, sortKey: keyof Task | "assigneeName"}) => (
    <TableHead onClick={() => requestSort(sortKey)} className="cursor-pointer hover:bg-muted/50">
      <div className="flex items-center gap-1">
        {children}
        {sortConfig.key === sortKey && <ArrowUpDown className="h-3 w-3" />}
      </div>
    </TableHead>
  );

  if (authLoading || !currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const pageActions = currentUser.role === 'manager' ? (
    <Button asChild>
      <Link href="/tasks/new">
        <PlusCircle className="mr-2 h-4 w-4" /> Add New Task
      </Link>
    </Button>
  ) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={currentUser.role === 'manager' ? "All Tasks" : "My Tasks"}
        description="Manage and track all your project tasks."
        actions={pageActions}
      />

      <TaskFilterControls 
        onFilterChange={handleFilterChange} 
        // Pass users for assignee filter if manager
        assignees={currentUser.role === 'manager' ? users : []}
        isLoadingAssignees={usersLoading}
      />

      <Card className="shadow-md">
        <CardContent className="p-0">
           {tasksLoading && (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {tasksError && (
            <div className="p-4 text-destructive">Error loading tasks: {tasksError.message}</div>
          )}
          {!tasksLoading && !tasksError && (
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader sortKey="title">Title</SortableHeader>
                <SortableHeader sortKey="status">Status</SortableHeader>
                <SortableHeader sortKey="priority">Priority</SortableHeader>
                <SortableHeader sortKey="dueDate">Due Date</SortableHeader>
                {currentUser.role === 'manager' && <SortableHeader sortKey="assigneeName">Assignee</SortableHeader>}
                <TableHead>Progress</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTasks.length > 0 ? sortedTasks.map((task) => {
                const assignee = getUserById(task.assigneeId);
                const canModify = currentUser.role === 'manager' || task.assigneeId === currentUser.uid;
                return (
                  <TableRow key={task.id} className={task.status === 'done' ? 'opacity-60' : ''}>
                    <TableCell className="font-medium">
                      <Link href={`/tasks/${task.id}`} className="hover:underline text-primary">
                          {task.title}
                      </Link>
                    </TableCell>
                    <TableCell><TaskStatusBadge status={task.status} /></TableCell>
                    <TableCell><TaskPriorityBadge priority={task.priority} /></TableCell>
                    <TableCell>{task.dueDate ? format(parseISO(task.dueDate), "MMM dd, yyyy") : "N/A"}</TableCell>
                    {currentUser.role === 'manager' && (
                      <TableCell>
                        {assignee ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={assignee.avatarUrl} alt={assignee.name} data-ai-hint="user avatar"/>
                              <AvatarFallback>{getInitials(assignee.name)}</AvatarFallback>
                            </Avatar>
                            {assignee.name}
                          </div>
                        ) : "Unassigned"}
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={task.progress} className="w-20 h-2" />
                        <span className="text-xs text-muted-foreground">{task.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <TaskActions 
                        task={task} 
                        onDelete={handleDeleteTask} 
                        onUpdateStatus={handleUpdateStatus}
                        canModify={canModify}
                      />
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={currentUser.role === 'manager' ? 7 : 6} className="h-24 text-center text-muted-foreground">
                    No tasks found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
