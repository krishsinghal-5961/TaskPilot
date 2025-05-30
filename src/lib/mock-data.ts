
import type { Notification, UserProfile, Task } from "@/types";
import { formatISO, subDays } from "date-fns";
import { getInitials } from "./utils";

const today = new Date();

// Sample User Data - restored for mock functionality
export const mockUsers: UserProfile[] = [
  {
    uid: "priya-mgr", // Manager
    name: "Priya Sharma",
    email: "priya-mgr@gmail.com",
    role: "manager",
    designation: "Engineering Manager",
    avatarUrl: `https://placehold.co/100x100.png?text=${getInitials("Priya Sharma")}`,
    currentWorkload: 30,
  },
  {
    uid: "rohan-dev", // Employee
    name: "Rohan Mehra",
    email: "rohan-dev@gmail.com",
    role: "employee",
    designation: "Software Developer",
    avatarUrl: `https://placehold.co/100x100.png?text=${getInitials("Rohan Mehra")}`,
    currentWorkload: 75,
  },
  {
    uid: "aisha-dev", // Employee
    name: "Aisha Khan",
    email: "aisha-dev@gmail.com",
    role: "employee",
    designation: "Frontend Developer",
    avatarUrl: `https://placehold.co/100x100.png?text=${getInitials("Aisha Khan")}`,
    currentWorkload: 50,
  },
  {
    uid: "vikram-qa", // Employee
    name: "Vikram Singh",
    email: "vikram-qa@gmail.com",
    role: "employee",
    designation: "QA Engineer",
    avatarUrl: `https://placehold.co/100x100.png?text=${getInitials("Vikram Singh")}`,
    currentWorkload: 60,
  },
];

// Sample Task Data - restored for mock functionality
export const mockTasks: Task[] = [
  {
    id: "task-1",
    title: "Design Homepage UI",
    description: "Create a modern and responsive design for the TaskPilot homepage, including wireframes and mockups.",
    status: "in-progress",
    priority: "high",
    dueDate: formatISO(new Date(today.setDate(today.getDate() + 7))), // Due in 7 days
    assigneeId: "rohan-dev", // Rohan Mehra
    progress: 60,
    dependencies: [],
    createdAt: formatISO(subDays(today, 10)),
    updatedAt: formatISO(subDays(today, 1)),
    userId: "priya-mgr",
  },
  {
    id: "task-2",
    title: "Develop Authentication System",
    description: "Implement user registration, login, and session management using secure practices.",
    status: "todo",
    priority: "high",
    dueDate: formatISO(new Date(today.setDate(today.getDate() + 14))), // Due in 14 days
    assigneeId: "aisha-dev", // Aisha Khan
    progress: 10,
    dependencies: [],
    createdAt: formatISO(subDays(today, 8)),
    updatedAt: formatISO(subDays(today, 2)),
    userId: "priya-mgr",
  },
  {
    id: "task-3",
    title: "Setup CI/CD Pipeline",
    description: "Configure a continuous integration and continuous deployment pipeline for automated testing and deployment.",
    status: "todo",
    priority: "medium",
    dueDate: formatISO(new Date(today.setDate(today.getDate() + 21))), // Due in 21 days
    assigneeId: "rohan-dev", // Rohan Mehra
    progress: 0,
    dependencies: ["task-2"], // Depends on auth system
    createdAt: formatISO(subDays(today, 5)),
    updatedAt: formatISO(subDays(today, 5)),
    userId: "priya-mgr",
  },
  {
    id: "task-4",
    title: "Write API Documentation",
    description: "Document all available API endpoints, request/response formats, and authentication methods.",
    status: "todo",
    priority: "low",
    dueDate: null, // No due date
    assigneeId: null, // Unassigned
    progress: 0,
    dependencies: [],
    createdAt: formatISO(subDays(today, 3)),
    updatedAt: formatISO(subDays(today, 3)),
    userId: "priya-mgr",
  },
  {
    id: "task-5",
    title: "Test Application Performance",
    description: "Conduct load testing and performance analysis to identify and address bottlenecks.",
    status: "done",
    priority: "medium",
    dueDate: formatISO(subDays(today, 2)), // Was due 2 days ago
    assigneeId: "vikram-qa", // Vikram Singh
    progress: 100,
    dependencies: [],
    createdAt: formatISO(subDays(today, 15)),
    updatedAt: formatISO(subDays(today, 1)),
    userId: "priya-mgr",
  },
];


export const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    userId: "rohan-dev",
    message: "Task 'Design Homepage UI' is due in 7 days.",
    timestamp: formatISO(subDays(today, 1)),
    read: false,
    link: "/tasks/task-1",
  },
  {
    id: "notif-2",
    userId: "priya-mgr", // Manager
    message: "Aisha Khan updated progress on 'Develop Authentication System'.",
    timestamp: formatISO(subDays(today, 0)),
    read: false,
    link: "/tasks/task-2",
  },
  {
    id: "notif-3",
    userId: "vikram-qa",
    message: "New task 'Conduct User Acceptance Testing' assigned to you.",
    timestamp: formatISO(subDays(today, 2)),
    read: true,
    link: "/tasks/new-task-id-placeholder", // Placeholder ID
  },
];
