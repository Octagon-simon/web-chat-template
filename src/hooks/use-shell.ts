import { useCallback, useEffect, useState } from "react";

import { initialView, syncViewParam, type View } from "@/lib/views";

/** Page routing plus the sidebar drawer state they share on narrow screens. */
export function useShell() {
  const [view, setView] = useState<View>(initialView);
  const [railOpen, setRailOpen] = useState(() => window.innerWidth > 860);

  const openPage = useCallback((next: View) => {
    setView(next);
    if (window.innerWidth <= 860) setRailOpen(false);
    syncViewParam(next);
  }, []);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const apply = () => {
      document.documentElement.style.setProperty(
        "--app-height",
        `${Math.round(viewport.height)}px`,
      );
    };
    apply();
    viewport.addEventListener("resize", apply);
    return () => viewport.removeEventListener("resize", apply);
  }, []);

  return { view, openPage, railOpen, setRailOpen };
}
