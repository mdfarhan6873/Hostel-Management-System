import React from "react";
import Header from "@/components/dashboard/Header";
import WardenSidebar from "@/components/dashboard/WardenSidebar";

export default function WardenLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <div className="flex flex-1">
        <WardenSidebar />
        <main className="flex-1 p-8 bg-gray-50/40 min-h-[calc(100vh-80px)]">
          {children}
        </main>
      </div>
    </div>
  );
}
