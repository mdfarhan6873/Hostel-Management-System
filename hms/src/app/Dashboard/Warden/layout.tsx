import React from "react";
import Header from "@/components/dashboard/Header";

export default function WardenLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
