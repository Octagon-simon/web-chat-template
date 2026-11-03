import { useCallback, useEffect, useState } from "react";

import type { ThemePref } from "@/lib/types";

const KEY = "chat-template.theme";

function readPref(): ThemePref {
  const saved = localStorage.getItem(KEY);
  return saved === "light" || saved === "dark" ? saved : "system";
}

function resolve(pref: ThemePref): "light" | "dark" {
  if (pref !== "system") return pref;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function useTheme() {
  const [pref, setPref] = useState<ThemePref>(readPref);
  const [theme, setTheme] = useState<"light" | "dark">(() => resolve(pref));

  useEffect(() => {
    localStorage.setItem(KEY, pref);
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => setTheme(pref === "system" ? (media.matches ? "dark" : "light") : pref);
    apply();
    if (pref !== "system") return;
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [pref]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    //an in-app theme override has to win over the OS preference in the manifest metas
    const color = theme === "dark" ? "#0f0f10" : "#ffffff";
    document
      .querySelectorAll('meta[name="theme-color"]')
      .forEach((meta) => meta.setAttribute("content", color));
  }, [theme]);

  const toggle = useCallback(() => setPref(theme === "dark" ? "light" : "dark"), [theme]);

  return { pref, theme, setPref, toggle };
}
