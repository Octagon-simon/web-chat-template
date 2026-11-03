import { useEffect, useState } from "react";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export type InstallPlatform = "ios" | "android" | "desktop";

function detectPlatform(): InstallPlatform {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  //ipadOS 13+ reports as a Mac, tell it apart by touch support
  if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) return "ios";
  if (/Android/.test(ua)) return "android";
  return "desktop";
}

function isStandalone(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

//kept at module scope: the browser fires this once, usually before the page mounts
let deferred: InstallPromptEvent | null = null;
let installedNow = isStandalone();
const watchers = new Set<() => void>();

const notify = () => watchers.forEach((watch) => watch());

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferred = event as InstallPromptEvent;
  notify();
});

window.addEventListener("appinstalled", () => {
  installedNow = true;
  deferred = null;
  notify();
});

window.matchMedia("(display-mode: standalone)").addEventListener("change", () => {
  installedNow = isStandalone();
  notify();
});

/** Tracks whether the browser offered an install prompt and whether we are already installed. */
export function useInstallPrompt() {
  const [platform] = useState<InstallPlatform>(detectPlatform);
  const [state, setState] = useState(() => ({
    canInstall: deferred !== null,
    installed: installedNow,
  }));

  useEffect(() => {
    const sync = () => setState({ canInstall: deferred !== null, installed: installedNow });
    sync();
    watchers.add(sync);
    return () => {
      watchers.delete(sync);
    };
  }, []);

  const install = async (): Promise<"accepted" | "dismissed" | "unavailable"> => {
    if (!deferred) return "unavailable";
    const event = deferred;
    await event.prompt();
    const choice = await event.userChoice;
    deferred = null;
    notify();
    return choice.outcome;
  };

  return { ...state, platform, install };
}
