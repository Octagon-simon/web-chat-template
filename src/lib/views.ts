import type { ThemePref } from "./types";

export type View =
  | "chat"
  | "login"
  | "signup"
  | "projects"
  | "connectors"
  | "customize"
  | "skills"
  | "settings"
  | "mobile";

export const VIEWS: View[] = [
  "login",
  "signup",
  "projects",
  "connectors",
  "customize",
  "skills",
  "settings",
  "mobile",
];

export const VIEW_TITLE: Record<Exclude<View, "chat">, string> = {
  login: "Sign in",
  signup: "Create account",
  projects: "Projects",
  connectors: "Connectors",
  customize: "Customize",
  skills: "Skills",
  settings: "Settings",
  mobile: "Mobile app",
};

/** `?panel=projects` opens a page on load, for docs and screenshots. */
export function initialView(): View {
  const value = new URLSearchParams(location.search).get("panel");
  if (value === "account") return "settings";
  if (value && (VIEWS as string[]).includes(value)) return value as View;
  return "chat";
}

export function initialSearch(): boolean {
  return new URLSearchParams(location.search).get("panel") === "search";
}

export function syncViewParam(next: View) {
  const url = new URL(window.location.href);
  if (next === "chat") url.searchParams.delete("panel");
  else url.searchParams.set("panel", next);
  window.history.replaceState(null, "", url);
}

export type { ThemePref };
