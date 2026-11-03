import { useMemo } from "react";
import type { Project, Profile } from "../lib/workspace";
import type { Thread } from "../lib/types";
import {
  IconArrowLeft,
  IconChevron,
  IconCog,
  IconFolder,
  IconGhost,
  IconMore,
  IconPanel,
  IconPhone,
  IconPlug,
  IconPlus,
  IconSearch,
  IconSliders,
  IconSparkles,
} from "./Icons";

interface SidebarProps {
  threads: Thread[];
  activeId: string | null;
  onNew: () => void;
  onNewTemporary: () => void;
  temporary: boolean;
  onSelect: (id: string) => void;
  onOpenThread: (id: string) => void;
  onClose: () => void;
  brand: string;
  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (id: string | null) => void;
  onOpenSearch: () => void;
  onOpenProjects: () => void;
  onOpenConnectors: () => void;
  onOpenCustomize: () => void;
  onOpenSkills: () => void;
  onOpenSettings: () => void;
  onOpenMobile: () => void;
  profile: Profile;
  connectorsOn: number;
  skillsOn: number;
}

function groupLabel(timestamp: number): string {
  const now = new Date();
  const then = new Date(timestamp);
  const day = 86_400_000;
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  if (timestamp >= startOfToday) return "Today";
  if (timestamp >= startOfToday - day) return "Yesterday";
  if (timestamp >= startOfToday - 7 * day) return "Previous 7 days";
  if (then.getFullYear() === now.getFullYear()) return "Earlier";
  return String(then.getFullYear());
}

function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

export function Sidebar({
  threads,
  activeId,
  onNew,
  onNewTemporary,
  temporary,
  onSelect,
  onOpenThread,
  onClose,
  brand,
  projects,
  activeProject,
  onSelectProject,
  onOpenSearch,
  onOpenProjects,
  onOpenConnectors,
  onOpenCustomize,
  onOpenSkills,
  onOpenSettings,
  onOpenMobile,
  profile,
  connectorsOn,
  skillsOn,
}: SidebarProps) {
  const groups = useMemo(() => {
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

  return (
    <aside className="rail">
      <div className="rail-top">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-name">{brand}</span>
        </div>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Hide sidebar">
          <IconPanel />
        </button>
      </div>

      <button type="button" className="new-chat" onClick={onNew}>
        <IconPlus />
        <span>New chat</span>
        <kbd>⌘J</kbd>
      </button>

      <button
        type="button"
        className={temporary ? "new-chat is-temporary is-active" : "new-chat is-temporary"}
        onClick={onNewTemporary}
        aria-pressed={temporary}
      >
        <IconGhost />
        <span>Temporary chat</span>
        {temporary ? <span className="temporary-flag">On</span> : null}
      </button>

      <nav className="rail-nav" aria-label="Workspace">
        <button type="button" className="nav-row" onClick={onOpenSearch}>
          <IconSearch size={17} />
          <span className="nav-label">Search chats</span>
          <kbd>⌘K</kbd>
        </button>
        <button type="button" className="nav-row" onClick={onOpenProjects}>
          <IconFolder size={17} />
          <span className="nav-label">Projects</span>
          {projects.length > 0 && <span className="nav-count">{projects.length}</span>}
        </button>
        <button type="button" className="nav-row" onClick={onOpenSkills}>
          <IconSparkles size={17} />
          <span className="nav-label">Skills</span>
          {skillsOn > 0 && <span className="nav-count">{skillsOn}</span>}
        </button>
        <button type="button" className="nav-row" onClick={onOpenConnectors}>
          <IconPlug size={17} />
          <span className="nav-label">Connectors</span>
          {connectorsOn > 0 && <span className="nav-count">{connectorsOn}</span>}
        </button>
        <button type="button" className="nav-row" onClick={onOpenCustomize}>
          <IconSliders size={17} />
          <span className="nav-label">Customize</span>
        </button>
        <button type="button" className="nav-row" onClick={onOpenMobile}>
          <IconPhone size={17} />
          <span className="nav-label">Mobile app</span>
          <span className="nav-badge">New</span>
        </button>
        <button type="button" className="nav-row" onClick={onOpenSettings}>
          <IconCog size={17} />
          <span className="nav-label">Settings</span>
        </button>
      </nav>

      {activeProject && (
        <div className="project-banner">
          <button
            type="button"
            className="banner-back"
            onClick={() => onSelectProject(null)}
            aria-label="Back to all chats"
          >
            <IconArrowLeft size={15} />
          </button>
          <span className="project-dot" style={{ background: activeProject.color }} />
          <span className="name">{activeProject.name}</span>
        </div>
      )}

      <nav className="rail-list" aria-label="Chat history">
        {groups.length === 0 && (
          <p className="rail-empty">
            {activeProject ? "No chats in this project yet." : "No chats yet."}
          </p>
        )}
        {groups.map(([label, items]) => (
          <section key={label} className="rail-group">
            <h2>{label}</h2>
            <ul>
              {items.map((thread) => (
                <li key={thread.id}>
                  <button
                    type="button"
                    className={thread.id === activeId ? "thread-link is-active" : "thread-link"}
                    onClick={() => onSelect(thread.id)}
                    aria-current={thread.id === activeId ? "true" : undefined}
                  >
                    <span className="thread-title">{thread.title}</span>
                    {thread.sharedAt ? <span className="thread-shared">Shared</span> : null}
                  </button>
                  <button
                    type="button"
                    className="thread-more"
                    aria-label={`Options for ${thread.title}`}
                    onClick={() => onOpenThread(thread.id)}
                  >
                    <IconMore size={15} />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </nav>

      <button type="button" className="account" onClick={onOpenSettings}>
        <span className="avatar" aria-hidden="true">
          {initials(profile.name)}
        </span>
        <span className="account-text">
          <span className="account-name">{profile.name || "Workspace owner"}</span>
        </span>
        <IconChevron size={16} />
      </button>
    </aside>
  );
}