import { useCallback, useEffect, useState } from "react";
import { uid } from "./types";

const KEY = "chat-template.workspace.v1";

export interface Project {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

export interface Connector {
  id: string;
  name: string;
  detail: string;
  custom?: boolean;
}

export interface Profile {
  name: string;
  plan: string;
}

export interface Skill {
  id: string;
  name: string;
  detail: string;
  prompt: string;
  icon: string;
  category: string;
  custom?: boolean;
}

export interface Settings {
  sendOnEnter: boolean;
  showMeta: boolean;
}

export type StyleId = "concise" | "balanced" | "detailed";

export interface WorkspaceState {
  projects: Project[];
  connectors: Connector[];
  enabled: Record<string, boolean>;
  skills: Skill[];
  skillOn: Record<string, boolean>;
  settings: Settings;
  instructions: string;
  style: StyleId;
  profile: Profile;
}

export const PROJECT_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#0ea5e9",
];

export const STYLES: { id: StyleId; label: string; hint: string }[] = [
  {
    id: "concise",
    label: "Concise",
    hint: "Answer in as few words as the question allows. Skip preamble and restating.",
  },
  {
    id: "balanced",
    label: "Balanced",
    hint: "Answer directly, then add only the context that changes the decision.",
  },
  {
    id: "detailed",
    label: "Detailed",
    hint: "Show the reasoning and cover edge cases before you finish.",
  },
];

export const DEFAULT_CONNECTORS: Connector[] = [
  { id: "web", name: "Web search", detail: "Ground answers in live pages" },
  { id: "files", name: "File index", detail: "Search documents you upload" },
  { id: "github", name: "GitHub", detail: "Repos, issues and pull requests" },
  { id: "notion", name: "Notion", detail: "Pages and databases" },
  { id: "postgres", name: "Postgres", detail: "Read-only queries against your data" },
  { id: "sandbox", name: "Code sandbox", detail: "Run code in an isolated container" },
];

export const DEFAULT_SKILLS: Skill[] = [
  {
    id: "code-review",
    name: "Code review",
    detail: "Find the bug, then argue the fix",
    icon: "🧑‍💻",
    category: "Engineering",
    prompt:
      "Review code like a senior engineer. Lead with correctness, then security, then readability. Quote the exact line and propose a patch.",
  },
  {
    id: "doc-writer",
    name: "Doc writer",
    detail: "READMEs, API references, changelogs",
    icon: "📝",
    category: "Writing",
    prompt:
      "Write documentation for developers. Show a runnable example before the reference table. Never invent an endpoint or an option.",
  },
  {
    id: "data-analyst",
    name: "Data analyst",
    detail: "SQL, spreadsheets and sanity checks",
    icon: "📊",
    category: "Analysis",
    prompt:
      "Answer with the query, then the result, then the caveat that could flip the conclusion. State the grain of every table you touch.",
  },
  {
    id: "deck-builder",
    name: "Deck builder",
    detail: "Tight narrative for a product update",
    icon: "🎨",
    category: "Design",
    prompt:
      "Structure decks as one idea per slide. Give each slide a headline that makes a claim, not a label. Keep body copy under 40 words.",
  },
  {
    id: "research",
    name: "Deep research",
    detail: "Compare sources and cite claims",
    icon: "🔍",
    category: "Research",
    prompt:
      "Separate what the sources say from what you infer. Cite each factual claim. Say plainly when the evidence is thin.",
  },
  {
    id: "brand-voice",
    name: "Brand voice",
    detail: "Rewrite copy in a consistent voice",
    icon: "🗣️",
    category: "Writing",
    prompt:
      "Rewrite in a direct, spoken brand voice. Short sentences, active voice, no hype adjectives. Keep the author's meaning intact.",
  },
];

function fresh(): WorkspaceState {
  const demo = new URLSearchParams(location.search).has("demo");
  return {
    projects: demo
      ? [
          { id: "p-launch", name: "Launch copy", color: PROJECT_COLORS[0], createdAt: Date.now() },
          { id: "p-support", name: "Support macros", color: PROJECT_COLORS[2], createdAt: Date.now() },
        ]
      : [],
    connectors: DEFAULT_CONNECTORS,
    enabled: {},
    skills: DEFAULT_SKILLS,
    skillOn: {},
    settings: { sendOnEnter: true, showMeta: true },
    instructions: "",
    style: "balanced",
    profile: { name: "Octagon", plan: "Self-hosted" },
  };
}

function readName(saved: string | undefined, fallback: string): string {
  return !saved || saved === "Workspace owner" ? fallback : saved;
}

