
import type { Notification, UserProfile, Task, ChatMessage } from "@/types";
import { formatISO, subDays, addDays, subHours, subMinutes } from "date-fns";
import { getInitials } from "./utils";

const managerId = "priya-mgr";
const rohanId = "rohan-dev";
const aishaId = "aisha-dev";
const vikramId = "vikram-qa";
const krishId = "krish-pe";

const today = new Date();

// Sample User Data
export const mockUsers: UserProfile[] = [
  {
    uid: managerId,
    name: "Priya Sharma",
    email: "priya-mgr@gmail.com",
    role: "manager",
    designation: "Engineering Manager",
    avatarUrl: `https://placehold.co/100x100.png?text=${getInitials("Priya Sharma")}`,
    currentWorkload: 20,
  },
  {
    uid: rohanId,
    name: "Rohan Mehra",
    email: "rohan-dev@gmail.com",
    role: "employee",
    designation: "Software Developer",
    avatarUrl: `https://placehold.co/100x100.png?text=${getInitials("Rohan Mehra")}`,
    currentWorkload: 75,
  },
  {
    uid: aishaId,
    name: "Aisha Khan",
    email: "aisha-dev@gmail.com",
    role: "employee",
    designation: "Frontend Developer",
    avatarUrl: `https://placehold.co/100x100.png?text=${getInitials("Aisha Khan")}`,
    currentWorkload: 50,
  },
  {
    uid: vikramId,
    name: "Vikram Singh",
    email: "vikram-qa@gmail.com",
    role: "employee",
    designation: "QA Engineer",
    avatarUrl: `https://placehold.co/100x100.png?text=${getInitials("Vikram Singh")}`,
    currentWorkload: 60,
  },
  {
    uid: krishId,
    name: "Krish Singhal",
    email: "krish-pe@gmail.com",
    role: "employee",
    designation: "Prompt Engineer",
    avatarUrl: `https://placehold.co/100x100.png?text=${getInitials("Krish Singhal")}`,
    currentWorkload: 10,
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
    dueDate: formatISO(addDays(today, 7)),
    assigneeId: rohanId,
    progress: 60,
    dependencies: [],
    createdAt: formatISO(subDays(today, 10)),
    updatedAt: formatISO(subDays(today, 1)),
    userId: managerId,
  },
  {
    id: "task-2",
    title: "Develop Authentication System",
    description: "Implement user registration, login, and session management using secure practices.",
    status: "todo",
    priority: "high",
    dueDate: formatISO(addDays(today, 14)),
    assigneeId: aishaId,
    progress: 10,
    dependencies: [],
    createdAt: formatISO(subDays(today, 8)),
    updatedAt: formatISO(subDays(today, 2)),
    userId: managerId,
  },
  {
    id: "task-3",
    title: "Setup CI/CD Pipeline",
    description: "Configure a continuous integration and continuous deployment pipeline for automated testing and deployment.",
    status: "blocked", // Changed to blocked for variety
    priority: "medium",
    dueDate: formatISO(addDays(today, 21)),
    assigneeId: rohanId,
    progress: 0,
    dependencies: ["task-2"], // Depends on auth system
    createdAt: formatISO(subDays(today, 5)),
    updatedAt: formatISO(subDays(today, 5)),
    userId: managerId,
  },
  {
    id: "task-4",
    title: "Write API Documentation",
    description: "Document all available API endpoints, request/response formats, and authentication methods.",
    status: "todo",
    priority: "low",
    dueDate: null,
    assigneeId: null, // Unassigned task
    progress: 0,
    dependencies: [],
    createdAt: formatISO(subDays(today, 3)),
    updatedAt: formatISO(subDays(today, 3)),
    userId: managerId,
  },
  {
    id: "task-5",
    title: "Test Application Performance",
    description: "Conduct load testing and performance analysis to identify and address bottlenecks.",
    status: "done",
    priority: "medium",
    dueDate: formatISO(subDays(today, 2)), // Due in the past, but done
    assigneeId: vikramId,
    progress: 100,
    dependencies: [],
    createdAt: formatISO(subDays(today, 15)),
    updatedAt: formatISO(subDays(today, 1)),
    userId: managerId,
  },
  {
    id: "task-6",
    title: "Write Project Proposal for New Feature",
    description: "Outline the scope, benefits, and resources required for the upcoming AI-driven reporting feature.",
    status: "in-progress", // Changed
    priority: "high",
    dueDate: formatISO(addDays(today, 5)),
    assigneeId: krishId,
    progress: 30, // Updated progress
    dependencies: [], 
    createdAt: formatISO(subDays(today, 4)),
    updatedAt: formatISO(subDays(today, 1)),
    userId: managerId,
  },
  {
    id: "task-7",
    title: "User Acceptance Testing (UAT) for v1.0",
    description: "Coordinate and execute UAT with stakeholders for the first version of the application.",
    status: "todo",
    priority: "high",
    dueDate: formatISO(addDays(today, 10)),
    assigneeId: vikramId,
    progress: 0,
    dependencies: ["task-1", "task-2"],
    createdAt: formatISO(subDays(today, 2)),
    updatedAt: formatISO(subDays(today, 2)),
    userId: managerId,
  },
  {
    id: "task-8",
    title: "Prepare Marketing Materials",
    description: "Create brochures and online content for the upcoming product launch.",
    status: "in-progress",
    priority: "medium",
    dueDate: formatISO(addDays(today, 30)),
    assigneeId: aishaId,
    progress: 45,
    dependencies: [],
    createdAt: formatISO(subDays(today, 6)),
    updatedAt: formatISO(subDays(today, 1)),
    userId: managerId,
  },
  {
    id: "task-9",
    title: "Overdue Task Example",
    description: "This task was due yesterday and is not done.",
    status: "in-progress",
    priority: "high",
    dueDate: formatISO(subDays(today, 1)), // Overdue
    assigneeId: rohanId,
    progress: 10,
    dependencies: [],
    createdAt: formatISO(subDays(today, 5)),
    updatedAt: formatISO(subDays(today, 1)),
    userId: managerId,
  },
  {
    id: "task-10",
    title: "Deploy to Staging",
    description: "Deploy the current build to the staging environment for QA.",
    status: "done",
    priority: "medium",
    dueDate: formatISO(addDays(today, 1)),
    assigneeId: "rohan-dev",
    progress: 100,
    dependencies: ["task-3"],
    createdAt: formatISO(subDays(today, 0)),
    updatedAt: formatISO(subDays(today, 0)),
    userId: managerId,
  }
];

