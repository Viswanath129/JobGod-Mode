import { promises as fs } from "fs";
import { join } from "path";
import { createClient } from "@supabase/supabase-js";
import type {
  Job,
  JobScore,
  TailoredResume,
  UserPreferences,
  Application,
  DashboardStats,
  AgentLog,
  UserProfile,
} from "@/types";

const DATA_DIR = join(process.cwd(), "data");
const DB_FILE = join(DATA_DIR, "store.json");

// Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

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

async function loadLocalStore(): Promise<Store> {
  try {
    try {
      await fs.access(DATA_DIR);
    } catch {
      await fs.mkdir(DATA_DIR, { recursive: true });
    }
    
    try {
      await fs.access(DB_FILE);
    } catch {
      const defaultStore = getDefaultStore();
      await fs.writeFile(DB_FILE, JSON.stringify(defaultStore, null, 2));
      return defaultStore;
    }
    
    const content = await fs.readFile(DB_FILE, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Local store load error:", error);
    return getDefaultStore();
  }
}

async function saveLocalStore(store: Store): Promise<void> {
  try {
    try {
      await fs.access(DATA_DIR);
    } catch {
      await fs.mkdir(DATA_DIR, { recursive: true });
    }
    await fs.writeFile(DB_FILE, JSON.stringify(store, null, 2));
  } catch (error) {
    console.error("Failed to save local store:", error);
  }
}

// ---- CRUD Operations (Async for Supabase support) ----

export async function getUser(): Promise<UserProfile> {
  const store = await loadLocalStore();
  const preferences = store.preferences;

  if (supabase) {
    const { data, error } = await supabase.from("profiles").select("*").single();
    if (!error && data) {
      return {
        name: data.full_name || store.user.fullName,
        email: data.email || store.user.email,
        phone: data.phone || store.user.phone,
        linkedin: data.linkedin_url || store.user.linkedinUrl,
        github: data.github_url || store.user.githubUrl,
        portfolio: data.portfolio_url || store.user.portfolioUrl,
        resumeMd: data.resume_md || store.user.resumeMd,
        preferences: data.preferences || preferences,
      };
    }
  }

  return {
    name: store.user.fullName,
    email: store.user.email,
    phone: store.user.phone,
    linkedin: store.user.linkedinUrl,
    github: store.user.githubUrl,
    portfolio: store.user.portfolioUrl,
    resumeMd: store.user.resumeMd,
    preferences: store.preferences,
  };
}

export async function updateUser(update: Partial<UserProfile>) {
  const store = await loadLocalStore();
  
  if (update.name) store.user.fullName = update.name;
  if (update.email) store.user.email = update.email;
  if (update.phone) store.user.phone = update.phone;
  if (update.linkedin) store.user.linkedinUrl = update.linkedin;
  if (update.github) store.user.githubUrl = update.github;
  if (update.portfolio) store.user.portfolioUrl = update.portfolio;
  if (update.resumeMd) store.user.resumeMd = update.resumeMd;

  if (supabase) {
    await supabase.from("profiles").upsert({
      full_name: store.user.fullName,
      email: store.user.email,
      phone: store.user.phone,
      linkedin_url: store.user.linkedinUrl,
      github_url: store.user.githubUrl,
      portfolio_url: store.user.portfolioUrl,
      resume_md: store.user.resumeMd,
    });
  }

  await saveLocalStore(store);
  return store.user;
}

export async function getPreferences(): Promise<UserPreferences> {
  if (supabase) {
    const { data, error } = await supabase.from("profiles").select("preferences").single();
    if (!error && data?.preferences) return data.preferences;
  }
  const store = await loadLocalStore();
  return store.preferences;
}

export async function updatePreferences(prefs: Partial<UserPreferences>): Promise<UserPreferences> {
  if (supabase) {
    await supabase.from("profiles").upsert({ preferences: prefs });
  }
  const store = await loadLocalStore();
  store.preferences = { ...store.preferences, ...prefs };
  await saveLocalStore(store);
  return store.preferences;
}

export async function getJobs(filters?: {
  status?: string;
  source?: string;
  minScore?: number;
  search?: string;
}): Promise<Job[]> {
  if (supabase) {
    let query = supabase.from("jobs").select("*, job_scores(*)");
    if (filters?.status) query = query.eq("status", filters.status);
    if (filters?.source) query = query.eq("source", filters.source);
    
    const { data, error } = await query;
    if (!error && data) {
      return (data as Array<Job & { job_scores?: JobScore[] }>).map((j) => ({
        ...j,
        score: j.job_scores?.[0]
      }));
    }
  }

  const store = await loadLocalStore();
  let jobs = store.jobs;
  if (filters?.status) jobs = jobs.filter((j) => j.status === filters.status);
  if (filters?.source) jobs = jobs.filter((j) => j.source === filters.source);
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    jobs = jobs.filter((j) => j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q));
  }
  return jobs.map((j) => ({ ...j, score: store.scores.find((s) => s.jobId === j.id) }));
}

