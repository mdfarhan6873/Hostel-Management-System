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
  
  showAddUserModal,
  setShowAddUserModal,
  handleUserSubmit,
  userForm,
  setUserForm,
  categories,

  showAssignWardenModal,
  setShowAssignWardenModal,
  handleAssignSubmit,
  assignForm,
  setAssignForm,

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
                <label className="block font-semibold text-slate-700 mb-1">
                  Blocks / Wings (Comma Separated) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Block A (Chanakya), Block B (Aryabhata)"
                  value={hostelForm.initialBlocks}
                  onChange={(e) => setHostelForm({ ...hostelForm, initialBlocks: e.target.value })}
                  className="w-full rounded-md border border-slate-300 text-xs py-2 px-3 focus:border-slate-900 focus:ring-0"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Campus Sector &amp; Notes</label>
                <textarea
                  rows={2}
                  placeholder="Haveli Kharagpur Permanent Campus North Wing"
                  value={hostelForm.description}
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

      {/* MODAL 2: ADD NEW USER */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full border border-slate-300 overflow-hidden my-8 animate-scaleUp">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded bg-white border border-slate-300 text-slate-900 flex items-center justify-center font-bold text-sm">
                  <i className="fa-solid fa-user-plus"></i>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add New User</h3>
                  <p className="text-xs text-slate-500">Role assignment strictly honoring PRD governance (§3.1)</p>
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
                <div className="grid grid-cols-3 gap-2">
                  <label
                    className={`relative flex flex-col items-center p-2 rounded-lg border cursor-pointer transition text-center ${
                      userForm.role === "warden"
                        ? "border-slate-900 bg-slate-50 font-bold"
                        : "border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="warden"
                      checked={userForm.role === "warden"}
                      onChange={() => setUserForm({ ...userForm, role: "warden" })}
                      className="sr-only"
                    />
                    <i className="fa-solid fa-user-shield text-slate-700 text-sm mb-1"></i>
                    <span className="font-bold text-slate-900 text-xs">Warden</span>
                    <span className="text-[10px] text-slate-500">Category Bound</span>
                  </label>

                  <label
                    className={`relative flex flex-col items-center p-2 rounded-lg border cursor-pointer transition text-center ${
                      userForm.role === "viewer"
                        ? "border-slate-900 bg-slate-50 font-bold"
                        : "border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="viewer"
                      checked={userForm.role === "viewer"}
                      onChange={() => setUserForm({ ...userForm, role: "viewer" })}
                      className="sr-only"
                    />
                    <i className="fa-solid fa-eye text-slate-700 text-sm mb-1"></i>
                    <span className="font-bold text-slate-900 text-xs">Viewer</span>
                    <span className="text-[10px] text-slate-500">Read-Only</span>
                  </label>

                  <label
                    className={`relative flex flex-col items-center p-2 rounded-lg border cursor-pointer transition text-center ${
                      userForm.role === "superadmin"
                        ? "border-slate-900 bg-slate-50 font-bold"
                        : "border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="superadmin"
                      checked={userForm.role === "superadmin"}
                      onChange={() => setUserForm({ ...userForm, role: "superadmin" })}
                      className="sr-only"
                    />
                    <i className="fa-solid fa-shield text-slate-700 text-sm mb-1"></i>
                    <span className="font-bold text-slate-900 text-xs">Super Admin</span>
                    <span className="text-[10px] text-slate-500">Root Governance</span>
                  </label>
                </div>
              </div>

              {/* Mandatory Category Binding for Warden Role */}
              {userForm.role === "warden" && (
                <div className="p-3 rounded-lg border border-slate-300 bg-white space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <i className="fa-solid fa-link text-slate-600"></i> Bind Hostel Category &amp; Block
                    </span>
                    <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      Required for Warden
                    </span>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Target Category *</label>
                    <select
                      value={userForm.assignedCategory}
                      onChange={(e) => setUserForm({ ...userForm, assignedCategory: e.target.value })}
                      className="w-full rounded border border-slate-300 text-xs py-1.5 px-2 bg-white"
                    >
                      {categories.map((c: any) => (
                        <option key={c._id} value={c.name}>
                          {c.name} ({c.type})
                        </option>
                      ))}
                      {categories.length === 0 && (
                        <>
                          <option value="Boys Hostel Category">Boys Hostel Category (बालक छात्रावास)</option>
                          <option value="Girls Hostel Category">Girls Hostel Category (बालिका छात्रावास)</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Assigned Block Jurisdiction</label>
                    <input
                      type="text"
                      value={userForm.assignedBlockScope}
                      onChange={(e) => setUserForm({ ...userForm, assignedBlockScope: e.target.value })}
                      placeholder="e.g., Block A (Kautilya Bhavan)"
                      className="w-full rounded border border-slate-300 text-xs py-1.5 px-2 bg-white"
                    />
                  </div>
                </div>
              )}

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
                  className="rounded-full px-5 py-2 bg-slate-900 text-white font-bold hover:bg-black transition cursor-pointer"
                >
                  Create User Credentials
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
                  <p className="text-xs text-slate-500">Bind Warden to Category &amp; Block Scope</p>
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
                <select
                  value={assignForm.targetCategory}
                  onChange={(e) => setAssignForm({ ...assignForm, targetCategory: e.target.value })}
                  className="w-full rounded border border-slate-300 text-xs py-2 px-3 bg-white"
                  required
                >
                  {categories.map((c: any) => (
                    <option key={c._id} value={c.name}>
                      {c.name} ({c.type})
                    </option>
                  ))}
                  {categories.length === 0 && (
                    <>
                      <option value="Boys Hostel Category">Boys Hostel Category (बालक छात्रावास)</option>
                      <option value="Girls Hostel Category">Girls Hostel Category (बालिका छात्रावास)</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Block Jurisdiction</label>
                <input
                  type="text"
                  value={assignForm.blockScope}
                  onChange={(e) => setAssignForm({ ...assignForm, blockScope: e.target.value })}
                  className="w-full rounded border border-slate-300 text-xs py-2 px-3 bg-white"
                />
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
                  className="rounded-full px-5 py-2 bg-slate-900 text-white font-bold hover:bg-black transition cursor-pointer"
                >
                  Save Assignment
                </button>
              </div>
            </form>
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