// Sample Notifications Data
export const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    userId: rohanId,
    message: `Task 'Design Homepage UI' is due in ${formatISO(addDays(today, 7), { representation: 'date' })}.`,
    timestamp: formatISO(subDays(today, 1)),
    read: false,
    link: "/tasks/task-1",
  },
  {
    id: "notif-2",
    userId: managerId,
    message: "Aisha Khan updated progress on 'Develop Authentication System' to 10%.",
    timestamp: formatISO(subHours(today, 1)), 
    read: false,
    link: "/tasks/task-2",
  },
  {
    id: "notif-3",
    userId: vikramId,
    message: "New task 'User Acceptance Testing (UAT) for v1.0' assigned to you.",
    timestamp: formatISO(subDays(today, 2)),
    read: true,
    link: "/tasks/task-7",
  },
  {
    id: 'notif-4',
    userId: managerId,
    message: "Vikram Singh completed task 'Test Application Performance'.",
    timestamp: formatISO(subDays(today, 1)),
    read: true,
    link: '/tasks/task-5',
  },
  {
    id: 'notif-5',
    userId: rohanId, 
    message: "Dependency 'Develop Authentication System' for your task 'Setup CI/CD Pipeline' has been updated (Progress: 10%).",
    timestamp: formatISO(today),
    read: false,
    link: '/tasks/task-3',
  },
  {
    id: 'notif-6',
    userId: krishId,
    message: "Your task 'Write Project Proposal for New Feature' progress updated to 30%.",
    timestamp: formatISO(subDays(today, 1)),
    read: false,
    link: '/tasks/task-6',
  },
  {
    id: 'notif-7',
    userId: managerId,
    message: "Task 'Write API Documentation' has no assignee yet. Please assign it.",
    timestamp: formatISO(subDays(today, 3)),
    read: false,
    link: '/tasks/task-4',
  },
  {
    id: 'notif-8',
    userId: aishaId,
    message: `Reminder: Task 'Prepare Marketing Materials' due date is approaching (${formatISO(addDays(today, 30), { representation: 'date' })}).`,
    timestamp: formatISO(addDays(today, 12)), 
    read: false,
    link: '/tasks/task-8',
  },
  {
    id: 'notif-9',
    userId: managerId,
    message: "Rohan Mehra's task 'Overdue Task Example' is now overdue.",
    timestamp: formatISO(today),
    read: false,
    link: '/tasks/task-9',
  },
  {
    id: 'notif-10',
    userId: rohanId,
    message: "Your task 'Setup CI/CD Pipeline' is currently blocked because 'Develop Authentication System' is not yet done.",
    timestamp: formatISO(subHours(today, 2)),
    read: true,
    link: '/tasks/task-3',
  }
];

// Sample Chat Messages
export const mockChatMessages: ChatMessage[] = [
  {
    id: 'chat-1',
    senderId: managerId,
    senderName: "Priya Sharma",
    receiverId: rohanId,
    text: "Hi Rohan, how's the homepage UI design coming along?",
    timestamp: formatISO(subMinutes(today, 30)),
  },
  {
    id: 'chat-2',
    senderId: rohanId,
    senderName: "Rohan Mehra",
    receiverId: managerId,
    text: "Hey Priya, making good progress! Should have the first draft by EOD.",
    timestamp: formatISO(subMinutes(today, 28)),
  },
  {
    id: 'chat-3',
    senderId: aishaId,
    senderName: "Aisha Khan",
    receiverId: vikramId,
    text: "Vikram, are you free to sync on the UAT plan for v1.0 later today?",
    timestamp: formatISO(subMinutes(today, 60)),
  },
  {
    id: 'chat-4',
    senderId: vikramId,
    senderName: "Vikram Singh",
    receiverId: aishaId,
    text: "Sure Aisha, how about 3 PM?",
    timestamp: formatISO(subMinutes(today, 55)),
  },
   {
    id: 'chat-5',
    senderId: managerId,
    senderName: "Priya Sharma",
    receiverId: aishaId,
    text: "Aisha, just checking in on the auth system. Any blockers?",
    timestamp: formatISO(subHours(today, 2)),
  },
];
