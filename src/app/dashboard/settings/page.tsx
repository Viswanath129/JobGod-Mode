"use client";

import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Save, MapPin, DollarSign, Briefcase, Code, Building2, Shield, Bell } from "lucide-react";
import type { UserPreferences } from "@/types";

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/preferences").then((r) => r.json()).then(setPrefs);
  }, []);

  const save = async () => {
    if (!prefs) return;
    setSaving(true);
    await fetch("/api/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prefs),
    });
    setSaving(false);
  };

  if (!prefs) return <div style={{ color: "#5a5a6e", padding: "40px" }}>Loading...</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "6px" }}>
            <span className="gradient-text">Settings</span> &amp; Preferences
          </h1>
          <p style={{ color: "#8a8a9a", fontSize: "14px" }}>Configure your AI agent&apos;s memory and behavior.</p>
        </div>
        <button className="btn-primary" onClick={save} disabled={saving}>
          <Save size={16} />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Locations */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <MapPin size={16} style={{ color: "#6366f1" }} /> Preferred Locations
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {prefs.preferredLocations.map((loc, i) => (
              <span key={i} className="filter-chip active">{loc}</span>
            ))}
          </div>
        </div>

        {/* Salary */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <DollarSign size={16} style={{ color: "#34d399" }} /> Salary Expectations
          </h3>
          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "12px", color: "#5a5a6e", display: "block", marginBottom: "6px" }}>Min ({prefs.salaryCurrency})</label>
              <input
                type="number"
                value={prefs.minSalary || ""}
                onChange={(e) => setPrefs({ ...prefs, minSalary: parseInt(e.target.value) || 0 })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", background: "var(--color-bg-card)", border: "1px solid var(--color-border-default)", color: "#f0f0f5", fontSize: "14px", outline: "none" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "12px", color: "#5a5a6e", display: "block", marginBottom: "6px" }}>Max ({prefs.salaryCurrency})</label>
              <input
                type="number"
                value={prefs.maxSalary || ""}
                onChange={(e) => setPrefs({ ...prefs, maxSalary: parseInt(e.target.value) || 0 })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", background: "var(--color-bg-card)", border: "1px solid var(--color-border-default)", color: "#f0f0f5", fontSize: "14px", outline: "none" }}
              />
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Code size={16} style={{ color: "#22d3ee" }} /> Tech Stack
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {prefs.techStack.map((t, i) => (
              <span key={i} className="filter-chip active">{t}</span>
            ))}
          </div>
        </div>

        {/* Auto-Apply */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Shield size={16} style={{ color: "#fb7185" }} /> Automation
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 600 }}>Auto-Apply</div>
                <div style={{ fontSize: "12px", color: "#5a5a6e" }}>Apply automatically when score &gt; threshold</div>
              </div>
              <button
                onClick={() => setPrefs({ ...prefs, autoApplyEnabled: !prefs.autoApplyEnabled })}
                style={{
                  width: "48px", height: "26px", borderRadius: "13px", border: "none", cursor: "pointer",
                  background: prefs.autoApplyEnabled ? "#6366f1" : "#2a2a3a",
                  position: "relative", transition: "background 0.2s",
                }}
              >
                <div style={{
                  width: "20px", height: "20px", borderRadius: "50%", background: "white",
                  position: "absolute", top: "3px",
                  left: prefs.autoApplyEnabled ? "25px" : "3px",
                  transition: "left 0.2s",
                }} />
              </button>
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#5a5a6e", display: "block", marginBottom: "6px" }}>
                Threshold: {prefs.autoApplyThreshold}/100
              </label>
              <input
                type="range" min="0" max="100"
                value={prefs.autoApplyThreshold}
                onChange={(e) => setPrefs({ ...prefs, autoApplyThreshold: parseInt(e.target.value) })}
                style={{ width: "100%", accentColor: "#6366f1" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
