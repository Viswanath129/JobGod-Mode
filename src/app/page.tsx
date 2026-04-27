"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Zap,
  Search,
  FileText,
  Send,
  BarChart3,
  Settings,
  Briefcase,
  Trophy,
  Brain,
  Shield,
  TrendingUp,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Rocket,
  Target,
  Bot,
  Clock,
} from "lucide-react";

export default function LandingPage() {
  const [count, setCount] = useState(0);
  const targetCount = 740;

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = targetCount / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= targetCount) {
        setCount(targetCount);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: <Search size={22} />,
      title: "Smart Job Search",
      desc: "Scans LinkedIn, Indeed, Naukri, Wellfound, Google Jobs & more in parallel.",
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
    },
    {
      icon: <Target size={22} />,
      title: "8-Dimension Scoring",
      desc: "AI scores every job on resume fit, salary, growth, brand value & more.",
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
    },
    {
      icon: <FileText size={22} />,
      title: "Resume Intelligence",
      desc: "Auto-rewrites your CV for each job. ATS-optimized PDFs in seconds.",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      icon: <Send size={22} />,
      title: "Auto Apply Engine",
      desc: "Fills forms, uploads resume, answers screenings. Human or autopilot mode.",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      icon: <Brain size={22} />,
      title: "Agent Memory",
      desc: "Remembers your preferences, liked companies, salary expectations & more.",
      color: "text-violet-400",
      bg: "bg-violet-500/10",
    },
    {
      icon: <Shield size={22} />,
      title: "Scam Detection",
      desc: "AI flags fake jobs, dead reposts, and suspicious listings automatically.",
      color: "text-rose-400",
      bg: "bg-rose-500/10",
    },
  ];

  return (
    <div style={{ background: "#0a0a0f", minHeight: "100vh" }}>
      {/* === HERO === */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background gradient orbs */}
        <div
          style={{
            position: "absolute",
            top: "-200px",
            right: "-200px",
            width: "600px",
            height: "600px",
            background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(80px)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-150px",
            left: "-150px",
            width: "500px",
            height: "500px",
            background: "radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(80px)",
            pointerEvents: "none",
          }}
        />

        {/* Badge */}
        <div
          className="animate-slide-up"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 16px",
            borderRadius: "20px",
            border: "1px solid rgba(99,102,241,0.3)",
            background: "rgba(99,102,241,0.08)",
            fontSize: "13px",
            fontWeight: 500,
            color: "#818cf8",
            marginBottom: "32px",
          }}
        >
          <Sparkles size={14} />
          Autonomous AI Job Hunter Agent
        </div>

        {/* Title */}
        <h1
          className="animate-slide-up"
          style={{
            fontSize: "clamp(42px, 7vw, 80px)",
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            marginBottom: "20px",
            maxWidth: "800px",
          }}
        >
          <span className="gradient-text">JobGod</span>{" "}
          <span style={{ color: "#f0f0f5" }}>Mode</span>
        </h1>

        {/* Subtitle */}
        <p
          className="animate-slide-up"
          style={{
            fontSize: "clamp(16px, 2.5vw, 20px)",
            color: "#8a8a9a",
            maxWidth: "600px",
            lineHeight: 1.6,
            marginBottom: "40px",
            animationDelay: "0.1s",
          }}
        >
          Your personal AI recruiter that finds, filters, ranks, customizes, and
          applies to jobs{" "}
          <strong style={{ color: "#f0f0f5" }}>automatically</strong>.
        </p>

        {/* Counter */}
        <div
          className="animate-slide-up"
          style={{
            display: "flex",
            gap: "48px",
            marginBottom: "48px",
            animationDelay: "0.15s",
          }}
        >
          {[
            { value: count + "+", label: "Jobs Evaluated" },
            { value: "8D", label: "AI Scoring" },
            { value: "100%", label: "ATS Optimized" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div
                className="gradient-text"
                style={{
                  fontSize: "36px",
                  fontWeight: 800,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: "12px", color: "#5a5a6e", marginTop: "4px" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          className="animate-slide-up"
          style={{
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
            justifyContent: "center",
            animationDelay: "0.2s",
          }}
        >
          <Link href="/dashboard" className="btn-primary" style={{ fontSize: "16px", padding: "14px 32px" }}>
            <Rocket size={18} />
            Launch Dashboard
            <ChevronRight size={16} />
          </Link>
          <a
            href="https://github.com/Viswanath129/career-ops"
            target="_blank"
            className="btn-ghost"
            style={{ fontSize: "16px", padding: "14px 32px" }}
          >
            <ExternalLink size={16} />
            View on GitHub
          </a>
        </div>
      </section>

      {/* === FEATURES GRID === */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "80px 20px 120px",
        }}
      >
        <h2
          style={{
            fontSize: "36px",
            fontWeight: 800,
            textAlign: "center",
            marginBottom: "16px",
            letterSpacing: "-0.02em",
          }}
        >
          Built for <span className="gradient-text">God Mode</span>
        </h2>
        <p
          style={{
            textAlign: "center",
            color: "#8a8a9a",
            maxWidth: "500px",
            margin: "0 auto 60px",
            fontSize: "15px",
          }}
        >
          Every feature designed to give you an unfair advantage in your job
          search.
        </p>

        <div
          className="stagger"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
          }}
        >
          {features.map((f, i) => (
            <div key={i} className="glass-card" style={{ padding: "28px" }}>
              <div
                className={f.bg}
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                }}
              >
                <span className={f.color}>{f.icon}</span>
              </div>
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  marginBottom: "8px",
                  color: "#f0f0f5",
                }}
              >
                {f.title}
              </h3>
              <p style={{ fontSize: "13px", color: "#8a8a9a", lineHeight: 1.6 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* === WORKFLOW === */}
      <section
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "0 20px 120px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "32px",
            fontWeight: 800,
            marginBottom: "48px",
            letterSpacing: "-0.02em",
          }}
        >
          How <span className="gradient-text-fire">JobGod</span> Works
        </h2>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0",
            alignItems: "center",
          }}
        >
          {[
            { icon: <Clock size={20} />, step: "1", title: "Daily Scan", desc: "Every morning, agents scan 9+ job sources" },
            { icon: <BarChart3 size={20} />, step: "2", title: "AI Scoring", desc: "Jobs scored on 8 dimensions — 0 to 100" },
            { icon: <FileText size={20} />, step: "3", title: "Resume Rewrite", desc: "ATS-optimized CV generated per job" },
            { icon: <Bot size={20} />, step: "4", title: "Auto Apply", desc: "Top jobs applied automatically" },
            { icon: <Trophy size={20} />, step: "5", title: "Interview Prep", desc: "AI generates questions & prep roadmap" },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                  padding: "20px 32px",
                  borderRadius: "14px",
                  background: "var(--color-bg-card)",
                  border: "1px solid var(--color-border-default)",
                  width: "100%",
                  maxWidth: "500px",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #6366f1, #22d3ee)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "16px",
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  {s.step}
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "2px" }}>
                    {s.title}
                  </div>
                  <div style={{ fontSize: "13px", color: "#8a8a9a" }}>{s.desc}</div>
                </div>
              </div>
              {i < 4 && (
                <div
                  style={{
                    width: "2px",
                    height: "24px",
                    background: "linear-gradient(to bottom, var(--color-border-default), transparent)",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* === FOOTER === */}
      <footer
        style={{
          borderTop: "1px solid var(--color-border-default)",
          padding: "40px 20px",
          textAlign: "center",
          color: "#5a5a6e",
          fontSize: "13px",
        }}
      >
        <p>
          Built by{" "}
          <a
            href="https://github.com/Viswanath129"
            target="_blank"
            style={{ color: "#818cf8", textDecoration: "none" }}
          >
            Kasi Viswanath Vegisetti
          </a>{" "}
          — JobGod Mode © 2026
        </p>
      </footer>
    </div>
  );
}
