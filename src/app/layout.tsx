import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JobGod Mode — AI Job Hunter Agent",
  description:
    "The most advanced autonomous AI Job Hunter Agent. Find, filter, rank, customize, and apply to jobs automatically.",
  keywords: ["AI", "job search", "automation", "career", "resume", "ATS"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
