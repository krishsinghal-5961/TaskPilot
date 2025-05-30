
// This file is effectively deprecated when using only mock data directly.
// Components will import from `src/lib/mock-data.ts`.
// Kept for reference or if a simple service layer over mock data is desired later.

import type { UserProfile, UserRole } from '@/types';
import { mockUsers } from '@/lib/mock-data'; // Assuming mockUsers is exported
import { getInitials } from '@/lib/utils';

// Get a user profile from mock data
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const user = mockUsers.find(u => u.uid === uid);
  return user ? { ...user } : null;
}

// Create or update a user profile in mock data
export async function setUserProfile(uid: string, profileData: Omit<UserProfile, 'uid'>): Promise<void> {
  const userIndex = mockUsers.findIndex(u => u.uid === uid);
  if (userIndex !== -1) {
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...profileData, uid };
  } else {
    // For mock, if user doesn't exist, add them.
    mockUsers.push({ uid, ...profileData });
  }
}

// Update an existing user profile in mock data
export async function updateUserProfileInFirestore(uid: string, dataToUpdate: Partial<Omit<UserProfile, 'uid' | 'email' | 'role'>>): Promise<void> {
  const userIndex = mockUsers.findIndex(u => u.uid === uid);
  if (userIndex !== -1) {
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...dataToUpdate };
  }
}

// Get all users from mock data
export async function getAllUsers(): Promise<UserProfile[]> {
  return [...mockUsers]; // Return a copy
}

// Add a new user to mock data
export async function addUserToFirestore(userData: Omit<UserProfile, 'uid' | 'currentWorkload'> & {currentWorkload?: number}): Promise<UserProfile> {
  const newUser: UserProfile = {
    uid: `user-${Date.now()}`, // Simple ID generation
    ...userData,
    role: userData.role || "employee", // Default role
    avatarUrl: userData.avatarUrl || `https://placehold.co/100x100.png?text=${getInitials(userData.name)}`,
    currentWorkload: userData.currentWorkload || 0,
  };
  mockUsers.push(newUser);
  return { ...newUser };
}
