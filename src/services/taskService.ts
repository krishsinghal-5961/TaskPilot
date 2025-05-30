
import { db } from '@/lib/firebase';
import type { Task, TaskStatus } from '@/types';
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

const TASKS_COLLECTION = 'tasks';

// Helper to convert Firestore Timestamps to ISO strings
const mapTimestampToISO = (data: any): any => {
  const mappedData = { ...data };
  if (data.createdAt && data.createdAt instanceof Timestamp) {
    mappedData.createdAt = data.createdAt.toDate().toISOString();
  }
  if (data.updatedAt && data.updatedAt instanceof Timestamp) {
    mappedData.updatedAt = data.updatedAt.toDate().toISOString();
  }
  if (data.dueDate && data.dueDate instanceof Timestamp) {
     mappedData.dueDate = data.dueDate.toDate().toISOString();
  } else if (typeof data.dueDate === 'string') {
    // If it's already a string, keep it, assuming it's ISO
    mappedData.dueDate = data.dueDate;
  } else if (data.dueDate === undefined || data.dueDate === null) {
    mappedData.dueDate = null;
  }
  return mappedData;
};


// Get all tasks (or filter by user if needed)
export async function getAllTasks(userId?: string, userRole?: 'manager' | 'employee'): Promise<Task[]> {
  const tasksCollectionRef = collection(db, TASKS_COLLECTION);
  let q;

  if (userRole === 'manager') {
    // Managers see all tasks, can be ordered by creation date or due date
    q = query(tasksCollectionRef, orderBy("createdAt", "desc"));
  } else if (userId) {
    // Employees see tasks assigned to them
    q = query(tasksCollectionRef, where("assigneeId", "==", userId), orderBy("dueDate", "asc"));
  } else {
    // Fallback or unauthenticated view (should not happen in a protected route)
    return [];
  }
  
  const querySnapshot = await getDocs(q);
  const tasks: Task[] = [];
  querySnapshot.forEach((doc) => {
    tasks.push(mapTimestampToISO({ id: doc.id, ...doc.data() }) as Task);
  });
  return tasks;
}

// Get a single task by its ID
export async function getTaskById(taskId: string): Promise<Task | null> {
  const docRef = doc(db, TASKS_COLLECTION, taskId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return mapTimestampToISO({ id: docSnap.id, ...docSnap.data() }) as Task;
  } else {
    return null;
  }
}

// Add a new task
export async function addTaskToFirestore(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
  const tasksCollectionRef = collection(db, TASKS_COLLECTION);
  const newTaskData = {
    ...taskData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    dueDate: taskData.dueDate ? Timestamp.fromDate(new Date(taskData.dueDate)) : null,
  };
  const docRef = await addDoc(tasksCollectionRef, newTaskData);
  // To return the full task object with ID and resolved timestamps, we fetch it back
  // This isn't strictly necessary if we construct it client-side, but ensures consistency
  const newDocSnap = await getDoc(docRef);
  return mapTimestampToISO({ id: newDocSnap.id, ...newDocSnap.data() }) as Task;
}

// Update an existing task
export async function updateTaskInFirestore(taskId: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
  const docRef = doc(db, TASKS_COLLECTION, taskId);
  const dataToUpdate: any = { ...updates, updatedAt: serverTimestamp() };
  if (updates.dueDate) {
    dataToUpdate.dueDate = Timestamp.fromDate(new Date(updates.dueDate));
  } else if (updates.dueDate === null) {
    dataToUpdate.dueDate = null;
  }
  await updateDoc(docRef, dataToUpdate);
}

// Delete a task
export async function deleteTaskFromFirestore(taskId: string): Promise<void> {
  const docRef = doc(db, TASKS_COLLECTION, taskId);
  await deleteDoc(docRef);
}

// Update task status (specific update example)
export async function updateTaskStatusInFirestore(taskId: string, status: TaskStatus, progress?: number): Promise<void> {
  const docRef = doc(db, TASKS_COLLECTION, taskId);
  const updates: any = { status, updatedAt: serverTimestamp() };
  if (progress !== undefined) {
    updates.progress = progress;
  }
  if (status === 'done' && (progress === undefined || progress < 100)) {
    updates.progress = 100;
  }
  await updateDoc(docRef, updates);
}
