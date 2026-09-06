"use client";

import React, { useState, useEffect } from "react";
import CountdownTimer from "@/components/CountdownTimer";
import ApplicationSlipModal from "@/components/ApplicationSlipModal";
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Printer,
  Search,
  KeyRound,
  ShieldAlert,
  HelpCircle,
  LogIn,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function PublicApplyPage() {
  const [activeTab, setActiveTab] = useState<"apply" | "status">("apply");

  // Application Windows State
  const [windows, setWindows] = useState<any[]>([]);
  const [selectedWindowId, setSelectedWindowId] = useState("");
  const [loadingWindows, setLoadingWindows] = useState(true);

  // Form Fields - Personal
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [age, setAge] = useState(18);
  const [gender, setGender] = useState("Female");
  const [phone, setPhone] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [address, setAddress] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [medicalRemark, setMedicalRemark] = useState("");

  // Verification Documents
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [aadhaarFileUrl, setAadhaarFileUrl] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploadingAadhaar, setUploadingAadhaar] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Academic Details
  const [rollNumber, setRollNumber] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [branch, setBranch] = useState("Computer Science & Engineering");
  const [session, setSession] = useState("2024-2028");
  const [semester, setSemester] = useState(1);

  // Conditional Academic Evaluation
  const [lastExamType, setLastExamType] = useState<"12TH" | "SEMESTER">("12TH");
  const [twelfthBoardName, setTwelfthBoardName] = useState("CBSE");
  const [twelfthPercentage, setTwelfthPercentage] = useState<number | "">("");
  const [semesterSgpaList, setSemesterSgpaList] = useState("");
  const [currentCgpa, setCurrentCgpa] = useState<number | "">("");

  // Credentials for future login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submittedApplication, setSubmittedApplication] = useState<any | null>(null);
  const [submittedCredentials, setSubmittedCredentials] = useState<any | null>(null);

  // Status Lookup State
  const [statusSearchId, setStatusSearchId] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [statusResult, setStatusResult] = useState<any | null>(null);

  useEffect(() => {
    const fetchWindows = async () => {
      try {
        setLoadingWindows(true);
        const res = await fetch("/api/application-windows?active=true");
        const data = await res.json();
        if (res.ok && data.windows) {
          setWindows(data.windows);
          if (data.windows.length > 0) {
            setSelectedWindowId(data.windows[0]._id);
          }
        }
      } catch (err) {
        console.error("Fetch windows error:", err);
      } finally {
        setLoadingWindows(false);
      }
    };
    fetchWindows();
  }, []);

  const handleFileUpload = async (file: File, type: "aadhaar" | "photo") => {
    try {
      if (type === "aadhaar") setUploadingAadhaar(true);
      else setUploadingPhoto(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/uploads", { method: "POST", body: formData });
      const data = await res.json();

      if (res.ok && data.url) {
        if (type === "aadhaar") setAadhaarFileUrl(data.url);
        else setPhotoUrl(data.url);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (type === "aadhaar") setUploadingAadhaar(false);
      else setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWindowId) {
      setError("Please select an active admission window.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Account password and confirmation password do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          windowId: selectedWindowId,
          name,
          dob,
          age,
          gender,
          phone,
          email: email || `${rollNumber.trim().toLowerCase()}@hostel.edu`,
          password,
          parentPhone,
          address,
          aadhaarNumber,
          aadhaarFileUrl,
          photoUrl,
          rollNumber: rollNumber.trim().toUpperCase(),
          registrationNumber,
          branch,
          session,
          semester,
          lastExamType,
          twelfthBoardName,
          twelfthPercentage: Number(twelfthPercentage) || 0,
          semesterSgpaList,
          currentCgpa: Number(currentCgpa) || 0,
          bloodGroup,
          medicalRemark,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Application submission failed.");
        setSubmitting(false);
        return;
      }

      try {
        confetti({ particleCount: 100, spread: 80 });
      } catch {}

      // Store application and credentials for the printable PDF slip modal
      setSubmittedApplication(data.application);
      setSubmittedCredentials({
        rollNumber: rollNumber.trim().toUpperCase(),
        email: email || data.application.email,
        phone,
        password,
      });
      setSubmitting(false);
    } catch (err: any) {
      setError(err.message || "Network error while submitting application.");
      setSubmitting(false);
    }
  };

  const handleStatusSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusSearchId) return;

    try {
      setStatusLoading(true);
      setStatusError("");
      setStatusResult(null);

      const res = await fetch(`/api/applications/status?identifier=${encodeURIComponent(statusSearchId)}`);
      const data = await res.json();

      if (!res.ok) {
        setStatusError(data.error || "No application found matching this identifier.");
      } else {
        setStatusResult(data);
      }
    } catch (err: any) {
      setStatusError(err.message || "Error looking up status.");
    } finally {
      setStatusLoading(false);
    }
  };

  const currentWindow = windows.find((w) => w._id === selectedWindowId) || windows[0];

  return (
    <div className="container" style={{ padding: "3rem 1.5rem", maxWidth: "900px" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem", textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "rgba(99, 102, 241, 0.12)",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            padding: "0.4rem 1rem",
            borderRadius: "var(--radius-full)",
            color: "#a5b4fc",
            fontSize: "0.85rem",
            fontWeight: 600,
            marginBottom: "1rem",
          }}
        >
          <Building2 size={16} /> Campus Residency & Accommodation Portal
        </div>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
          Hostel <span className="text-gradient">Admission & Residency</span> Form
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "680px", margin: "0.5rem auto 0 auto" }}>
          Apply for hostel accommodation first. Once your application is reviewed and marked <strong>ELIGIBLE</strong> by administration,
          you will unlock access to sign in, pay hostel & mess fees, and confirm your room allotment.
        </p>

        {/* Tab Switcher */}
        <div
          style={{
            display: "inline-flex",
            background: "rgba(15, 23, 42, 0.8)",
            padding: "0.35rem",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-subtle)",
            marginTop: "1.5rem",
            gap: "0.35rem",
          }}
        >
          <button
            type="button"
            className={`btn btn-sm ${activeTab === "apply" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveTab("apply")}
          >
            <FileText size={15} /> 1. New Hostel Application
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === "status" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveTab("status")}
          >
            <Search size={15} /> 2. Check Application Status / Re-Print Slip
          </button>
        </div>
      </div>

      {/* TAB 1: NEW APPLICATION */}
      {activeTab === "apply" && (
        <>
          {loadingWindows ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
              Checking active hostel admission rounds...
            </div>
          ) : windows.length === 0 ? (
            <div className="glass-card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
              <AlertCircle size={48} color="#f59e0b" style={{ margin: "0 auto 1rem auto" }} />
              <h3>Hostel Admissions Are Currently Closed</h3>
              <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                There are no open admission windows at the moment. Please check back later or contact the warden office.
              </p>
            </div>
          ) : (
            <>
              {/* Active Window Banner & Rules PDF */}
              <div
                className="glass-card"
                style={{
                  marginBottom: "2rem",
                  background: "linear-gradient(180deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.85) 100%)",
                  border: "1px solid var(--border-glow)",
                  padding: "1.5rem",
                }}
              >
                <div className="form-group" style={{ marginBottom: "1rem" }}>
                  <label className="form-label" style={{ fontWeight: 700, color: "#a5b4fc" }}>
                    Select Active Admission Round & Target Hostel:
                  </label>
                  <select
                    className="form-select"
                    value={selectedWindowId}
                    onChange={(e) => setSelectedWindowId(e.target.value)}
                  >
                    {windows.map((w) => (
                      <option key={w._id} value={w._id}>
                        {w.title} — Target: {w.hostelName}
                      </option>
                    ))}
                  </select>
                </div>

                {currentWindow && (
                  <div>
                    <div
                      style={{
                        background: "rgba(245, 158, 11, 0.1)",
                        border: "1px solid rgba(245, 158, 11, 0.3)",
                        borderRadius: "var(--radius-md)",
                        padding: "0.85rem 1rem",
                        marginBottom: "1rem",
                      }}
                    >
                      <div style={{ fontSize: "0.75rem", color: "#fcd34d", textTransform: "uppercase", fontWeight: 700 }}>
                        Target Eligibility Notice:
                      </div>
                      <div style={{ color: "#f8fafc", fontWeight: 600, fontSize: "0.925rem", marginTop: "0.2rem" }}>
                        {currentWindow.targetRemark}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "0.75rem",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Building2 size={16} color="var(--accent-secondary)" />
                        <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                          Hostel: {currentWindow.hostelName}
                        </span>
                      </div>
                      <CountdownTimer targetDate={currentWindow.endDate} />
                    </div>

                    {/* PDF Download Links */}
                    <div
                      style={{
                        display: "flex",
                        gap: "0.75rem",
                        marginTop: "1rem",
                        paddingTop: "1rem",
                        borderTop: "1px solid var(--border-subtle)",
                        flexWrap: "wrap",
                      }}
                    >
                      {currentWindow.feeStructureUrl && (
                        <a
                          href={currentWindow.feeStructureUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary btn-sm"
                          style={{ flex: 1, fontSize: "0.8rem" }}
                        >
                          <FileText size={14} /> Download Fee Structure PDF
                        </a>
                      )}
                      {currentWindow.rulesRegulationsUrl && (
                        <a
                          href={currentWindow.rulesRegulationsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary btn-sm"
                          style={{ flex: 1, fontSize: "0.8rem" }}
                        >
                          <FileText size={14} /> View Rules & Regulations PDF
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Error Box */}
              {error && (
                <div
                  style={{
                    background: "rgba(239, 68, 68, 0.15)",
                    border: "1px solid rgba(239, 68, 68, 0.35)",
                    borderRadius: "var(--radius-md)",
                    padding: "0.85rem 1rem",
                    color: "#fca5a5",
                    fontSize: "0.875rem",
                    marginBottom: "1.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <AlertCircle size={18} /> {error}
                </div>
              )}

              {/* Main Application Form */}
              <form onSubmit={handleSubmit} className="glass-card" style={{ padding: "2rem" }}>
                {/* Section 1: Personal Details */}
                <h3
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: 800,
                    marginBottom: "1rem",
                    borderBottom: "1px solid var(--border-subtle)",
                    paddingBottom: "0.5rem",
                  }}
                >
                  1. Personal & Contact Details
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">Full Name of Student</label>
                    <input
                      type="text"
                      className="form-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="As per matriculation certificate"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      className="form-input"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">Age</label>
                    <input
                      type="number"
                      className="form-input"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      min={15}
                      max={35}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select className="form-select" value={gender} onChange={(e) => setGender(e.target.value)}>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Blood Group (Optional)</label>
                    <select className="form-select" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
                      <option value="">Select</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">Student Mobile Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Parent's / Guardian's Mobile Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      placeholder="Required for leave tele-verification"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Permanent Address</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House/Street, City, District, State, PIN code"
                    required
                  />
                </div>

                {/* Section 2: Verification Documents */}
                <h3
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: 800,
                    margin: "2rem 0 1rem 0",
                    borderBottom: "1px solid var(--border-subtle)",
                    paddingBottom: "0.5rem",
                  }}
                >
                  2. Identity & Document Uploads
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">Aadhaar Card Number</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="12-digit Aadhaar Number"
                      value={aadhaarNumber}
                      onChange={(e) => setAadhaarNumber(e.target.value)}
                      required
                    />
                    <div style={{ marginTop: "0.5rem" }}>
                      <label className="btn btn-secondary btn-sm" style={{ width: "100%", cursor: "pointer" }}>
                        <Upload size={14} /> {uploadingAadhaar ? "Uploading..." : "Upload Aadhaar Document"}
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, "aadhaar");
                          }}
                        />
                      </label>
                      {aadhaarFileUrl && (
                        <div style={{ fontSize: "0.75rem", color: "#34d399", marginTop: "0.25rem" }}>
                          ✓ Aadhaar document uploaded successfully
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Passport Photograph</label>
                    <label className="btn btn-secondary btn-sm" style={{ width: "100%", cursor: "pointer" }}>
                      <Upload size={14} /> {uploadingPhoto ? "Uploading..." : "Upload Passport Photo"}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, "photo");
                        }}
                      />
                    </label>
                    {photoUrl && (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
                        <img
                          src={photoUrl}
                          alt="Preview"
                          style={{ width: "45px", height: "45px", borderRadius: "50%", objectFit: "cover" }}
                        />
                        <span style={{ fontSize: "0.75rem", color: "#34d399" }}>Photo attached</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 3: College Academic Information */}
                <h3
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: 800,
                    margin: "2rem 0 1rem 0",
                    borderBottom: "1px solid var(--border-subtle)",
                    paddingBottom: "0.5rem",
                  }}
                >
                  3. College Academic Details
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">College Roll Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      placeholder="e.g. 2026CS101"
                      required
                    />
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      This will also serve as your login username once marked eligible.
                    </span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Registration Number{" "}
                      <span style={{ fontSize: "0.75rem", color: "#f59e0b" }}>(Optional - can update later)</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      placeholder="Leave blank if newly admitted fresher"
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">Branch / Department</label>
                    <input
                      type="text"
                      className="form-input"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Academic Session</label>
                    <input
                      type="text"
                      className="form-input"
                      value={session}
                      onChange={(e) => setSession(e.target.value)}
                      placeholder="2024-2028"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Semester</label>
                    <input
                      type="number"
                      className="form-input"
                      value={semester}
                      onChange={(e) => setSemester(Number(e.target.value))}
                      min={1}
                      max={10}
                      required
                    />
                  </div>
                </div>

                {/* Conditional Last Examination Background */}
                <div
                  style={{
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    padding: "1rem",
                    marginTop: "0.5rem",
                    marginBottom: "1rem",
                  }}
                >
                  <label className="form-label">Prior Examination Record</label>
                  <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontSize: "0.875rem" }}>
                      <input
                        type="radio"
                        name="examType"
                        checked={lastExamType === "12TH"}
                        onChange={() => setLastExamType("12TH")}
                      />
                      <span>12th Standard / Intermediate (New Freshers)</span>
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontSize: "0.875rem" }}>
                      <input
                        type="radio"
                        name="examType"
                        checked={lastExamType === "SEMESTER"}
                        onChange={() => setLastExamType("SEMESTER")}
                      />
                      <span>College Semester (2nd+ Year or Higher)</span>
                    </label>
                  </div>

                  {lastExamType === "12TH" ? (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      <div>
                        <label className="form-label" style={{ fontSize: "0.8rem" }}>12th Board Name</label>
                        <input
                          type="text"
                          className="form-input"
                          value={twelfthBoardName}
                          onChange={(e) => setTwelfthBoardName(e.target.value)}
                          placeholder="CBSE, ICSE, State Board"
                          required
                        />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: "0.8rem" }}>12th Overall Percentage (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-input"
                          value={twelfthPercentage}
                          onChange={(e) => setTwelfthPercentage(e.target.value === "" ? "" : Number(e.target.value))}
                          placeholder="e.g. 92.4"
                          required
                        />
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      <div>
                        <label className="form-label" style={{ fontSize: "0.8rem" }}>Semester-wise SGPA Breakdown</label>
                        <input
                          type="text"
                          className="form-input"
                          value={semesterSgpaList}
                          onChange={(e) => setSemesterSgpaList(e.target.value)}
                          placeholder="e.g. Sem 1: 8.5, Sem 2: 8.9"
                          required
                        />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: "0.8rem" }}>Current Cumulative CGPA</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-input"
                          value={currentCgpa}
                          onChange={(e) => setCurrentCgpa(e.target.value === "" ? "" : Number(e.target.value))}
                          placeholder="e.g. 8.7"
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 4: Health Remarks */}
                <div className="form-group" style={{ marginTop: "1rem" }}>
                  <label className="form-label">Medical Remarks / Allergies / Health Conditions (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Mention any allergies, asthma, or regular medical requirements"
                    value={medicalRemark}
                    onChange={(e) => setMedicalRemark(e.target.value)}
                  />
                </div>

                {/* Section 5: Student Credentials Setup */}
                <h3
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: 800,
                    margin: "2rem 0 1rem 0",
                    borderBottom: "1px solid var(--border-subtle)",
                    paddingBottom: "0.5rem",
                    color: "#a5b4fc",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <KeyRound size={20} /> 4. Student Portal Login Credentials (To Use Once Eligible)
                </h3>

                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                  Set up your password now. These credentials will be printed on your acknowledgement slip. You will be
                  able to sign in once the administration marks your application as <strong>ELIGIBLE</strong>.
                </p>

                <div className="form-group">
                  <label className="form-label">Student Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. student@example.com (or leave blank to use Roll Number ID)"
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">Set Account Password</label>
                    <input
                      type="password"
                      className="form-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <input
                      type="password"
                      className="form-input"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      required
                    />
                  </div>
                </div>

                {/* Gated Workflow Disclaimer Box */}
                <div
                  style={{
                    background: "rgba(99, 102, 241, 0.1)",
                    border: "1px solid rgba(99, 102, 241, 0.3)",
                    borderRadius: "var(--radius-md)",
                    padding: "1rem",
                    marginTop: "1.5rem",
                    display: "flex",
                    gap: "0.75rem",
                  }}
                >
                  <Sparkles size={22} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: "2px" }} />
                  <div style={{ fontSize: "0.85rem", color: "#c7d2fe", lineHeight: 1.5 }}>
                    <strong>Printable Slip & Login Policy:</strong> Upon submitting, an official printable acknowledgement slip
                    with your credentials and reference number will be generated immediately so you will not forget your password.
                    Student dashboard login is activated once your application is verified and marked <strong>ELIGIBLE</strong> by the administration.
                  </div>
                </div>

                {/* Submit Action */}
                <div style={{ marginTop: "2rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border-subtle)" }}>
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    style={{ width: "100%" }}
                    disabled={submitting}
                  >
                    {submitting ? (
                      "Submitting & Generating Slip..."
                    ) : (
                      <>
                        <Printer size={18} /> Submit Application & Print / Save PDF Slip
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </>
      )}

      {/* TAB 2: STATUS LOOKUP & RE-PRINT */}
      {activeTab === "status" && (
        <div className="glass-card" style={{ padding: "2.5rem 2rem" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Check Application Status & Re-Print Slip</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.35rem" }}>
              Enter your College Roll Number, Email, or Application Reference ID to check live verification status or re-download your slip.
            </p>
          </div>

          <form onSubmit={handleStatusSearch} style={{ maxWidth: "550px", margin: "0 auto 2rem auto" }}>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 2024CS001, student@hostel.edu, or ID"
                value={statusSearchId}
                onChange={(e) => setStatusSearchId(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary" disabled={statusLoading}>
                {statusLoading ? "Searching..." : <Search size={16} />}
              </button>
            </div>
          </form>

          {statusError && (
            <div
              style={{
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.35)",
                borderRadius: "var(--radius-md)",
                padding: "0.85rem 1rem",
                color: "#fca5a5",
                fontSize: "0.875rem",
                maxWidth: "550px",
                margin: "0 auto 1.5rem auto",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <AlertCircle size={18} /> {statusError}
            </div>
          )}

          {statusResult && (
            <div
              style={{
                maxWidth: "600px",
                margin: "0 auto",
                background: "rgba(15, 23, 42, 0.7)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-lg)",
                padding: "1.5rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <div>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 800 }}>{statusResult.application.name}</h3>
                  <div style={{ fontSize: "0.825rem", color: "var(--text-secondary)" }}>
                    Roll: <strong>{statusResult.application.rollNumber}</strong> • {statusResult.application.branch}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    Target: {statusResult.application.hostelName}
                  </div>
                </div>

                <div>
                  <span
                    className={`badge ${
                      statusResult.application.status === "ELIGIBLE"
                        ? "badge-eligible"
                        : statusResult.application.status === "ALLOTTED"
                        ? "badge-allotted"
                        : statusResult.application.status === "REJECTED"
                        ? "badge-cancelled"
                        : "badge-pending"
                    }`}
                  >
                    {statusResult.application.status}
                  </span>
                </div>
              </div>

              <div
                style={{
                  background:
                    statusResult.canLogin
                      ? "rgba(16, 185, 129, 0.12)"
                      : "rgba(245, 158, 11, 0.12)",
                  border: `1px solid ${statusResult.canLogin ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.3)"}`,
                  borderRadius: "var(--radius-md)",
                  padding: "0.85rem 1rem",
                  marginBottom: "1.25rem",
                  fontSize: "0.875rem",
                  color: statusResult.canLogin ? "#6ee7b7" : "#fcd34d",
                }}
              >
                {statusResult.message}
              </div>

              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setSubmittedApplication(statusResult.application);
                    setSubmittedCredentials({
                      rollNumber: statusResult.application.rollNumber,
                      email: statusResult.application.email,
                      password: statusResult.application.passwordHint || "••••••••",
                    });
                  }}
                  style={{ flex: 1 }}
                >
                  <Printer size={15} /> View & Print Application Slip (PDF)
                </button>

                {statusResult.canLogin && (
                  <a href="/login" className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                    <LogIn size={15} /> Proceed to Sign In
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* PRINTABLE SLIP MODAL */}
      {submittedApplication && (
        <ApplicationSlipModal
          application={submittedApplication}
          credentials={submittedCredentials}
          onClose={() => setSubmittedApplication(null)}
        />
      )}
    </div>
  );
}
