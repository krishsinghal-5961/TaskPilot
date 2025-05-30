
export type TaskStatus = "todo" | "in-progress" | "done" | "blocked";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string; 
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null; 
  assigneeId?: string | null; 
  assigneeName?: string | null; 
  dependencies?: string[]; 
  progress: number; 
  createdAt: string; 
  updatedAt: string; 
  userId?: string; 
}

export type UserRole = "manager" | "employee";

export interface UserProfile {
  uid: string; 
  name: string;
  email: string; 
  avatarUrl?: string;
  currentWorkload?: number; 
  role: UserRole;
  designation?: string;
}

export interface Notification {
  id: string; 
  message: string;
  timestamp: string; 
  read: boolean;
  link?: string;
  userId: string; 
}

export interface ChatMessage {
  id: string;
  senderId: string; // UID of the sender
  senderName: string; // Name of the sender
  receiverId?: string; // UID of the receiver (for direct messages)
  // groupId?: string; // For group messages (not implemented yet)
  text: string;
  timestamp: string; // ISO Date string
  imageUrl?: string; // For image messages (not implemented yet)
}
