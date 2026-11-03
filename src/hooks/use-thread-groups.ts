import { useMemo } from "react";

import { groupLabel } from "@/lib/format";
import type { Thread } from "@/lib/types";

export type ThreadGroup = [string, Thread[]];

/** Pinned first, then conversation history bucketed by recency. */
export function useThreadGroups(threads: Thread[]): ThreadGroup[] {
  return useMemo(() => {
    const sorted = [...threads].sort((a, b) => b.updatedAt - a.updatedAt);
    const map = new Map<string, Thread[]>();
    const pinned = sorted.filter((thread) => thread.pinnedAt);
    if (pinned.length) {
      map.set("Pinned", pinned.sort((a, b) => (b.pinnedAt ?? 0) - (a.pinnedAt ?? 0)));
    }
    for (const thread of sorted.filter((item) => !item.pinnedAt)) {
      const label = groupLabel(thread.updatedAt);
      const bucket = map.get(label);
      if (bucket) bucket.push(thread);
      else map.set(label, [thread]);
    }
    return [...map.entries()];
  }, [threads]);
}
