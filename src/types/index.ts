
export type TaskStatus = "todo" | "in-progress" | "done" | "blocked";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string; // Firestore document ID
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null; // ISO Date string, or null if not set
  assigneeId?: string | null; // Firebase Auth UID of the assignee
  assigneeName?: string | null; // For display purposes
  dependencies?: string[]; // Array of Task IDs
  progress: number; // 0-100
  createdAt: string; // ISO Date string (server timestamp preferably)
  updatedAt: string; // ISO Date string (server timestamp preferably)
  userId?: string; // Firebase Auth UID of the user who created/owns the task
}

export type UserRole = "manager" | "employee";

export interface UserProfile {
  uid: string; // Firebase Auth UID, also Firestore document ID in 'users' collection
  name: string;
  email: string; // Email used for Firebase Auth
  avatarUrl?: string;
  currentWorkload?: number; // 0-100, for AI assignment
  role: UserRole;
  designation?: string;
}

export interface Notification {
  id: string; // Firestore document ID
  message: string;
  timestamp: string; // ISO Date string (server timestamp preferably)
  read: boolean;
  link?: string;
  userId: string; // Firebase Auth UID of the recipient
}
