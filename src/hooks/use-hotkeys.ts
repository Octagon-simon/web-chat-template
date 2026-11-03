import { useEffect } from "react";

type Handler = (event: KeyboardEvent) => void;

/** Registers one window-level keydown listener for an app-wide shortcut map. */
export function useHotkeys(handler: Handler, active = true) {
  useEffect(() => {
    if (!active) return;
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handler, active]);
}
