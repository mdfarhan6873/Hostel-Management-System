"use client";

import React, { useState } from "react";
import { ICustomForm } from "@/lib/types";

interface DynamicFormModalProps {
  form: ICustomForm | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DynamicFormModal({
  form,
  isOpen,
  onClose,
}: DynamicFormModalProps) {
  const [applicantInfo, setApplicantInfo] = useState({
    name: "",
    email: "",
    phone: "",
    rollNo: "",
    branch: "",
    session: "2025-2029",
  });

  const [fieldAnswers, setFieldAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submittedReceipt, setSubmittedReceipt] = useState<{
    success: boolean;
    responseId?: string;
    message?: string;
  } | null>(null);

  if (!isOpen || !form) return null;

  const handleFieldChange = (fieldId: string, val: any) => {
    setFieldAnswers((prev) => ({ ...prev, [fieldId]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!applicantInfo.name.trim() || !applicantInfo.email.trim() || !applicantInfo.phone.trim()) {
      setErrorMessage("Please enter your Full Name, Email, and Mobile Number.");
      return;
    }

    // Client-side validation of required fields
    for (const f of form.fields || []) {
      if (f.required) {
        const val = fieldAnswers[f.id];
        const isEmpty =
          val === undefined ||
          val === null ||
          (typeof val === "string" && val.trim() === "") ||
          (Array.isArray(val) && val.length === 0);

        if (isEmpty) {
          setErrorMessage(`Please complete the required field: "${f.label}".`);
          return;
        }
      }
    }

    // Prepare responses payload
    const responsesPayload = (form.fields || []).map((f) => ({
      fieldId: f.id,
      label: f.label,
      value: fieldAnswers[f.id] !== undefined ? fieldAnswers[f.id] : "",
      fieldType: f.fieldType,
    }));

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/forms/${form._id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicantInfo,
          responses: responsesPayload,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit application");

      setSubmittedReceipt({
        success: true,
        responseId: data.responseId,
        message: data.message,
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit form");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmittedReceipt(null);
    setFieldAnswers({});
    setErrorMessage("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-2xl w-full p-5 sm:p-6 max-h-[92vh] flex flex-col my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-md bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-xs">
              <i className="fa-solid fa-file-signature"></i>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-gray-900">{form.title}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                  {form.formType}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Deadline: {new Date(form.endDate).toLocaleString()}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Success Confirmation Screen */}
        {submittedReceipt ? (
          <div className="py-8 text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl shadow-xs">
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-gray-900">Application Submitted Successfully!</h4>
              <p className="text-xs text-gray-600 max-w-md mx-auto">
                Your application for <strong>{form.title}</strong> has been received by the Warden Office.
              </p>
            </div>

            {submittedReceipt.responseId && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 max-w-sm mx-auto text-xs font-mono text-gray-700">
                <span className="text-gray-400 block text-[10px] uppercase font-sans">
                  Application Reference ID:
                </span>
                <span className="font-bold text-blue-700">{submittedReceipt.responseId}</span>
              </div>
            )}

            <p className="text-[11px] text-gray-500">
              Please save this reference ID for future inquiries. You will be notified via email once your
              application is reviewed.
            </p>

            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 text-xs font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
            >
              Done & Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="overflow-y-auto space-y-5 pr-1 flex-1">
            {errorMessage && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200 text-xs font-medium text-red-700 flex items-center gap-2">
                <i className="fa-solid fa-circle-exclamation text-red-500"></i>
                <span>{errorMessage}</span>
              </div>
            )}

            {form.description && (
              <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3 text-xs text-blue-900 leading-relaxed">
                <i className="fa-solid fa-circle-info mr-1.5 text-blue-600"></i>
                {form.description}
              </div>
            )}

            {/* Section 1: Applicant Information */}
            <div className="bg-gray-50/80 border border-gray-200 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <i className="fa-solid fa-user text-blue-600"></i>
                <span>1. Applicant Information</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={applicantInfo.name}
                    onChange={(e) =>
                      setApplicantInfo((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="e.g. Ankit Kumar"
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={applicantInfo.email}
                    onChange={(e) =>
                      setApplicantInfo((p) => ({ ...p, email: e.target.value }))
                    }
                    placeholder="e.g. ankit@gmail.com"
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={applicantInfo.phone}
                    onChange={(e) =>
                      setApplicantInfo((p) => ({ ...p, phone: e.target.value }))
                    }
                    placeholder="e.g. 9876543210"
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Roll / Registration Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={applicantInfo.rollNo}
                    onChange={(e) =>
                      setApplicantInfo((p) => ({ ...p, rollNo: e.target.value }))
                    }
                    placeholder="e.g. 2310101001"
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Custom Dynamic Form Fields */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <i className="fa-solid fa-list-check text-blue-600"></i>
                <span>2. Form Requirements & Questions</span>
              </h4>

              {(form.fields || []).map((f) => (
                <div
                  key={f.id}
                  className="bg-white border border-gray-200 rounded-lg p-3.5 space-y-1.5 shadow-2xs"
                >
                  <label className="block text-xs font-bold text-gray-800">
                    {f.label}{" "}
                    {f.required && <span className="text-red-500">*</span>}
                  </label>
                  {f.helpText && (
                    <p className="text-[11px] text-gray-500">{f.helpText}</p>
                  )}

                  {f.fieldType === "text" && (
                    <input
                      type="text"
                      required={f.required}
                      placeholder={f.placeholder || "Enter your answer..."}
                      value={fieldAnswers[f.id] || ""}
                      onChange={(e) => handleFieldChange(f.id, e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  )}

                  {f.fieldType === "textarea" && (
                    <textarea
                      rows={3}
                      required={f.required}
                      placeholder={f.placeholder || "Enter detailed response..."}
                      value={fieldAnswers[f.id] || ""}
                      onChange={(e) => handleFieldChange(f.id, e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  )}

                  {f.fieldType === "number" && (
                    <input
                      type="number"
                      required={f.required}
                      placeholder={f.placeholder || "e.g. 85, 2"}
                      value={fieldAnswers[f.id] || ""}
                      onChange={(e) => handleFieldChange(f.id, e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                  )}

                  {f.fieldType === "checkbox" && (
                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={Boolean(fieldAnswers[f.id])}
                        onChange={(e) => handleFieldChange(f.id, e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-xs text-gray-800 font-medium">
                        {f.placeholder || "I agree / confirm this requirement"}
                      </span>
                    </label>
                  )}

                  {f.fieldType === "select" && (
                    <select
                      required={f.required}
                      value={fieldAnswers[f.id] || ""}
                      onChange={(e) => handleFieldChange(f.id, e.target.value)}
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
                            name={`dyn_${f.id}`}
                            value={opt}
                            checked={fieldAnswers[f.id] === opt}
                            onChange={() => handleFieldChange(f.id, opt)}
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
                      required={f.required}
                      value={fieldAnswers[f.id] || ""}
                      onChange={(e) => handleFieldChange(f.id, e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  )}

                  {f.fieldType === "datetime" && (
                    <input
                      type="datetime-local"
                      required={f.required}
                      value={fieldAnswers[f.id] || ""}
                      onChange={(e) => handleFieldChange(f.id, e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  )}

                  {f.fieldType === "email" && (
                    <input
                      type="email"
                      required={f.required}
                      placeholder={f.placeholder || "name@example.com"}
                      value={fieldAnswers[f.id] || ""}
                      onChange={(e) => handleFieldChange(f.id, e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  )}

                  {f.fieldType === "phone" && (
                    <input
                      type="tel"
                      required={f.required}
                      placeholder={f.placeholder || "10-digit mobile number"}
                      value={fieldAnswers[f.id] || ""}
                      onChange={(e) => handleFieldChange(f.id, e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                  )}

                  {f.fieldType === "file" && (
                    <input
                      type="url"
                      required={f.required}
                      placeholder={
                        f.placeholder ||
                        "Google Drive / Cloud file URL (e.g. https://...)"
                      }
                      value={fieldAnswers[f.id] || ""}
                      onChange={(e) => handleFieldChange(f.id, e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-blue-600"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Bottom Submit */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 flex-shrink-0">
              <span className="text-[11px] text-gray-500">
                Verified submission directly to Warden Office
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-semibold border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <i className="fa-solid fa-circle-notch animate-spin"></i>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane"></i>
                      <span>Submit Application</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
