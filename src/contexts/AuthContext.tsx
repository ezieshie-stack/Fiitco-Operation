"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useConvex } from "convex/react";
import { api } from "../../convex/_generated/api";
import { AppUser, SESSION_KEY } from "@/lib/auth";

interface AuthContextValue {
  currentUser: AppUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  currentUser: null,
  isLoading: true,
  login: async () => ({ success: false }),
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const convex = useConvex();
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) setCurrentUser(JSON.parse(stored));
    } catch {}
    setIsLoading(false);
  }, []);

  async function login(email: string, password: string): Promise<{ success: boolean; message?: string }> {
    try {
      const result = await convex.query(api.auth.loginUser, { email, password });
      if (result.success && result.user) {
        const appUser: AppUser = {
          id: result.user.id as string,
          email: result.user.email,
          role: result.user.role as AppUser["role"],
          name: result.user.name,
          displayName: result.user.displayName,
          instructorId: result.user.instructorId ?? undefined,
          status: result.user.status,
        };
        setCurrentUser(appUser);
        localStorage.setItem(SESSION_KEY, JSON.stringify(appUser));
        return { success: true };
      }
      return { success: false, message: result.success === false ? result.message : "Login failed" };
    } catch (err: any) {
      return { success: false, message: err?.message ?? "Login failed" };
    }
  }

  function logout() {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEY);
  }

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
