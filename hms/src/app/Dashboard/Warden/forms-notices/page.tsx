"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import FormList from "@/components/dashboard/warden/FormList";
import NoticeManager from "@/components/dashboard/warden/NoticeManager";
import ResponsesCenter from "@/components/dashboard/warden/ResponsesCenter";

function FormsNoticesContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "forms";

  const [activeTab, setActiveTab] = useState<"forms" | "notices" | "responses">(
    initialTab === "responses" ? "responses" : initialTab === "notices" ? "notices" : "forms"
  );

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "responses") setActiveTab("responses");
    else if (tabParam === "notices") setActiveTab("notices");
    else if (tabParam === "forms") setActiveTab("forms");
  }, [searchParams]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
              <i className="fa-solid fa-clipboard-list"></i>
              <span>Forms & Notices Command Hub</span>
            </h1>
            <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
              Warden Administration
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Build custom dynamic forms, broadcast official notices, and manage student responses across categorized tabs.
          </p>
        </div>

        {/* Global Hub Navigation Tabs */}
        <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200 self-start md:self-center">
          <button
            type="button"
            onClick={() => setActiveTab("forms")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === "forms"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <i className="fa-solid fa-file-pen"></i>
            <span>Custom Forms</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("notices")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === "notices"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <i className="fa-solid fa-bullhorn"></i>
            <span>Notice Board</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("responses")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === "responses"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <i className="fa-solid fa-inbox"></i>
            <span>Responses Center</span>
          </button>
        </div>
      </div>

      {/* Main Tab View */}
      {activeTab === "forms" && <FormList />}
      {activeTab === "notices" && <NoticeManager />}
      {activeTab === "responses" && <ResponsesCenter />}
    </div>
  );
}

export default function FormsNoticesPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-12">
          <i className="fa-solid fa-circle-notch animate-spin text-blue-600 text-2xl"></i>
        </div>
      }
    >
      <FormsNoticesContent />
    </Suspense>
  );
}
