import next from "next";
import http from "http";
import { chromium } from "playwright";
import path from "path";

async function main() {
  console.log("Preparing Next.js app in-process...");
  const app = next({ dev: true, dir: path.resolve(".") });
  const handle = app.getRequestHandler();
  await app.prepare();

  const server = http.createServer((req, res) => {
    handle(req, res);
  });

  await new Promise((resolve) => server.listen(3099, "127.0.0.1", resolve));
  const port = 3099;
  console.log(`Next.js server listening on http://127.0.0.1:${port}`);

  const chromePath = path.resolve("./chrome-bin/opt/google/chrome/chrome");
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  console.log("Navigating to home page...");
  const res = await page.goto(`http://127.0.0.1:${port}/`);
  console.log("Page status:", res.status());
  console.log("Page title:", await page.title());

  await browser.close();
  server.close();
  console.log("Test finished successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error in main:", err);
  process.exit(1);
});
