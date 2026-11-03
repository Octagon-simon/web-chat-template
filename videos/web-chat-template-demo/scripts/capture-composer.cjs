//Captures the composer strip at 3x for the detail card.
const path = require("node:path");
const { chromium } = require("/Users/octagon/.npm/_npx/13ab0715f9f30c2e/node_modules/playwright");

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 810 },
    deviceScaleFactor: 3,
    colorScheme: "light",
    reducedMotion: "reduce",
  });
  await context.addInitScript(() => localStorage.setItem("chat-template.theme", "light"));
  const page = await context.newPage();
  await page.goto("http://localhost:5173/?demo=1", { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await page.locator("#composer-input").fill("Which file handles streaming?");
  await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}" });
  await page.waitForTimeout(250);
  await page.screenshot({
    path: path.join(__dirname, "..", "assets", "screens", "composer.png"),
    clip: { x: 436, y: 648, width: 848, height: 148 },
  });
  console.log("composer strip done");
  await browser.close();
})();
