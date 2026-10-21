"use client";

import React, { useState, useEffect } from "react";
import { IAdmissionNotice, FormVisibility } from "@/lib/types";

interface NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialNotice?: IAdmissionNotice | null;
}

export default function NoticeModal({
  isOpen,
  onClose,
  onSaved,
  initialNotice,
}: NoticeModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("CIRCULAR");
  const [refNumber, setRefNumber] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [visibility, setVisibility] = useState<FormVisibility>("PUBLIC");
  const [isActive, setIsActive] = useState(true);
  const [links, setLinks] = useState<{ label: string; url: string }[]>([]);
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (initialNotice) {
      setTitle(initialNotice.title || "");
      setDescription(initialNotice.description || "");
      setCategory(initialNotice.category || "CIRCULAR");
      setRefNumber(initialNotice.refNumber || "");
      setPublishDate(
        initialNotice.publishDate
          ? new Date(initialNotice.publishDate).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10)
      );
      setVisibility(initialNotice.visibility || "PUBLIC");
      setIsActive(initialNotice.isActive !== false);
      setLinks(initialNotice.pdfLinks || []);
    } else {
      setTitle("");
      setDescription("");
      setCategory("CIRCULAR");
      setRefNumber(
        `Ref: GEC/HMS/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`
      );
      setPublishDate(new Date().toISOString().slice(0, 10));
      setVisibility("PUBLIC");
      setIsActive(true);
      setLinks([
        {
          label: "Download Circular",
          url: "https://gecmunger.ac.in",
        },
      ]);
    }
    setErrorMessage("");
  }, [initialNotice, isOpen]);

  if (!isOpen) return null;

  const handleAddLink = () => {
    if (!newLinkLabel.trim() || !newLinkUrl.trim()) return;
    setLinks((prev) => [...prev, { label: newLinkLabel.trim(), url: newLinkUrl.trim() }]);
    setNewLinkLabel("");
    setNewLinkUrl("");
  };

  const handleRemoveLink = (idx: number) => {
    setLinks((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!title.trim() || !description.trim()) {
      setErrorMessage("Title and description are required.");
      return;
    }

    setIsSaving(true);
    try {
      const isEdit = Boolean(initialNotice?._id);
      const url = "/api/warden/notices";
      const method = isEdit ? "PUT" : "POST";

      const payload = {
        ...(isEdit ? { noticeId: initialNotice?._id } : {}),
        title: title.trim(),
        description: description.trim(),
        category,
        refNumber: refNumber.trim(),
        publishDate: new Date(publishDate),
        visibility,
        isActive,
        pdfLinks: links,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save notice");

      onSaved();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save notice");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-xl w-full p-6 max-h-[90vh] flex flex-col my-8">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold shadow-xs">
              <i className="fa-solid fa-bullhorn"></i>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                {initialNotice ? "Edit Notice / Circular" : "Publish Official Notice"}
              </h3>
              <p className="text-xs text-gray-500">
                Directives, guidelines, and circulars shown on the Notice Board.
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

        <form onSubmit={handleSubmit} className="overflow-y-auto space-y-4 pr-1 flex-1">
          {errorMessage && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-xs font-medium text-red-700">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Notice Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Session 2026-27 Hostel Admission Guidelines & Directives"
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-gray-900"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-gray-900"
              >
                <option value="CIRCULAR">CIRCULAR</option>
                <option value="ADMISSION">ADMISSION</option>
                <option value="BLUEPRINT">ASSET BLUEPRINT</option>
                <option value="REBATE">MESS REBATE</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
                <option value="GENERAL">GENERAL</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Reference Number
              </label>
              <input
                type="text"
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
                placeholder="e.g. Ref: GEC/HMS/2026/092"
                className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-gray-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Publish Date
              </label>
              <input
                type="date"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Visibility Audience
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as FormVisibility)}
                className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-gray-900"
              >
                <option value="PUBLIC">🌐 Public (Home Page Notice Board)</option>
                <option value="ENROLLED_STUDENTS">👥 Enrolled Students Only</option>
                <option value="ALLOTTED_STUDENTS">🏠 Allotted Students (Hostel Residents)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Description / Circular Text <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of the directive or notice..."
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
              required
            />
          </div>

          {/* Links Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                Document Links / Action Buttons ({links.length})
              </label>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {links.map((link, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-gray-300 text-xs font-medium text-gray-800 shadow-2xs"
                >
                  <i className="fa-solid fa-link text-[10px] text-blue-600"></i>
                  <span>{link.label}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveLink(idx)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <i className="fa-solid fa-xmark text-[10px]"></i>
                  </button>
                </span>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
              <input
                type="text"
                placeholder="Link Label (e.g. Download Circular, Rules PDF)"
                value={newLinkLabel}
                onChange={(e) => setNewLinkLabel(e.target.value)}
                className="sm:col-span-5 px-2.5 py-1 text-xs border border-gray-300 rounded-md bg-white"
              />
              <input
                type="text"
                placeholder="URL (e.g. https://... or /rules)"
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                className="sm:col-span-5 px-2.5 py-1 text-xs border border-gray-300 rounded-md bg-white font-mono"
              />
              <button
                type="button"
                onClick={handleAddLink}
                className="sm:col-span-2 px-3 py-1 text-xs font-semibold bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors"
              >
                + Add
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100 flex-shrink-0">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-xs font-semibold text-gray-700">Active Notice</span>
            </label>

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
                className="px-5 py-2 text-xs font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
              >
                {isSaving ? "Saving..." : initialNotice ? "Save Notice" : "Publish Notice"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
