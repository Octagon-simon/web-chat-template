//Captures the template's screens for the demo video.
const path = require("node:path");
const fs = require("node:fs");
const { chromium } = require("/Users/octagon/.npm/_npx/13ab0715f9f30c2e/node_modules/playwright");

const BASE = "http://localhost:5173";
const OUT = path.join(__dirname, "..", "assets", "screens");
fs.mkdirSync(OUT, { recursive: true });

const shots = [
  { name: "chat-empty-light", path: "/", theme: "light", vp: "desktop" },
  { name: "chat-light", path: "/?demo=1", theme: "light", vp: "desktop" },
  { name: "projects-light", path: "/?demo=1&panel=projects", theme: "light", vp: "desktop" },
  { name: "skills-light", path: "/?demo=1&panel=skills", theme: "light", vp: "desktop" },
  { name: "connectors-light", path: "/?demo=1&panel=connectors", theme: "light", vp: "desktop" },
  { name: "customize-light", path: "/?demo=1&panel=customize", theme: "light", vp: "desktop" },
  { name: "settings-light", path: "/?demo=1&panel=settings", theme: "light", vp: "desktop" },
  { name: "mobile-light", path: "/?demo=1&panel=mobile", theme: "light", vp: "desktop" },
  { name: "login-light", path: "/?panel=login", theme: "light", vp: "desktop" },
  { name: "signup-dark", path: "/?panel=signup", theme: "dark", vp: "desktop" },
  { name: "chat-dark", path: "/?demo=1", theme: "dark", vp: "desktop" },
  { name: "settings-dark", path: "/?demo=1&panel=settings", theme: "dark", vp: "desktop" },
  { name: "skills-dark", path: "/?demo=1&panel=skills", theme: "dark", vp: "desktop" },
  { name: "m-chat-light", path: "/?demo=1", theme: "light", vp: "mobile" },
  { name: "m-chat-dark", path: "/?demo=1", theme: "dark", vp: "mobile" },
  { name: "m-settings-light", path: "/?demo=1&panel=settings", theme: "light", vp: "mobile" },
  { name: "m-skills-light", path: "/?demo=1&panel=skills", theme: "light", vp: "mobile" },
];

const viewports = {
  desktop: { viewport: { width: 1440, height: 810 }, deviceScaleFactor: 2, isMobile: false, hasTouch: false },
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
};

(async () => {
  const browser = await chromium.launch();
  for (const shot of shots) {
    const context = await browser.newContext({
      ...viewports[shot.vp],
      colorScheme: shot.theme,
      reducedMotion: "reduce",
    });
    await context.addInitScript((theme) => {
      localStorage.setItem("chat-template.theme", theme);
    }, shot.theme);
    const page = await context.newPage();
    await page.goto(BASE + shot.path, { waitUntil: "networkidle" });
    await page.waitForTimeout(700);
    await page.addStyleTag({ content: "*,*::before,*::after{caret-color:transparent!important;animation:none!important;transition:none!important}" });
    await page.waitForTimeout(200);
    const file = path.join(OUT, shot.name + ".png");
    await page.screenshot({ path: file });
    const size = fs.statSync(file).size;
    console.log(shot.name, size, "bytes");
    await context.close();
  }
  await browser.close();
})();
