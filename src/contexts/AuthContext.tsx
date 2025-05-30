
"use client";

import type { UserProfile } from "@/types";
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Auth, User as FirebaseUser, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserProfile, updateUserProfileInFirestore } from "@/services/userService"; // We'll create this service

interface AuthContextType {
  currentUser: UserProfile | null; // This will be our app's user profile
  firebaseUser: FirebaseUser | null; // Original Firebase user object
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  updateCurrentUserDetails: (updatedDetails: Partial<UserProfile>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      if (user) {
        setFirebaseUser(user);
        try {
          const userProfileData = await getUserProfile(user.uid);
          if (userProfileData) {
            setCurrentUser(userProfileData);
          } else {
            // This case means user exists in Firebase Auth but not in Firestore 'users' collection.
            // Potentially redirect to a profile setup page or handle as an error.
            console.warn("User profile not found in Firestore for UID:", user.uid);
            setCurrentUser(null); // Or a minimal profile
             // signOut(auth); // Optionally sign out if profile is mandatory
          }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            setCurrentUser(null);
            // signOut(auth); // Optionally sign out
        }
      } else {
        setFirebaseUser(null);
        setCurrentUser(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle setting currentUser and redirecting
      // For immediate redirect feedback (optional, as onAuthStateChanged will trigger it):
      // const user = auth.currentUser;
      // if (user) {
      //   const profile = await getUserProfile(user.uid);
      //   if (profile?.role === "manager") router.push("/dashboard/manager");
      //   else if (profile?.role === "employee") router.push("/dashboard/employee");
      //   else router.push("/"); // Fallback
      // }
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      setIsLoading(false);
      return false;
    }
  }, [router]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      setCurrentUser(null);
      setFirebaseUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
        setIsLoading(false);
    }
  }, [router]);

  const updateCurrentUserDetails = useCallback(async (updatedDetails: Partial<UserProfile>): Promise<boolean> => {
    if (!currentUser || !firebaseUser) return false;
    setIsLoading(true);
    try {
      await updateUserProfileInFirestore(firebaseUser.uid, updatedDetails);
      // Re-fetch or optimistically update currentUser
      const updatedProfile = await getUserProfile(firebaseUser.uid);
      if (updatedProfile) {
        setCurrentUser(updatedProfile);
      }
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Failed to update user details:", error);
      setIsLoading(false);
      return false;
    }
  }, [currentUser, firebaseUser]);

  // Redirect logic based on currentUser role
  useEffect(() => {
    if (!isLoading && currentUser) {
        if (router.pathname === "/login" || router.pathname === "/") {
             if (currentUser.role === "manager") {
                router.replace("/dashboard/manager");
            } else if (currentUser.role === "employee") {
                router.replace("/dashboard/employee");
            }
        }
    }
  }, [currentUser, isLoading, router, router.pathname]);


  return (
    <AuthContext.Provider value={{ currentUser, firebaseUser, login, logout, isLoading, updateCurrentUserDetails }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
