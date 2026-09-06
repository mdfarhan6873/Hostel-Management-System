"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import CountdownTimer from "@/components/CountdownTimer";
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
} from "lucide-react";
import confetti from "canvas-confetti";

export default function StudentApplyPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();

  const [windows, setWindows] = useState<any[]>([]);
  const [selectedWindowId, setSelectedWindowId] = useState("");
  const [loadingWindows, setLoadingWindows] = useState(true);

  // Form Fields
  const [name, setName] = useState(user?.name || "");
  const [dob, setDob] = useState("");
  const [age, setAge] = useState(18);
  const [gender, setGender] = useState("Female");
  const [phone, setPhone] = useState(user?.phone || "");
  const [parentPhone, setParentPhone] = useState(user?.guardianPhone || "");
  const [address, setAddress] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [aadhaarFileUrl, setAadhaarFileUrl] = useState("");
  const [photoUrl, setPhotoUrl] = useState(user?.avatarUrl || "");

  // Academic
  const [rollNumber, setRollNumber] = useState(user?.rollNumber || "");
  const [registrationNumber, setRegistrationNumber] = useState(user?.registrationNumber || "");
  const [branch, setBranch] = useState(user?.department || "Computer Science & Engineering");
  const [session, setSession] = useState("2024-2028");
  const [semester, setSemester] = useState(user?.semester || 1);

  // Conditional Academic
  const [lastExamType, setLastExamType] = useState<"12TH" | "SEMESTER">("12TH");
  const [twelfthBoardName, setTwelfthBoardName] = useState("CBSE");
  const [twelfthPercentage, setTwelfthPercentage] = useState<number | "">("");
  const [semesterSgpaList, setSemesterSgpaList] = useState("");
  const [currentCgpa, setCurrentCgpa] = useState<number | "">("");

  // Health
  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || "");
  const [medicalRemark, setMedicalRemark] = useState("");

  const [uploadingAadhaar, setUploadingAadhaar] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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
        console.error(err);
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
          parentPhone,
          address,
          aadhaarNumber,
          aadhaarFileUrl,
          photoUrl,
          rollNumber,
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
        confetti({ particleCount: 80, spread: 90 });
      } catch {}

      await refreshUser();
      router.push("/student");
    } catch (err: any) {
      setError(err.message || "Network error while submitting.");
      setSubmitting(false);
    }
  };

  const currentWindow = windows.find((w) => w._id === selectedWindowId) || windows[0];

  return (
    <div className="container" style={{ padding: "2.5rem 1.5rem", maxWidth: "900px" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "2.25rem", fontWeight: 800 }}>
          Campus Hostel <span className="text-gradient">Admission Form</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginTop: "0.35rem" }}>
          Fill out your application, upload credentials, and review official hostel rules and fee structures.
        </p>
      </div>

      {loadingWindows ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>Checking active admission windows...</div>
      ) : windows.length === 0 ? (
        <div className="glass-card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <AlertCircle size={48} color="#f59e0b" style={{ margin: "0 auto 1rem auto" }} />
          <h3>Hostel Admissions Are Currently Closed</h3>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
            There are no active admission windows at this moment. Please check back later or contact the warden office.
          </p>
        </div>
      ) : (
        <>
          {/* Active Window Selection & Notice Banner */}
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
                Select Active Admission Round:
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
                    Notice / Eligibility Remark:
                  </div>
                  <div style={{ color: "#f8fafc", fontWeight: 600, fontSize: "0.925rem", marginTop: "0.2rem" }}>
                    {currentWindow.targetRemark}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Building2 size={16} color="var(--accent-secondary)" />
                    <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Target: {currentWindow.hostelName}</span>
                  </div>
                  <CountdownTimer targetDate={currentWindow.endDate} />
                </div>

                {/* Attached Document Links */}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="glass-card" style={{ padding: "2rem" }}>
            {/* Section 1: Personal Details */}
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "1rem", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "0.5rem" }}>
              1. Personal Details
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                  placeholder="Mandatory for leave verification"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Permanent & Correspondence Address</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House/Street, City, State, PIN code"
                required
              />
            </div>

            {/* Document Uploads */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "0.5rem" }}>
              <div className="form-group">
                <label className="form-label">Aadhaar Card Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 1234 5678 9012"
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
                      ✓ Aadhaar document uploaded
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
                      style={{ width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover" }}
                    />
                    <span style={{ fontSize: "0.75rem", color: "#34d399" }}>Photo attached</span>
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: College Academic Details */}
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: "2rem 0 1rem 0", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "0.5rem" }}>
              2. Academic Information
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">College Roll Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="e.g. 2024CS001"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Registration Number <span style={{ fontSize: "0.75rem", color: "#f59e0b" }}>(Optional - can update later)</span>
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
                <label className="form-label">Current Semester</label>
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

            {/* Conditional Examination Background */}
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
              <label className="form-label">Last Examination Passed</label>
              <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontSize: "0.875rem" }}>
                  <input
                    type="radio"
                    name="examType"
                    checked={lastExamType === "12TH"}
                    onChange={() => setLastExamType("12TH")}
                  />
                  <span>12th Standard / Intermediate (New Admission)</span>
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

            {/* Section 3: Health & Remarks */}
            <div className="form-group">
              <label className="form-label">Medical Remarks / Pre-existing Health Conditions (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Mention any allergies, asthma, or regular medical requirements"
                value={medicalRemark}
                onChange={(e) => setMedicalRemark(e.target.value)}
              />
            </div>

            {/* Agreement & Submit */}
            <div style={{ marginTop: "2rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border-subtle)" }}>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: "100%" }}
                disabled={submitting}
              >
                {submitting ? "Submitting Application..." : "Submit Hostel Application"}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
