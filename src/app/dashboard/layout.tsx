"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Send,
  FileText,
  BarChart3,
  Settings,
  Trophy,
  Brain,
  Zap,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/jobs", label: "Job Search", icon: Search },
  { href: "/dashboard/applied", label: "Applied", icon: Send },
  { href: "/dashboard/resumes", label: "Resumes", icon: FileText },
  { href: "/dashboard/interviews", label: "Interviews", icon: Brain },
  { href: "/dashboard/offers", label: "Offers", icon: Trophy },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0a0a0f" }}>
      {/* Sidebar */}
      <aside className="sidebar">
        {/* Logo */}
        <div
          style={{
            padding: "24px 20px 20px",
            borderBottom: "1px solid var(--color-border-default)",
            marginBottom: "12px",
          }}
        >
          <Link
            href="/"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #6366f1, #22d3ee)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Zap size={18} color="white" />
            </div>
            <div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 800,
                  color: "#f0f0f5",
                  letterSpacing: "-0.02em",
                }}
              >
                JobGod
              </div>
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  color: "#6366f1",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                God Mode
              </div>
            </div>
          </Link>
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: "0 0 20px" }}>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive ? "active" : ""}`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div
          style={{
            padding: "16px 20px",
            borderTop: "1px solid var(--color-border-default)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #6366f1, #a78bfa)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: 700,
                color: "white",
              }}
            >
              KV
            </div>
            <div>
              <div
                style={{ fontSize: "13px", fontWeight: 600, color: "#f0f0f5" }}
              >
                Kasi Viswanath
              </div>
              <div style={{ fontSize: "11px", color: "#5a5a6e" }}>
                God Mode Active
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          marginLeft: "260px",
          padding: "32px",
          maxWidth: "calc(100vw - 260px)",
        }}
      >
        {children}
      </main>
    </div>
  );
}
