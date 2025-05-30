
"use client";

import type { UserProfile, UserRole } from "@/types"; // Assuming User is defined in types
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { mockUsers } from "@/lib/mock-data"; // We'll use mock users

interface AuthContextType {
  currentUser: UserProfile | null;
  login: (employeeId: string) => boolean; // Simple login with employee ID
  logout: () => void;
  isLoading: boolean;
  updateCurrentUserDetails: (updatedDetails: Partial<UserProfile>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "taskpilot-auth-userId";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Try to load user from localStorage on initial load
    setIsLoading(true);
    const storedUserId = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedUserId) {
      const user = mockUsers.find(u => u.uid === storedUserId);
      if (user) {
        setCurrentUser(user);
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY); // Clean up invalid stored ID
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((employeeId: string): boolean => {
    setIsLoading(true);
    const user = mockUsers.find(u => u.uid === employeeId);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem(AUTH_STORAGE_KEY, user.uid);
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
    localStorage.removeItem(AUTH_STORAGE_KEY);
    router.push("/login");
  }, [router]);

  const updateCurrentUserDetails = useCallback(async (updatedDetails: Partial<UserProfile>): Promise<boolean> => {
    if (!currentUser) return false;
    
    const userIndex = mockUsers.findIndex(u => u.uid === currentUser.uid);
    if (userIndex !== -1) {
      const updatedUser = { ...mockUsers[userIndex], ...updatedDetails };
      mockUsers[userIndex] = updatedUser; // Update in the global mock array
      setCurrentUser(updatedUser); // Update context state
      return true;
    }
    return false;
  }, [currentUser]);


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
