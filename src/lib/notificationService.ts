
"use client"; 

// This service needs to be refactored to use Firestore for notifications.
// For now, it will be non-functional as mockNotifications is deprecated.
// Placeholder functions are provided.

import type { Notification, Task, UserProfile } from "@/types";
import { formatISO } from "date-fns";
// import { db } from '@/lib/firebase'; // Will be needed for Firestore
// import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

const NOTIFICATIONS_COLLECTION = 'notifications';

async function _addRawNotificationToFirestore(userId: string, message: string, link?: string): Promise<Notification | null> {
  console.warn("_addRawNotificationToFirestore is not fully implemented with Firestore yet.");
  // Example structure for Firestore:
  // const newNotifData = {
  //   userId,
  //   message,
  //   link: link || null,
  //   read: false,
  //   timestamp: serverTimestamp(), // Use server timestamp
  // };
  // try {
  //   const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), newNotifData);
  //   return { id: docRef.id, ...newNotifData, timestamp: new Date().toISOString() } as Notification; // Approximate client-side
  // } catch (error) {
  //   console.error("Error adding notification to Firestore:", error);
  //   return null;
  // }
  return {
    id: `temp-notif-${Date.now()}`,
    userId,
    message,
    link,
    read: false,
    timestamp: new Date().toISOString()
  }
}

export async function notifyManagerOfProgressChange(task: Task, updatedByUserName: string | undefined) {
  // Find manager(s) - this logic needs to be robust, e.g. project managers or a global manager role
  // For now, let's assume a generic manager notification (or this might be per project)
  // This function is a placeholder until user roles and notification targeting is fully implemented with Firestore.
  const actor = updatedByUserName || "The system";
  console.log(`Placeholder: Notify manager about progress for task '${task.title}' to ${task.progress}% by ${actor}.`);
  // await _addRawNotificationToFirestore("manager-uid", /* ... */);
}

export async function notifyManagerOfTaskCompletion(task: Task, completedByUserName: string | undefined) {
  const actor = completedByUserName || "The system";
  console.log(`Placeholder: Notify manager task '${task.title}' was completed by ${actor}.`);
  // await _addRawNotificationToFirestore("manager-uid", /* ... */);
}

export async function notifyEmployeeOfTaskAssignment(task: Task, employeeId: string) {
  if (employeeId) {
     console.log(`Placeholder: Notify employee ${employeeId} about assignment of task '${task.title}'.`);
    // await _addRawNotificationToFirestore(employeeId, `You have been assigned a new task: '${task.title}'.`, `/tasks/${task.id}`);
  }
}

export async function notifyEmployeeOfDependencyCompletion(dependentTask: Task, completedDependencyTask: Task) {
   if (dependentTask.assigneeId) {
     console.log(`Placeholder: Notify employee ${dependentTask.assigneeId} that prerequisite task '${completedDependencyTask.title}' for '${dependentTask.title}' is complete.`);
    // await _addRawNotificationToFirestore(dependentTask.assigneeId, /* ... */);
   }
}

export async function checkAndNotifyForDependentTasks(completedTask: Task) {
  // This would query Firestore for tasks that depend on `completedTask.id`
  console.log(`Placeholder: Check and notify for tasks dependent on '${completedTask.title}'.`);
}

// Function to get notifications for a user from Firestore (to be implemented)
export async function getNotificationsForUser(userId: string): Promise<Notification[]> {
  console.warn("getNotificationsForUser is not implemented with Firestore yet.");
  // const notificationsRef = collection(db, NOTIFICATIONS_COLLECTION);
  // const q = query(notificationsRef, where("userId", "==", userId), orderBy("timestamp", "desc"));
  // const querySnapshot = await getDocs(q);
  // const notifications: Notification[] = [];
  // querySnapshot.forEach((doc) => {
  //   const data = doc.data();
  //   notifications.push({
  //     id: doc.id,
  //     ...data,
  //     timestamp: (data.timestamp as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
  //   } as Notification);
  // });
  // return notifications;
  return []; // Return empty for now
}
