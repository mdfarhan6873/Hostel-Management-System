"use client";

import React, { useState } from "react";
import { ICustomFormField, FormType, FormVisibility } from "@/lib/types";

interface FormPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  formType: FormType;
  visibility: FormVisibility;
  startDate: string;
  endDate: string;
  fields: ICustomFormField[];
}

export default function FormPreviewModal({
  isOpen,
  onClose,
  title,
  description,
  formType,
  visibility,
  startDate,
  endDate,
  fields,
}: FormPreviewModalProps) {
  const [dummyAnswers, setDummyAnswers] = useState<Record<string, any>>({});

  if (!isOpen) return null;

  const handleDummyChange = (fieldId: string, val: any) => {
    setDummyAnswers((prev) => ({ ...prev, [fieldId]: val }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] flex flex-col my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              <i className="fa-solid fa-eye"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-900">Live Form Preview</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                  Interactive Preview Mode
                </span>
              </div>
              <p className="text-xs text-gray-500">
                This is how prospective applicants / students will see and fill this form.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Form Body Preview */}
        <div className="overflow-y-auto space-y-5 pr-1 flex-1">
          {/* Institutional Banner Header */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-blue-900 text-white rounded-xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
                {formType} FORM &bull; {visibility}
              </span>
              <span className="text-[11px] text-blue-200 font-medium">
                Window: {startDate ? new Date(startDate).toLocaleDateString() : "TBD"} –{" "}
                {endDate ? new Date(endDate).toLocaleDateString() : "TBD"}
              </span>
            </div>
            <h2 className="text-lg font-bold tracking-tight text-white">
              {title || "Untitled Custom Form"}
            </h2>
            {description && (
              <p className="text-xs text-blue-100 leading-relaxed">{description}</p>
            )}
          </div>

          {/* Standard Applicant Contact Fields */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              1. Basic Contact Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Kumar"
                  disabled
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md bg-white text-gray-400 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. rahul@example.com"
                  disabled
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md bg-white text-gray-400 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +91 9876543210"
                  disabled
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md bg-white text-gray-400 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Roll / Reg Number (If Applicable)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2310101001"
                  disabled
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md bg-white text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Custom Fields Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              2. Custom Fields ({fields.length} Fields Configured)
            </h4>

            {fields.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl text-gray-400 text-xs">
                No custom fields added yet. Add fields using the form editor.
              </div>
            ) : (
              fields.map((f, fIdx) => (
                <div
                  key={f.id || fIdx}
                  className="bg-white border border-gray-200 rounded-lg p-3.5 space-y-1.5 shadow-2xs"
                >
                  <label className="block text-xs font-bold text-gray-800">
                    {f.label}{" "}
                    {f.required && <span className="text-red-500">*</span>}
                  </label>
                  {f.helpText && (
                    <p className="text-[11px] text-gray-500">{f.helpText}</p>
                  )}

                  {/* Render by field type */}
                  {f.fieldType === "text" && (
                    <input
                      type="text"
                      placeholder={f.placeholder || "Enter text..."}
                      value={dummyAnswers[f.id] || ""}
                      onChange={(e) => handleDummyChange(f.id, e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  )}

                  {f.fieldType === "textarea" && (
                    <textarea
                      rows={2}
                      placeholder={f.placeholder || "Enter details..."}
                      value={dummyAnswers[f.id] || ""}
                      onChange={(e) => handleDummyChange(f.id, e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  )}

                  {f.fieldType === "number" && (
                    <input
                      type="number"
                      placeholder={f.placeholder || "e.g. 85, 2"}
                      value={dummyAnswers[f.id] || ""}
                      onChange={(e) => handleDummyChange(f.id, e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                  )}

                  {f.fieldType === "checkbox" && (
                    <label className="flex items-center gap-2 cursor-pointer mt-1">
                      <input
                        type="checkbox"
                        checked={Boolean(dummyAnswers[f.id])}
                        onChange={(e) => handleDummyChange(f.id, e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-xs text-gray-700 font-medium">
                        {f.placeholder || "Yes, I agree / confirm this statement"}
                      </span>
                    </label>
                  )}

                  {f.fieldType === "select" && (
                    <select
                      value={dummyAnswers[f.id] || ""}
                      onChange={(e) => handleDummyChange(f.id, e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">-- Select an option --</option>
                      {(f.options || []).map((opt, oIdx) => (
                        <option key={oIdx} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}

                  {f.fieldType === "radio" && (
                    <div className="space-y-1.5 pt-1">
                      {(f.options || []).map((opt, oIdx) => (
                        <label
                          key={oIdx}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name={`preview_${f.id}`}
                            value={opt}
                            checked={dummyAnswers[f.id] === opt}
                            onChange={() => handleDummyChange(f.id, opt)}
                            className="w-3.5 h-3.5 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {f.fieldType === "date" && (
                    <input
                      type="date"
                      value={dummyAnswers[f.id] || ""}
                      onChange={(e) => handleDummyChange(f.id, e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  )}

                  {f.fieldType === "datetime" && (
                    <input
                      type="datetime-local"
                      value={dummyAnswers[f.id] || ""}
                      onChange={(e) => handleDummyChange(f.id, e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  )}

                  {f.fieldType === "email" && (
                    <input
                      type="email"
                      placeholder={f.placeholder || "name@example.com"}
                      value={dummyAnswers[f.id] || ""}
                      onChange={(e) => handleDummyChange(f.id, e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  )}

                  {f.fieldType === "phone" && (
                    <input
                      type="tel"
                      placeholder={f.placeholder || "10-digit number"}
                      value={dummyAnswers[f.id] || ""}
                      onChange={(e) => handleDummyChange(f.id, e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                  )}

                  {f.fieldType === "file" && (
                    <input
                      type="url"
                      placeholder={
                        f.placeholder ||
                        "Google Drive / Cloud document URL (e.g. https://...)"
                      }
                      value={dummyAnswers[f.id] || ""}
                      onChange={(e) => handleDummyChange(f.id, e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-blue-600"
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end pt-4 border-t border-gray-100 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors shadow-sm"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
