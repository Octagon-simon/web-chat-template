//Dumps real element boxes so callouts anchor to the UI, not to guesses.
const { chromium } = require("/Users/octagon/.npm/_npx/13ab0715f9f30c2e/node_modules/playwright");

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 810 },
    deviceScaleFactor: 2,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto("http://localhost:5173/?demo=1", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const box = async (sel) => {
    const el = page.locator(sel).first();
    if ((await el.count()) === 0) return null;
    const b = await el.boundingBox();
    return b && { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) };
  };
  const out = {};
  for (const sel of [".rail", ".rail-nav", ".new-chat", ".topbar", ".dock", ".composer", ".composer-bar", ".msg-column", ".row-user .bubble", ".assistant", ".code-block", ".send", ".select-wrap"]) {
    out[sel] = await box(sel);
  }
  console.log(JSON.stringify(out, null, 2));
  await browser.close();
})();
