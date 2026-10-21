"use client";

import React, { useState, useEffect } from "react";
import { IFormResponse, FormType, ResponseStatus } from "@/lib/types";
import ResponseExpandableRow from "./ResponseExpandableRow";

interface ResponsesCenterProps {
  initialFormType?: FormType | "ALL";
}

export default function ResponsesCenter({
  initialFormType = "ADMISSION",
}: ResponsesCenterProps) {
  const [activeTab, setActiveTab] = useState<FormType | "ALL">(initialFormType);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [responses, setResponses] = useState<IFormResponse[]>([]);
  const [tabCounts, setTabCounts] = useState<Record<string, { total: number; pending: number }>>({
    ADMISSION: { total: 0, pending: 0 },
    REALLOCATION: { total: 0, pending: 0 },
    MAINTENANCE: { total: 0, pending: 0 },
    NOTICE: { total: 0, pending: 0 },
    GENERAL: { total: 0, pending: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchResponses = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== "ALL") params.append("formType", activeTab);
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`/api/warden/forms/responses?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setResponses(data.responses || []);
        if (data.tabCounts) {
          setTabCounts(data.tabCounts);
        }
      }
    } catch (err) {
      console.error("fetchResponses error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResponses();
  }, [activeTab, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResponses();
  };

  const handleStatusUpdate = async (
    responseId: string,
    status: ResponseStatus,
    wardenNotes: string
  ) => {
    const res = await fetch("/api/warden/forms/responses", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ responseId, status, wardenNotes }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to update response");
    }
    // Update local state without full reload
    setResponses((prev) =>
      prev.map((r) => (r._id === responseId ? { ...r, status, wardenNotes } : r))
    );
  };

  const tabs: { type: FormType | "ALL"; label: string; icon: string }[] = [
    { type: "ADMISSION", label: "Admission", icon: "fa-graduation-cap" },
    { type: "REALLOCATION", label: "Reallocation", icon: "fa-arrows-rotate" },
    { type: "MAINTENANCE", label: "Maintenance", icon: "fa-wrench" },
    { type: "NOTICE", label: "Notice / Inquiries", icon: "fa-bullhorn" },
    { type: "ALL", label: "All Submissions", icon: "fa-layer-group" },
  ];

  const totalAll =
    tabCounts.ADMISSION.total +
    tabCounts.REALLOCATION.total +
    tabCounts.MAINTENANCE.total +
    tabCounts.NOTICE.total +
    tabCounts.GENERAL.total;

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-gray-200">
        {tabs.map((tab) => {
          const isSelected = activeTab === tab.type;
          const count =
            tab.type === "ALL"
              ? totalAll
              : tabCounts[tab.type]?.total || 0;
          const pending =
            tab.type === "ALL"
              ? tabCounts.ADMISSION.pending +
                tabCounts.REALLOCATION.pending +
                tabCounts.MAINTENANCE.pending
              : tabCounts[tab.type]?.pending || 0;

          return (
            <button
              key={tab.type}
              type="button"
              onClick={() => setActiveTab(tab.type)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-lg text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                isSelected
                  ? "border-blue-600 text-blue-600 bg-blue-50/50"
                  : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <i className={`fa-solid ${tab.icon} text-xs`}></i>
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                  isSelected
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {count}
              </span>
              {pending > 0 && (
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500 text-white">
                  {pending} new
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1">
          <div className="relative flex-1">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, roll number, email, or form title..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-semibold bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors"
          >
            Search
          </button>
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setTimeout(() => fetchResponses(), 50);
              }}
              className="p-1.5 text-gray-400 hover:text-gray-600 text-xs"
              title="Clear search"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </form>

        {/* Status Filter Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-500 whitespace-nowrap">
            Status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-gray-800"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <button
            type="button"
            onClick={fetchResponses}
            className="p-1.5 text-gray-500 hover:text-blue-600 rounded hover:bg-gray-100 transition-colors"
            title="Refresh submissions"
          >
            <i className="fa-solid fa-rotate-right text-xs"></i>
          </button>
        </div>
      </div>

      {/* Responses List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <i className="fa-solid fa-circle-notch animate-spin text-blue-600 text-2xl"></i>
            <p className="text-xs text-gray-500 font-medium mt-2">Loading submissions...</p>
          </div>
        ) : responses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200 p-6 space-y-2">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-lg">
              <i className="fa-solid fa-inbox"></i>
            </div>
            <h4 className="text-sm font-bold text-gray-800">No Submissions Found</h4>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              There are currently no responses matching the "{activeTab}" category with status "
              {statusFilter}". New form applications submitted by students or public applicants will
              appear here with full expand/collapse details.
            </p>
          </div>
        ) : (
          responses.map((resp) => (
            <ResponseExpandableRow
              key={resp._id}
              response={resp}
              onStatusUpdate={handleStatusUpdate}
            />
          ))
        )}
      </div>
    </div>
  );
}
