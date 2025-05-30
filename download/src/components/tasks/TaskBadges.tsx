import { Badge } from "@/components/ui/badge";
import type { TaskStatus, TaskPriority } from "@/types";
import { cn } from "@/lib/utils";
import { Circle, CircleDot, CheckCircle2, XCircle, AlertOctagon, ArrowUp, ArrowDown, Minus } from "lucide-react";

interface TaskStatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

export function TaskStatusBadge({ status, className }: TaskStatusBadgeProps) {
  const statusConfig = {
    todo: { label: "To Do", color: "bg-slate-500 hover:bg-slate-600", icon: Circle },
    "in-progress": { label: "In Progress", color: "bg-blue-500 hover:bg-blue-600", icon: CircleDot },
    done: { label: "Done", color: "bg-green-500 hover:bg-green-600", icon: CheckCircle2 },
    blocked: { label: "Blocked", color: "bg-red-500 hover:bg-red-600", icon: XCircle },
  };
  const Icon = statusConfig[status]?.icon || AlertOctagon;
  return (
    <Badge
      variant="secondary"
      className={cn(
        "text-xs font-semibold capitalize text-white",
        statusConfig[status]?.color || "bg-gray-400",
        className
      )}
    >
      <Icon className="mr-1 h-3 w-3" />
      {statusConfig[status]?.label || status}
    </Badge>
  );
}

interface TaskPriorityBadgeProps {
  priority: TaskPriority;
  className?: string;
}

export function TaskPriorityBadge({ priority, className }: TaskPriorityBadgeProps) {
  const priorityConfig = {
    low: { label: "Low", color: "bg-sky-500 hover:bg-sky-600", icon: ArrowDown },
    medium: { label: "Medium", color: "bg-amber-500 hover:bg-amber-600", icon: Minus },
    high: { label: "High", color: "bg-rose-500 hover:bg-rose-600", icon: ArrowUp },
  };
  const Icon = priorityConfig[priority]?.icon || AlertOctagon;
  return (
    <Badge
      variant="secondary"
      className={cn(
        "text-xs font-semibold capitalize text-white",
        priorityConfig[priority]?.color || "bg-gray-400",
        className
      )}
    >
      <Icon className="mr-1 h-3 w-3" />
      {priorityConfig[priority]?.label || priority}
    </Badge>
  );
}
