import { chromium } from "playwright";
import path from "path";

async function main() {
  const chromePath = path.resolve("./chrome-bin/opt/google/chrome/chrome");
  console.log("Launching browser at:", chromePath);
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });
  const page = await browser.newPage();
  console.log("Browser opened successfully!");
  await browser.close();
  console.log("Browser closed successfully!");
}

main().catch((err) => {
  console.error("Playwright launch error:", err);
  process.exit(1);
});
