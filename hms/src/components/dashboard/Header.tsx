"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface User {
  name?: string;
  fullName?: string;
  role: string;
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          router.push("/");
        }
      })
      .catch((err) => {
        console.error("Failed to fetch session", err);
        router.push("/");
      });
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const displayRole = user?.role === "superadmin" ? "Admin" : user?.role === "warden" ? "Warden" : user?.role === "student" ? "Student" : "";
  const displayName = user?.name || user?.fullName || "User";

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white">
      <div className="flex items-center">
        <Image
          src="/logo.webp"
          alt="GEC Munger Logo"
          width={60}
          height={60}
          className="object-contain"
          priority
        />
      </div>
      
      <div 
        className="text-right cursor-pointer select-none group"
        onDoubleClick={handleLogout}
        title="Double click to logout"
      >
        <div className="text-sm font-semibold text-gray-800 group-hover:text-red-600 transition-colors">
          {user ? `Hi, ${displayName}` : "Loading..."}
        </div>
        <div className="text-xs text-blue-500 capitalize">
          {displayRole}
        </div>
      </div>
    </header>
  );
}
