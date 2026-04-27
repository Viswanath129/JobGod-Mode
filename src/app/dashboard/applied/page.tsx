"use client";

import { useState } from "react";
import { Send, Building2, Clock, Bot } from "lucide-react";
import type { Application } from "@/types";
import { formatRelativeTime } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  pending: "badge-amber",
  submitted: "badge-indigo",
  acknowledged: "badge-cyan",
  rejected: "badge-rose",
  interview_scheduled: "badge-emerald",
  offer: "badge-violet",
  accepted: "badge-emerald",
  declined: "badge-rose",
};

export default function AppliedPage() {
  const [applications] = useState<Application[]>([]);

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "6px" }}>
          <span className="gradient-text">Applied</span> Jobs
        </h1>
        <p style={{ color: "#8a8a9a", fontSize: "14px" }}>
          Track every application from submission to offer.
        </p>
      </div>

      {/* Status Summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "12px",
          marginBottom: "32px",
        }}
      >
        {[
          { label: "Pending", count: 0, color: "#fbbf24" },
          { label: "Submitted", count: 0, color: "#6366f1" },
          { label: "Interview", count: 0, color: "#34d399" },
          { label: "Offer", count: 0, color: "#a78bfa" },
          { label: "Rejected", count: 0, color: "#fb7185" },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              padding: "16px",
              borderRadius: "12px",
              background: "var(--color-bg-card)",
              border: "1px solid var(--color-border-default)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "24px",
                fontWeight: 800,
                fontFamily: "var(--font-mono)",
                color: s.color,
                marginBottom: "4px",
              }}
            >
              {s.count}
            </div>
            <div style={{ fontSize: "12px", color: "#5a5a6e" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {applications.length === 0 ? (
        <div className="empty-state">
          <Send size={48} style={{ color: "#2a2a3a", marginBottom: "16px" }} />
          <h3>No applications yet</h3>
          <p>
            Search for jobs, let AI score them, and apply to the best matches.
            Your applications will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {applications.map((app) => (
            <div key={app.id} className="job-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#f0f0f5", marginBottom: "4px" }}>
                    {app.job?.title || "Unknown Role"}
                  </h3>
                  <div style={{ display: "flex", gap: "12px", fontSize: "13px", color: "#8a8a9a" }}>
                    <span><Building2 size={13} style={{ display: "inline" }} /> {app.job?.company}</span>
                    <span><Clock size={13} style={{ display: "inline" }} /> {app.appliedAt ? formatRelativeTime(app.appliedAt) : "Pending"}</span>
                    <span className="badge badge-indigo" style={{ fontSize: "9px" }}>
                      <Bot size={10} style={{ marginRight: "3px" }} />
                      {app.method}
                    </span>
                  </div>
                </div>
                <span className={`badge ${STATUS_COLORS[app.status] || "badge-indigo"}`}>
                  {app.status.replace("_", " ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
