-- JobGod Mode — Supabase Database Schema
-- Run this in the Supabase SQL Editor

-- 1. Profiles (User Data)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  full_name TEXT,
  email TEXT,
  resume_md TEXT,
  preferences JSONB DEFAULT '{
    "preferredLocations": ["India", "Remote"],
    "blockedLocations": [],
    "salaryCurrency": "USD",
    "workModes": ["remote", "hybrid"],
    "industries": ["AI", "Tech"],
    "experienceLevel": "senior",
    "techStack": [],
    "autoApplyThreshold": 85,
    "autoApplyEnabled": false,
    "dailyScanEnabled": true
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Jobs
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT UNIQUE,
  source TEXT NOT NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  work_mode TEXT,
  salary_min NUMERIC,
  salary_max NUMERIC,
  salary_currency TEXT,
  description TEXT,
  requirements TEXT,
  url TEXT UNIQUE NOT NULL,
  posted_at TEXT,
  expires_at TEXT,
  is_scam BOOLEAN DEFAULT FALSE,
  is_repost BOOLEAN DEFAULT FALSE,
  visa_sponsor BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'discovered',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Job Scores
CREATE TABLE IF NOT EXISTS public.job_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  total_score INTEGER NOT NULL,
  resume_fit INTEGER,
  salary_quality INTEGER,
  career_growth INTEGER,
  brand_value INTEGER,
  skills_alignment INTEGER,
  location_pref INTEGER,
  work_life_balance INTEGER,
  hiring_probability INTEGER,
  reasoning TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tailored Resumes
CREATE TABLE IF NOT EXISTS public.tailored_resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  content_md TEXT NOT NULL,
  content_html TEXT,
  pdf_path TEXT,
  ats_score INTEGER,
  keywords_added TEXT[],
  cover_letter TEXT,
  recruiter_msg TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Applications
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES public.tailored_resumes(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending',
  applied_at TIMESTAMPTZ,
  method TEXT DEFAULT 'manual',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Agent Logs
CREATE TABLE IF NOT EXISTS public.agent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type TEXT NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS — Enable Security (Basic for now)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tailored_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;

-- Simple Policies (Allow all for development)
-- In production, these should be restricted to auth.uid()
CREATE POLICY "Allow all for profiles" ON public.profiles FOR ALL USING (TRUE);
CREATE POLICY "Allow all for jobs" ON public.jobs FOR ALL USING (TRUE);
CREATE POLICY "Allow all for job_scores" ON public.job_scores FOR ALL USING (TRUE);
CREATE POLICY "Allow all for tailored_resumes" ON public.tailored_resumes FOR ALL USING (TRUE);
CREATE POLICY "Allow all for applications" ON public.applications FOR ALL USING (TRUE);
CREATE POLICY "Allow all for agent_logs" ON public.agent_logs FOR ALL USING (TRUE);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_url ON public.jobs(url);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_scores_job_id ON public.job_scores(job_id);
CREATE INDEX IF NOT EXISTS idx_resumes_job_id ON public.tailored_resumes(job_id);
