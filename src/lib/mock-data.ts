
import type { Notification, UserProfile, Task } from "@/types";
import { formatISO, subDays } from "date-fns";
import { getInitials } from "./utils";

const today = new Date();

// Sample User Data
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

// Sample Task Data
export const mockTasks: Task[] = [
  {
    id: "task-1",
    title: "Design Homepage UI",
    description: "Create a modern and responsive design for the TaskPilot homepage, including wireframes and mockups.",
    status: "in-progress",
    priority: "high",
    dueDate: formatISO(new Date(new Date().setDate(new Date().getDate() + 7))),
    assigneeId: "rohan-dev", 
    progress: 60,
    dependencies: [],
    createdAt: formatISO(subDays(new Date(), 10)),
    updatedAt: formatISO(subDays(new Date(), 1)),
    userId: "priya-mgr",
  },
  {
    id: "task-2",
    title: "Develop Authentication System",
    description: "Implement user registration, login, and session management using secure practices.",
    status: "todo",
    priority: "high",
    dueDate: formatISO(new Date(new Date().setDate(new Date().getDate() + 14))),
    assigneeId: "aisha-dev", 
    progress: 10,
    dependencies: [],
    createdAt: formatISO(subDays(new Date(), 8)),
    updatedAt: formatISO(subDays(new Date(), 2)),
    userId: "priya-mgr",
  },
  {
    id: "task-3",
    title: "Setup CI/CD Pipeline",
    description: "Configure a continuous integration and continuous deployment pipeline for automated testing and deployment.",
    status: "todo",
    priority: "medium",
    dueDate: formatISO(new Date(new Date().setDate(new Date().getDate() + 21))),
    assigneeId: "rohan-dev",
    progress: 0,
    dependencies: ["task-2"], 
    createdAt: formatISO(subDays(new Date(), 5)),
    updatedAt: formatISO(subDays(new Date(), 5)),
    userId: "priya-mgr",
  },
  {
    id: "task-4",
    title: "Write API Documentation",
    description: "Document all available API endpoints, request/response formats, and authentication methods.",
    status: "todo",
    priority: "low",
    dueDate: null, 
    assigneeId: null, 
    progress: 0,
    dependencies: [],
    createdAt: formatISO(subDays(new Date(), 3)),
    updatedAt: formatISO(subDays(new Date(), 3)),
    userId: "priya-mgr",
  },
  {
    id: "task-5",
    title: "Test Application Performance",
    description: "Conduct load testing and performance analysis to identify and address bottlenecks.",
    status: "done",
    priority: "medium",
    dueDate: formatISO(subDays(new Date(), 2)), 
    assigneeId: "vikram-qa", 
    progress: 100,
    dependencies: [],
    createdAt: formatISO(subDays(new Date(), 15)),
    updatedAt: formatISO(subDays(new Date(), 1)),
    userId: "priya-mgr",
  },
];

// Sample Notifications Data
export const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    userId: "rohan-dev",
    message: "Task 'Design Homepage UI' is due in 7 days.",
    timestamp: formatISO(subDays(new Date(), 1)),
    read: false,
    link: "/tasks/task-1",
  },
  {
    id: "notif-2",
    userId: "priya-mgr", 
    message: "Aisha Khan updated progress on 'Develop Authentication System'.",
    timestamp: formatISO(subDays(new Date(), 0)),
    read: false,
    link: "/tasks/task-2",
  },
  {
    id: "notif-3",
    userId: "vikram-qa",
    message: "New task 'Conduct User Acceptance Testing' assigned to you.",
    timestamp: formatISO(subDays(new Date(), 2)),
    read: true,
    link: "/tasks/new-task-id-placeholder", 
  },
   {
    id: 'notif-4',
    userId: 'priya-mgr',
    message: "Rohan Mehra completed task 'Design Homepage UI'",
    timestamp: formatISO(new Date()),
    read: false,
    link: '/tasks/task-1',
  },
  {
    id: 'notif-5',
    userId: 'rohan-dev',
    message: "Task 'Develop Authentication System' (dependency for 'Setup CI/CD Pipeline') has been completed.",
    timestamp: formatISO(new Date()),
    read: false,
    link: '/tasks/task-3',
  },
];
