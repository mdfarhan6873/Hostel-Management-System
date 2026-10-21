"use client";

import React, { useState } from "react";
import { IFormResponse, ResponseStatus } from "@/lib/types";

interface ResponseExpandableRowProps {
  response: IFormResponse;
  onStatusUpdate: (responseId: string, status: ResponseStatus, notes: string) => Promise<void>;
}

export default function ResponseExpandableRow({
  response,
  onStatusUpdate,
}: ResponseExpandableRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<ResponseStatus>(response.status);
  const [notes, setNotes] = useState(response.wardenNotes || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const getStatusBadge = (status: ResponseStatus) => {
    switch (status) {
      case "APPROVED":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-300";
      case "UNDER_REVIEW":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "PENDING":
      default:
        return "bg-amber-100 text-amber-800 border-amber-300";
    }
  };

  const handleSave = async (statusToSet: ResponseStatus) => {
    setIsUpdating(true);
    setUpdateSuccess(false);
    try {
      await onStatusUpdate(response._id!, statusToSet, notes);
      setCurrentStatus(statusToSet);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs hover:border-gray-300 transition-all">
      {/* Top Scannable Summary Row */}
      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs flex-shrink-0 border border-blue-200 shadow-2xs">
            {response.applicantInfo.name.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-gray-900 truncate">
                {response.applicantInfo.name}
              </h4>
              {response.applicantInfo.rollNo && (
                <span className="text-[11px] font-mono text-gray-600 bg-gray-100 px-1.5 py-0.2 rounded border border-gray-200">
                  Roll: {response.applicantInfo.rollNo}
                </span>
              )}
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getStatusBadge(
                  currentStatus
                )}`}
              >
                {currentStatus.replace("_", " ")}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5 flex-wrap">
              <span className="font-medium text-gray-700">{response.formTitle}</span>
              <span>&bull;</span>
              <span>{response.applicantInfo.email}</span>
              <span>&bull;</span>
              <span>{response.applicantInfo.phone}</span>
              <span>&bull;</span>
              <span className="text-gray-400">
                {response.createdAt ? new Date(response.createdAt).toLocaleString() : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Expand / Collapse Button */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-all flex items-center gap-1.5 ${
              isExpanded
                ? "bg-blue-50 text-blue-700 border-blue-300 shadow-xs"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            <span>{isExpanded ? "Collapse Details" : "View Details"}</span>
            <i
              className={`fa-solid ${
                isExpanded ? "fa-chevron-up" : "fa-chevron-down"
              } text-[10px]`}
            ></i>
          </button>
        </div>
      </div>

      {/* Expanded Details Drawer */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-slate-50/70 p-4 sm:p-5 space-y-4 animate-fadeIn">
          {/* Applicant Metadata Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-lg border border-gray-200 text-xs">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Full Name
              </span>
              <span className="font-semibold text-gray-900">{response.applicantInfo.name}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Email Address
              </span>
              <span className="font-medium text-gray-800 break-all">{response.applicantInfo.email}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Mobile Number
              </span>
              <span className="font-mono text-gray-800">{response.applicantInfo.phone}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Branch & Session
              </span>
              <span className="font-medium text-gray-800">
                {response.applicantInfo.branch || "N/A"} &bull; {response.applicantInfo.session || "N/A"}
              </span>
            </div>
          </div>

          {/* Submitted Custom Form Fields */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <i className="fa-solid fa-list-check text-blue-600"></i>
              <span>Submitted Form Responses ({response.responses.length} Fields)</span>
            </h5>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {response.responses.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-gray-200 rounded-lg p-3 space-y-1 shadow-2xs"
                >
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                    {item.label}
                  </span>
                  <div className="text-xs font-semibold text-gray-900">
                    {item.fieldType === "checkbox" ? (
                      item.value ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <i className="fa-solid fa-check text-[10px]"></i>
                          <span>Checked / Agreed (Yes)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                          <i className="fa-solid fa-xmark text-[10px]"></i>
                          <span>Not Checked (No)</span>
                        </span>
                      )
                    ) : item.fieldType === "file" && typeof item.value === "string" ? (
                      <a
                        href={item.value}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1"
                      >
                        <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                        <span>Open Document / File</span>
                      </a>
                    ) : (
                      <span className="break-words font-medium text-gray-800">
                        {item.value !== undefined && item.value !== null && item.value !== ""
                          ? String(item.value)
                          : "(No answer provided)"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Warden Review & Action Bar */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <i className="fa-solid fa-user-shield text-blue-600"></i>
                <span>Warden Decision & Administrative Notes</span>
              </h5>
              {updateSuccess && (
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <i className="fa-solid fa-check"></i>
                  <span>Decision Saved!</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <div className="md:col-span-8">
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add administrative remarks (e.g. Verified 10th/12th marksheet, approved for Block A Room 102)"
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
                />
              </div>

              <div className="md:col-span-4 flex items-center justify-end gap-1.5 flex-wrap">
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleSave("APPROVED")}
                  className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  <i className="fa-solid fa-check"></i>
                  <span>Approve</span>
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleSave("REJECTED")}
                  className="px-3 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  <i className="fa-solid fa-xmark"></i>
                  <span>Reject</span>
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleSave("UNDER_REVIEW")}
                  className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  <i className="fa-solid fa-clock"></i>
                  <span>Review</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
