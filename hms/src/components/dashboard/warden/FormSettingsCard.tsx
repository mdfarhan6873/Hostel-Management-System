"use client";

import React from "react";
import { FormType, FormVisibility, FormStatus } from "@/lib/types";

interface FormSettingsCardProps {
  title: string;
  setTitle: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  formType: FormType;
  setFormType: (val: FormType) => void;
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  visibility: FormVisibility;
  setVisibility: (val: FormVisibility) => void;
  status: FormStatus;
  setStatus: (val: FormStatus) => void;
}

export default function FormSettingsCard({
  title,
  setTitle,
  description,
  setDescription,
  formType,
  setFormType,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  visibility,
  setVisibility,
  status,
  setStatus,
}: FormSettingsCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
            <i className="fa-solid fa-sliders"></i>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Form Metadata & Scheduling</h3>
            <p className="text-xs text-gray-500">Configure form type, submission window, and target audience.</p>
          </div>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
          Form Type: {formType}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Form Title */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Form Name / Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. B.Tech 1st Year Hostel Admission 2026-27"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-gray-900"
            required
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Instructions / Description
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Selected students must provide their branch, academic scores, and select room preference before the deadline."
            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-800"
          />
        </div>

        {/* Form Type */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Form Type Category <span className="text-red-500">*</span>
          </label>
          <select
            value={formType}
            onChange={(e) => setFormType(e.target.value as FormType)}
            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-gray-900"
          >
            <option value="ADMISSION">🎓 Admission (Hostel Seat Application)</option>
            <option value="REALLOCATION">🔄 Reallocation (Room / Bed Change)</option>
            <option value="MAINTENANCE">🛠️ Maintenance (Asset Repair Ticket)</option>
            <option value="NOTICE">📢 Notice / Inquiry / Feedback</option>
            <option value="GENERAL">📋 General Form</option>
          </select>
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Audience Visibility <span className="text-red-500">*</span>
          </label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as FormVisibility)}
            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-gray-900"
          >
            <option value="PUBLIC">🌐 Public (Visible on Home Page Notice Board)</option>
            <option value="ENROLLED_STUDENTS">👥 Enrolled Students Only</option>
            <option value="ALLOTTED_STUDENTS">🏠 Allotted Students Only (Current Residents)</option>
          </select>
        </div>

        {/* Start Date & Time */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Valid From (Date & Time) <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-gray-800"
            required
          />
        </div>

        {/* End Date & Time */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Deadline / Valid To (Date & Time) <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-gray-800"
            required
          />
        </div>
      </div>
    </div>
  );
}
