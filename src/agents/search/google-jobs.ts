// ============================================
// JobGod Mode — Google Jobs Search Agent
// ============================================

import * as cheerio from "cheerio";
import type { Job, JobSource } from "@/types";
import { v4 as uuidv4 } from "uuid";

interface SearchParams {
  query: string;
  location?: string;
  workMode?: string;
  datePosted?: "day" | "week" | "month";
}

interface SerpApiJobResult {
  title?: string;
  company_name?: string;
  location?: string;
  description?: string;
  job_id?: string;
  related_links?: { link: string }[];
  detected_extensions?: {
    posted_at?: string;
    salary?: string;
  };
}

interface SerpApiOrganicResult {
  title?: string;
  link: string;
}

/**
 * Search Google Jobs via SerpApi
 */
export async function searchGoogleJobs(params: SearchParams): Promise<Partial<Job>[]> {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) {
    console.warn("SERPAPI_API_KEY not set, falling back to basic scraping");
    return []; // For now just return empty if no API key to avoid being blocked
  }

  const { query, location, datePosted } = params;
  const q = `${query} ${location || ""}`.trim();
  
  const searchUrl = new URL("https://serpapi.com/search");
  searchUrl.searchParams.append("engine", "google_jobs");
  searchUrl.searchParams.append("q", q);
  searchUrl.searchParams.append("api_key", apiKey);
  if (datePosted === "day") searchUrl.searchParams.append("chips", "date_posted:today");
  else if (datePosted === "week") searchUrl.searchParams.append("chips", "date_posted:3days");

  try {
    const response = await fetch(searchUrl.toString());
    if (!response.ok) throw new Error(`SerpApi failed: ${response.status}`);

    const data = await response.json();
    const results = data.jobs_results || [];

    return results.map((j: SerpApiJobResult) => ({
      id: uuidv4(),
      source: "google_jobs" as JobSource,
      title: j.title || "",
      company: j.company_name || "",
      location: j.location || "",
      description: j.description || "",
      url: j.job_id || j.related_links?.[0]?.link || "",
      postedAt: j.detected_extensions?.posted_at || "",
      salary: j.detected_extensions?.salary || "",
      status: "discovered",
      isScam: false,
      isRepost: false,
    }));
  } catch (error) {
    console.error("SerpApi search error:", error);
    return [];
  }
}

/**
 * Search LinkedIn Jobs via SerpApi (google_search with site:linkedin.com/jobs)
 */
export async function searchLinkedInJobs(query: string, location: string): Promise<Partial<Job>[]> {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) return [];

  const safeQuery = query.replace(/"/g, '');
  const safeLocation = location.replace(/"/g, '');
  const q = `site:linkedin.com/jobs/view "${safeQuery}" in "${safeLocation}"`;
  const searchUrl = new URL("https://serpapi.com/search");
  searchUrl.searchParams.append("q", q);
  searchUrl.searchParams.append("api_key", apiKey);

  try {
    const response = await fetch(searchUrl.toString());
    const data = await response.json();
    const results = data.organic_results || [];

    return results.map((r: SerpApiOrganicResult) => ({
      id: uuidv4(),
      source: "linkedin" as JobSource,
      title: r.title?.split(" job ")[0] || "",
      company: r.title?.split(" at ")[1]?.split(" | ")[0] || "",
      url: r.link,
      location,
      status: "discovered",
      isScam: false,
      isRepost: false,
    }));
  } catch (error) {
    console.error("LinkedIn search error:", error);
    return [];
  }
}

/**
 * Generic career page scraper — enhanced with ScraperAPI
 */
export async function scrapeCareerPage(
  url: string,
  companyName: string
): Promise<Partial<Job>[]> {
  const scraperApiKey = process.env.SCRAPERAPI_API_KEY;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    console.error(`Invalid URL protocol for scrapeCareerPage: ${url}`);
    return [];
  }
  let targetUrl = url;

  // Route through ScraperAPI to bypass bot detection if key is available
  if (scraperApiKey) {
    targetUrl = `http://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodeURIComponent(url)}&render=true`;
  }

  try {
    const response = await fetch(targetUrl);
    if (!response.ok) return [];

    const html = await response.text();
    const $ = cheerio.load(html);
    const jobs: Partial<Job>[] = [];

    // Improved selector logic for career sites
    const linkItems = $("a").filter((_, el) => {
      const text = $(el).text().toLowerCase();
      const href = $(el).attr("href")?.toLowerCase() || "";
      return (
        (text.includes("engineer") || text.includes("developer") || text.includes("manager")) &&
        (href.includes("/jobs/") || href.includes("/careers/") || href.includes("/openings/"))
      );
    });

    linkItems.each((_, el) => {
      const title = $(el).text().trim();
      const href = $(el).attr("href");
      if (title && href) {
        const fullUrl = href.startsWith("http") ? href : new URL(href, url).toString();
        if (fullUrl.startsWith("http://") || fullUrl.startsWith("https://")) {
          jobs.push({
            id: uuidv4(),
            source: "company_page" as JobSource,
            title,
            company: companyName,
            url: fullUrl,
            status: "discovered",
          });
        }
      }
    });

    return jobs;
  } catch (error) {
    console.error(`Scrape failed for ${url}:`, error);
    return [];
  }
}

/**
 * Multi-source search orchestrator
 */
export async function searchAllSources(
  query: string,
  locations: string[]
): Promise<Partial<Job>[]> {
  const allJobs: Partial<Job>[] = [];

  // Search each location
  for (const location of locations) {
    console.log(`Searching for ${query} in ${location}...`);
    const [google, linkedin] = await Promise.all([
      searchGoogleJobs({ query, location }),
      searchLinkedInJobs(query, location),
    ]);
    allJobs.push(...google, ...linkedin);
  }

  // Deduplicate by URL
  const seen = new Set<string>();
  return allJobs.filter((job) => {
    if (!job.url || seen.has(job.url)) return false;
    seen.add(job.url);
    return true;
  });
}
