"use client";

import React, { useState, useEffect } from "react";
import { ICustomForm } from "@/lib/types";
import FormBuilderModal from "./FormBuilderModal";

interface FormListProps {
  onSelectFormForResponses?: (formId: string) => void;
}

export default function FormList({ onSelectFormForResponses }: FormListProps) {
  const [forms, setForms] = useState<(ICustomForm & { responseCount?: number })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<ICustomForm | null>(null);

  const fetchForms = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/warden/forms");
      const data = await res.json();
      if (res.ok) {
        setForms(data.forms || []);
      }
    } catch (err) {
      console.error("fetchForms error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleToggleStatus = async (form: ICustomForm) => {
    const nextStatus = form.status === "ACTIVE" ? "CLOSED" : "ACTIVE";
    try {
      const res = await fetch("/api/warden/forms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formId: form._id, status: nextStatus }),
      });
      if (res.ok) {
        setForms((prev) =>
          prev.map((f) => (f._id === form._id ? { ...f, status: nextStatus } : f))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (formId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this form template and all its associated submissions?"
      )
    )
      return;
    try {
      const res = await fetch(`/api/warden/forms?formId=${formId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setForms((prev) => prev.filter((f) => f._id !== formId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getFormTypeBadge = (type: string) => {
    switch (type) {
      case "ADMISSION":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "REALLOCATION":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "MAINTENANCE":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "NOTICE":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getTimingStatus = (start: Date | string, end: Date | string, status: string) => {
    if (status === "CLOSED") {
      return { text: "Manually Closed", color: "bg-gray-100 text-gray-700 border-gray-300" };
    }
    const now = new Date();
    const sDate = new Date(start);
    const eDate = new Date(end);

    if (now < sDate) {
      return { text: "Upcoming Window", color: "bg-blue-50 text-blue-700 border-blue-200" };
    }
    if (now > eDate) {
      return { text: "Expired / Ended", color: "bg-red-50 text-red-700 border-red-200" };
    }
    return { text: "Accepting Responses", color: "bg-emerald-50 text-emerald-700 border-emerald-300" };
  };

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
        <div>
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <i className="fa-solid fa-file-pen text-blue-600"></i>
            <span>Configured Custom Forms</span>
          </h3>
          <p className="text-xs text-gray-500">
            Create admission forms, reallocation requests, or maintenance forms with custom fields and deadlines.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingForm(null);
            setIsBuilderOpen(true);
          }}
          className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-1.5 self-start sm:self-center"
        >
          <i className="fa-solid fa-plus text-[10px]"></i>
          <span>Create Custom Form</span>
        </button>
      </div>

      {/* Forms List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <i className="fa-solid fa-circle-notch animate-spin text-blue-600 text-2xl"></i>
            <p className="text-xs text-gray-500 font-medium mt-2">Loading custom forms...</p>
          </div>
        ) : forms.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200 p-6 space-y-2">
            <i className="fa-solid fa-file-pen text-gray-300 text-3xl"></i>
            <h4 className="text-sm font-bold text-gray-800">No Custom Forms Created Yet</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Click the "Create Custom Form" button to build your first dynamic admission, reallocation, or maintenance form.
            </p>
          </div>
        ) : (
          forms.map((form) => {
            const timing = getTimingStatus(form.startDate, form.endDate, form.status);

            return (
              <div
                key={form._id}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs hover:border-gray-300 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-gray-100 pb-2.5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm flex-shrink-0 border border-blue-200 shadow-2xs">
                      <i className="fa-solid fa-file-lines"></i>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getFormTypeBadge(
                            form.formType
                          )}`}
                        >
                          {form.formType}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${timing.color}`}
                        >
                          {timing.text}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                          {form.visibility}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 mt-1">{form.title}</h4>
                    </div>
                  </div>

                  {/* Actions & Response Count */}
                  <div className="flex items-center gap-2 self-end sm:self-start flex-wrap">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200 flex items-center gap-1.5">
                      <i className="fa-solid fa-inbox text-blue-600 text-[10px]"></i>
                      <span>{form.responseCount || 0} Submissions</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(form)}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border transition-colors ${
                        form.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                          : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
                      }`}
                    >
                      {form.status === "ACTIVE" ? "Active" : "Closed"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingForm(form);
                        setIsBuilderOpen(true);
                      }}
                      className="p-1.5 text-gray-500 hover:text-blue-600 rounded hover:bg-gray-100"
                      title="Edit Form"
                    >
                      <i className="fa-solid fa-pen text-xs"></i>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(form._id!)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"
                      title="Delete Form"
                    >
                      <i className="fa-solid fa-trash-can text-xs"></i>
                    </button>
                  </div>
                </div>

                {form.description && (
                  <p className="text-xs text-gray-600 leading-relaxed">{form.description}</p>
                )}

                {/* Timing & Fields Pill Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1">
                      <i className="fa-regular fa-clock text-blue-600 text-[11px]"></i>
                      <span>
                        Window: {new Date(form.startDate).toLocaleString()} &rarr;{" "}
                        {new Date(form.endDate).toLocaleString()}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-600">
                    <i className="fa-solid fa-list-check text-blue-600"></i>
                    <span>{(form.fields || []).length} Custom Fields</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Form Builder Modal */}
      <FormBuilderModal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        onSaved={fetchForms}
        initialForm={editingForm}
      />
    </div>
  );
}
