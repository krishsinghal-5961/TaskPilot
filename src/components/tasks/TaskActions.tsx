
"use client";

import { MoreHorizontal, Edit, Trash2, Eye, PlayCircle, PauseCircle, CheckCircle2Icon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Task } from "@/types";

interface TaskActionsProps {
  task: Task;
  onDelete: (taskId: string) => void;
  onUpdateStatus: (taskId: string, status: Task["status"]) => void;
  canModify?: boolean; // Added to control edit/delete/status update actions
}

export function TaskActions({ task, onDelete, onUpdateStatus, canModify = false }: TaskActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/tasks/${task.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Link>
        </DropdownMenuItem>
        {canModify && (
          <DropdownMenuItem asChild>
            <Link href={`/tasks/${task.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Task
            </Link>
          </DropdownMenuItem>
        )}
        {canModify && <DropdownMenuSeparator />}
        {canModify && task.status !== "in-progress" && task.status !== "done" && (
          <DropdownMenuItem onClick={() => onUpdateStatus(task.id, "in-progress")}>
            <PlayCircle className="mr-2 h-4 w-4" />
            Start Task
          </DropdownMenuItem>
        )}
        {canModify && task.status === "in-progress" && (
          <DropdownMenuItem onClick={() => onUpdateStatus(task.id, "todo")}> {/* Or 'paused' if you add that status */}
            <PauseCircle className="mr-2 h-4 w-4" />
            Pause Task
          </DropdownMenuItem>
        )}
         {canModify && task.status !== "done" && (
          <DropdownMenuItem onClick={() => onUpdateStatus(task.id, "done")}>
            <CheckCircle2Icon className="mr-2 h-4 w-4 text-green-500" />
            Mark as Done
          </DropdownMenuItem>
        )}
        {canModify && <DropdownMenuSeparator />}
        {canModify && (
          <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Task
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
