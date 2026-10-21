"use client";

import React, { useState, useEffect } from "react";
import { IAdmissionNotice } from "@/lib/types";
import NoticeModal from "./NoticeModal";

export default function NoticeManager() {
  const [notices, setNotices] = useState<IAdmissionNotice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<IAdmissionNotice | null>(null);

  const fetchNotices = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/warden/notices");
      const data = await res.json();
      if (res.ok) {
        setNotices(data.notices || []);
      }
    } catch (err) {
      console.error("fetchNotices error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleToggleActive = async (notice: IAdmissionNotice) => {
    try {
      const res = await fetch("/api/warden/notices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noticeId: notice._id,
          isActive: !notice.isActive,
        }),
      });
      if (res.ok) {
        setNotices((prev) =>
          prev.map((n) =>
            n._id === notice._id ? { ...n, isActive: !notice.isActive } : n
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (noticeId: string) => {
    if (!confirm("Are you sure you want to delete this notice?")) return;
    try {
      const res = await fetch(`/api/warden/notices?noticeId=${noticeId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setNotices((prev) => prev.filter((n) => n._id !== noticeId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "ADMISSION":
        return "bg-red-600 text-white";
      case "BLUEPRINT":
        return "bg-blue-600 text-white";
      case "REBATE":
        return "bg-emerald-600 text-white";
      case "MAINTENANCE":
        return "bg-amber-600 text-white";
      case "CIRCULAR":
      default:
        return "bg-indigo-600 text-white";
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
        <div>
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <i className="fa-solid fa-bullhorn text-blue-600"></i>
            <span>Official Notices & Circulars</span>
          </h3>
          <p className="text-xs text-gray-500">
            Publish official hostel directives, seat circulars, and announcements displayed on the Home Page notice board.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingNotice(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-1.5 self-start sm:self-center"
        >
          <i className="fa-solid fa-plus text-[10px]"></i>
          <span>Publish New Notice</span>
        </button>
      </div>

      {/* Notices List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <i className="fa-solid fa-circle-notch animate-spin text-blue-600 text-2xl"></i>
            <p className="text-xs text-gray-500 font-medium mt-2">Loading notices...</p>
          </div>
        ) : notices.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200 p-6 space-y-2">
            <i className="fa-solid fa-bullhorn text-gray-300 text-3xl"></i>
            <h4 className="text-sm font-bold text-gray-800">No Notices Published Yet</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Click the "Publish New Notice" button above to post official circulars to the hostel notice board.
            </p>
          </div>
        ) : (
          notices.map((notice) => (
            <div
              key={notice._id}
              className={`bg-white border rounded-xl p-4 shadow-2xs transition-all space-y-3 ${
                notice.isActive ? "border-gray-200 hover:border-gray-300" : "border-gray-200 opacity-60 bg-gray-50/70"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-gray-100 pb-2.5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-800 flex flex-col items-center justify-center font-bold text-xs flex-shrink-0 border border-gray-200">
                    <span className="text-[9px] uppercase font-bold text-red-600">
                      {new Date(notice.publishDate).toLocaleString("default", { month: "short" })}
                    </span>
                    <span className="text-sm leading-none font-black text-gray-900">
                      {new Date(notice.publishDate).getDate()}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${getCategoryColor(
                          notice.category
                        )}`}
                      >
                        {notice.category}
                      </span>
                      <span className="text-[11px] font-mono text-gray-500 font-medium">
                        {notice.refNumber}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                        {notice.visibility || "PUBLIC"}
                      </span>
                      {!notice.isActive && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-gray-200 text-gray-600">
                          Inactive
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 mt-1">{notice.title}</h4>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-start">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(notice)}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border transition-colors ${
                      notice.isActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                        : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    {notice.isActive ? "Active" : "Disabled"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingNotice(notice);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 text-gray-500 hover:text-blue-600 rounded hover:bg-gray-100"
                    title="Edit Notice"
                  >
                    <i className="fa-solid fa-pen text-xs"></i>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(notice._id!)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"
                    title="Delete Notice"
                  >
                    <i className="fa-solid fa-trash-can text-xs"></i>
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">{notice.description}</p>

              {/* Attached Links */}
              {(notice.pdfLinks || []).length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-100">
                  {notice.pdfLinks.map((link, lIdx) => (
                    <a
                      key={lIdx}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                    >
                      <i className="fa-solid fa-file-pdf text-[10px]"></i>
                      <span>{link.label}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Notice Create/Edit Modal */}
      <NoticeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchNotices}
        initialNotice={editingNotice}
      />
    </div>
  );
}
