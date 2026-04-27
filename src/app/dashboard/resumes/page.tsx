"use client";

import { useState, useEffect } from "react";
import { FileText, Download, Eye, Trash2, Sparkles, Clock } from "lucide-react";
import type { TailoredResume } from "@/types";

export default function ResumesPage() {
  const [resumes, setResumes] = useState<TailoredResume[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    setResumes([]);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Resume uploaded and parsed successfully!" });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to upload resume" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "An error occurred during upload." });
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "6px" }}>
            <span className="gradient-text">Resume</span> Gallery
          </h1>
          <p style={{ color: "#8a8a9a", fontSize: "14px" }}>
            AI-tailored resumes for each job application. ATS-optimized PDFs.
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <label className="btn-ghost" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
            {uploading ? (
              <Clock className="animate-spin" size={16} />
            ) : (
              <FileText size={16} />
            )}
            {uploading ? "Uploading..." : "Upload Base Resume"}
            <input type="file" accept=".pdf,.docx" hidden onChange={handleFileUpload} disabled={uploading} />
          </label>
          <button className="btn-primary">
            <Sparkles size={16} />
            Generate New
          </button>
        </div>
      </div>

      {message && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "10px",
            marginBottom: "24px",
            fontSize: "14px",
            fontWeight: 500,
            background: message.type === "success" ? "rgba(52, 211, 153, 0.15)" : "rgba(251, 113, 133, 0.15)",
            color: message.type === "success" ? "#34d399" : "#fb7185",
            border: `1px solid ${message.type === "success" ? "rgba(52, 211, 153, 0.3)" : "rgba(251, 113, 133, 0.3)"}`,
          }}
        >
          {message.text}
        </div>
      )}

      {/* Base Resume Card */}
      <div
        className="glass-card"
        style={{
          padding: "24px",
          marginBottom: "32px",
          borderColor: "rgba(99,102,241,0.3)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #6366f1, #22d3ee)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FileText size={22} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "2px" }}>
              Base Resume — Kasi Viswanath Vegisetti
            </div>
            <div style={{ fontSize: "13px", color: "#8a8a9a" }}>
              AI & Embedded Systems Engineer · Computer Vision · Edge AI
            </div>
          </div>
          <span className="badge badge-emerald">PRIMARY</span>
        </div>
      </div>

      {/* Tailored Resumes */}
      {resumes.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} style={{ color: "#2a2a3a", marginBottom: "16px" }} />
          <h3>No tailored resumes yet</h3>
          <p>
            When you score a job, JobGod can generate an ATS-optimized resume tailored 
            specifically for that role. Click &quot;Generate New&quot; to create one.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
          {resumes.map((r) => (
            <div key={r.id} className="glass-card" style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <span className="badge badge-cyan">ATS: {r.atsScore || "—"}/100</span>
                <span style={{ fontSize: "11px", color: "#5a5a6e" }}>
                  <Clock size={11} style={{ display: "inline" }} /> {r.createdAt}
                </span>
              </div>
              <div style={{ fontSize: "13px", color: "#8a8a9a", marginBottom: "12px" }}>
                Keywords: {r.keywordsAdded.slice(0, 5).join(", ")}
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button className="btn-ghost" style={{ flex: 1, fontSize: "12px", padding: "8px" }}>
                  <Eye size={14} /> Preview
                </button>
                <button className="btn-primary" style={{ flex: 1, fontSize: "12px", padding: "8px" }}>
                  <Download size={14} /> PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
