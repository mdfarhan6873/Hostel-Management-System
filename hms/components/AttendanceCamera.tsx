"use client";

import React, { useRef, useState, useEffect } from "react";
import { Camera, CheckCircle2, Clock, AlertTriangle, RefreshCw, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

interface AttendanceCameraProps {
  studentName: string;
  rollNumber: string;
  roomNumber: string;
  hostelName: string;
  onMarked: () => void;
}

export default function AttendanceCamera({
  studentName,
  rollNumber,
  roomNumber,
  hostelName,
  onMarked,
}: AttendanceCameraProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentTimeStr, setCurrentTimeStr] = useState("");
  const [bypassWindow, setBypassWindow] = useState(false);

  // Check 7-8 PM window
  const now = new Date();
  const currentHour = now.getHours();
  const isInsideTimeWindow = currentHour >= 19 && currentHour < 20;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeStr(new Date().toLocaleTimeString());
    }, 1000);
    setCurrentTimeStr(new Date().toLocaleTimeString());
    return () => clearInterval(timer);
  }, []);

  // Start Camera
  const startCamera = async () => {
    try {
      setError("");
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 720 }, height: { ideal: 720 }, facingMode: "user" },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      setError("Unable to access camera. Please allow camera permissions in your browser.");
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Capture Snapshot with Overlay Watermark Stamp
  const captureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // Draw camera frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Add Overlay Watermark Banner at Bottom
    const bannerHeight = 85;
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.fillRect(0, canvas.height - bannerHeight, canvas.width, bannerHeight);

    // Accent line
    ctx.fillStyle = "#6366f1";
    ctx.fillRect(0, canvas.height - bannerHeight, canvas.width, 3);

    // Stamp Text
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(`ROOM ${roomNumber} • ${hostelName.toUpperCase()}`, 20, canvas.height - bannerHeight + 30);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "14px 'Plus Jakarta Sans', sans-serif";
    const dateStamp = new Date().toISOString().slice(0, 10);
    const timeStamp = new Date().toLocaleTimeString();
    ctx.fillText(`${studentName} (${rollNumber}) | ${dateStamp} ${timeStamp}`, 20, canvas.height - bannerHeight + 58);

    // Watermark tag
    ctx.fillStyle = "#10b981";
    ctx.font = "bold 13px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText("CAMPUSHMS VERIFIED ROLL-CALL", canvas.width - 240, canvas.height - bannerHeight + 45);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedPhoto(dataUrl);
    stopCamera();
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  // Submit Attendance
  const submitAttendance = async () => {
    if (!capturedPhoto) return;
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selfieUrl: capturedPhoto,
          roomNumber,
          bypassWindowCheck: bypassWindow,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit attendance.");
        setLoading(false);
        return;
      }

      try {
        confetti({ particleCount: 70, spread: 80 });
      } catch {}

      onMarked();
    } catch (err: any) {
      setError(err.message || "Network error while marking attendance.");
      setLoading(false);
    }
  };

  return (
    <div className="glass-card" style={{ maxWidth: "680px", margin: "0 auto", padding: "1.75rem" }}>
      {/* Header with Time Window Status */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
        <div>
          <h2 style={{ fontSize: "1.35rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Camera size={24} color="var(--accent-primary)" /> Nightly Room-Door Roll Call
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
            Stand in front of your assigned room door to capture your daily verification selfie.
          </p>
        </div>

        {/* Active Window Indicator */}
        <div style={{ textAlign: "right" }}>
          <div
            className="badge"
            style={{
              background: isInsideTimeWindow || bypassWindow ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
              color: isInsideTimeWindow || bypassWindow ? "#6ee7b7" : "#fca5a5",
              border: isInsideTimeWindow || bypassWindow ? "1px solid rgba(16, 185, 129, 0.35)" : "1px solid rgba(239, 68, 68, 0.35)",
            }}
          >
            <Clock size={12} /> {isInsideTimeWindow || bypassWindow ? "Window Open (7-8 PM)" : "Window Closed"}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
            Current Time: {currentTimeStr}
          </div>
        </div>
      </div>

      {/* Demo Window Simulation Toggle */}
      <div
        style={{
          background: "rgba(30, 41, 59, 0.5)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          padding: "0.6rem 0.85rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.25rem",
        }}
      >
        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <Sparkles size={14} color="#f59e0b" />
          <span>Testing at a different hour? Simulate active 7:00 PM – 8:00 PM window:</span>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontSize: "0.8rem", fontWeight: 700 }}>
          <input
            type="checkbox"
            checked={bypassWindow}
            onChange={(e) => setBypassWindow(e.target.checked)}
            style={{ cursor: "pointer", accentColor: "var(--accent-primary)" }}
          />
          Enable Test Window
        </label>
      </div>

      {error && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.35)",
            borderRadius: "var(--radius-md)",
            padding: "0.75rem 1rem",
            color: "#fca5a5",
            fontSize: "0.85rem",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Camera Preview / Captured Photo */}
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "4/3",
          background: "#000",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          border: "2px solid var(--border-medium)",
          marginBottom: "1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {capturedPhoto ? (
          <img src={capturedPhoto} alt="Captured Room Selfie" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : stream ? (
          <>
            <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            {/* Live Visual Stamp Overlay */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                background: "rgba(15, 23, 42, 0.85)",
                padding: "0.75rem 1rem",
                borderTop: "2px solid var(--accent-primary)",
              }}
            >
              <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#fff" }}>
                ROOM {roomNumber} • {hostelName.toUpperCase()}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.15rem" }}>
                {studentName} ({rollNumber}) | {currentTimeStr}
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div
              style={{
                width: "4rem",
                height: "4rem",
                borderRadius: "50%",
                background: "rgba(99, 102, 241, 0.15)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-primary)",
                marginBottom: "1rem",
              }}
            >
              <Camera size={32} />
            </div>
            <div style={{ fontWeight: 700, fontSize: "1rem", color: "#f8fafc" }}>Camera Inactive</div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.825rem", marginTop: "0.25rem" }}>
              Click Start Camera to initialize video roll-call stream.
            </p>
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>

      {/* Control Buttons */}
      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
        {!stream && !capturedPhoto && (
          <button type="button" className="btn btn-primary" onClick={startCamera}>
            <Camera size={18} /> Start Camera
          </button>
        )}

        {stream && (
          <button type="button" className="btn btn-success" onClick={captureSnapshot}>
            <CheckCircle2 size={18} /> Capture Room Selfie
          </button>
        )}

        {capturedPhoto && (
          <>
            <button type="button" className="btn btn-secondary" onClick={retakePhoto} disabled={loading}>
              <RefreshCw size={16} /> Retake
            </button>
            <button type="button" className="btn btn-primary" onClick={submitAttendance} disabled={loading}>
              <CheckCircle2 size={18} /> {loading ? "Logging Attendance..." : "Confirm & Submit Attendance"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
