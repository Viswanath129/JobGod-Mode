"use client";

import { useEffect, useState } from "react";
import {
  Briefcase,
  Send,
  TrendingUp,
  Trophy,
  Sparkles,
  Zap,
  Target,
  BarChart3,
  Search,
  ArrowUpRight,
  Clock,
  Bot,
} from "lucide-react";
import type { DashboardStats } from "@/types";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      label: "Jobs Discovered",
      value: stats?.totalDiscovered ?? 0,
      icon: <Briefcase size={20} />,
      color: "#6366f1",
      gradient: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05))",
      change: `+${stats?.todayNewJobs ?? 0} today`,
    },
    {
      label: "Applied",
      value: stats?.totalApplied ?? 0,
      icon: <Send size={20} />,
      color: "#22d3ee",
      gradient: "linear-gradient(135deg, rgba(34,211,238,0.15), rgba(34,211,238,0.05))",
      change: `${stats?.weekApplications ?? 0} this week`,
    },
    {
      label: "Interviews",
      value: stats?.totalInterviews ?? 0,
      icon: <Target size={20} />,
      color: "#34d399",
      gradient: "linear-gradient(135deg, rgba(52,211,153,0.15), rgba(52,211,153,0.05))",
      change: "Scheduled",
    },
    {
      label: "Offers",
      value: stats?.totalOffers ?? 0,
      icon: <Trophy size={20} />,
      color: "#fbbf24",
      gradient: "linear-gradient(135deg, rgba(251,191,36,0.15), rgba(251,191,36,0.05))",
      change: "Active",
    },
  ];

  const [godModeActive, setGodModeActive] = useState(false);

  const handleGodMode = async () => {
    if (!confirm("Activate God Mode? This will automatically search, score, and apply to high-quality jobs.")) return;
    
    setGodModeActive(true);
    try {
      const res = await fetch("/api/agents/god-mode", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        // Refresh stats
        fetch("/api/stats").then(r => r.json()).then(setStats);
      } else {
        alert(data.error || "God Mode failed");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred during God Mode execution.");
    } finally {
      setGodModeActive(false);
    }
  };

  const quickActions = [
    {
      icon: <Search size={18} />,
      label: "Search Jobs",
      desc: "Scan all sources for new opportunities",
      href: "/dashboard/jobs",
      color: "#6366f1",
    },
    {
      icon: <Zap size={18} />,
      label: "Auto Score",
      desc: "Score all unscored jobs with AI",
      href: "#",
      color: "#22d3ee",
    },
    {
      icon: godModeActive ? <RefreshCw size={18} className="animate-spin" /> : <Bot size={18} />,
      label: "God Mode",
      desc: godModeActive ? "Autopilot running..." : "Full autopilot — search, score, apply",
      onClick: handleGodMode,
      color: "#f97316",
    },
  ];

  const recentActivity = [
    { time: "Just now", action: "System initialized", type: "system" },
    { time: "Ready", action: "AI Scoring Engine online", type: "ai" },
    { time: "Ready", action: "Resume Intelligence Engine online", type: "ai" },
    { time: "Ready", action: "Job Search Agents standing by", type: "agent" },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "8px",
          }}
        >
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            Command Center
          </h1>
          <div className="badge badge-indigo animate-pulse-glow">
            <Sparkles size={12} style={{ marginRight: "4px" }} />
            LIVE
          </div>
        </div>
        <p style={{ color: "#8a8a9a", fontSize: "14px" }}>
          Your autonomous AI job hunt is running. Here&apos;s the overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div
        className="stagger"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        {statCards.map((card, i) => (
          <div key={i} className="stat-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                  background: card.gradient,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: card.color,
                }}
              >
                {card.icon}
              </div>
              <span
                style={{
                  fontSize: "11px",
                  color: "#5a5a6e",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {card.change}
                <ArrowUpRight size={12} />
              </span>
            </div>
            <div
              style={{
                fontSize: "32px",
                fontWeight: 800,
                fontFamily: "var(--font-mono)",
                color: card.color,
                lineHeight: 1,
                marginBottom: "6px",
              }}
            >
              {loading ? "—" : card.value}
            </div>
            <div style={{ fontSize: "13px", color: "#8a8a9a", fontWeight: 500 }}>
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Quick Actions */}
        <div
          className="glass-card"
          style={{ padding: "24px" }}
        >
          <h3
            style={{
              fontSize: "16px",
              fontWeight: 700,
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Zap size={18} className="text-amber-400" />
            Quick Actions
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {quickActions.map((action, i) => (
              <a
                key={i}
                href={action.href}
                onClick={(e) => {
                  if (action.onClick) {
                    e.preventDefault();
                    action.onClick();
                  }
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  background: "var(--color-bg-card)",
                  border: "1px solid var(--color-border-default)",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = action.color;
                  e.currentTarget.style.transform = "translateX(4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-border-default)";
                  e.currentTarget.style.transform = "translateX(0)";
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: `${action.color}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: action.color,
                    flexShrink: 0,
                  }}
                >
                  {action.icon}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#f0f0f5",
                      marginBottom: "2px",
                    }}
                  >
                    {action.label}
                  </div>
                  <div style={{ fontSize: "12px", color: "#5a5a6e" }}>
                    {action.desc}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Agent Activity */}
        <div
          className="glass-card"
          style={{ padding: "24px" }}
        >
          <h3
            style={{
              fontSize: "16px",
              fontWeight: 700,
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Bot size={18} className="text-cyan-400" />
            Agent Activity
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {recentActivity.map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 0",
                  borderBottom:
                    i < recentActivity.length - 1
                      ? "1px solid rgba(42,42,58,0.5)"
                      : "none",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background:
                      item.type === "system"
                        ? "#34d399"
                        : item.type === "ai"
                        ? "#6366f1"
                        : "#22d3ee",
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", color: "#f0f0f5" }}>
                    {item.action}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#5a5a6e",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {item.time}
                </div>
              </div>
            ))}
          </div>

          {/* Score Ring */}
          <div
            style={{
              marginTop: "24px",
              padding: "20px",
              borderRadius: "12px",
              background: "var(--color-bg-card)",
              border: "1px solid var(--color-border-default)",
              display: "flex",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <div className="score-ring">
              <svg width="64" height="64" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="#2a2a3a"
                  strokeWidth="4"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="url(#scoreGrad)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${((stats?.averageScore ?? 0) / 100) * 176} 176`}
                />
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
              </svg>
              <span
                className="score-value"
                style={{ color: "#6366f1" }}
              >
                {stats?.averageScore ?? 0}
              </span>
            </div>
            <div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#f0f0f5",
                  marginBottom: "2px",
                }}
              >
                Average Score
              </div>
              <div style={{ fontSize: "12px", color: "#5a5a6e" }}>
                Top: {stats?.topScore ?? 0}/100
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
