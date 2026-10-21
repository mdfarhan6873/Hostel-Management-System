"use client";

import React, { useState } from "react";
import { ICustomFormField, CustomFormFieldType } from "@/lib/types";

interface FormFieldEditorProps {
  field: ICustomFormField;
  index: number;
  totalFields: number;
  onUpdate: (updatedField: ICustomFormField) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export default function FormFieldEditor({
  field,
  index,
  totalFields,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: FormFieldEditorProps) {
  const [newOption, setNewOption] = useState("");

  const handleAddOption = () => {
    if (!newOption.trim()) return;
    const currentOptions = field.options || [];
    onUpdate({
      ...field,
      options: [...currentOptions, newOption.trim()],
    });
    setNewOption("");
  };

  const handleRemoveOption = (optIdx: number) => {
    const currentOptions = field.options || [];
    onUpdate({
      ...field,
      options: currentOptions.filter((_, i) => i !== optIdx),
    });
  };

  const hasOptions = field.fieldType === "select" || field.fieldType === "radio";

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-2xs hover:border-blue-300 transition-all space-y-3">
      {/* Field Header / Actions */}
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-200">
            {index + 1}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Field #{index + 1}
          </span>
          {field.required && (
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-red-50 text-red-700 border border-red-200">
              * Required
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={index === 0}
            onClick={onMoveUp}
            className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded hover:bg-gray-100"
            title="Move Up"
          >
            <i className="fa-solid fa-arrow-up text-xs"></i>
          </button>
          <button
            type="button"
            disabled={index === totalFields - 1}
            onClick={onMoveDown}
            className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded hover:bg-gray-100"
            title="Move Down"
          >
            <i className="fa-solid fa-arrow-down text-xs"></i>
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 text-red-500 hover:text-red-700 rounded hover:bg-red-50 ml-1"
            title="Delete Field"
          >
            <i className="fa-solid fa-trash-can text-xs"></i>
          </button>
        </div>
      </div>

      {/* Primary Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Label */}
        <div className="md:col-span-6">
          <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
            Field Label <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={field.label}
            onChange={(e) => onUpdate({ ...field, label: e.target.value })}
            placeholder="e.g. Student Full Name, Preferred Room Type, CGPA"
            className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900"
            required
          />
        </div>

        {/* Field Type Selector */}
        <div className="md:col-span-4">
          <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
            Field Type <span className="text-red-500">*</span>
          </label>
          <select
            value={field.fieldType}
            onChange={(e) =>
              onUpdate({
                ...field,
                fieldType: e.target.value as CustomFormFieldType,
              })
            }
            className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-gray-900"
          >
            <optgroup label="Text & Numbers">
              <option value="text">String / Short Text (Input)</option>
              <option value="textarea">Multi-line Paragraph (Textarea)</option>
              <option value="number">Numbered Value (Number)</option>
            </optgroup>
            <optgroup label="Selection Controls">
              <option value="checkbox">Tick / Checkbox (Yes / No)</option>
              <option value="select">Dropdown Menu (Select Single)</option>
              <option value="radio">Radio Buttons (Single Choice)</option>
            </optgroup>
            <optgroup label="Date & Time">
              <option value="date">Date Picker (Date)</option>
              <option value="datetime">Date & Time Picker (Datetime)</option>
            </optgroup>
            <optgroup label="Special Inputs">
              <option value="email">Email Address</option>
              <option value="phone">10-Digit Mobile Number</option>
              <option value="file">File Upload / Document Link (URL)</option>
            </optgroup>
          </select>
        </div>

        {/* Required Switch */}
        <div className="md:col-span-2 flex items-center md:justify-center mt-2 md:mt-0">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) => onUpdate({ ...field, required: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="text-xs font-semibold text-gray-700">Required</span>
          </label>
        </div>
      </div>

      {/* Secondary Configuration (Placeholder & Helper Text) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        <div>
          <label className="block text-[11px] font-medium text-gray-600 mb-1">
            Placeholder Text (Optional)
          </label>
          <input
            type="text"
            value={field.placeholder || ""}
            onChange={(e) => onUpdate({ ...field, placeholder: e.target.value })}
            placeholder="e.g. Enter your roll number"
            className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-gray-600 mb-1">
            Helper / Instructions Text (Optional)
          </label>
          <input
            type="text"
            value={field.helpText || ""}
            onChange={(e) => onUpdate({ ...field, helpText: e.target.value })}
            placeholder="e.g. As printed on your college ID card"
            className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
          />
        </div>
      </div>

      {/* Options Editor for Select & Radio */}
      {hasOptions && (
        <div className="bg-slate-50 border border-slate-200 rounded-md p-3 space-y-2 mt-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
              Choices / Options
            </label>
            <span className="text-[10px] text-gray-400">
              {(field.options || []).length} options configured
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(field.options || []).map((opt, optIdx) => (
              <span
                key={optIdx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-gray-300 text-xs font-medium text-gray-800 shadow-2xs"
              >
                <span>{opt}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveOption(optIdx)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <i className="fa-solid fa-xmark text-[10px]"></i>
                </button>
              </span>
            ))}
            {(field.options || []).length === 0 && (
              <p className="text-xs text-amber-700 italic">
                No options added yet. Add at least one option below.
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddOption();
                }
              }}
              placeholder="Type an option and press Add (e.g. Single Room, CSE, Yes)"
              className="flex-1 px-2.5 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            />
            <button
              type="button"
              onClick={handleAddOption}
              className="px-3 py-1 text-xs font-semibold bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors"
            >
              + Add Option
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
