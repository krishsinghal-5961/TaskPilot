"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { PlusCircle, ArrowUpDown } from "lucide-react";
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
import { Card } from "@/components/ui/card";
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

type SortConfig = {
  key: keyof Task | "assigneeName" | null;
  direction: "ascending" | "descending";
};

export default function TasksPage() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "createdAt", direction: "descending" });

  useEffect(() => {
    // Simulate fetching tasks
    setTasks(mockTasks);
  }, []);

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    toast({
      title: "Task Deleted",
      description: `Task "${mockTasks.find(t=>t.id === taskId)?.title}" has been deleted.`,
      variant: "destructive",
    });
  };

  const handleUpdateStatus = (taskId: string, status: TaskStatus) => {
    setTasks(prev => prev.map(task => task.id === taskId ? { ...task, status, updatedAt: new Date().toISOString() } : task));
     toast({
      title: "Task Updated",
      description: `Task status changed to ${status}.`,
    });
  };

  const handleUpdateProgress = (taskId: string, progress: number) => {
    setTasks(prev => prev.map(task => task.id === taskId ? { ...task, progress, status: progress === 100 ? 'done' : task.status, updatedAt: new Date().toISOString() } : task));
    toast({
      title: "Progress Updated",
      description: `Task progress set to ${progress}%.`,
    });
  };

  const getUserById = (id?: string) => mockUsers.find(user => user.id === id);

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
    if (filters.assignee && filters.assignee !== "all") {
      currentTasks = currentTasks.filter(task => task.assigneeId === filters.assignee);
    }
    return currentTasks;
  }, [tasks, filters]);
  
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


  return (
    <div className="space-y-6">
      <PageHeader
        title="Task List"
        description="Manage and track all your project tasks."
        actions={
          <Button asChild>
            <Link href="/tasks/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Task
            </Link>
          </Button>
        }
      />

      <TaskFilterControls onFilterChange={handleFilterChange} />

      <Card className="shadow-md">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader sortKey="title">Title</SortableHeader>
              <SortableHeader sortKey="status">Status</SortableHeader>
              <SortableHeader sortKey="priority">Priority</SortableHeader>
              <SortableHeader sortKey="dueDate">Due Date</SortableHeader>
              <SortableHeader sortKey="assigneeName">Assignee</SortableHeader>
              <TableHead>Progress</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTasks.length > 0 ? sortedTasks.map((task) => {
              const assignee = getUserById(task.assigneeId);
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
                  <TableCell>
                    {assignee ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={assignee.avatarUrl} alt={assignee.name} data-ai-hint="user avatar" />
                          <AvatarFallback>{getInitials(assignee.name)}</AvatarFallback>
                        </Avatar>
                        {assignee.name}
                      </div>
                    ) : "Unassigned"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={task.progress} className="w-20 h-2" />
                      <span className="text-xs text-muted-foreground">{task.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <TaskActions task={task} onDelete={handleDeleteTask} onUpdateStatus={handleUpdateStatus} />
                  </TableCell>
                </TableRow>
              );
            }) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No tasks found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
