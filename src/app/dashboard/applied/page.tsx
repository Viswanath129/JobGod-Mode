"use client";

import { useEffect, useState } from "react";
import { Send, Building2, Clock, Bot, Loader2 } from "lucide-react";
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
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadApplications = async (showSpinner = false) => {
      if (showSpinner) setLoading(true);
      try {
        const response = await fetch("/api/applications", { cache: "no-store" });
        const data = await response.json();
        if (mounted) setApplications(data.applications || []);
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted && showSpinner) setLoading(false);
      }
    };

    loadApplications(true);
    const interval = window.setInterval(() => loadApplications(false), 15000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  const summary = {
    pending: applications.filter((app) => app.status === "pending").length,
    submitted: applications.filter((app) => app.status === "submitted" || app.status === "acknowledged").length,
    interview: applications.filter((app) => app.status === "interview_scheduled").length,
    offer: applications.filter((app) => app.status === "offer" || app.status === "accepted").length,
    rejected: applications.filter((app) => app.status === "rejected" || app.status === "declined").length,
  };

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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "12px",
          marginBottom: "32px",
        }}
      >
        {[
          { label: "Pending", count: summary.pending, color: "#fbbf24" },
          { label: "Submitted", count: summary.submitted, color: "#6366f1" },
          { label: "Interview", count: summary.interview, color: "#34d399" },
          { label: "Offer", count: summary.offer, color: "#a78bfa" },
          { label: "Rejected", count: summary.rejected, color: "#fb7185" },
        ].map((s) => (
          <div
            key={s.label}
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

      {loading ? (
        <div className="empty-state">
          <Loader2 size={32} className="animate-spin" style={{ color: "#6366f1", marginBottom: "16px" }} />
          <p style={{ color: "#5a5a6e" }}>Loading applications...</p>
        </div>
      ) : applications.length === 0 ? (
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
                  <div style={{ display: "flex", gap: "12px", fontSize: "13px", color: "#8a8a9a", flexWrap: "wrap" }}>
                    <span><Building2 size={13} style={{ display: "inline" }} /> {app.job?.company || "Unknown"}</span>
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
