import { useCallback } from "react";

import type { Thread } from "@/lib/types";
import type { Workspace } from "@/lib/workspace";

/** Downloads the whole local workspace as JSON. */
export function useWorkspaceExport(threads: Thread[], workspace: Workspace) {
  return useCallback(() => {
    const payload = {
      exportedAt: new Date().toISOString(),
      threads,
      projects: workspace.projects,
      skills: workspace.skills,
      skillOn: workspace.skillOn,
      connectors: workspace.connectors,
      enabled: workspace.enabled,
      instructions: workspace.instructions,
      style: workspace.style,
      profile: workspace.profile,
      settings: workspace.settings,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "chat-workspace.json";
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [threads, workspace]);
}
