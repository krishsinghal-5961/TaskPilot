
import type { Task, User, Notification, TaskStatus, TaskPriority, UserRole } from "@/types";
import { addDays, subDays, formatISO } from "date-fns";

const today = new Date();

export const mockUsers: User[] = [
  { id: "user-1", name: "Alice Wonderland", email: "alice@example.com", avatarUrl: "https://placehold.co/100x100.png?text=AW", currentWorkload: 30, role: "manager" },
  { id: "user-2", name: "Bob The Builder", email: "bob@example.com", avatarUrl: "https://placehold.co/100x100.png?text=BB", currentWorkload: 70, role: "employee" },
  { id: "user-3", name: "Charlie Chaplin", email: "charlie@example.com", avatarUrl: "https://placehold.co/100x100.png?text=CC", currentWorkload: 50, role: "employee" },
  { id: "user-4", name: "Diana Prince", email: "diana@example.com", avatarUrl: "https://placehold.co/100x100.png?text=DP", currentWorkload: 20, role: "employee" },
];

export const mockTasks: Task[] = [
  {
    id: "task-1",
    title: "Design Homepage UI",
    description: "Create a modern and responsive design for the homepage.",
    status: "in-progress" as TaskStatus,
    priority: "high" as TaskPriority,
    dueDate: formatISO(addDays(today, 7)),
    assigneeId: "user-1", // Alice (manager) can also be assigned tasks
    progress: 60,
    dependencies: [],
    createdAt: formatISO(subDays(today, 3)),
    updatedAt: formatISO(subDays(today, 1)),
  },
  {
    id: "task-2",
    title: "Develop Authentication System",
    description: "Implement secure user authentication using OAuth 2.0.",
    status: "todo" as TaskStatus,
    priority: "high" as TaskPriority,
    dueDate: formatISO(addDays(today, 14)),
    assigneeId: "user-2",
    progress: 0,
    dependencies: [],
    createdAt: formatISO(subDays(today, 5)),
    updatedAt: formatISO(subDays(today, 5)),
  },
  {
    id: "task-3",
    title: "Setup Project Backend",
    description: "Initialize backend services and database schema.",
    status: "done" as TaskStatus,
    priority: "medium" as TaskPriority,
    dueDate: formatISO(subDays(today, 2)),
    assigneeId: "user-3",
    progress: 100,
    dependencies: [],
    createdAt: formatISO(subDays(today, 10)),
    updatedAt: formatISO(subDays(today, 2)),
  },
  {
    id: "task-4",
    title: "Write API Documentation",
    description: "Document all public API endpoints for external developers.",
    status: "blocked" as TaskStatus,
    priority: "medium" as TaskPriority,
    dueDate: formatISO(addDays(today, 21)),
    assigneeId: "user-1",
    progress: 10,
    dependencies: ["task-2"], // Depends on authentication system
    createdAt: formatISO(subDays(today, 1)),
    updatedAt: formatISO(subDays(today, 1)),
  },
  {
    id: "task-5",
    title: "User Acceptance Testing",
    description: "Conduct UAT with a select group of users.",
    status: "todo" as TaskStatus,
    priority: "low" as TaskPriority,
    dueDate: formatISO(addDays(today, 30)),
    progress: 0,
    dependencies: ["task-1", "task-2"],
    createdAt: formatISO(today),
    updatedAt: formatISO(today),
  },
   {
    id: "task-6",
    title: "Deploy to Staging",
    description: "Deploy the current version to the staging environment for final checks.",
    status: "in-progress" as TaskStatus,
    priority: "high" as TaskPriority,
    dueDate: formatISO(addDays(today, 3)),
    assigneeId: "user-4",
    progress: 25,
    dependencies: ["task-3"],
    createdAt: formatISO(subDays(today, 2)),
    updatedAt: formatISO(today),
  },
  {
    id: "task-7",
    title: "Client Demo Preparation",
    description: "Prepare slides and demo script for the upcoming client presentation.",
    status: "todo" as TaskStatus,
    priority: "medium" as TaskPriority,
    dueDate: formatISO(addDays(today, 5)),
    assigneeId: "user-3",
    progress: 0,
    dependencies: [],
    createdAt: formatISO(subDays(today, 1)),
    updatedAt: formatISO(subDays(today, 1)),
  }
];

export const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    message: "Task 'Develop Authentication System' is due in 7 days.",
    timestamp: formatISO(subDays(today, 1)),
    read: false,
    link: "/tasks/task-2",
  },
  {
    id: "notif-2",
    message: "Alice Wonderland updated progress on 'Design Homepage UI'.",
    timestamp: formatISO(subDays(today, 0)),
    read: false,
    link: "/tasks/task-1",
  },
  {
    id: "notif-3",
    message: "Task 'Setup Project Backend' was completed by Charlie Chaplin.",
    timestamp: formatISO(subDays(today, 2)),
    read: true,
    link: "/tasks/task-3",
  },
  {
    id: "notif-4",
    message: "A new task 'User Acceptance Testing' has been created.",
    timestamp: formatISO(today),
    read: true,
  }
];
