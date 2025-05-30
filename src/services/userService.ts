
import { db } from '@/lib/firebase';
import type { UserProfile } from '@/types';
import { collection, doc, getDoc, setDoc, updateDoc, getDocs, query, where, serverTimestamp, writeBatch } from 'firebase/firestore';

const USERS_COLLECTION = 'users';

// Get a user profile from Firestore
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const docRef = doc(db, USERS_COLLECTION, uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { uid: docSnap.id, ...docSnap.data() } as UserProfile;
  } else {
    console.warn(`No user profile found in Firestore for UID: ${uid}`);
    return null;
  }
}

// Create or update a user profile in Firestore
// Used during initial setup by admin or could be part of a sign-up flow
export async function setUserProfile(uid: string, profileData: Omit<UserProfile, 'uid'>): Promise<void> {
  const docRef = doc(db, USERS_COLLECTION, uid);
  await setDoc(docRef, { ...profileData, uid }, { merge: true }); // merge true to avoid overwriting if only partial data is sent
}

// Update an existing user profile in Firestore
export async function updateUserProfileInFirestore(uid: string, dataToUpdate: Partial<Omit<UserProfile, 'uid' | 'email' | 'role'>>): Promise<void> {
  const docRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(docRef, dataToUpdate);
}

// Get all users (typically for manager roles)
export async function getAllUsers(): Promise<UserProfile[]> {
  const usersCollectionRef = collection(db, USERS_COLLECTION);
  const q = query(usersCollectionRef); // Add ordering or filtering if needed, e.g., orderBy("name")
  const querySnapshot = await getDocs(q);
  const users: UserProfile[] = [];
  querySnapshot.forEach((doc) => {
    users.push({ uid: doc.id, ...doc.data() } as UserProfile);
  });
  return users;
}


// Add a new user to Firestore (typically by a manager for an employee)
// Note: This does NOT create a Firebase Authentication user.
export async function addUserToFirestore(userData: Omit<UserProfile, 'uid' | 'currentWorkload'> & {currentWorkload?: number}): Promise<UserProfile> {
  // In a real scenario, the UID would come from Firebase Auth after the user is created there.
  // For this simulation, if no UID is provided (which it won't be from the form),
  // we'll need a placeholder or decide this user can't log in until Auth account is made.
  // Let's assume an admin will create the Auth account separately and then an admin tool updates the UID here.
  // Or, for now, we could generate a temporary ID, but that's not ideal for a "real" backend.
  // The best approach is that user is created in Auth first, then UID is used here.
  // Since manager adds user, let's just create the profile and UID would be pending.
  // However, our UserProfile type requires a UID. This highlights the gap.
  // For now, let's use email as a temporary ID for the document, but this isn't robust.
  // A better mock: auto-generate an ID for Firestore doc, but this user can't login.

  // For the purpose of this app, we'll simulate an ID.
  const tempId = `temp-${Date.now()}`; // THIS IS NOT A REAL AUTH UID
  const docRef = doc(db, USERS_COLLECTION, tempId);
  
  const newUserProfile: UserProfile = {
    ...userData,
    uid: tempId, // Placeholder UID
    currentWorkload: userData.currentWorkload || 0,
  };
  await setDoc(docRef, newUserProfile);
  return newUserProfile;
}


// This is a utility function you might run once to migrate mockUsers to Firestore
// Ensure Firebase Auth users are created first, then map their UIDs here.
/*
import { mockUsers } from "@/lib/mock-data"; // You would remove this import later

export async function migrateMockUsersToFirestore() {
  const batch = writeBatch(db);
  const usersToMigrate = [
    // Replace 'FIREBASE_AUTH_UID_FOR_PRIYA' with actual UIDs from Firebase Auth
    { mockId: "priya-mgr", uid: "FIREBASE_AUTH_UID_FOR_PRIYA", name: "Priya Sharma", email: "priya-mgr@gmail.com", avatarUrl: "https://placehold.co/100x100.png?text=PS", currentWorkload: 30, role: "manager", designation: "Engineering Manager" },
    { mockId: "rohan-dev", uid: "FIREBASE_AUTH_UID_FOR_ROHAN", name: "Rohan Mehra", email: "rohan-dev@gmail.com", avatarUrl: "https://placehold.co/100x100.png?text=RM", currentWorkload: 70, role: "employee", designation: "Senior Software Engineer" },
    { mockId: "aisha-dev", uid: "FIREBASE_AUTH_UID_FOR_AISHA", name: "Aisha Khan", email: "aisha-dev@gmail.com", avatarUrl: "https://placehold.co/100x100.png?text=AK", currentWorkload: 50, role: "employee", designation: "Frontend Developer" },
    { mockId: "vikram-qa", uid: "FIREBASE_AUTH_UID_FOR_VIKRAM", name: "Vikram Singh", email: "vikram-qa@gmail.com", avatarUrl: "https://placehold.co/100x100.png?text=VS", currentWorkload: 20, role: "employee", designation: "QA Engineer" },
  ];

  usersToMigrate.forEach(user => {
    if (user.uid.startsWith("FIREBASE_AUTH_UID")) {
        console.error(`UID for ${user.name} is a placeholder. Update it before migrating.`);
        return;
    }
    const userRef = doc(db, USERS_COLLECTION, user.uid);
    const profileData: Omit<UserProfile, 'uid'> & {uid: string} = { // Ensure UID is part of data
      uid: user.uid,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      currentWorkload: user.currentWorkload,
      role: user.role as UserRole,
      designation: user.designation,
    };
    batch.set(userRef, profileData);
  });

  try {
    await batch.commit();
    console.log("Mock users migrated to Firestore successfully (ensure UIDs were correct).");
  } catch (error) {
    console.error("Error migrating mock users to Firestore: ", error);
  }
}
*/
