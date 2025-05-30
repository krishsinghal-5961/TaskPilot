
"use client"; // Can be client-side for this mock implementation

import { mockNotifications, mockTasks, mockUsers } from "@/lib/mock-data";
import type { Notification, Task } from "@/types";
import { formatISO } from "date-fns";

// Helper to add a raw notification to the global list
function _addRawNotification(message: string, link?: string): Notification {
  const newNotif: Notification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    message,
    timestamp: formatISO(new Date()),
    read: false, // New notifications are unread by default
    link,
  };
  // Add to the beginning of the array so it appears at the top of lists
  mockNotifications.unshift(newNotif);
  // console.log("Notification Added:", newNotif.message); // For debugging
  return newNotif;
}

export function notifyManagerOfProgressChange(task: Task, updatedByUserName: string | undefined) {
  const actor = updatedByUserName || "The system";
  _addRawNotification(
    `${actor} updated progress for task '${task.title}' to ${task.progress}%.`,
    `/tasks/${task.id}`
  );
}

export function notifyManagerOfTaskCompletion(task: Task, completedByUserName: string | undefined) {
  const actor = completedByUserName || "The system";
  _addRawNotification(
    `Task '${task.title}' was completed by ${actor}.`,
    `/tasks/${task.id}`
  );
}

export function notifyEmployeeOfTaskAssignment(task: Task, employeeId: string) {
  const employee = mockUsers.find(u => u.id === employeeId);
  if (employee) {
    _addRawNotification(
      `You have been assigned a new task: '${task.title}'.`,
      `/tasks/${task.id}`
    );
  }
}

export function notifyEmployeeOfDependencyCompletion(dependentTask: Task, completedDependencyTask: Task) {
   const employee = mockUsers.find(u => u.id === dependentTask.assigneeId);
   if (employee) {
     _addRawNotification(
       `A prerequisite task ('${completedDependencyTask.title}') for your task '${dependentTask.title}' has been completed.`,
       `/tasks/${dependentTask.id}`
     );
   }
}

// This function should be called whenever a task is marked as 'done'
export function checkAndNotifyForDependentTasks(completedTask: Task) {
  mockTasks.forEach(task => {
    if (task.dependencies?.includes(completedTask.id) && task.assigneeId && task.status !== 'done') {
      // Only notify if the dependent task is assigned and not already done
      notifyEmployeeOfDependencyCompletion(task, completedTask);
    }
  });
}
