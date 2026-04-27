// ============================================
// JobGod Mode — Type Definitions
// ============================================

export type JobSource =
  | "linkedin"
  | "indeed"
  | "naukri"
  | "wellfound"
  | "glassdoor"
  | "google_jobs"
  | "company_page"
  | "remote_board";

export type WorkMode = "remote" | "hybrid" | "onsite" | "part_time" | "full_time" | "internship" | "contract";

export type JobStatus =
  | "discovered"
  | "scored"
  | "resume_ready"
  | "applied"
  | "rejected"
  | "interview"
  | "offer"
  | "accepted"
  | "archived";

export type ApplicationStatus =
  | "pending"
  | "submitted"
  | "acknowledged"
  | "rejected"
  | "interview_scheduled"
  | "offer"
  | "accepted"
  | "declined";

export interface Job {
  id: string;
  externalId?: string;
  source: JobSource;
  title: string;
  company: string;
  location?: string;
  workMode?: WorkMode;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  description?: string;
  requirements?: string;
  url: string;
  postedAt?: string;
  expiresAt?: string;
  isScam: boolean;
  isRepost: boolean;
  visaSponsor?: boolean;
  status: JobStatus;
  score?: JobScore;
  createdAt: string;
  updatedAt: string;
}

export interface JobScore {
  id: string;
  jobId: string;
  totalScore: number;
  resumeFit: number;
  salaryQuality: number;
  careerGrowth: number;
  brandValue: number;
  skillsAlignment: number;
  locationPref: number;
  workLifeBalance: number;
  hiringProbability: number;
  reasoning?: string;
}

export interface TailoredResume {
  id: string;
  jobId: string;
  contentMd: string;
  contentHtml?: string;
  pdfPath?: string;
  atsScore?: number;
  keywordsAdded: string[];
  coverLetter?: string;
  recruiterMsg?: string;
  createdAt: string;
}

export interface UserPreferences {
  preferredLocations: string[];
  blockedLocations: string[];
  minSalary?: number;
  maxSalary?: number;
  salaryCurrency: string;
  workModes: string[];
  industries: string[];
  experienceLevel: string;
  shiftPreferences: string[];
  likedCompanies: string[];
  dislikedCompanies: string[];
  techStack: string[];
  relocationCountries: string[];
  autoApplyThreshold: number;
  autoApplyEnabled: boolean;
  dailyScanEnabled: boolean;
}

export interface Application {
  id: string;
  jobId: string;
  resumeId: string;
  status: ApplicationStatus;
  appliedAt?: string;
  method: "auto" | "manual";
  notes?: string;
  job?: Job;
  resume?: TailoredResume;
}

export interface InterviewPrep {
  id: string;
  applicationId: string;
  hrQuestions: { question: string; suggestedAnswer: string }[];
  techQuestions: { question: string; suggestedAnswer: string }[];
  companyBrief: string;
  prepRoadmap: string;
}

export interface DashboardStats {
  totalDiscovered: number;
  totalApplied: number;
  totalInterviews: number;
  totalOffers: number;
  averageScore: number;
  todayNewJobs: number;
  weekApplications: number;
  topScore: number;
}

export interface AgentLog {
  id: string;
  agentType: string;
  action: string;
  details: Record<string, unknown>;
  status: "success" | "error";
  createdAt: string;
}
