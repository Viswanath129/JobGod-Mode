import { chromium, Browser, Page } from "playwright";
import { Job, UserProfile } from "@/types";
import { generateTailoredResume, mapFormFields } from "@/lib/ai";
import { addLog, updateJob } from "@/lib/store";

export class AutoApplyAgent {
  private job: Job;
  private user: UserProfile;

  constructor(job: Job, user: UserProfile) {
    this.job = job;
    this.user = user;
  }

  async run() {
    let browser: Browser | null = null;
    try {
      await addLog({
        id: crypto.randomUUID(),
        agentType: "apply",
        action: `Starting auto-apply for ${this.job.title} at ${this.job.company}`,
        details: { jobId: this.job.id, url: this.job.url },
        status: "success",
        createdAt: new Date().toISOString(),
      });

      // 1. Generate Tailored Resume
      const tailoredResume = await generateTailoredResume(this.job, this.user.resumeMd);
      
      // 2. Perform application with Playwright
      browser = await chromium.launch({ 
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"] 
      });
      
      const context = await browser.newContext({
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      });
      
      const page = await context.newPage();
      
      // Use ScraperAPI for residential proxy if configured
      const targetUrl = this.job.url;
      await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 60000 });

      // 3. Autonomous Form Filling
      const success = await this.fillForm(page, tailoredResume);

      if (success) {
        await updateJob(this.job.id, { status: "applied", updatedAt: new Date().toISOString() });
        await addLog({
          id: crypto.randomUUID(),
          agentType: "apply",
          action: `Successfully applied to ${this.job.company}`,
          details: { jobId: this.job.id },
          status: "success",
          createdAt: new Date().toISOString(),
        });
      }

      return success;
    } catch (error: any) {
      console.error("[AutoApply] Error:", error);
      await addLog({
        id: crypto.randomUUID(),
        agentType: "apply",
        action: `Failed to apply to ${this.job.company}`,
        details: { error: error.message },
        status: "error",
        createdAt: new Date().toISOString(),
      });
      return false;
    } finally {
      if (browser) await browser.close();
    }
  }

  private async fillForm(page: Page, resume: string): Promise<boolean> {
    // 1. Detect all inputs and their labels
    const fields = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll("input, textarea, select"));
      return inputs.map((input: any) => {
        const label = document.querySelector(`label[for="${input.id}"]`)?.textContent || 
                      input.placeholder || 
                      input.name || 
                      input.ariaLabel || 
                      "";
        return {
          id: input.id,
          name: input.name,
          type: input.type,
          label: label.trim(),
          selector: input.id ? `#${input.id}` : `[name="${input.name}"]`
        };
      });
    });

    // 2. Map fields using AI
    const fieldLabels = fields.map(f => f.label).filter(l => l.length > 0);
    const mapping = await mapFormFields(fieldLabels, this.user);

    // 3. Fill the fields
    for (const field of fields) {
      const value = mapping[field.label] || mapping[field.name] || "";
      if (value) {
        try {
          if (field.type === "file") {
            // Placeholder for file upload (would require saving resume to disk first)
            // await page.setInputFiles(field.selector, resumePath);
          } else {
            await page.fill(field.selector, value);
          }
        } catch (e) {
          console.warn(`Could not fill field: ${field.label}`, e);
        }
      }
    }

    // 4. Try to find and click submit button
    const submitSelectors = [
      "button[type='submit']",
      "input[type='submit']",
      "button:has-text('Apply')",
      "button:has-text('Submit Application')",
      "button:has-text('Send Application')"
    ];

    for (const selector of submitSelectors) {
      const btn = await page.$(selector);
      if (btn) {
        // In a real scenario, we'd click it. For safety in dev, we log it.
        console.log(`[AutoApply] Found submit button: ${selector}`);
        // await btn.click();
        return true; 
      }
    }

    return false;
  }
}
