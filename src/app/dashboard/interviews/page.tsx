"use client";

import { Brain, MessageSquare, Code, Building2, Route, BookOpen } from "lucide-react";

export default function InterviewsPage() {
  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "6px" }}>
          <span className="gradient-text">Interview</span> Prep Center
        </h1>
        <p style={{ color: "#8a8a9a", fontSize: "14px" }}>
          AI-generated questions, company briefs, and preparation roadmaps.
        </p>
      </div>

      {/* Prep Categories */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "32px" }}>
        {[
          { icon: <MessageSquare size={22} />, title: "HR Questions", desc: "Behavioral & situational questions with STAR answers", color: "#6366f1", count: 0 },
          { icon: <Code size={22} />, title: "Technical Questions", desc: "Role-specific technical challenges & solutions", color: "#22d3ee", count: 0 },
          { icon: <Building2 size={22} />, title: "Company Briefs", desc: "Deep research on company culture, funding, and mission", color: "#34d399", count: 0 },
        ].map((cat, i) => (
          <div key={i} className="glass-card" style={{ padding: "24px" }}>
            <div
              style={{
                width: "44px", height: "44px", borderRadius: "12px",
                background: `${cat.color}15`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: cat.color, marginBottom: "16px",
              }}
            >
              {cat.icon}
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "6px" }}>{cat.title}</h3>
            <p style={{ fontSize: "13px", color: "#8a8a9a", marginBottom: "12px" }}>{cat.desc}</p>
            <div style={{ fontSize: "24px", fontWeight: 800, fontFamily: "var(--font-mono)", color: cat.color }}>
              {cat.count}
            </div>
          </div>
        ))}
      </div>

      <div className="empty-state">
        <Brain size={48} style={{ color: "#2a2a3a", marginBottom: "16px" }} />
        <h3>No interview prep yet</h3>
        <p>
          After applying to a job, JobGod auto-generates interview questions,
          company research, and a personalized prep roadmap.
        </p>
      </div>
    </div>
  );
}
