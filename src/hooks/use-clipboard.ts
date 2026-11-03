import { useCallback, useEffect, useRef, useState } from "react";

/** Copy to clipboard with a short "copied" flash for the button label. */
export function useClipboard(resetAfter = 1400) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  const copy = useCallback(
    (text: string) => {
      void navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        if (timer.current) window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setCopied(false), resetAfter);
      });
    },
    [resetAfter],
  );

  return { copied, copy };
}
