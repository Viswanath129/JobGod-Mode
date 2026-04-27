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

/**
 * Search Google Jobs via SerpAPI-style scraping
 * Falls back to Google search scraping if no API key
 */
export async function searchGoogleJobs(params: SearchParams): Promise<Partial<Job>[]> {
  const { query, location, datePosted } = params;

  // Build Google Jobs search URL
  let searchQuery = `${query} jobs`;
  if (location) searchQuery += ` in ${location}`;

  const url = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&ibp=htl;jobs`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!response.ok) {
      console.warn(`Google Jobs search failed: ${response.status}`);
      return [];
    }

    const html = await response.text();
    return parseGoogleJobsHTML(html);
  } catch (error) {
    console.error("Google Jobs search error:", error);
    return [];
  }
}

function parseGoogleJobsHTML(html: string): Partial<Job>[] {
  const $ = cheerio.load(html);
  const jobs: Partial<Job>[] = [];

  // Google Jobs embeds job data in script tags as JSON-LD or in specific div structures
  $("script[type='application/ld+json']").each((_, el) => {
    try {
      const data = JSON.parse($(el).html() || "{}");
      if (data["@type"] === "JobPosting") {
        jobs.push({
          id: uuidv4(),
          source: "google_jobs" as JobSource,
          title: data.title || "",
          company: data.hiringOrganization?.name || "",
          location: data.jobLocation?.address?.addressLocality || "",
          description: data.description || "",
          url: data.url || "",
          postedAt: data.datePosted,
          salaryMin: data.baseSalary?.value?.minValue,
          salaryMax: data.baseSalary?.value?.maxValue,
          salaryCurrency: data.baseSalary?.currency,
          status: "discovered",
          isScam: false,
          isRepost: false,
        });
      }
    } catch {
      // Skip malformed JSON
    }
  });

  return jobs;
}

/**
 * Generic career page scraper — works with any company website
 */
export async function scrapeCareerPage(
  url: string,
  companyName: string
): Promise<Partial<Job>[]> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) return [];

    const html = await response.text();
    const $ = cheerio.load(html);
    const jobs: Partial<Job>[] = [];

    // Look for common job listing patterns
    const selectors = [
      'a[href*="job"], a[href*="career"], a[href*="position"]',
      ".job-listing a, .career-listing a, .opening a",
      '[class*="job"] a, [class*="career"] a, [class*="position"] a',
    ];

    for (const selector of selectors) {
      $(selector).each((_, el) => {
        const link = $(el);
        const title = link.text().trim();
        const href = link.attr("href");

        if (title && href && title.length > 5 && title.length < 200) {
          const fullUrl = href.startsWith("http")
            ? href
            : new URL(href, url).toString();

          jobs.push({
            id: uuidv4(),
            source: "company_page" as JobSource,
            title,
            company: companyName,
            url: fullUrl,
            status: "discovered",
            isScam: false,
            isRepost: false,
          });
        }
      });
    }

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
    const googleJobs = await searchGoogleJobs({ query, location });
    allJobs.push(...googleJobs);
  }

  // Search without location for remote jobs
  const remoteJobs = await searchGoogleJobs({
    query: `${query} remote`,
  });
  allJobs.push(...remoteJobs);

  // Deduplicate by URL
  const seen = new Set<string>();
  return allJobs.filter((job) => {
    if (!job.url || seen.has(job.url)) return false;
    seen.add(job.url);
    return true;
  });
}
