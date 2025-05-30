
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
import { Card, CardContent } from "@/components/ui/card"; // Added CardContent import
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TaskFilterControls } from "@/components/tasks/TaskFilterControls";
import { TaskActions } from "@/components/tasks/TaskActions";
import { TaskStatusBadge, TaskPriorityBadge } from "@/components/tasks/TaskBadges";
import { mockTasks, mockUsers } from "@/lib/mock-data";
import type { Task, TaskStatus, TaskPriority } from "@/types";
import { format, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { getInitials } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

type SortConfig = {
  key: keyof Task | "assigneeName" | null;
  direction: "ascending" | "descending";
};

export default function TasksPage() {
  const { toast } = useToast();
  const { currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "createdAt", direction: "descending" });

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.replace("/login");
    }
  }, [currentUser, authLoading, router]);
  
  useEffect(() => {
    // Simulate fetching tasks - will be adapted for roles
    if (currentUser) {
      if (currentUser.role === 'manager') {
        setTasks(mockTasks); // Manager sees all tasks
      } else {
        setTasks(mockTasks.filter(task => task.assigneeId === currentUser.id)); // Employee sees their tasks
      }
    }
  }, [currentUser]);


  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleDeleteTask = (taskId: string) => {
    // Permission check: Only manager can delete or employee can delete their own UNASSIGNED task (example)
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;

    if (currentUser?.role === 'manager' || (currentUser?.role === 'employee' && taskToDelete.assigneeId === currentUser.id /* && !taskToDelete.status */)) {
       setTasks(prev => prev.filter(task => task.id !== taskId));
        toast({
          title: "Task Deleted",
          description: `Task "${taskToDelete.title}" has been deleted.`,
          variant: "destructive",
        });
    } else {
        toast({
          title: "Permission Denied",
          description: "You do not have permission to delete this task.",
          variant: "destructive",
        });
    }
  };

  const handleUpdateStatus = (taskId: string, status: TaskStatus) => {
     // Permission check (simplified for now)
    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (!taskToUpdate) return;

    if (currentUser?.role === 'manager' || taskToUpdate.assigneeId === currentUser?.id) {
      setTasks(prev => prev.map(task => task.id === taskId ? { ...task, status, updatedAt: new Date().toISOString() } : task));
      toast({
        title: "Task Updated",
        description: `Task status changed to ${status}.`,
      });
    } else {
       toast({
        title: "Permission Denied",
        description: "You cannot update this task's status.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateProgress = (taskId: string, progress: number) => {
     // Permission check (simplified for now)
    const taskToUpdate = tasks.find(t => t.id === taskId);
     if (!taskToUpdate) return;

    if (currentUser?.role === 'manager' || taskToUpdate.assigneeId === currentUser?.id) {
      setTasks(prev => prev.map(task => task.id === taskId ? { ...task, progress, status: progress === 100 ? 'done' : (progress > 0 && task.status === 'todo' ? 'in-progress' : task.status), updatedAt: new Date().toISOString() } : task));
      toast({
        title: "Progress Updated",
        description: `Task progress set to ${progress}%.`,
      });
    } else {
        toast({
        title: "Permission Denied",
        description: "You cannot update this task's progress.",
        variant: "destructive",
      });
    }
  };

  const getUserById = useCallback((id?: string) => mockUsers.find(user => user.id === id), []);

  const filteredTasks = useMemo(() => {
    let currentTasks = [...tasks];
    if (filters.searchTerm) {
      currentTasks = currentTasks.filter(task =>
        task.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }
    if (filters.status && filters.status !== "all") {
      currentTasks = currentTasks.filter(task => task.status === filters.status);
    }
    if (filters.priority && filters.priority !== "all") {
      currentTasks = currentTasks.filter(task => task.priority === filters.priority);
    }
    // Only allow manager to filter by assignee for all users
    if (filters.assignee && filters.assignee !== "all" && currentUser?.role === 'manager') {
      currentTasks = currentTasks.filter(task => task.assigneeId === filters.assignee);
    }
    return currentTasks;
  }, [tasks, filters, currentUser]);
  
  const sortedTasks = useMemo(() => {
    let sortableTasks = [...filteredTasks];
    if (sortConfig.key !== null) {
      sortableTasks.sort((a, b) => {
        let aValue, bValue;
        if (sortConfig.key === "assigneeName") {
          aValue = getUserById(a.assigneeId)?.name || "";
          bValue = getUserById(b.assigneeId)?.name || "";
        } else if (sortConfig.key === "dueDate" || sortConfig.key === "createdAt" || sortConfig.key === "updatedAt") {
          aValue = a[sortConfig.key] ? parseISO(a[sortConfig.key]!).getTime() : 0;
          bValue = b[sortConfig.key] ? parseISO(b[sortConfig.key]!).getTime() : 0;
        }
         else {
          // Type assertion needed here if sortConfig.key can be other Task keys
          aValue = a[sortConfig.key as keyof Task];
          bValue = b[sortConfig.key as keyof Task];
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
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

  return (
    <div className="space-y-6">
      <PageHeader
        title={currentUser.role === 'manager' ? "All Tasks" : "My Tasks"}
        description="Manage and track all your project tasks."
        actions={
          currentUser.role === 'manager' && ( // Only manager can add new tasks for now
            <Button asChild>
              <Link href="/tasks/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Task
              </Link>
            </Button>
          )
        }
      />

      <TaskFilterControls 
        onFilterChange={handleFilterChange} 
        // Pass role to disable assignee filter for employees if needed
        // showAssigneeFilter={currentUser.role === 'manager'} 
      />

      <Card className="shadow-md">
        <CardContent className="p-0"> {/* Ensure CardContent is used if Table is direct child, or remove if Table has its own padding */}
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
                const canModify = currentUser.role === 'manager' || task.assigneeId === currentUser.id;
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
                        canModify={canModify} // Pass down modify permission
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
        </CardContent>
      </Card>
    </div>
  );
}
