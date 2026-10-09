import next from "next";
import http from "http";
import { chromium } from "playwright";
import path from "path";
import fs from "fs";

const ARTIFACTS_DIR = "/home/manuelkophie/.gemini/antigravity/brain/95bbded2-3e7e-4447-ba08-ebeaacea3fcd";
const SCREENSHOTS_DIR = path.join(ARTIFACTS_DIR, "screenshots");

async function testVolunteer() {
  console.log("=========================================");
  console.log("🔍 TESTING VOLUNTEER FLOW AND PORTAL");
  console.log("=========================================");

  // 1. Boot Next.js in-process
  const app = next({ dev: true, dir: path.resolve(".") });
  const handle = app.getRequestHandler();
  await app.prepare();

  const server = http.createServer((req, res) => {
    handle(req, res);
  });

  const PORT = 3125;
  await new Promise((resolve) => server.listen(PORT, "127.0.0.1", resolve));
  const baseUrl = `http://127.0.0.1:${PORT}`;
  console.log(`✓ Next.js server active at ${baseUrl}`);

  const chromePath = path.resolve("./chrome-bin/opt/google/chrome/chrome");
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--window-size=1280,800"],
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });

  const page = await context.newPage();

  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
      console.log(`[BROWSER ERROR] ${msg.text()}`);
    }
  });

  page.on("pageerror", (err) => {
    consoleErrors.push(err.message);
    console.log(`[PAGE ERROR] ${err.message}`);
  });

  try {
    // -------------------------------------------------------------
    // Test 1: Public /volunteer page without login
    // -------------------------------------------------------------
    console.log("\n▶ Test 1: Visiting /volunteer anonymously");
    await page.goto(`${baseUrl}/volunteer`, { waitUntil: "networkidle" });
    const publicTitle = await page.title();
    console.log(`   ✓ Page title: "${publicTitle}"`);
    const publicHeading = await page.locator("h1, h2").first().innerText();
    console.log(`   ✓ Main heading: "${publicHeading}"`);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "vol_01_public_hub.png") });

    // -------------------------------------------------------------
    // Test 2: Register as a Volunteer (/register?role=volunteer)
    // -------------------------------------------------------------
    console.log("\n▶ Test 2: Registering as Volunteer (/register?role=volunteer)");
    await page.goto(`${baseUrl}/register?role=volunteer`, { waitUntil: "networkidle" });
    await page.waitForSelector("form", { timeout: 10000 });

    const volUser = {
      name: "Enyonam Peace Gidi",
      email: `enyonam.volunteer.${Date.now()}@citizen.tongu.test`,
      password: "TestVolunteer2026!",
    };

    await page.fill('input[placeholder*="Ama Serwaa"]', volUser.name);
    await page.fill('input[type="email"]', volUser.email);
    await page.fill('input[type="password"]', volUser.password);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "vol_02_register_filled.png") });
    console.log(`   ✓ Filled volunteer registration for: ${volUser.name}`);

    // Click register button
    const regBtn = page.getByRole("button", { name: /Register as Community Ambassador/i });
    console.log(`   ✓ Found register button: ${await regBtn.innerText()}`);
    await regBtn.click();

    // Wait for redirect to /volunteer
    await page.waitForURL("**/volunteer", { timeout: 15000 });
    console.log(`   ✓ Redirected to: ${page.url()}`);
    await page.waitForTimeout(1500);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "vol_03_after_registration.png") });
    const postRegHeading = await page.locator("body").innerText();
    const hasVolunteerDashboard = postRegHeading.includes("Volunteer Service Ledger") || postRegHeading.includes("Overview & Service Metrics") || postRegHeading.includes("Akua") || postRegHeading.includes("Enyonam");
    console.log(`   ✓ Volunteer Dashboard loaded after registration: ${hasVolunteerDashboard}`);

    // -------------------------------------------------------------
    // Test 3: Sign in as demo volunteer (akua.volunteer@citizen.gh)
    // -------------------------------------------------------------
    console.log("\n▶ Test 3: Signing in as demo volunteer (/login?role=volunteer)");
    await page.goto(`${baseUrl}/login?role=volunteer`, { waitUntil: "networkidle" });
    await page.fill('input[type="email"]', "akua.volunteer@citizen.gh");
    await page.fill('input[type="password"]', "volunteer2026");

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "vol_04_login_filled.png") });
    const loginBtn = page.getByRole("button", { name: /Sign In to Volunteer Portal/i });
    await loginBtn.click();

    await page.waitForURL("**/volunteer", { timeout: 15000 });
    console.log(`   ✓ Redirected to: ${page.url()}`);
    await page.waitForTimeout(1500);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "vol_05_demo_volunteer_dashboard.png") });
    const demoDashboardText = await page.locator("body").innerText();
    console.log(`   ✓ Demo volunteer portal has Akua Agbavitor: ${demoDashboardText.includes("Akua Agbavitor")}`);

    // -------------------------------------------------------------
    // Test 4: Test Volunteer Dashboard Features
    // -------------------------------------------------------------
    console.log("\n▶ Test 4: Testing Volunteer Dashboard tabs and features");
    
    // Tab: Hours Ledger
    const ledgerTab = page.locator('button:has-text("Hours Ledger")').first();
    if (await ledgerTab.isVisible()) {
      await ledgerTab.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "vol_06_hours_ledger.png") });
      console.log("   ✓ Clicked Hours Ledger tab");
    }

    // Tab: Events & Deployments
    const eventsTab = page.locator('button:has-text("Deployments & Shifts")').first();
    if (await eventsTab.isVisible()) {
      await eventsTab.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "vol_07_events_deployments.png") });
      console.log("   ✓ Clicked Deployments & Shifts tab");
    }

    // Tab: Official Transcript
    const transcriptTab = page.locator('button:has-text("Official Transcript")').first();
    if (await transcriptTab.isVisible()) {
      await transcriptTab.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "vol_08_official_transcript.png") });
      console.log("   ✓ Clicked Official Transcript tab");
    }

    // Modal: Log Volunteer Hours
    const logHoursBtn = page.locator('button:has-text("Log Service Hours")').first();
    if (await logHoursBtn.isVisible()) {
      await logHoursBtn.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "vol_09_log_hours_modal.png") });
      console.log("   ✓ Log Volunteer Hours modal opened");

      // Fill in an hour log
      await page.fill('input[placeholder*="civic rights session"]', "District Health Screening Outreach Support");
      await page.fill('input[placeholder*="Kwaku Baah"]', "Dr. E. Mensah");
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "vol_10_log_hours_filled.png") });

      const submitHoursBtn = page.locator('button[type="submit"]:has-text("Submit for Approval")');
      await submitHoursBtn.click();
      await page.waitForTimeout(1000);
      console.log("   ✓ Submitted new volunteer hours log");
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "vol_11_hours_logged_success.png") });
    }

    // -------------------------------------------------------------
    // Test 5: Bi-Directional Portal Switcher (Volunteer <-> Citizen)
    // -------------------------------------------------------------
    console.log("\n▶ Test 5: Testing Bi-Directional Portal Switcher");
    const switchToCitizenBtn = page.locator('a:has-text("Switch to Citizen Portal")').first();
    if (await switchToCitizenBtn.isVisible()) {
      await switchToCitizenBtn.click();
      await page.waitForTimeout(1200);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "vol_12_switched_to_citizen.png") });
      console.log(`   ✓ Switched to Citizen Portal: ${page.url()}`);
    }

    const switchToVolunteerBtn = page.locator('a:has-text("Volunteer Console")').first();
    if (await switchToVolunteerBtn.isVisible()) {
      await switchToVolunteerBtn.click();
      await page.waitForTimeout(1200);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "vol_13_switched_back_to_volunteer.png") });
      console.log(`   ✓ Switched back to Volunteer Console: ${page.url()}`);
    }

    console.log("\n=========================================");
    console.log("🎉 ALL VOLUNTEER TESTS FINISHED");
    console.log(`   • Browser console errors: ${consoleErrors.length}`);
    console.log("=========================================");
  } catch (err) {
    console.error("❌ Test failed:", err);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "vol_error.png") }).catch(() => {});
  } finally {
    await browser.close();
    server.close();
  }
}

testVolunteer().catch((e) => {
  console.error("Runner fatal error:", e);
  process.exit(1);
});
