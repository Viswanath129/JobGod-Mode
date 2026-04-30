"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Filter,
  Sparkles,
  MapPin,
  Building2,
  DollarSign,
  ExternalLink,
  Zap,
  RefreshCw,
  ChevronDown,
  X,
  Loader2,
  AlertTriangle,
  Clock,
  Star,
} from "lucide-react";
import type { Job } from "@/types";
import { scoreColor, scoreBgColor, formatSalary, formatRelativeTime } from "@/lib/utils";

const LOCATIONS = [
  "India", "Hyderabad", "Bangalore", "Chennai", "Remote",
  "UAE", "Europe", "US", "Mumbai", "Delhi", "Pune",
];

const WORK_MODES = [
  "Remote", "Hybrid", "Onsite", "Full-time", "Part-time", "Internship", "Contract",
];

const SOURCES = [
  { value: "google_jobs", label: "Google Jobs" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "indeed", label: "Indeed" },
  { value: "naukri", label: "Naukri" },
  { value: "wellfound", label: "Wellfound" },
  { value: "company_page", label: "Company" },
];

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [scoringJobId, setScoringJobId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("AI Engineer");
  const [showFilters, setShowFilters] = useState(true);
  const [selectedLocations, setSelectedLocations] = useState<string[]>(["India", "Remote"]);
  const [selectedModes, setSelectedModes] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [minScore, setMinScore] = useState(0);

  const fetchJobs = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (minScore > 0) params.set("minScore", String(minScore));
    fetch(`/api/jobs?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setJobs(data.jobs || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [minScore]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      fetchJobs();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [fetchJobs]);

  useEffect(() => {
    const interval = window.setInterval(fetchJobs, 15000);
    return () => window.clearInterval(interval);
  }, [fetchJobs]);

  const handleSearch = async () => {
    setSearching(true);
    try {
      const res = await fetch("/api/jobs/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          locations: selectedLocations,
        }),
      });
      const data = await res.json();
      if (data.jobs) {
        fetchJobs();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  };

  const handleScore = async (jobId: string) => {
    setScoringJobId(jobId);
    try {
      await fetch("/api/jobs/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, useAI: false }),
      });
      fetchJobs();
    } catch (e) {
      console.error(e);
    } finally {
      setScoringJobId(null);
    }
  };

  const [applying, setApplying] = useState<string | null>(null);

  const handleApply = async (jobId: string) => {
    setApplying(jobId);
    try {
      const res = await fetch("/api/jobs/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Application submitted successfully!");
        fetchJobs();
      } else {
        alert(data.error || "Failed to apply");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred during application.");
    } finally {
      setApplying(null);
    }
  };

  const toggleFilter = (arr: string[], item: string, setter: (v: string[]) => void) => {
    setter(arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);
  };

  // ⚡ Bolt Optimization: Memoize filtered jobs and optimize filtering complexity
  // What: Moved string manipulation out of the filter loop, used Sets for O(1) lookup, and wrapped in useMemo
  // Why: Prevents creating strings on every iteration and executing O(N*M) array lookups during every render
  // Impact: Complexity drops from O(N*M) to O(N), drastically reduces memory allocations and garbage collection overhead
  const filteredJobs = useMemo(() => {
    const hasSources = selectedSources.length > 0;
    const hasModes = selectedModes.length > 0;

    // Fast path: no filters
    if (!hasSources && !hasModes) return jobs;

    const sourceSet = new Set(selectedSources);
    const modeSet = new Set(selectedModes.map(m => m.toLowerCase().replace('-', '_')));

    return jobs.filter((j) => {
      if (hasSources && !sourceSet.has(j.source)) return false;
      if (hasModes && j.workMode && !modeSet.has(j.workMode)) return false;
      return true;
    });
  }, [jobs, selectedSources, selectedModes]);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "6px" }}>
          <span className="gradient-text">Smart</span> Job Search
        </h1>
        <p style={{ color: "#8a8a9a", fontSize: "14px" }}>
          AI-powered multi-source job discovery engine.
        </p>
      </div>

      {/* Search Bar */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "0 16px",
            borderRadius: "12px",
            background: "var(--color-bg-card)",
            border: "1px solid var(--color-border-default)",
          }}
        >
          <Search size={18} style={{ color: "#5a5a6e" }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roles... e.g. AI Engineer, Embedded Systems"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#f0f0f5",
              fontSize: "14px",
              padding: "14px 0",
              fontFamily: "var(--font-sans)",
            }}
          />
        </div>

        <button
          className="btn-primary"
          onClick={handleSearch}
          disabled={searching}
          style={{ minWidth: "140px", justifyContent: "center" }}
        >
          {searching ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Search Jobs
            </>
          )}
        </button>

        <button
          className="btn-ghost"
          onClick={() => setShowFilters(!showFilters)}
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
        >
          <Filter size={16} />
          Filters
          <ChevronDown
            size={14}
            style={{
              transform: showFilters ? "rotate(180deg)" : "rotate(0)",
              transition: "transform 0.2s ease",
            }}
          />
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div
          className="glass-card animate-slide-up"
          style={{
            padding: "24px",
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px" }}>
            {/* Locations */}
            <div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#8a8a9a", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <MapPin size={12} style={{ display: "inline", marginRight: "4px" }} />
                Location
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    className={`filter-chip ${selectedLocations.includes(loc) ? "active" : ""}`}
                    onClick={() => toggleFilter(selectedLocations, loc, setSelectedLocations)}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            {/* Work Mode */}
            <div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#8a8a9a", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <Building2 size={12} style={{ display: "inline", marginRight: "4px" }} />
                Work Mode
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {WORK_MODES.map((mode) => (
                  <button
                    key={mode}
                    className={`filter-chip ${selectedModes.includes(mode) ? "active" : ""}`}
                    onClick={() => toggleFilter(selectedModes, mode, setSelectedModes)}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Source */}
            <div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#8a8a9a", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <Search size={12} style={{ display: "inline", marginRight: "4px" }} />
                Source
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {SOURCES.map((src) => (
                  <button
                    key={src.value}
                    className={`filter-chip ${selectedSources.includes(src.value) ? "active" : ""}`}
                    onClick={() => toggleFilter(selectedSources, src.value, setSelectedSources)}
                  >
                    {src.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Min Score Slider */}
          <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--color-border-default)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#8a8a9a", textTransform: "uppercase" }}>
                Min Score: {minScore}
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={minScore}
                onChange={(e) => setMinScore(parseInt(e.target.value))}
                style={{
                  flex: 1,
                  maxWidth: "300px",
                  accentColor: "#6366f1",
                }}
              />
              {(selectedLocations.length > 0 || selectedModes.length > 0 || selectedSources.length > 0 || minScore > 0) && (
                <button
                  className="btn-ghost"
                  style={{ fontSize: "12px", padding: "6px 12px" }}
                  onClick={() => {
                    setSelectedLocations([]);
                    setSelectedModes([]);
                    setSelectedSources([]);
                    setMinScore(0);
                  }}
                >
                  <X size={12} />
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Results header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <span style={{ fontSize: "13px", color: "#5a5a6e" }}>
          {filteredJobs.length} jobs found
        </span>
        <button
          className="btn-ghost"
          style={{ fontSize: "12px", padding: "6px 14px" }}
          onClick={fetchJobs}
        >
          <RefreshCw size={12} />
          Refresh
        </button>
      </div>

      {/* Job List */}
      {loading ? (
        <div className="empty-state">
          <Loader2 size={32} className="animate-spin" style={{ color: "#6366f1", marginBottom: "16px" }} />
          <p style={{ color: "#5a5a6e" }}>Loading jobs...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="empty-state">
          <Search size={48} style={{ color: "#2a2a3a", marginBottom: "16px" }} />
          <h3>No jobs yet</h3>
          <p>
            Click &quot;Search Jobs&quot; to scan multiple sources and discover opportunities.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredJobs.map((job) => (
            <div key={job.id} className="job-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#f0f0f5" }}>
                      {job.title}
                    </h3>
                    {job.isScam && (
                      <span className="badge badge-rose">
                        <AlertTriangle size={10} style={{ marginRight: "3px" }} />
                        SCAM
                      </span>
                    )}
                    {job.visaSponsor && (
                      <span className="badge badge-emerald">VISA</span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "13px", color: "#8a8a9a" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Building2 size={13} />
                      {job.company}
                    </span>
                    {job.location && (
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <MapPin size={13} />
                        {job.location}
                      </span>
                    )}
                    {job.workMode && (
                      <span className="badge badge-violet" style={{ fontSize: "10px" }}>
                        {job.workMode.replace("_", " ")}
                      </span>
                    )}
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={12} />
                      {formatRelativeTime(job.createdAt)}
                    </span>
                  </div>
                  {(job.salaryMin || job.salaryMax) && (
                    <div style={{ marginTop: "8px", fontSize: "13px", color: "#34d399", fontWeight: 600 }}>
                      <DollarSign size={13} style={{ display: "inline" }} />
                      {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                    </div>
                  )}
                </div>

                {/* Score + Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {job.score ? (
                    <div
                      className={scoreBgColor(job.score.totalScore)}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "10px",
                        border: "1px solid",
                        textAlign: "center",
                      }}
                    >
                      <div
                        className={scoreColor(job.score.totalScore)}
                        style={{
                          fontSize: "20px",
                          fontWeight: 800,
                          fontFamily: "var(--font-mono)",
                          lineHeight: 1,
                        }}
                      >
                        {job.score.totalScore}
                      </div>
                      <div style={{ fontSize: "9px", color: "#5a5a6e", marginTop: "2px" }}>
                        SCORE
                      </div>
                    </div>
                  ) : (
                    <button
                      className="btn-ghost"
                      style={{ fontSize: "12px", padding: "8px 14px" }}
                      onClick={() => handleScore(job.id)}
                      disabled={scoringJobId === job.id}
                    >
                      {scoringJobId === job.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Star size={14} />
                      )}
                      {scoringJobId === job.id ? "Scoring..." : "Score"}
                    </button>
                  )}

                  {job.status === "applied" ? (
                    <div className="badge badge-emerald" style={{ padding: "8px 12px" }}>
                      Applied
                    </div>
                  ) : (
                    <button
                      className="btn-primary"
                      style={{ fontSize: "12px", padding: "8px 14px" }}
                      onClick={() => handleApply(job.id)}
                      disabled={
                        applying === job.id ||
                        !job.url ||
                        (!job.url.startsWith("http://") && !job.url.startsWith("https://"))
                      }
                    >
                      {applying === job.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Zap size={14} />
                      )}
                      Apply
                    </button>
                  )}

                  <a
                    href={job.url}
                    target="_blank"
                    className="btn-ghost"
                    style={{ padding: "8px 12px" }}
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>

              {/* Source badge */}
              <div style={{ marginTop: "10px", display: "flex", gap: "6px" }}>
                <span className="badge badge-indigo" style={{ fontSize: "9px" }}>
                  {job.source.replace("_", " ")}
                </span>
                <span className="badge badge-cyan" style={{ fontSize: "9px" }}>
                  {job.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
