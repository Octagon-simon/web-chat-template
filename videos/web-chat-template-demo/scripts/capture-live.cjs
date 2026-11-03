//Captures live chat states: typed composer, mid-stream answer.
const path = require("node:path");
const fs = require("node:fs");
const { chromium } = require("/Users/octagon/.npm/_npx/13ab0715f9f30c2e/node_modules/playwright");

const BASE = "http://localhost:5173";
const OUT = path.join(__dirname, "..", "assets", "screens");

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 810 },
    deviceScaleFactor: 2,
    colorScheme: "light",
    reducedMotion: "reduce",
  });
  await context.addInitScript(() => localStorage.setItem("chat-template.theme", "light"));
  const page = await context.newPage();
  await page.goto(BASE + "/?demo=1", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: /new chat/i }).click();
  await page.waitForTimeout(400);

  await page.locator("#composer-input").fill("Which file handles streaming?");
  await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important}" });
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(OUT, "chat-typed.png") });

  await page.locator("#composer-input").press("Enter");
  await page.waitForTimeout(650);
  await page.screenshot({ path: path.join(OUT, "chat-streaming.png") });
  await page.waitForTimeout(4500);
  await page.screenshot({ path: path.join(OUT, "chat-answer.png") });

  const dark = await context.newPage();
  await dark.goto(BASE + "/?demo=1", { waitUntil: "networkidle" });
  await dark.evaluate(() => localStorage.setItem("chat-template.theme", "dark"));
  await dark.reload({ waitUntil: "networkidle" });
  await dark.waitForTimeout(500);
  await dark.getByRole("button", { name: /new chat/i }).click();
  await dark.locator("#composer-input").fill("Which file handles streaming?");
  await dark.locator("#composer-input").press("Enter");
  await dark.waitForTimeout(650);
  await dark.screenshot({ path: path.join(OUT, "chat-streaming-dark.png") });

  for (const f of ["chat-typed", "chat-streaming", "chat-answer", "chat-streaming-dark"]) {
    console.log(f, fs.statSync(path.join(OUT, f + ".png")).size);
  }
  await browser.close();
})();
