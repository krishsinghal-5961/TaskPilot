
// This file is effectively deprecated when using only mock data directly.
// Components will import from `src/lib/mock-data.ts`.
// Kept for reference or if a simple service layer over mock data is desired later.

import type { Task, TaskStatus } from '@/types';
import { mockTasks } from '@/lib/mock-data'; // Assuming mockTasks is exported
import { formatISO } from 'date-fns';

// Get all tasks (or filter by user if needed)
export async function getAllTasks(userId?: string, userRole?: 'manager' | 'employee'): Promise<Task[]> {
  if (userRole === 'manager') {
    return [...mockTasks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (userId) {
    return mockTasks.filter(task => task.assigneeId === userId)
      .sort((a,b) => (a.dueDate && b.dueDate) ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime() : (a.dueDate ? -1 : 1));
  }
  return [];
}

// Get a single task by its ID
export async function getTaskById(taskId: string): Promise<Task | null> {
  const task = mockTasks.find(t => t.id === taskId);
  return task ? { ...task } : null;
}

// Add a new task
export async function addTaskToFirestore(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
  const newTask: Task = {
    id: `task-${Date.now()}`, // Simple ID generation for mock
    ...taskData,
    createdAt: formatISO(new Date()),
    updatedAt: formatISO(new Date()),
    // Ensure progress is set, especially if status is 'done'
    progress: taskData.status === 'done' ? 100 : (taskData.progress ?? 0),
  };
  mockTasks.push(newTask);
  return { ...newTask };
}

// Update an existing task
export async function updateTaskInFirestore(taskId: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
  const taskIndex = mockTasks.findIndex(t => t.id === taskId);
  if (taskIndex !== -1) {
    const progress = updates.status === 'done' ? 100 : (updates.progress ?? mockTasks[taskIndex].progress);
    mockTasks[taskIndex] = {
      ...mockTasks[taskIndex],
      ...updates,
      progress,
      updatedAt: formatISO(new Date()),
    };
  }
}

// Delete a task
export async function deleteTaskFromFirestore(taskId: string): Promise<void> {
  const taskIndex = mockTasks.findIndex(t => t.id === taskId);
  if (taskIndex !== -1) {
    mockTasks.splice(taskIndex, 1);
  }
}

// Update task status (specific update example)
export async function updateTaskStatusInFirestore(taskId: string, status: TaskStatus, progress?: number): Promise<void> {
  const taskIndex = mockTasks.findIndex(t => t.id === taskId);
  if (taskIndex !== -1) {
    let newProgress = progress ?? mockTasks[taskIndex].progress;
    if (status === 'done') {
      newProgress = 100;
    } else if (status === 'in-progress' && mockTasks[taskIndex].progress === 0 && progress === undefined) {
      newProgress = 10; // Default progress when starting
    }
    
    mockTasks[taskIndex] = {
      ...mockTasks[taskIndex],
      status,
      progress: newProgress,
      updatedAt: formatISO(new Date()),
    };
  }
}
