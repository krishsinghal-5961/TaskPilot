
"use client"; 

// This service needs to be refactored to use Firestore for notifications.
// For now, it will be non-functional as mockNotifications is deprecated.
// Placeholder functions are provided.

import type { Notification, Task, UserProfile } from "@/types";
import { formatISO } from "date-fns";
import { mockNotifications } from '@/lib/mock-data'; // For adding to the mock list

// This function is a stand-in. In a real app, it would interact with a backend.
async function _addNotification(userId: string, message: string, link?: string): Promise<Notification | null> {
  const newNotif: Notification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, // More unique ID
    userId,
    message,
    link,
    read: false,
    timestamp: new Date().toISOString()
  };
  mockNotifications.unshift(newNotif); // Add to the beginning of the array
  // console.log("Notification added (mock):", newNotif);
  return newNotif;
}

export async function notifyManagerOfProgressChange(task: Task, updatedByUserName: string | undefined) {
  const actor = updatedByUserName || "A team member";
  const message = `Progress on task '${task.title}' updated to ${task.progress}% by ${actor}.`;
  // Assuming a generic manager ID for now, or logic to find the actual manager.
  // For simplicity, let's assume 'priya-mgr' is the manager to notify.
  const managerId = "priya-mgr"; 
  await _addNotification(managerId, message, `/tasks/${task.id}`);
}

export async function notifyManagerOfTaskCompletion(task: Task, completedByUserName: string | undefined) {
  const actor = completedByUserName || "A team member";
  const message = `Task '${task.title}' was completed by ${actor}.`;
  const managerId = "priya-mgr";
  await _addNotification(managerId, message, `/tasks/${task.id}`);
}

export async function notifyEmployeeOfTaskAssignment(task: Task, employeeId: string) {
  if (employeeId) {
    const message = `You have been assigned a new task: '${task.title}'.`;
    await _addNotification(employeeId, message, `/tasks/${task.id}`);
  }
}

export async function notifyEmployeeOfDependencyCompletion(dependentTask: Task, completedDependencyTask: Task) {
   if (dependentTask.assigneeId) {
     const message = `A prerequisite task '${completedDependencyTask.title}' for your task '${dependentTask.title}' has been completed. You can now start working on it.`;
     await _addNotification(dependentTask.assigneeId, message, `/tasks/${dependentTask.id}`);
   }
}

export async function checkAndNotifyForDependentTasks(completedTask: Task) {
  // Find tasks that depend on the completedTask
  const tasksThatDependOnThis = mockTasks.filter(
    (task) => task.dependencies && task.dependencies.includes(completedTask.id)
  );

  for (const dependentTask of tasksThatDependOnThis) {
    // Check if all other dependencies for this dependentTask are also met
    const allDependenciesMet = dependentTask.dependencies?.every(depId => {
      if (depId === completedTask.id) return true; // This one is just completed
      const otherDepTask = mockTasks.find(t => t.id === depId);
      return otherDepTask?.status === 'done';
    });

    if (allDependenciesMet && dependentTask.status === 'blocked') { // If it was blocked due to this
      // Optionally, automatically unblock the task
      // dependentTask.status = 'todo'; 
      // dependentTask.updatedAt = formatISO(new Date());
      // console.log(`Task '${dependentTask.title}' unblocked as its dependencies are met.`);
      // For now, just notify:
      if (dependentTask.assigneeId) {
        await notifyEmployeeOfDependencyCompletion(dependentTask, completedTask);
      }
    } else if (allDependenciesMet && dependentTask.assigneeId) {
      // If not blocked but dependencies are met, still might be a useful notification
       await notifyEmployeeOfDependencyCompletion(dependentTask, completedTask);
    }
  }
}

// Function to get notifications for a user (using mock data)
export async function getNotificationsForUser(userId: string): Promise<Notification[]> {
  // This function would be more complex if directly manipulating global mockNotifications
  // For now, NotificationBell and NotificationList directly use mockNotifications.
  // If we needed more sophisticated filtering/sorting here, we could implement it.
  return mockNotifications.filter(n => n.userId === userId).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// Import mockTasks for checkAndNotifyForDependentTasks
import { mockTasks } from '@/lib/mock-data';
