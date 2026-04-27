// ============================================
// JobGod Mode — In-Memory Data Store (MVP)
// ============================================
// Replaces PostgreSQL for local development.
// Data persists in a JSON file on disk.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import type {
  Job,
  JobScore,
  TailoredResume,
  UserPreferences,
  Application,
  DashboardStats,
  AgentLog,
} from "@/types";

const DATA_DIR = join(process.cwd(), "data");
const DB_FILE = join(DATA_DIR, "store.json");

interface Store {
  user: {
    id: string;
    email: string;
    fullName: string;
    phone: string;
    linkedinUrl: string;
    githubUrl: string;
    portfolioUrl: string;
    resumeMd: string;
  };
  preferences: UserPreferences;
  jobs: Job[];
  scores: JobScore[];
  resumes: TailoredResume[];
  applications: Application[];
  logs: AgentLog[];
}

function getDefaultStore(): Store {
  return {
    user: {
      id: "user-1",
      email: "kasiviswanathvegisetti43@gmail.com",
      fullName: "Kasi Viswanath Vegisetti",
      phone: "+91 9391592209",
      linkedinUrl: "https://linkedin.com/in/kasi-viswanath-vegisetti",
      githubUrl: "https://github.com/Viswanath129",
      portfolioUrl: "https://studio-3388969323-8ef91.web.app",
      resumeMd: "",
    },
    preferences: {
      preferredLocations: ["Hyderabad", "Bangalore", "Chennai", "Remote", "India"],
      blockedLocations: [],
      minSalary: 400000,
      maxSalary: 1500000,
      salaryCurrency: "INR",
      workModes: ["remote", "hybrid", "full_time", "internship"],
      industries: ["AI", "Software", "Embedded", "Robotics", "Research"],
      experienceLevel: "fresher",
      shiftPreferences: ["day", "flexible"],
      likedCompanies: ["Google", "Microsoft", "ISRO", "DRDO", "OpenAI", "NVIDIA"],
      dislikedCompanies: [],
      techStack: ["Python", "PyTorch", "TensorFlow", "OpenCV", "YOLOv8", "C++", "ROS", "Raspberry Pi"],
      relocationCountries: ["India", "UAE", "US", "Europe"],
      autoApplyThreshold: 75,
      autoApplyEnabled: false,
      dailyScanEnabled: true,
    },
    jobs: [],
    scores: [],
    resumes: [],
    applications: [],
    logs: [],
  };
}

function loadStore(): Store {
  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    if (!existsSync(DB_FILE)) {
      const defaultStore = getDefaultStore();
      writeFileSync(DB_FILE, JSON.stringify(defaultStore, null, 2));
      return defaultStore;
    }
    return JSON.parse(readFileSync(DB_FILE, "utf-8"));
  } catch {
    return getDefaultStore();
  }
}

function saveStore(store: Store): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DB_FILE, JSON.stringify(store, null, 2));
}

// ---- CRUD Operations ----

export function getUser() {
  return loadStore().user;
}

export function updateUser(update: Partial<Store["user"]>) {
  const store = loadStore();
  store.user = { ...store.user, ...update };
  saveStore(store);
  return store.user;
}

export function getPreferences(): UserPreferences {
  return loadStore().preferences;
}

export function updatePreferences(prefs: Partial<UserPreferences>): UserPreferences {
  const store = loadStore();
  store.preferences = { ...store.preferences, ...prefs };
  saveStore(store);
  return store.preferences;
}

export function getJobs(filters?: {
  status?: string;
  source?: string;
  minScore?: number;
  search?: string;
}): Job[] {
  const store = loadStore();
  let jobs = store.jobs;

  if (filters?.status) {
    jobs = jobs.filter((j) => j.status === filters.status);
  }
  if (filters?.source) {
    jobs = jobs.filter((j) => j.source === filters.source);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    jobs = jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q)
    );
  }
  if (filters?.minScore) {
    const scores = store.scores;
    jobs = jobs.filter((j) => {
      const score = scores.find((s) => s.jobId === j.id);
      return score && score.totalScore >= (filters.minScore || 0);
    });
  }

  // Attach scores
  return jobs.map((j) => ({
    ...j,
    score: store.scores.find((s) => s.jobId === j.id),
  }));
}

