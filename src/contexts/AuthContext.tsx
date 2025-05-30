
"use client";

import type { User, UserRole } from "@/types";
import { mockUsers } from "@/lib/mock-data";
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  currentUser: User | null;
  login: (userId: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  updateCurrentUserDetails: (updatedDetails: Partial<User>) => Promise<boolean>; // Added this
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const router = useRouter();

  useEffect(() => {
    // Check localStorage for a logged-in user on initial load (client-side only)
    try {
      const storedUserId = localStorage.getItem("taskpilot-currentUser");
      if (storedUserId) {
        const user = mockUsers.find(u => u.id === storedUserId);
        if (user) {
          setCurrentUser(user);
        } else {
          localStorage.removeItem("taskpilot-currentUser"); // Clean up if user ID is invalid
        }
      }
    } catch (error) {
      console.error("Could not access localStorage:", error);
      // Potentially running in an environment where localStorage is not available
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (userId: string): Promise<boolean> => {
    setIsLoading(true);
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      try {
        localStorage.setItem("taskpilot-currentUser", user.id);
      } catch (error) {
        console.error("Could not access localStorage:", error);
      }
      setIsLoading(false);
      if (user.role === "manager") {
        router.push("/dashboard/manager");
      } else {
        router.push("/dashboard/employee");
      }
      return true;
    }
    setIsLoading(false);
    return false;
  }, [router]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    try {
      localStorage.removeItem("taskpilot-currentUser");
    } catch (error) {
      console.error("Could not access localStorage:", error);
    }
    router.push("/login");
  }, [router]);

  const updateCurrentUserDetails = useCallback(async (updatedDetails: Partial<User>): Promise<boolean> => {
    if (!currentUser) return false;
    // setIsLoading(true); // Can enable if async operations are involved

    const updatedUser = { ...currentUser, ...updatedDetails };
    setCurrentUser(updatedUser);

    // Update mockUsers array (simulating backend update)
    const userIndex = mockUsers.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
      mockUsers[userIndex] = { ...mockUsers[userIndex], ...updatedDetails };
    }
    
    // No need to update localStorage unless the persisted 'taskpilot-currentUser' (which is userId) changes.
    // If we stored the whole user object in localStorage, we would update it here.

    // setIsLoading(false);
    return true;
  }, [currentUser, setCurrentUser]);


  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isLoading, updateCurrentUserDetails }}>
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
