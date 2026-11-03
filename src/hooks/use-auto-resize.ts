import { useLayoutEffect, type DependencyList, type RefObject } from "react";

/** Grows a textarea to its content, capped so the page never runs away. */
export function useAutoResize(
  ref: RefObject<HTMLTextAreaElement | null>,
  deps: DependencyList,
  max = 220,
) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, max)}px`;
  }, [ref, max, ...deps]);
}