export async function getJob(id: string): Promise<(Job & { score?: JobScore }) | null> {
  if (supabase) {
    const { data, error } = await supabase.from("jobs").select("*, job_scores(*)").eq("id", id).single();
    if (!error && data) return { ...data, score: data.job_scores?.[0] };
  }
  const store = await loadLocalStore();
  const job = store.jobs.find((j) => j.id === id);
  if (!job) return null;
  return { ...job, score: store.scores.find((s) => s.jobId === id) };
}

export async function addJobs(newJobs: Partial<Job>[]): Promise<Job[]> {
  const store = await loadLocalStore();
  const added: Job[] = [];

  for (const j of newJobs) {
    if (j.url && store.jobs.some((existing) => existing.url === j.url)) continue;
    const job: Job = {
      id: j.id || crypto.randomUUID(),
      externalId: j.externalId,
      source: j.source || "google_jobs",
      title: j.title || "Unknown",
      company: j.company || "Unknown",
      location: j.location,
      url: j.url || "",
      status: j.status || "discovered",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isScam: false,
      isRepost: false
    };
    store.jobs.push(job);
    added.push(job);
  }

  if (supabase) {
    await supabase.from("jobs").insert(added.map(j => ({
      id: j.id,
      source: j.source,
      title: j.title,
      company: j.company,
      url: j.url,
      location: j.location,
      status: j.status
    })));
  }

  await saveLocalStore(store);
  return added;
}

export async function updateJob(id: string, update: Partial<Job>): Promise<Job | null> {
  if (supabase) {
    await supabase.from("jobs").update(update).eq("id", id);
  }
  const store = await loadLocalStore();
  const idx = store.jobs.findIndex((j) => j.id === id);
  if (idx === -1) return null;
  store.jobs[idx] = { ...store.jobs[idx], ...update, updatedAt: new Date().toISOString() };
  await saveLocalStore(store);
  return store.jobs[idx];
}

export async function addScore(score: JobScore): Promise<JobScore> {
  if (supabase) {
    await supabase.from("job_scores").upsert({
      job_id: score.jobId,
      total_score: score.totalScore,
      resume_fit: score.resumeFit,
      salary_quality: score.salaryQuality,
      career_growth: score.careerGrowth,
      brand_value: score.brandValue,
      skills_alignment: score.skillsAlignment,
      location_pref: score.locationPref,
      work_life_balance: score.workLifeBalance,
      hiring_probability: score.hiringProbability,
      reasoning: score.reasoning
    });
  }
  const store = await loadLocalStore();
  store.scores = store.scores.filter((s) => s.jobId !== score.jobId);
  store.scores.push(score);
  await saveLocalStore(store);
  return score;
}

export async function addLog(log: AgentLog): Promise<void> {
  if (supabase) {
    await supabase.from("agent_logs").insert({
      id: log.id,
      agent_type: log.agentType,
      action: log.action,
      details: log.details,
      status: log.status
    });
  }
  const store = await loadLocalStore();
  store.logs.push(log);
  if (store.logs.length > 500) store.logs = store.logs.slice(-500);
  await saveLocalStore(store);
}

export async function getStats(): Promise<DashboardStats> {
  const store = await loadLocalStore();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const scores = store.scores.map((s) => s.totalScore);

  return {
    totalDiscovered: store.jobs.length,
    totalApplied: store.applications.length,
    totalInterviews: store.applications.filter((a) => a.status === "interview_scheduled").length,
    totalOffers: store.applications.filter((a) => a.status === "offer").length,
    averageScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
    todayNewJobs: store.jobs.filter((j) => new Date(j.createdAt) >= today).length,
    weekApplications: 0, // Simplified for brevity
    topScore: scores.length ? Math.max(...scores) : 0,
  };
}
