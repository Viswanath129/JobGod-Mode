"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, PieChart, Loader2 } from "lucide-react";
import type { AnalyticsSnapshot } from "@/types";

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadAnalytics = async (showSpinner = false) => {
      if (showSpinner) setLoading(true);
      try {
        const response = await fetch("/api/analytics", { cache: "no-store" });
        const data = await response.json();
        if (mounted) setAnalytics(data);
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted && showSpinner) setLoading(false);
      }
    };

    loadAnalytics(true);
    const interval = window.setInterval(() => loadAnalytics(false), 15000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  const weeklyData = analytics?.weeklyActivity ?? [];
  const maxJobs = Math.max(...weeklyData.map((d) => d.jobs), 1);
  const scoreDistribution = analytics?.scoreDistribution ?? [];
  const funnel = analytics?.funnel ?? [];

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "6px" }}>
          <span className="gradient-text">Analytics</span> &amp; Insights
        </h1>
        <p style={{ color: "#8a8a9a", fontSize: "14px" }}>Track your job search performance in real time.</p>
      </div>

      {loading ? (
        <div className="empty-state">
          <Loader2 size={32} className="animate-spin" style={{ color: "#6366f1", marginBottom: "16px" }} />
          <p style={{ color: "#5a5a6e" }}>Loading analytics...</p>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px", marginBottom: "20px" }}>
            <div className="glass-card" style={{ padding: "24px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "24px" }}>
                <BarChart3 size={18} style={{ display: "inline", marginRight: "8px", color: "#6366f1" }} />
                Weekly Activity
              </h3>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "12px", height: "180px" }}>
                {weeklyData.map((d) => (
                  <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
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
              {scoreDistribution.map((tier) => (
                <div key={tier.label} style={{ marginBottom: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                    <span style={{ color: "#8a8a9a" }}>{tier.label}</span>
                    <span style={{ color: "#22d3ee", fontWeight: 600 }}>{tier.pct}%</span>
                  </div>
                  <div style={{ width: "100%", height: "6px", borderRadius: "3px", background: "var(--color-bg-card)" }}>
                    <div style={{ width: `${tier.pct}%`, height: "100%", borderRadius: "3px", background: "#22d3ee" }} />
                  </div>
                  <div style={{ marginTop: "4px", fontSize: "11px", color: "#5a5a6e" }}>{tier.count} jobs</div>
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
              {funnel.map((step) => (
                <div key={step.label} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ height: "48px", background: `${step.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: "18px", fontWeight: 800, color: step.color }}>
                    {step.value}
                  </div>
                  <div style={{ fontSize: "11px", color: "#5a5a6e", marginTop: "8px" }}>{step.label}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
