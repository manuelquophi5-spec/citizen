import next from "next";
import http from "http";
import { chromium } from "playwright";
import path from "path";
import fs from "fs";

const ARTIFACTS_DIR = "/home/manuelkophie/.gemini/antigravity/brain/95bbded2-3e7e-4447-ba08-ebeaacea3fcd";
const SCREENSHOTS_DIR = path.join(ARTIFACTS_DIR, "screenshots");

async function runClerkRbacE2E() {
  console.log("==================================================================");
  console.log("🚀 E2E VERIFICATION: CLERK AUTH + SUPABASE RBAC ENFORCEMENT");
  console.log("==================================================================");

  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  // 1. Boot Next.js in-process
  const app = next({ dev: true, dir: path.resolve(".") });
  const handle = app.getRequestHandler();
  await app.prepare();

  const server = http.createServer((req, res) => {
    handle(req, res);
  });

  const PORT = 3128;
  await new Promise((resolve) => server.listen(PORT, "127.0.0.1", resolve));
  const baseUrl = `http://127.0.0.1:${PORT}`;
  console.log(`✓ Next.js server running at ${baseUrl}`);

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

  const errors = [];
  page.on("pageerror", (err) => {
    console.error(`[PAGE ERROR] ${err.message}`);
    errors.push(err.message);
  });

  try {
    // TEST 1: Check Auth Sync API endpoint
    console.log("\n[TEST 1] Verifying /api/auth/sync endpoint...");
    const syncRes = await page.goto(`${baseUrl}/api/auth/sync`);
    const syncText = await syncRes.text();
    const syncJson = JSON.parse(syncText);
    console.log("  ✓ /api/auth/sync status:", syncRes.status(), syncJson);

    // TEST 2: Check Sign In Route
    console.log("\n[TEST 2] Verifying /sign-in route...");
    await page.goto(`${baseUrl}/sign-in`);
    await page.waitForLoadState("networkidle");
    console.log("  ✓ /sign-in loaded, current URL:", page.url());
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "clerk_01_signin_route.png") });

    // TEST 3: Check Sign Up Route
    console.log("\n[TEST 3] Verifying /sign-up route...");
    await page.goto(`${baseUrl}/sign-up`);
    await page.waitForLoadState("networkidle");
    console.log("  ✓ /sign-up loaded, current URL:", page.url());
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "clerk_02_signup_route.png") });

    // TEST 4: Middleware RBAC Protection on /admin
    console.log("\n[TEST 4] Verifying Route Protection on /admin (Unauthenticated)...");
    await page.goto(`${baseUrl}/admin`);
    await page.waitForLoadState("networkidle");
    const adminBlockedUrl = page.url();
    console.log("  ✓ /admin access redirected unauthenticated user to:", adminBlockedUrl);
    if (!adminBlockedUrl.includes("/admin/login") && !adminBlockedUrl.includes("/sign-in")) {
      throw new Error(`Expected redirect to /admin/login or /sign-in, got ${adminBlockedUrl}`);
    }
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "clerk_03_admin_guard_blocked.png") });

    // TEST 5: Citizen Persona Login & Access to /user
    console.log("\n[TEST 5] Testing Citizen Login (Kofi Mensah -> /user)...");
    await page.goto(`${baseUrl}/login`);
    await page.waitForSelector("input[type='email']");
    await page.fill("input[type='email']", "kofi@citizen.gh");
    await page.fill("input[type='password']", "citizen2026");
    await page.click("button[type='submit']");
    await page.waitForURL("**/user", { timeout: 25000 });
    console.log("  ✓ Successfully signed in and landed at Citizen Portal:", page.url());
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "clerk_04_citizen_portal.png") });

    // TEST 6: Citizen attempts unauthorized access to /admin
    console.log("\n[TEST 6] Citizen attempting access to /admin (RBAC Violation Check)...");
    await page.goto(`${baseUrl}/admin`);
    await page.waitForLoadState("networkidle");
    const citizenBlockedUrl = page.url();
    console.log("  ✓ Citizen accessing /admin was blocked by RBAC and routed to:", citizenBlockedUrl);
    if (!citizenBlockedUrl.includes("/admin/login")) {
      throw new Error(`Citizen should be denied access to /admin, routed to ${citizenBlockedUrl}`);
    }

    // TEST 7: Volunteer Persona Login & Access to /volunteer
    console.log("\n[TEST 7] Testing Volunteer Login (Akua Agbavitor -> /volunteer)...");
    await page.goto(`${baseUrl}/login?role=volunteer`);
    await page.waitForSelector("input[type='email']");
    await page.fill("input[type='email']", "akua.volunteer@citizen.gh");
    await page.fill("input[type='password']", "volunteer2026");
    await page.click("button[type='submit']");
    await page.waitForURL("**/volunteer**", { timeout: 25000 });
    console.log("  ✓ Successfully signed in and landed at Volunteer Portal:", page.url());
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "clerk_05_volunteer_portal.png") });

    // TEST 8: Admin Operations Terminal Authentication
    console.log("\n[TEST 8] Testing Official Administrator Authentication (Selorm Dzreke -> /admin)...");
    await page.goto(`${baseUrl}/admin/login`);
    await page.waitForSelector("input[type='email']");
    await page.fill("input[type='email']", "coordinator@thecitizenproject.org");
    await page.fill("input[type='password']", "STDA-2026");
    await page.click("button[type='submit']");
    await page.waitForURL("**/admin", { timeout: 25000 });
    console.log("  ✓ Administrator authorized and landed at Operations Terminal:", page.url());
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "clerk_06_admin_operations_terminal.png") });

    console.log("\n==================================================================");
    console.log("🎉 ALL 8 E2E CLERK & SUPABASE RBAC TESTS COMPLETED SUCCESSFULLY!");
    console.log("==================================================================");
  } finally {
    await browser.close();
    server.close();
  }
}

runClerkRbacE2E().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
