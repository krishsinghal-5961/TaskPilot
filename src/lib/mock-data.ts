
// This file is now largely deprecated for users and tasks as data will come from Firebase.
// It might still be used for notifications temporarily or for initial seeding structure.

import type { Notification } from "@/types";
import { formatISO, subDays } from "date-fns";

const today = new Date();

// mockUsers and mockTasks are no longer the source of truth.
// Data should be created/managed in Firebase Authentication and Firestore.

export const mockNotifications: Notification[] = [
  // Note: Notification links and user IDs might need adjustment
  // if they reference old mock task/user IDs.
  // This will be part of refactoring notifications to use Firestore.
  {
    id: "notif-1",
    userId: "some-user-uid", // Replace with actual user UIDs
    message: "Task 'Develop Authentication System' is due in 7 days.",
    timestamp: formatISO(subDays(today, 1)),
    read: false,
    link: "/tasks/some-task-id", // Replace with actual task IDs from Firestore
  },
  {
    id: "notif-2",
    userId: "some-user-uid",
    message: "Priya Sharma updated progress on 'Design Homepage UI'.",
    timestamp: formatISO(subDays(today, 0)),
    read: false,
    link: "/tasks/some-task-id",
  },
];