function read(): WorkspaceState {
  const base = fresh();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return base;
    const saved = JSON.parse(raw) as Partial<WorkspaceState>;
    return {
      ...base,
      ...saved,
      projects: Array.isArray(saved.projects) ? saved.projects : base.projects,
      connectors:
        Array.isArray(saved.connectors) && saved.connectors.length
          ? saved.connectors
          : base.connectors,
      enabled: saved.enabled ?? base.enabled,
      skills: Array.isArray(saved.skills) && saved.skills.length ? saved.skills : base.skills,
      skillOn: saved.skillOn ?? base.skillOn,
      settings: { ...base.settings, ...saved.settings },
      profile: { ...base.profile, ...saved.profile, name: readName(saved.profile?.name, base.profile.name) },
    };
  } catch {
    return base;
  }
}

/** Turns the customize fields and active skills into the system message. */
export function systemPrompt(
  instructions: string,
  style: StyleId,
  skills: Skill[] = [],
): string {
  const hint = STYLES.find((entry) => entry.id === style)?.hint ?? "";
  const skillBlock = skills.length
    ? ["Active skills:", ...skills.map((skill) => `- ${skill.name}: ${skill.prompt}`)].join("\n")
    : "";
  return [instructions.trim(), hint, skillBlock].filter(Boolean).join("\n\n");
}

export function useWorkspace() {
  const [state, setState] = useState<WorkspaceState>(read);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  const addProject = useCallback((name: string): string | null => {
    const clean = name.trim();
    if (!clean) return null;
    const project: Project = {
      id: uid(),
      name: clean,
      color: PROJECT_COLORS[0],
      createdAt: Date.now(),
    };
    setState((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        { ...project, color: PROJECT_COLORS[prev.projects.length % PROJECT_COLORS.length] },
      ],
    }));
    return project.id;
  }, []);

  const removeProject = useCallback((id: string) => {
    setState((prev) => ({ ...prev, projects: prev.projects.filter((p) => p.id !== id) }));
  }, []);

  const renameProject = useCallback((id: string, name: string) => {
    const clean = name.trim();
    if (!clean) return;
    setState((prev) => ({
      ...prev,
      projects: prev.projects.map((project) =>
        project.id === id ? { ...project, name: clean } : project,
      ),
    }));
  }, []);

  const toggleSkill = useCallback((id: string) => {
    setState((prev) => ({ ...prev, skillOn: { ...prev.skillOn, [id]: !prev.skillOn[id] } }));
  }, []);

  const addSkill = useCallback((name: string, detail: string, prompt: string) => {
    const clean = name.trim();
    if (!clean) return;
    setState((prev) => ({
      ...prev,
      skills: [
        ...prev.skills,
        {
          id: `custom-${uid().slice(0, 8)}`,
          name: clean,
          detail: detail.trim() || "Custom skill",
          prompt: prompt.trim() || detail.trim() || clean,
          icon: "✨",
          category: "Custom",
          custom: true,
        },
      ],
    }));
  }, []);

  const removeSkill = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill.id !== id),
      skillOn: Object.fromEntries(Object.entries(prev.skillOn).filter(([key]) => key !== id)),
    }));
  }, []);

  const setSettings = useCallback((patch: Partial<Settings>) => {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));
  }, []);

  const toggleConnector = useCallback((id: string) => {
    setState((prev) => ({ ...prev, enabled: { ...prev.enabled, [id]: !prev.enabled[id] } }));
  }, []);

  const addConnector = useCallback((name: string, detail: string) => {
    const clean = name.trim();
    if (!clean) return;
    setState((prev) => ({
      ...prev,
      connectors: [
        ...prev.connectors,
        {
          id: `custom-${uid().slice(0, 8)}`,
          name: clean,
          detail: detail.trim() || "Custom connector",
          custom: true,
        },
      ],
    }));
  }, []);

  const removeConnector = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      connectors: prev.connectors.filter((connector) => connector.id !== id),
      enabled: Object.fromEntries(Object.entries(prev.enabled).filter(([key]) => key !== id)),
    }));
  }, []);

  const setInstructions = useCallback((instructions: string) => {
    setState((prev) => ({ ...prev, instructions }));
  }, []);

  const setStyle = useCallback((style: StyleId) => {
    setState((prev) => ({ ...prev, style }));
  }, []);

  const setProfile = useCallback((patch: Partial<Profile>) => {
    setState((prev) => ({ ...prev, profile: { ...prev.profile, ...patch } }));
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem(KEY);
    setState(fresh());
  }, []);

  return {
    ...state,
    addProject,
    removeProject,
    renameProject,
    toggleConnector,
    addConnector,
    removeConnector,
    toggleSkill,
    addSkill,
    removeSkill,
    setSettings,
    setInstructions,
    setStyle,
    setProfile,
    reset,
  };
}

export type Workspace = ReturnType<typeof useWorkspace>;
