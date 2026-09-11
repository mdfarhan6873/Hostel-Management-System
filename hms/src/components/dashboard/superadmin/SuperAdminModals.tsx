// @ts-nocheck
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

export function SuperAdminModals({
  showAddHostelModal,
  setShowAddHostelModal,
  handleHostelSubmit,
  hostelForm,
  setHostelForm,

  showEditHostelModal,
  setShowEditHostelModal,
  handleEditHostelSubmit,
  editHostelForm,
  setEditHostelForm,

  showAddUserModal,
  setShowAddUserModal,
  handleUserSubmit,
  userForm,
  setUserForm,
  categories,

  showEditUserModal,
  setShowEditUserModal,
  handleEditUserSubmit,
  editUserForm,
  setEditUserForm,

  showAssignWardenModal,
  setShowAssignWardenModal,
  handleAssignSubmit,
  assignForm,
  setAssignForm,

  showDeleteModal,
  setShowDeleteModal,
  deleteTarget,
  handleConfirmDelete,

  showDiagnosticsModal,
  setShowDiagnosticsModal,
  currentUser,
  users
}: any) {
  return (
    <>
      {/* MODAL 1: ADD HOSTEL CATEGORY */}
      {showAddHostelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full border border-slate-300 overflow-hidden my-8 animate-scaleUp">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded bg-white border border-slate-300 text-slate-900 flex items-center justify-center font-bold text-sm">
                  <i className="fa-solid fa-hotel"></i>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add Hostel Category</h3>
                  <p className="text-xs text-slate-500">Establish top-level physical accommodation category (PRD §2.0)</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddHostelModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 transition cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-base"></i>
              </button>
            </div>

            <form onSubmit={handleHostelSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Category Title (English &amp; Hindi) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Post Graduate Boys Hostel / स्नातकोत्तर बालक छात्रावास"
                  value={hostelForm.name}
                  onChange={(e) => setHostelForm({ ...hostelForm, name: e.target.value })}
                  className="w-full rounded-md border border-slate-300 text-xs py-2 px-3 focus:border-slate-900 focus:ring-0"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prefix Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., PGBH-MUNGER"
                    value={hostelForm.code}
                    onChange={(e) => setHostelForm({ ...hostelForm, code: e.target.value.toUpperCase() })}
                    className="w-full rounded-md border border-slate-300 text-xs uppercase font-mono py-2 px-3 focus:border-slate-900 focus:ring-0"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender Demographic *</label>
                  <select
                    value={hostelForm.type}
                    onChange={(e) => setHostelForm({ ...hostelForm, type: e.target.value })}
                    className="w-full rounded-md border border-slate-300 text-xs py-2 px-3 focus:border-slate-900 focus:ring-0 bg-white"
                  >
                    <option value="boys">Male (Boys Hostel)</option>
                    <option value="girls">Female (Girls Hostel)</option>
                    <option value="coed">Staff / Co-educational</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Additional institutional notes..."
                  value={hostelForm.description || ""}
                  onChange={(e) => setHostelForm({ ...hostelForm, description: e.target.value })}
                  className="w-full rounded-md border border-slate-300 text-xs py-2 px-3 focus:border-slate-900 focus:ring-0"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddHostelModal(false)}
                  className="rounded-full px-4 py-2 border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full px-5 py-2 bg-slate-900 text-white font-bold hover:bg-black transition cursor-pointer"
                >
                  Save Hostel Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT HOSTEL CATEGORY */}
      {showEditHostelModal && editHostelForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full border border-slate-300 overflow-hidden my-8 animate-scaleUp">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded bg-white border border-slate-300 text-slate-900 flex items-center justify-center font-bold text-sm">
                  <i className="fa-solid fa-pen-to-square"></i>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Edit Hostel Category</h3>
                  <p className="text-xs text-slate-500">Update category details and demographic type</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditHostelModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 transition cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-base"></i>
              </button>
            </div>

            <form onSubmit={handleEditHostelSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Category Title (English &amp; Hindi) *
                </label>
                <input
                  type="text"
                  required
                  value={editHostelForm.name}
                  onChange={(e) => setEditHostelForm({ ...editHostelForm, name: e.target.value })}
                  className="w-full rounded-md border border-slate-300 text-xs py-2 px-3 focus:border-slate-900 focus:ring-0"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prefix Code *</label>
                  <input
                    type="text"
                    required
                    value={editHostelForm.code}
                    onChange={(e) => setEditHostelForm({ ...editHostelForm, code: e.target.value.toUpperCase() })}
                    className="w-full rounded-md border border-slate-300 text-xs uppercase font-mono py-2 px-3 focus:border-slate-900 focus:ring-0"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender Demographic *</label>
                  <select
                    value={editHostelForm.type}
                    onChange={(e) => setEditHostelForm({ ...editHostelForm, type: e.target.value })}
                    className="w-full rounded-md border border-slate-300 text-xs py-2 px-3 focus:border-slate-900 focus:ring-0 bg-white"
                  >
                    <option value="boys">Male (Boys Hostel)</option>
                    <option value="girls">Female (Girls Hostel)</option>
                    <option value="coed">Staff / Co-educational</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={editHostelForm.description || ""}
                  onChange={(e) => setEditHostelForm({ ...editHostelForm, description: e.target.value })}
                  className="w-full rounded-md border border-slate-300 text-xs py-2 px-3 focus:border-slate-900 focus:ring-0"
                  placeholder="Additional institutional notes..."
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditHostelModal(false)}
                  className="rounded-full px-4 py-2 border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full px-5 py-2 bg-slate-900 text-white font-bold hover:bg-black transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD NEW WARDEN */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full border border-slate-300 overflow-hidden my-8 animate-scaleUp">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded bg-white border border-slate-300 text-slate-900 flex items-center justify-center font-bold text-sm">
                  <i className="fa-solid fa-user-plus"></i>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add New Warden</h3>
                  <p className="text-xs text-slate-500">Create new warden credentials and assign to a category</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 transition cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-base"></i>
              </button>
            </div>

            <form onSubmit={handleUserSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name &amp; Academic Designation *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Prof. Rajesh Sharma"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full rounded-md border border-slate-300 text-xs py-2 px-3 focus:border-slate-900 focus:ring-0"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Institutional Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@gecmunger.ac.in"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full rounded-md border border-slate-300 text-xs py-2 px-3 focus:border-slate-900 focus:ring-0"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 9431X XXXXX"
                    value={userForm.mobile}
                    onChange={(e) => setUserForm({ ...userForm, mobile: e.target.value })}
                    className="w-full rounded-md border border-slate-300 text-xs font-mono py-2 px-3 focus:border-slate-900 focus:ring-0"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Initial Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full rounded-md border border-slate-300 text-xs py-2 px-3 focus:border-slate-900 focus:ring-0"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Permitted System Role *</label>
                <div className="p-3 rounded-lg border border-slate-900 bg-slate-50 flex items-center justify-center gap-2">
                  <i className="fa-solid fa-user-shield text-slate-700"></i>
                  <span className="font-bold text-slate-900 text-sm">Warden</span>
                  <span className="text-xs text-slate-500">(Category Bound)</span>
                </div>
              </div>

              {/* Mandatory Category Binding for Warden Role */}
              <div className="p-3 rounded-lg border border-slate-300 bg-white space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <i className="fa-solid fa-link text-slate-600"></i> Bind Hostel Category
                  </span>
                  <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                    Required for Warden
                  </span>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Target Category *</label>
                  {categories.length === 0 ? (
                    <div className="p-3 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <i className="fa-solid fa-triangle-exclamation text-amber-600"></i> No Hostel Categories Exist in System
                      </div>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        A warden must be assigned to an active hostel category. You must create at least one hostel category first before creating wardens.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddUserModal(false);
                          setShowAddHostelModal(true);
                        }}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                      >
                        <i className="fa-solid fa-hotel text-[10px]"></i> + Add Hostel Category First
                      </button>
                    </div>
                  ) : (
                    <select
                      value={userForm.assignedCategory}
                      onChange={(e) => setUserForm({ ...userForm, assignedCategory: e.target.value })}
                      className="w-full rounded border border-slate-300 text-xs py-1.5 px-2 bg-white"
                      required
                    >
                      <option value="" disabled>-- Select an Existing Category --</option>
                      {categories.map((c: any) => (
                        <option key={c._id} value={c.name}>
                          {c.name} ({c.type ? c.type.toUpperCase() : "GENERAL"})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="rounded-full px-4 py-2 border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={categories.length === 0}
                  className={`rounded-full px-5 py-2 font-bold transition ${
                    categories.length === 0
                      ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                      : "bg-slate-900 text-white hover:bg-black cursor-pointer"
                  }`}
                >
                  Create Warden Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT WARDEN DETAILS */}
      {showEditUserModal && editUserForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full border border-slate-300 overflow-hidden my-8 animate-scaleUp">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded bg-white border border-slate-300 text-slate-900 flex items-center justify-center font-bold text-sm">
                  {editUserForm.role === "superadmin" ? (
                    <i className="fa-solid fa-shield-halved"></i>
                  ) : (
                    <i className="fa-solid fa-user-pen"></i>
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editUserForm.role === "superadmin" ? "Edit Administrator Profile" : "Edit Warden Profile"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editUserForm.role === "superadmin"
                      ? "Update institutional head contact details & security credentials"
                      : "Update warden contact, designation & category"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEditUserModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 transition cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-base"></i>
              </button>
            </div>

            <form onSubmit={handleEditUserSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name &amp; Academic Designation *
                </label>
                <input
                  type="text"
                  required
                  value={editUserForm.name}
                  onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })}
                  className="w-full rounded-md border border-slate-300 text-xs py-2 px-3 focus:border-slate-900 focus:ring-0"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Institutional Email</label>
                  <input
                    type="email"
                    disabled
                    value={editUserForm.email}
                    className="w-full rounded-md border border-slate-200 bg-slate-100 text-slate-500 text-xs py-2 px-3 font-mono cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={editUserForm.mobile}
                    onChange={(e) => setEditUserForm({ ...editUserForm, mobile: e.target.value })}
                    className="w-full rounded-md border border-slate-300 text-xs font-mono py-2 px-3 focus:border-slate-900 focus:ring-0"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Designation</label>
                <input
                  type="text"
                  value={editUserForm.designation || ""}
                  onChange={(e) => setEditUserForm({ ...editUserForm, designation: e.target.value })}
                  className="w-full rounded-md border border-slate-300 text-xs py-2 px-3 focus:border-slate-900 focus:ring-0"
                  placeholder="e.g., Principal / Institutional Head"
                />
              </div>

              {/* Conditional Authority: Super Admin has campus-wide scope, Warden binds to category */}
              {editUserForm.role === "superadmin" ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <label className="block font-semibold text-slate-700">Institutional Authority Scope</label>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-white border border-slate-900 text-slate-900">
                      <i className="fa-solid fa-shield text-[10px]"></i> Super Admin Root
                    </span>
                    <span className="text-xs font-semibold text-slate-800">
                      Campus-Wide Authority (All Hostel Categories)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Institutional Super Admin oversees all physical accommodation, finances, and category allocations campus-wide.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Hostel Category *</label>
                  {categories.length === 0 ? (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-amber-800 text-xs">
                      No hostel categories currently exist in the database.
                    </div>
                  ) : (
                    <select
                      value={editUserForm.assignedCategory}
                      onChange={(e) => setEditUserForm({ ...editUserForm, assignedCategory: e.target.value })}
                      className="w-full rounded border border-slate-300 text-xs py-2 px-3 bg-white"
                      required
                    >
                      <option value="" disabled>-- Select an Existing Category --</option>
                      {categories.map((c: any) => (
                        <option key={c._id} value={c.name}>
                          {c.name} ({c.type ? c.type.toUpperCase() : "GENERAL"})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Password (leave blank to keep current)</label>
                <input
                  type="password"
                  placeholder="Enter at least 6 characters to reset"
                  value={editUserForm.password || ""}
                  onChange={(e) => setEditUserForm({ ...editUserForm, password: e.target.value })}
                  className="w-full rounded-md border border-slate-300 text-xs py-2 px-3 focus:border-slate-900 focus:ring-0"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditUserModal(false)}
                  className="rounded-full px-4 py-2 border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full px-5 py-2 bg-slate-900 text-white font-bold hover:bg-black transition cursor-pointer"
                >
                  {editUserForm.role === "superadmin" ? "Save Administrator Profile" : "Save Warden Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ASSIGN / REASSIGN WARDEN */}
      {showAssignWardenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-300 overflow-hidden my-8 animate-scaleUp">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded bg-white border border-slate-300 text-slate-900 flex items-center justify-center font-bold text-sm">
                  <i className="fa-solid fa-arrows-rotate"></i>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Assign / Reassign Warden</h3>
                  <p className="text-xs text-slate-500">Bind Warden to Hostel Category</p>
                </div>
              </div>
              <button
                onClick={() => setShowAssignWardenModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 transition cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-base"></i>
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Designated Warden *</label>
                <input
                  type="text"
                  disabled
                  value={assignForm.wardenName}
                  className="w-full rounded border border-slate-200 text-xs py-2 px-3 bg-slate-100 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Hostel Category *</label>
                {categories.length === 0 ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-800 text-xs space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <i className="fa-solid fa-triangle-exclamation text-amber-600"></i> No Categories Found
                    </p>
                    <p className="text-[11px]">
                      No hostel categories exist in the system. Create a category before assigning a warden.
                    </p>
                  </div>
                ) : (
                  <select
                    value={assignForm.targetCategory}
                    onChange={(e) => setAssignForm({ ...assignForm, targetCategory: e.target.value })}
                    className="w-full rounded border border-slate-300 text-xs py-2 px-3 bg-white"
                    required
                  >
                    <option value="" disabled>-- Select an Existing Category --</option>
                    {categories.map((c: any) => (
                      <option key={c._id} value={c.name}>
                        {c.name} ({c.type ? c.type.toUpperCase() : "GENERAL"})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Effective Date *</label>
                  <input
                    type="date"
                    value={assignForm.effectiveDate}
                    onChange={(e) => setAssignForm({ ...assignForm, effectiveDate: e.target.value })}
                    className="w-full rounded border border-slate-300 text-xs py-1.5 px-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Handover Clearance</label>
                  <select className="w-full rounded border border-slate-300 text-xs py-1.5 px-2 bg-white">
                    <option value="signed">Verified &amp; Signed</option>
                    <option value="pending">Pending Inventory Audit</option>
                  </select>
                </div>
              </div>

              <div className="p-2.5 rounded border border-slate-300 bg-white text-slate-700 text-[11px] leading-relaxed">
                <i className="fa-solid fa-circle-info text-slate-600 mr-1"></i> Reassignment will automatically restrict this Warden's room allocation, fee verification, and student rosters to the chosen category.
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAssignWardenModal(false)}
                  className="rounded-full px-4 py-2 border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={categories.length === 0}
                  className={`rounded-full px-5 py-2 font-bold transition ${
                    categories.length === 0
                      ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                      : "bg-slate-900 text-white hover:bg-black cursor-pointer"
                  }`}
                >
                  Save Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-md w-full border border-red-200 overflow-hidden my-8 animate-scaleUp p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center text-lg flex-shrink-0">
                <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Delete {deleteTarget.type === "category" ? "Hostel Category" : "Warden Account"}?
                </h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <div className="p-3 bg-red-50/50 rounded-lg border border-red-100 text-xs text-slate-700 space-y-1">
              <p>
                You are about to permanently delete{" "}
                <strong className="text-slate-900 font-bold">
                  {deleteTarget.item?.name}
                </strong>
                .
              </p>
              {deleteTarget.type === "category" && (
                <p className="text-red-700 text-[11px]">
                  All associated wardens assigned to this category will need reassignment.
                </p>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-full px-4 py-2 border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-full px-5 py-2 bg-red-600 text-white font-bold hover:bg-red-700 transition cursor-pointer text-xs flex items-center gap-1.5"
              >
                <i className="fa-solid fa-trash-can text-xs"></i>
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: SYSTEM DIAGNOSTICS & SETTINGS (GEAR ⚙️) */}
      {showDiagnosticsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-300 overflow-hidden animate-scaleUp p-5 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-gear text-slate-900 text-base"></i>
                <h3 className="text-base font-bold text-slate-900">System Diagnostics &amp; Settings</h3>
              </div>
              <button
                onClick={() => setShowDiagnosticsModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-base"></i>
              </button>
            </div>

            <div className="space-y-2.5 font-mono text-slate-700">
              <div className="flex justify-between p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500">Framework Runtime:</span>
                <span className="font-bold text-slate-900">Next.js 16 (App Router)</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500">Database Engine:</span>
                <span className="font-bold text-emerald-700">MongoDB Atlas (Healthy)</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500">Active Root User:</span>
                <span className="font-bold text-slate-900">{currentUser?.name}</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500">Operational Hostels:</span>
                <span className="font-bold text-slate-900">{categories.length} Categories</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500">Supervised Personnel:</span>
                <span className="font-bold text-slate-900">{users.length} Users</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowDiagnosticsModal(false)}
                className="rounded-full px-5 py-1.5 bg-slate-900 text-white font-bold hover:bg-black transition cursor-pointer"
              >
                Close Diagnostics
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
