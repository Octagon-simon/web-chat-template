import { useState } from "react";
import type { Thread } from "../../lib/types";
import type { Project } from "../../lib/workspace";
import { IconCheck, IconFolder, IconPencil, IconPlus, IconTrash } from "../Icons";
import { EmptyCard, Page } from "./Page";

interface ProjectsPageProps {
  projects: Project[];
  threads: Thread[];
  activeProjectId: string | null;
  onOpen: (id: string | null) => void;
  onCreate: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onRemove: (id: string) => void;
  onNewChat: (id: string) => void;
}

function relative(timestamp: number): string {
  const minutes = Math.round((Date.now() - timestamp) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function ProjectsPage({
  projects,
  threads,
  activeProjectId,
  onOpen,
  onCreate,
  onRename,
  onRemove,
  onNewChat,
}: ProjectsPageProps) {
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [confirming, setConfirming] = useState<string | null>(null);

  const counts = new Map<string, { count: number; last: number }>();
  for (const thread of threads) {
    if (!thread.projectId) continue;
    const entry = counts.get(thread.projectId) ?? { count: 0, last: 0 };
    counts.set(thread.projectId, {
      count: entry.count + 1,
      last: Math.max(entry.last, thread.updatedAt),
    });
  }
  const loose = threads.filter((thread) => !thread.projectId).length;

  const commit = (id: string) => {
    onRename(id, draft);
    setEditing(null);
  };

  return (
    <Page
      title="Projects"
      description="Group related chats, share the context, and keep every conversation about one body of work in the same place."
      actions={
        <span className="page-count">
          {projects.length} project{projects.length === 1 ? "" : "s"}
        </span>
      }
    >
      <form
        className="page-card new-project"
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim()) return;
          onCreate(name);
          setName("");
        }}
      >
        <div className="new-project-icon" aria-hidden="true">
          <IconFolder size={20} />
        </div>
        <label className="sr-only" htmlFor="new-project-name">
          Project name
        </label>
        <input
          id="new-project-name"
          className="input"
          value={name}
          maxLength={60}
          placeholder="New project name"
          onChange={(event) => setName(event.target.value)}
        />
        <button type="submit" className="btn btn-primary" disabled={!name.trim()}>
          <IconPlus size={16} />
          Create project
        </button>
      </form>

      <button
        type="button"
        className={activeProjectId === null ? "all-chats is-active" : "all-chats"}
        onClick={() => onOpen(null)}
      >
        <span className="all-chats-icon" aria-hidden="true">
          <IconFolder size={18} />
        </span>
        <span className="grow">
          <span className="title">All chats</span>
          <span className="sub">{loose} chat{loose === 1 ? "" : "s"} outside a project</span>
        </span>
        {activeProjectId === null ? <IconCheck size={16} /> : <span className="sub">Open</span>}
      </button>

      {projects.length === 0 ? (
        <EmptyCard
          title="No projects yet"
          detail="Create one above, then every new chat started inside it carries the project."
        />
      ) : (
        <div className="project-grid">
          {projects.map((project) => {
            const meta = counts.get(project.id);
            const isEditing = editing === project.id;
            return (
              <article
                key={project.id}
                className={project.id === activeProjectId ? "project-card is-active" : "project-card"}
              >
                <div className="project-card-top">
                  <span className="project-swatch" style={{ background: project.color }}>
                    {project.name.slice(0, 1).toUpperCase()}
                  </span>
                  <div className="project-card-name">
                    {isEditing ? (
                      <input
                        className="input is-inline"
                        value={draft}
                        autoFocus
                        maxLength={60}
                        aria-label={`Rename ${project.name}`}
                        onChange={(event) => setDraft(event.target.value)}
                        onBlur={() => commit(project.id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            commit(project.id);
                          }
                          if (event.key === "Escape") setEditing(null);
                        }}
                      />
                    ) : (
                      <h2>{project.name}</h2>
                    )}
                    <span className="sub">
                      {meta?.count ?? 0} chat{(meta?.count ?? 0) === 1 ? "" : "s"}
                      {meta?.last ? ` · active ${relative(meta.last)}` : ""}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label={`Rename ${project.name}`}
                    onClick={() => {
                      setEditing(project.id);
                      setDraft(project.name);
                    }}
                  >
                    <IconPencil size={15} />
                  </button>
                  <button
                    type="button"
                    className={
                      confirming === project.id ? "btn btn-danger is-armed is-tiny" : "icon-btn is-danger"
                    }
                    aria-label={`Delete ${project.name}`}
                    onClick={() => {
                      if (confirming !== project.id) {
                        setConfirming(project.id);
                        return;
                      }
                      setConfirming(null);
                      onRemove(project.id);
                    }}
                  >
                    {confirming === project.id ? "Sure?" : <IconTrash size={15} />}
                  </button>
                </div>
                <div className="project-card-foot">
                  <button type="button" className="btn btn-primary" onClick={() => onOpen(project.id)}>
                    Open project
                  </button>
                  <button type="button" className="btn" onClick={() => onNewChat(project.id)}>
                    New chat
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </Page>
  );
}
