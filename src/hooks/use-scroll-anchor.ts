import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const STICKY_DISTANCE = 96;

/** Keeps a scroller pinned to the newest message unless the reader scrolled up. */
export function useScrollAnchor(on: unknown, streamingId?: unknown) {
  const ref = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handle = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      setPinned(distance < STICKY_DISTANCE);
    };
    el.addEventListener("scroll", handle, { passive: true });
    return () => el.removeEventListener("scroll", handle);
  }, []);

  useLayoutEffect(() => {
    const el = ref.current;
    if (el && pinned) el.scrollTop = el.scrollHeight;
  }, [on, streamingId, pinned]);

  const toBottom = useCallback(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
    setPinned(true);
  }, []);

  return { ref, pinned, toBottom };
}
