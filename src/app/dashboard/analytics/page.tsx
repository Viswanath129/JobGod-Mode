"use client";

import { BarChart3, TrendingUp, PieChart } from "lucide-react";

export default function AnalyticsPage() {
  const weeklyData = [
    { day: "Mon", jobs: 12, applied: 3 },
    { day: "Tue", jobs: 18, applied: 5 },
    { day: "Wed", jobs: 8, applied: 2 },
    { day: "Thu", jobs: 24, applied: 7 },
    { day: "Fri", jobs: 15, applied: 4 },
    { day: "Sat", jobs: 6, applied: 1 },
    { day: "Sun", jobs: 3, applied: 0 },
  ];
  const maxJobs = Math.max(...weeklyData.map((d) => d.jobs), 1);

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "6px" }}>
          <span className="gradient-text">Analytics</span> &amp; Insights
        </h1>
        <p style={{ color: "#8a8a9a", fontSize: "14px" }}>Track your job search performance.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px", marginBottom: "20px" }}>
        <div className="glass-card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "24px" }}>
            <BarChart3 size={18} style={{ display: "inline", marginRight: "8px", color: "#6366f1" }} />
            Weekly Activity
          </h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "12px", height: "180px" }}>
            {weeklyData.map((d, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "100%", display: "flex", gap: "4px", alignItems: "flex-end", height: "150px" }}>
                  <div style={{ flex: 1, height: `${(d.jobs / maxJobs) * 100}%`, background: "rgba(99,102,241,0.35)", borderRadius: "4px 4px 0 0", minHeight: "4px" }} />
                  <div style={{ flex: 1, height: `${(d.applied / maxJobs) * 100}%`, background: "rgba(34,211,238,0.45)", borderRadius: "4px 4px 0 0", minHeight: "4px" }} />
                </div>
                <span style={{ fontSize: "11px", color: "#5a5a6e" }}>{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "24px" }}>
            <PieChart size={18} style={{ display: "inline", marginRight: "8px", color: "#22d3ee" }} />
            Score Distribution
          </h3>
          {[
            { label: "80-100", pct: 15, color: "#34d399" },
            { label: "60-79", pct: 35, color: "#fbbf24" },
            { label: "40-59", pct: 30, color: "#f97316" },
            { label: "0-39", pct: 20, color: "#fb7185" },
          ].map((t, i) => (
            <div key={i} style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                <span style={{ color: "#8a8a9a" }}>{t.label}</span>
                <span style={{ color: t.color, fontWeight: 600 }}>{t.pct}%</span>
              </div>
              <div style={{ width: "100%", height: "6px", borderRadius: "3px", background: "var(--color-bg-card)" }}>
                <div style={{ width: `${t.pct}%`, height: "100%", borderRadius: "3px", background: t.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card" style={{ padding: "24px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "24px" }}>
          <TrendingUp size={18} style={{ display: "inline", marginRight: "8px", color: "#34d399" }} />
          Application Funnel
        </h3>
        <div style={{ display: "flex" }}>
          {[
            { label: "Discovered", value: 0, color: "#6366f1" },
            { label: "Scored", value: 0, color: "#22d3ee" },
            { label: "Applied", value: 0, color: "#34d399" },
            { label: "Interview", value: 0, color: "#fbbf24" },
            { label: "Offer", value: 0, color: "#a78bfa" },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ height: "48px", background: `${s.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: "18px", fontWeight: 800, color: s.color }}>
                {s.value}
              </div>
              <div style={{ fontSize: "11px", color: "#5a5a6e", marginTop: "8px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
