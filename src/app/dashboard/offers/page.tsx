"use client";

import { Trophy } from "lucide-react";

export default function OffersPage() {
  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "6px" }}>
          <span className="gradient-text-fire">Offer</span> Tracker
        </h1>
        <p style={{ color: "#8a8a9a", fontSize: "14px" }}>
          Compare offers, negotiate salary, and make informed decisions.
        </p>
      </div>

      <div className="empty-state">
        <Trophy size={48} style={{ color: "#2a2a3a", marginBottom: "16px" }} />
        <h3>No offers yet</h3>
        <p>
          When you receive offers, they&apos;ll appear here with comparison tools,
          salary negotiation drafts, and decision analysis.
        </p>
      </div>
    </div>
  );
}
