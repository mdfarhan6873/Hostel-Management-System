"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  phone: string;
  rollNumber?: string;
  registrationNumber?: string;
  role: "ADMIN" | "STUDENT" | "VIEWER";
  avatarUrl?: string;
  department?: string;
  semester?: number;
  batch?: string;
  guardianPhone?: string;
  bloodGroup?: string;
  allotmentStatus?: "NOT_APPLIED" | "PENDING" | "ELIGIBLE" | "ALLOTTED" | "CANCELLED" | "REJECTED";
  hostelName?: string;
  roomNumber?: string;
  bedNumber?: string;
}

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (
    identifier: string,
    pass: string
  ) => Promise<{ success: boolean; error?: string; status?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (identifier: string, pass: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password: pass }),
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          error: data.error || "Login failed",
          status: data.status,
        };
      }

      setUser(data.user);

      // Redirect by role
      if (data.user.role === "ADMIN") {
        router.push("/admin");
      } else if (data.user.role === "VIEWER") {
        router.push("/viewer");
      } else {
        router.push("/student");
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error during login" };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