export function getJob(id: string): (Job & { score?: JobScore }) | null {
  const store = loadStore();
  const job = store.jobs.find((j) => j.id === id);
  if (!job) return null;
  return {
    ...job,
    score: store.scores.find((s) => s.jobId === id),
  };
}

export function addJobs(newJobs: Partial<Job>[]): Job[] {
  const store = loadStore();
  const added: Job[] = [];

  for (const j of newJobs) {
    // Deduplicate by URL
    if (j.url && store.jobs.some((existing) => existing.url === j.url)) {
      continue;
    }
    const job: Job = {
      id: j.id || crypto.randomUUID(),
      externalId: j.externalId,
      source: j.source || "google_jobs",
      title: j.title || "Unknown",
      company: j.company || "Unknown",
      location: j.location,
      workMode: j.workMode,
      salaryMin: j.salaryMin,
      salaryMax: j.salaryMax,
      salaryCurrency: j.salaryCurrency,
      description: j.description,
      requirements: j.requirements,
      url: j.url || "",
      postedAt: j.postedAt,
      expiresAt: j.expiresAt,
      isScam: j.isScam || false,
      isRepost: j.isRepost || false,
      visaSponsor: j.visaSponsor,
      status: j.status || "discovered",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.jobs.push(job);
    added.push(job);
  }

  saveStore(store);
  return added;
}

export function updateJob(id: string, update: Partial<Job>): Job | null {
  const store = loadStore();
  const idx = store.jobs.findIndex((j) => j.id === id);
  if (idx === -1) return null;
  store.jobs[idx] = { ...store.jobs[idx], ...update, updatedAt: new Date().toISOString() };
  saveStore(store);
  return store.jobs[idx];
}

export function addScore(score: JobScore): JobScore {
  const store = loadStore();
  // Remove existing score for this job
  store.scores = store.scores.filter((s) => s.jobId !== score.jobId);
  store.scores.push(score);
  saveStore(store);
  return score;
}

export function addResume(resume: TailoredResume): TailoredResume {
  const store = loadStore();
  store.resumes.push(resume);
  saveStore(store);
  return resume;
}

export function getResumes(): TailoredResume[] {
  return loadStore().resumes;
}

export function getResume(id: string): TailoredResume | null {
  return loadStore().resumes.find((r) => r.id === id) || null;
}

export function addApplication(app: Application): Application {
  const store = loadStore();
  store.applications.push(app);
  saveStore(store);
  return app;
}

export function getApplications(): Application[] {
  const store = loadStore();
  return store.applications.map((a) => ({
    ...a,
    job: store.jobs.find((j) => j.id === a.jobId),
    resume: store.resumes.find((r) => r.id === a.resumeId),
  }));
}

export function addLog(log: AgentLog): void {
  const store = loadStore();
  store.logs.push(log);
  // Keep only last 500 logs
  if (store.logs.length > 500) store.logs = store.logs.slice(-500);
  saveStore(store);
}

export function getStats(): DashboardStats {
  const store = loadStore();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const scores = store.scores.map((s) => s.totalScore);

  return {
    totalDiscovered: store.jobs.length,
    totalApplied: store.applications.length,
    totalInterviews: store.applications.filter((a) => a.status === "interview_scheduled").length,
    totalOffers: store.applications.filter((a) => a.status === "offer").length,
    averageScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
    todayNewJobs: store.jobs.filter((j) => new Date(j.createdAt) >= today).length,
    weekApplications: store.applications.filter(
      (a) => a.appliedAt && new Date(a.appliedAt) >= weekAgo
    ).length,
    topScore: scores.length ? Math.max(...scores) : 0,
  };
}
