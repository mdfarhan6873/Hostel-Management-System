"use client";

import React, { useState, useEffect } from "react";
import { IFormResponse, FormType, ResponseStatus } from "@/lib/types";
import ResponseExpandableRow from "./ResponseExpandableRow";

interface ResponsesCenterProps {
  initialFormType?: FormType | "ALL";
}

interface AvailableForm {
  _id: string;
  formTitle: string;
  formType: string;
  count: number;
}

export default function ResponsesCenter({
  initialFormType = "ADMISSION",
}: ResponsesCenterProps) {
  const [activeTab, setActiveTab] = useState<FormType | "ALL">(initialFormType);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedFormId, setSelectedFormId] = useState<string>("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [datePreset, setDatePreset] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [responses, setResponses] = useState<IFormResponse[]>([]);
  const [availableForms, setAvailableForms] = useState<AvailableForm[]>([]);
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
      if (selectedFormId !== "ALL") params.append("formId", selectedFormId);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`/api/warden/forms/responses?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setResponses(data.responses || []);
        if (data.tabCounts) {
          setTabCounts(data.tabCounts);
        }
        if (data.availableForms) {
          setAvailableForms(data.availableForms);
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
  }, [activeTab, statusFilter, selectedFormId, startDate, endDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResponses();
  };

  const handleDatePresetChange = (preset: string) => {
    setDatePreset(preset);
    const now = new Date();
    const formatYMD = (d: Date) => d.toISOString().split("T")[0];

    if (preset === "ALL") {
      setStartDate("");
      setEndDate("");
    } else if (preset === "TODAY") {
      const today = formatYMD(now);
      setStartDate(today);
      setEndDate(today);
    } else if (preset === "LAST_7") {
      const past = new Date();
      past.setDate(now.getDate() - 7);
      setStartDate(formatYMD(past));
      setEndDate(formatYMD(now));
    } else if (preset === "LAST_30") {
      const past = new Date();
      past.setDate(now.getDate() - 30);
      setStartDate(formatYMD(past));
      setEndDate(formatYMD(now));
    } else if (preset === "THIS_MONTH") {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(formatYMD(firstDay));
      setEndDate(formatYMD(now));
    }
  };

  const handleCustomDateChange = (field: "start" | "end", val: string) => {
    setDatePreset("CUSTOM");
    if (field === "start") setStartDate(val);
    if (field === "end") setEndDate(val);
  };

  const clearAllFilters = () => {
    setActiveTab("ALL");
    setStatusFilter("ALL");
    setSelectedFormId("ALL");
    setStartDate("");
    setEndDate("");
    setDatePreset("ALL");
    setSearchQuery("");
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

  const hasActiveFilters =
    activeTab !== "ALL" ||
    statusFilter !== "ALL" ||
    selectedFormId !== "ALL" ||
    Boolean(startDate) ||
    Boolean(endDate) ||
    Boolean(searchQuery.trim());

  // Filter forms list by active tab if not ALL
  const filteredAvailableForms =
    activeTab === "ALL"
      ? availableForms
      : availableForms.filter((f) => f.formType === activeTab);

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
              onClick={() => {
                setActiveTab(tab.type);
                setSelectedFormId("ALL");
              }}
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

      {/* Main Filter & Control Panel */}
      <div className="bg-white border border-gray-200 rounded-xl p-3.5 space-y-3 shadow-2xs">
        {/* Top Controls Row: Search + Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1">
            <div className="relative flex-1">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student name, roll number, email, or form title..."
                className="w-full pl-9 pr-8 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setTimeout(() => fetchResponses(), 50);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                  title="Clear search text"
                >
                  <i className="fa-solid fa-circle-xmark"></i>
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 text-xs font-semibold bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors whitespace-nowrap"
            >
              Search
            </button>
          </form>

          {/* Quick Stats & Refresh */}
          <div className="flex items-center gap-2 text-xs text-gray-600 justify-end">
            <span className="text-gray-400">|</span>
            <span className="font-semibold text-gray-700">
              {responses.length} {responses.length === 1 ? "Result" : "Results"}
            </span>
            <button
              type="button"
              onClick={fetchResponses}
              className="p-2 text-gray-500 hover:text-blue-600 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
              title="Refresh submissions"
            >
              <i className="fa-solid fa-rotate-right text-xs"></i>
            </button>
          </div>
        </div>

        {/* Filters Grid: Form Type + Specific Form + Status + Date Range Filter */}
        <div className="pt-2 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* 1. Form Type Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">
              <i className="fa-solid fa-shapes text-gray-400 mr-1"></i> Form Type
            </label>
            <select
              value={activeTab}
              onChange={(e) => {
                setActiveTab(e.target.value as FormType | "ALL");
                setSelectedFormId("ALL");
              }}
              className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-gray-800"
            >
              <option value="ALL">All Form Types</option>
              <option value="ADMISSION">Admission</option>
              <option value="REALLOCATION">Reallocation</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="NOTICE">Notice / Inquiries</option>
            </select>
          </div>

          {/* 2. Specific Form Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">
              <i className="fa-solid fa-file-lines text-gray-400 mr-1"></i> Specific Form
            </label>
            <select
              value={selectedFormId}
              onChange={(e) => setSelectedFormId(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-gray-800 truncate"
            >
              <option value="ALL">All Forms</option>
              {filteredAvailableForms.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.formTitle} ({f.count})
                </option>
              ))}
            </select>
          </div>

          {/* 3. Status Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">
              <i className="fa-solid fa-circle-check text-gray-400 mr-1"></i> Review Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-gray-800"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Review</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* 4. Date Preset Range */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">
              <i className="fa-solid fa-calendar-days text-gray-400 mr-1"></i> Date Preset
            </label>
            <select
              value={datePreset}
              onChange={(e) => handleDatePresetChange(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-gray-800"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Submitted Today</option>
              <option value="LAST_7">Last 7 Days</option>
              <option value="LAST_30">Last 30 Days</option>
              <option value="THIS_MONTH">This Month</option>
              <option value="CUSTOM">Custom Date Range</option>
            </select>
          </div>
        </div>

        {/* Date Range Inputs: From Date to To Date */}
        <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center gap-2.5 text-xs">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
            <i className="fa-regular fa-calendar text-blue-600"></i> Submission Date Range:
          </span>

          <div className="flex items-center gap-1.5">
            <span className="text-gray-500 font-medium">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => handleCustomDateChange("start", e.target.value)}
              className="px-2.5 py-1 text-xs border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-gray-800"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-gray-500 font-medium">To:</span>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => handleCustomDateChange("end", e.target.value)}
              className="px-2.5 py-1 text-xs border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-gray-800"
            />
          </div>

          {(startDate || endDate) && (
            <button
              type="button"
              onClick={() => handleDatePresetChange("ALL")}
              className="px-2 py-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors flex items-center gap-1"
              title="Clear date filter"
            >
              <i className="fa-solid fa-xmark"></i> Clear Dates
            </button>
          )}

          {/* Quick preset buttons */}
          <div className="ml-auto hidden xl:flex items-center gap-1">
            {[
              { id: "TODAY", label: "Today" },
              { id: "LAST_7", label: "7 Days" },
              { id: "LAST_30", label: "30 Days" },
              { id: "THIS_MONTH", label: "This Month" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleDatePresetChange(p.id)}
                className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border transition-colors ${
                  datePreset === p.id
                    ? "bg-blue-50 border-blue-300 text-blue-700"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active Filters Bar */}
        {hasActiveFilters && (
          <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-gray-500">Active Filters:</span>

            {activeTab !== "ALL" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                Type: {activeTab}
                <button
                  type="button"
                  onClick={() => setActiveTab("ALL")}
                  className="hover:text-blue-900 ml-0.5"
                >
                  <i className="fa-solid fa-xmark text-[10px]"></i>
                </button>
              </span>
            )}

            {selectedFormId !== "ALL" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                Form: {availableForms.find((f) => f._id === selectedFormId)?.formTitle || "Selected"}
                <button
                  type="button"
                  onClick={() => setSelectedFormId("ALL")}
                  className="hover:text-indigo-900 ml-0.5"
                >
                  <i className="fa-solid fa-xmark text-[10px]"></i>
                </button>
              </span>
            )}

            {statusFilter !== "ALL" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                Status: {statusFilter}
                <button
                  type="button"
                  onClick={() => setStatusFilter("ALL")}
                  className="hover:text-amber-900 ml-0.5"
                >
                  <i className="fa-solid fa-xmark text-[10px]"></i>
                </button>
              </span>
            )}

            {(startDate || endDate) && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                Date: {startDate || "Any"} → {endDate || "Any"}
                <button
                  type="button"
                  onClick={() => handleDatePresetChange("ALL")}
                  className="hover:text-emerald-900 ml-0.5"
                >
                  <i className="fa-solid fa-xmark text-[10px]"></i>
                </button>
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 text-gray-700 border border-gray-300">
                Search: "{searchQuery}"
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setTimeout(() => fetchResponses(), 50);
                  }}
                  className="hover:text-gray-900 ml-0.5"
                >
                  <i className="fa-solid fa-xmark text-[10px]"></i>
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={clearAllFilters}
              className="ml-auto text-[11px] font-semibold text-rose-600 hover:text-rose-700 underline underline-offset-2"
            >
              Reset All Filters
            </button>
          </div>
        )}
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
              There are currently no responses matching the applied filters
              {activeTab !== "ALL" && ` (Type: ${activeTab})`}
              {statusFilter !== "ALL" && ` (Status: ${statusFilter})`}
              {(startDate || endDate) && ` (Date Range: ${startDate || "Any"} to ${endDate || "Any"})`}
              . Try adjusting your date range or form type filters.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
              >
                <i className="fa-solid fa-rotate-left"></i> Reset All Filters
              </button>
            )}
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
