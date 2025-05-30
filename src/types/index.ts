
export type TaskStatus = "todo" | "in-progress" | "done" | "blocked";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string; // ISO Date string
  assigneeId?: string;
  dependencies?: string[]; // Array of Task IDs
  progress: number; // 0-100
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
}

export type UserRole = "manager" | "employee";

export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
  email: string;
  currentWorkload?: number; // 0-100, for AI assignment
  role: UserRole;
}

export interface Notification {
  id: string;
  message: string;
  timestamp: string; // ISO Date string
  read: boolean;
  link?: string; // Optional link for the notification
}
