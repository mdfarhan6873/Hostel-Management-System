"use client";

import React, { useState, useEffect } from "react";
import {
  ICustomForm,
  ICustomFormField,
  FormType,
  FormVisibility,
  FormStatus,
  CustomFormFieldType,
} from "@/lib/types";
import FormSettingsCard from "./FormSettingsCard";
import FormFieldEditor from "./FormFieldEditor";
import FormPreviewModal from "./FormPreviewModal";

interface FormBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialForm?: ICustomForm | null;
}

export default function FormBuilderModal({
  isOpen,
  onClose,
  onSaved,
  initialForm,
}: FormBuilderModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [formType, setFormType] = useState<FormType>("ADMISSION");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [visibility, setVisibility] = useState<FormVisibility>("PUBLIC");
  const [status, setStatus] = useState<FormStatus>("ACTIVE");
  const [fields, setFields] = useState<ICustomFormField[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    if (initialForm) {
      setTitle(initialForm.title || "");
      setDescription(initialForm.description || "");
      setFormType(initialForm.formType || "ADMISSION");
      setStartDate(
        initialForm.startDate
          ? new Date(initialForm.startDate).toISOString().slice(0, 16)
          : ""
      );
      setEndDate(
        initialForm.endDate
          ? new Date(initialForm.endDate).toISOString().slice(0, 16)
          : ""
      );
      setVisibility(initialForm.visibility || "PUBLIC");
      setStatus(initialForm.status || "ACTIVE");
      setFields(initialForm.fields || []);
    } else {
      // Default initial state
      setTitle("");
      setDescription("");
      setFormType("ADMISSION");
      const now = new Date();
      const inTwoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
      setStartDate(now.toISOString().slice(0, 16));
      setEndDate(inTwoWeeks.toISOString().slice(0, 16));
      setVisibility("PUBLIC");
      setStatus("ACTIVE");
      // Preload standard admission fields
      setFields([
        {
          id: "f_branch",
          label: "Engineering Branch / Stream",
          fieldType: "select",
          required: true,
          options: ["CSE", "ECE", "EEE", "Mechanical", "Civil"],
          order: 0,
        },
        {
          id: "f_pref_room",
          label: "Room Preference",
          fieldType: "radio",
          required: true,
          options: ["Double Room (2 Beds)", "Triple Room (3 Beds)"],
          order: 1,
        },
        {
          id: "f_cgpa",
          label: "Last Semester Marks / CGPA",
          fieldType: "number",
          placeholder: "e.g. 8.45",
          required: false,
          order: 2,
        },
        {
          id: "f_declaration",
          label: "Hostel Anti-Ragging & Code of Conduct Agreement",
          fieldType: "checkbox",
          placeholder: "I accept the college hostel rules and code of conduct",
          required: true,
          order: 3,
        },
      ]);
    }
    setErrorMessage("");
  }, [initialForm, isOpen]);

  if (!isOpen) return null;

  const handleAddField = (type: CustomFormFieldType = "text") => {
    const newField: ICustomFormField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      label: `New ${type.toUpperCase()} Field`,
      fieldType: type,
      required: false,
      placeholder: "",
      helpText: "",
      options: type === "select" || type === "radio" ? ["Option 1", "Option 2"] : [],
      order: fields.length,
    };
    setFields((prev) => [...prev, newField]);
  };

  const handleUpdateField = (index: number, updated: ICustomFormField) => {
    setFields((prev) => {
      const copy = [...prev];
      copy[index] = updated;
      return copy;
    });
  };

  const handleDeleteField = (index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setFields((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === fields.length - 1) return;
    setFields((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!title.trim()) {
      setErrorMessage("Form title is required.");
      return;
    }
    if (!startDate || !endDate) {
      setErrorMessage("Start and end dates/times are required.");
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      setErrorMessage("End date must be after the start date.");
      return;
    }
    if (fields.length === 0) {
      setErrorMessage("Please configure at least one custom field in the form.");
      return;
    }

    setIsSaving(true);
    try {
      const isEdit = Boolean(initialForm?._id);
      const url = "/api/warden/forms";
      const method = isEdit ? "PUT" : "POST";

      const payload = {
        ...(isEdit ? { formId: initialForm?._id } : {}),
        title: title.trim(),
        description: description.trim(),
        formType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        visibility,
        status,
        fields,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save form");

      onSaved();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save form");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4 animate-fadeIn overflow-y-auto">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-4xl w-full p-5 sm:p-6 max-h-[92vh] flex flex-col my-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-md bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-xs">
                <i className="fa-solid fa-file-pen"></i>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {initialForm ? "Edit Custom Form Template" : "Create New Custom Form"}
                </h3>
                <p className="text-xs text-gray-500">
                  Build custom dynamic forms with flexible field types, scheduling & visibility rules.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors flex items-center gap-1.5"
              >
                <i className="fa-solid fa-eye text-blue-600"></i>
                <span>Preview Form</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="overflow-y-auto space-y-5 pr-1 flex-1">
            {errorMessage && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200 text-xs font-medium text-red-700 flex items-center gap-2">
                <i className="fa-solid fa-triangle-exclamation text-red-500"></i>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form Settings & Timing */}
            <FormSettingsCard
              title={title}
              setTitle={setTitle}
              description={description}
              setDescription={setDescription}
              formType={formType}
              setFormType={setFormType}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              visibility={visibility}
              setVisibility={setVisibility}
              status={status}
              setStatus={setStatus}
            />

            {/* Custom Fields Section */}
            <div className="bg-gray-50/70 border border-gray-200 rounded-xl p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/60 pb-3">
                <div>
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                    <i className="fa-solid fa-list-check text-blue-600"></i>
                    <span>Custom Form Fields ({fields.length} Configured)</span>
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Add numbered, string, tick (checkbox), select dropdowns, radio groups, date, or file URL fields.
                  </p>
                </div>

                {/* Quick Add Field Presets */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleAddField("text")}
                    className="px-2 py-1 text-[11px] font-semibold bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors"
                  >
                    + Text
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddField("number")}
                    className="px-2 py-1 text-[11px] font-semibold bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors"
                  >
                    + Number
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddField("checkbox")}
                    className="px-2 py-1 text-[11px] font-semibold bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors"
                  >
                    + Tick (Checkbox)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddField("select")}
                    className="px-2 py-1 text-[11px] font-semibold bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors"
                  >
                    + Dropdown
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddField("date")}
                    className="px-2 py-1 text-[11px] font-semibold bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors"
                  >
                    + Date
                  </button>
                </div>
              </div>

              {/* Field Editors List */}
              <div className="space-y-3">
                {fields.length === 0 ? (
                  <div className="text-center py-8 bg-white border border-dashed border-gray-300 rounded-lg p-6 space-y-2">
                    <i className="fa-solid fa-shapes text-gray-300 text-3xl"></i>
                    <p className="text-xs font-medium text-gray-600">No fields configured yet</p>
                    <p className="text-[11px] text-gray-400">
                      Click any of the "+ Field" buttons above to add fields to this form.
                    </p>
                  </div>
                ) : (
                  fields.map((f, idx) => (
                    <FormFieldEditor
                      key={f.id || idx}
                      field={f}
                      index={idx}
                      totalFields={fields.length}
                      onUpdate={(upd) => handleUpdateField(idx, upd)}
                      onDelete={() => handleDeleteField(idx)}
                      onMoveUp={() => handleMoveUp(idx)}
                      onMoveDown={() => handleMoveDown(idx)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 flex-shrink-0">
              <span className="text-xs text-gray-500">
                Audience: <strong className="text-gray-700 font-semibold">{visibility}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm flex items-center gap-1.5"
                >
                  {isSaving ? (
                    <>
                      <i className="fa-solid fa-circle-notch animate-spin"></i>
                      <span>Saving Form...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-check"></i>
                      <span>{initialForm ? "Save Changes" : "Create & Publish Form"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Live Preview Modal */}
      <FormPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={title}
        description={description}
        formType={formType}
        visibility={visibility}
        startDate={startDate}
        endDate={endDate}
        fields={fields}
      />
    </>
  );
}
