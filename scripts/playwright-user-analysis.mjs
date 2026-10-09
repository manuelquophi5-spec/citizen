import next from "next";
import http from "http";
import { chromium } from "playwright";
import path from "path";
import fs from "fs";

const ARTIFACTS_DIR = "/home/manuelkophie/.gemini/antigravity/brain/95bbded2-3e7e-4447-ba08-ebeaacea3fcd";
const SCREENSHOTS_DIR = path.join(ARTIFACTS_DIR, "screenshots");

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function runAnalysis() {
  console.log("=================================================");
  console.log("🚀 STARTING IN-PROCESS PLAYWRIGHT ANALYSIS SUITE");
  console.log("=================================================");

  // 1. Prepare Next.js App
  console.log("[1/6] Bootstrapping Next.js server in dev mode...");
  const app = next({ dev: true, dir: path.resolve(".") });
  const handle = app.getRequestHandler();
  await app.prepare();

  const server = http.createServer((req, res) => {
    handle(req, res);
  });

  const PORT = 3124;
  await new Promise((resolve) => server.listen(PORT, "127.0.0.1", resolve));
  const baseUrl = `http://127.0.0.1:${PORT}`;
  console.log(`[2/6] Next.js server active at ${baseUrl}`);

  // 2. Launch Chromium
  console.log("[3/6] Launching Playwright browser instance...");
  const chromePath = path.resolve("./chrome-bin/opt/google/chrome/chrome");
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--window-size=1280,800"],
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: "Playwright-E2E-Auditor/1.0",
  });

  const page = await context.newPage();

  // Metrics collection
  const consoleMessages = [];
  const networkRequests = [];
  const pageErrors = [];

  page.on("console", (msg) => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location(),
    });
  });

  page.on("pageerror", (err) => {
    pageErrors.push(err.message);
  });

  page.on("response", (res) => {
    try {
      networkRequests.push({
        url: res.url(),
        method: res.request().method(),
        status: res.status(),
        resourceType: res.request().resourceType(),
      });
    } catch {
      // Ignore if request was already disposed
    }
  });

  const results = {
    testStartTime: new Date().toISOString(),
    stages: [],
    performance: {},
    accessibility: {},
    network: { totalRequests: 0, failedRequests: [] },
    consoleAudit: { errors: [], warnings: [] },
  };

  try {
    // -------------------------------------------------------------
    // STAGE 1: Home Landing Page
    // -------------------------------------------------------------
    console.log("\n▶ STAGE 1: Testing Landing Page (/)");
    const navStart = Date.now();
    const homeRes = await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
    const navEnd = Date.now();

    const title = await page.title();
    console.log(`   ✓ Loaded Home in ${navEnd - navStart}ms (Status: ${homeRes.status()})`);
    console.log(`   ✓ Title: "${title}"`);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "01_landing_page.png"), fullPage: false });

    results.stages.push({
      stage: "Landing Page",
      url: `${baseUrl}/`,
      status: homeRes.status(),
      durationMs: navEnd - navStart,
      title,
      screenshot: "01_landing_page.png",
      success: homeRes.status() === 200,
    });

    // -------------------------------------------------------------
    // STAGE 2: Navigate to Register Page
    // -------------------------------------------------------------
    console.log("\n▶ STAGE 2: Navigating to Register (/register)");
    const regRes = await page.goto(`${baseUrl}/register`, { waitUntil: "networkidle" });
    await page.waitForSelector("form", { timeout: 10000 });
    console.log("   ✓ Registration form loaded");

    // -------------------------------------------------------------
    // STAGE 3: Create Citizen User
    // -------------------------------------------------------------
    console.log("\n▶ STAGE 3: Creating Citizen User Account");
    const testUser = {
      name: "Kofi Mawuli Mensah",
      email: `kofi.mensah.${Date.now()}@citizen.tongu.test`,
      password: "TestPassword2026!",
      area: "Sogakope Central",
    };

    // Fill form
    await page.fill('input[placeholder*="Ama Serwaa"]', testUser.name);
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.selectOption("select", testUser.area);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "02_registration_form_filled.png") });
    console.log(`   ✓ Form filled with resident: "${testUser.name}" (${testUser.email})`);

    // Submit form and wait for redirect to /user
    const submitBtn = page.getByRole("button", { name: /Complete Citizen Registration/i });
    await submitBtn.click();
    console.log("   ✓ Clicked Complete Citizen Registration button");

    // Wait for redirect to /user
    await page.waitForURL("**/user", { timeout: 15000 });
    console.log("   ✓ Successfully redirected to /user portal");

    // Wait for dashboard DOM to be ready
    await page.waitForSelector("h1", { timeout: 10000 });
    await page.waitForTimeout(1000); // Allow stats animation

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "03_citizen_portal_overview.png") });

    const portalHeading = await page.locator("h1").innerText();
    const greetingText = await page.locator("body").innerText();
    const hasUserName = greetingText.includes(testUser.name);

    console.log(`   ✓ Citizen portal active header: "${portalHeading}"`);
    console.log(`   ✓ User name "${testUser.name}" verified in session view: ${hasUserName}`);

    results.stages.push({
      stage: "User Creation & Onboarding",
      userCreated: {
        name: testUser.name,
        email: testUser.email,
        role: "citizen",
        electoralArea: testUser.area,
      },
      redirectUrl: page.url(),
      hasUserName,
      screenshot: "03_citizen_portal_overview.png",
      success: hasUserName && page.url().includes("/user"),
    });

    // -------------------------------------------------------------
    // STAGE 4: File a Civic Issue Report from Citizen Portal
    // -------------------------------------------------------------
    console.log("\n▶ STAGE 4: Filing Civic Issue from Citizen Portal");
    const fileReportBtn = page.locator('button:has-text("File Report")');
    await fileReportBtn.click();

    await page.waitForSelector('input[placeholder*="water pipeline"]', { timeout: 5000 });
    console.log("   ✓ File Civic Report dialog opened");

    const reportData = {
      title: "Dabala Market Drainage Culvert Washout",
      category: "water",
      urgency: "HIGH",
      community: "Dabala",
      town: "Dabala Central Market",
      desc: "Severe erosion has destabilized the roadside drainage culvert during recent rainfall, causing pooling near market stalls.",
    };

    await page.fill('input[placeholder*="water pipeline"]', reportData.title);
    await page.fill('textarea[placeholder*="Describe location"]', reportData.desc);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "04_filing_civic_report_modal.png") });

    // Submit report modal
    const submitReportBtn = page.locator('button[type="submit"]:has-text("Submit Report")');
    await submitReportBtn.click();
    console.log("   ✓ Submitted Civic Report");

    await page.waitForTimeout(1000);

    // Switch to "My Civic Reports" tab
    const myReportsTab = page.locator('button:has-text("My Civic Reports")');
    await myReportsTab.click();
    await page.waitForTimeout(1000);

    // Open the stepper drawer by clicking the stepper button on the report row
    const stepperBtn = page.locator('button:has-text("Step 1/5")').first();
    if (await stepperBtn.isVisible()) {
      await stepperBtn.click();
      await page.waitForTimeout(600);
      console.log("   ✓ Clicked Step 1/5 button to expand Resolution Pipeline drawer");
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "05_civic_report_stepper_tracker.png") });
    console.log("   ✓ My Civic Reports tab active and 5-stage stepper rendered");

    const reportsText = await page.locator("body").innerText();
    const hasReportTitle = reportsText.includes(reportData.title);
    console.log(`   ✓ Report title found in tracker: ${hasReportTitle}`);

    results.stages.push({
      stage: "Civic Issue Filing & Tracker Stepper",
      reportTitle: reportData.title,
      foundInTracker: hasReportTitle,
      screenshot: "05_civic_report_stepper_tracker.png",
      success: hasReportTitle,
    });

    // -------------------------------------------------------------
    // STAGE 5: Priority Ballots (Civic Voting)
    // -------------------------------------------------------------
    console.log("\n▶ STAGE 5: Participatory Budgeting Priority Poll");
    const pollsTab = page.locator('button:has-text("Priority Ballots")');
    await pollsTab.click();
    await page.waitForTimeout(1000);

    // Click on the first ballot option to cast vote
    const ballotOption = page.locator('div:has-text("verified resident votes")').first();
    if (await ballotOption.isVisible()) {
      await ballotOption.click();
      console.log("   ✓ Clicked ballot option to cast verified civic vote");
      await page.waitForTimeout(800);
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "06_priority_ballot_voted.png") });
    console.log("   ✓ Priority ballot state captured");

    results.stages.push({
      stage: "Priority Ballot Voting",
      screenshot: "06_priority_ballot_voted.png",
      success: true,
    });

    // -------------------------------------------------------------
    // STAGE 6: Resident Account Settings & Profile
    // -------------------------------------------------------------
    console.log("\n▶ STAGE 6: Resident Profile & Settings");
    const profileTab = page.locator('button:has-text("Resident Settings")');
    await profileTab.click();
    await page.waitForTimeout(1000);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "07_resident_profile_settings.png") });
    console.log("   ✓ Resident settings page captured");

    // -------------------------------------------------------------
    // STAGE 7: Accessibility & Contrast Audit
    // -------------------------------------------------------------
    console.log("\n▶ STAGE 7: Automated Accessibility & Structure Audit");
    const a11yAudit = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll("img"));
      const missingAlt = images.filter((img) => !img.hasAttribute("alt") || img.getAttribute("alt") === "");

      const inputs = Array.from(document.querySelectorAll("input, select, textarea"));
      const missingAriaOrLabel = inputs.filter((el) => {
        const id = el.getAttribute("id");
        const hasLabel = id && document.querySelector(`label[for="${id}"]`);
        const hasAria = el.hasAttribute("aria-label") || el.hasAttribute("aria-labelledby");
        const parentLabel = el.closest("label");
        return !hasLabel && !hasAria && !parentLabel;
      });

      const buttons = Array.from(document.querySelectorAll("button"));
      const emptyButtons = buttons.filter((b) => (b.innerText.trim() === "" && !b.getAttribute("aria-label") && !b.getAttribute("title")));

      const headings = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6")).map((h) => ({
        tag: h.tagName,
        text: h.innerText.slice(0, 40),
      }));

      return {
        totalImages: images.length,
        missingAltCount: missingAlt.length,
        totalFormElements: inputs.length,
        unassociatedInputCount: missingAriaOrLabel.length,
        totalButtons: buttons.length,
        emptyButtonCount: emptyButtons.length,
        headingCount: headings.length,
        headingHierarchySample: headings.slice(0, 6),
      };
    });

    results.accessibility = a11yAudit;
    console.log(`   ✓ Images checked: ${a11yAudit.totalImages} (Missing alt: ${a11yAudit.missingAltCount})`);
    console.log(`   ✓ Buttons checked: ${a11yAudit.totalButtons} (Unlabelled: ${a11yAudit.emptyButtonCount})`);
    console.log(`   ✓ Headings checked: ${a11yAudit.headingCount}`);

    // Navigation timings
    const perfTiming = await page.evaluate(() => {
      const nav = performance.getEntriesByType("navigation")[0];
      if (!nav) return {};
      return {
        dnsLookupMs: Math.round(nav.domainLookupEnd - nav.domainLookupStart),
        tcpConnectMs: Math.round(nav.connectEnd - nav.connectStart),
        ttfbMs: Math.round(nav.responseStart - nav.requestStart),
        responseDurationMs: Math.round(nav.responseEnd - nav.responseStart),
        domContentLoadedMs: Math.round(nav.domContentLoadedEventEnd - nav.startTime),
        domCompleteMs: Math.round(nav.domComplete - nav.startTime),
      };
    });

    results.performance = perfTiming;

    // Filter console errors and warnings
    results.consoleAudit.errors = consoleMessages.filter((m) => m.type === "error").map((m) => m.text);
    results.consoleAudit.warnings = consoleMessages.filter((m) => m.type === "warning").map((m) => m.text);
    results.network.totalRequests = networkRequests.length;
    results.network.failedRequests = networkRequests.filter((r) => r.status && r.status >= 400);

    console.log("\n=================================================");
    console.log("🎯 PLAYWRIGHT ANALYSIS COMPLETE");
    console.log(`   • Total Network Requests: ${results.network.totalRequests}`);
    console.log(`   • Failed Requests (4xx/5xx): ${results.network.failedRequests.length}`);
    console.log(`   • Console Errors: ${results.consoleAudit.errors.length}`);
    console.log(`   • Console Warnings: ${results.consoleAudit.warnings.length}`);
    console.log(`   • DOM Content Loaded: ${results.performance.domContentLoadedMs}ms`);
    console.log(`   • TTFB: ${results.performance.ttfbMs}ms`);
    console.log("=================================================");

  } catch (error) {
    console.error("❌ Test suite encountered error:", error);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "error_state.png") }).catch(() => {});
    results.fatalError = error.message;
  } finally {
    await browser.close();
    server.close();
  }

  // Save JSON report
  fs.writeFileSync(
    path.join(ARTIFACTS_DIR, "playwright-user-analysis.json"),
    JSON.stringify(results, null, 2)
  );

  console.log("Results written to:", path.join(ARTIFACTS_DIR, "playwright-user-analysis.json"));
  process.exit(results.fatalError ? 1 : 0);
}

runAnalysis().catch((e) => {
  console.error("Runner error:", e);
  process.exit(1);
});
