import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Thread } from "@/lib/types";
import type { Project } from "@/lib/workspace";
import { IconCheck, IconFolder, IconPencil, IconPlus, IconTrash } from "../Icons";
import { IconButton } from "../icon-button";
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
        <span className="text-xs text-faint max-[560px]:w-full">
          {projects.length} project{projects.length === 1 ? "" : "s"}
        </span>
      }
    >
      <Card className="flex-row flex-wrap items-center gap-2.5 rounded-2xl border-border-soft p-4 max-[560px]:flex-col max-[560px]:items-stretch">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!name.trim()) return;
            onCreate(name);
            setName("");
          }}
          className="flex flex-1 flex-wrap items-center gap-2.5"
        >
          <div
            aria-hidden="true"
            className="grid size-[38px] shrink-0 place-items-center rounded-xl bg-brand-soft text-brand max-[560px]:order-1"
          >
            <IconFolder size={20} />
          </div>
          <label className="sr-only" htmlFor="new-project-name">
            Project name
          </label>
          <Input
            id="new-project-name"
            value={name}
            maxLength={60}
            placeholder="New project name"
            onChange={(event) => setName(event.target.value)}
            className="min-w-0 flex-1 max-[560px]:order-2 max-[560px]:basis-full"
          />
          <Button
            type="submit"
            disabled={!name.trim()}
            className="rounded-full max-[560px]:order-3 max-[560px]:w-full"
          >
            <IconPlus size={16} />
            Create project
          </Button>
        </form>
      </Card>

      <button
        type="button"
        onClick={() => onOpen(null)}
        className={cn(
          "flex items-center gap-3 rounded-xl border border-border-soft bg-card px-4 py-3 text-left transition-colors hover:bg-hover",
          activeProjectId === null && "border-brand/40 bg-brand-soft hover:bg-brand-soft",
        )}
      >
        <span
          aria-hidden="true"
          className="grid size-[34px] shrink-0 place-items-center rounded-[10px] bg-hover text-muted-foreground"
        >
          <IconFolder size={18} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="block text-sm font-medium">All chats</span>
          <span className="block text-xs text-faint">
            {loose} chat{loose === 1 ? "" : "s"} outside a project
          </span>
        </span>
        {activeProjectId === null ? (
          <IconCheck size={16} className="text-brand" />
        ) : (
          <span className="text-xs text-faint">Open</span>
        )}
      </button>

      {projects.length === 0 ? (
        <EmptyCard
          title="No projects yet"
          detail="Create one above, then every new chat started inside it carries the project."
        />
      ) : (
        <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(280px,1fr))] max-[860px]:grid-cols-1">
          {projects.map((project) => {
            const meta = counts.get(project.id);
            const isEditing = editing === project.id;
            return (
              <article
                key={project.id}
                className={cn(
                  "flex flex-col gap-3 rounded-2xl border border-border-soft bg-card p-4 transition-colors",
                  project.id === activeProjectId && "border-brand/40",
                )}
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className="grid size-[38px] shrink-0 place-items-center rounded-xl text-base font-semibold text-white"
                    style={{ background: project.color }}
                  >
                    {project.name.slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <Input
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
                        className="h-auto px-2 py-0.5 text-sm"
                      />
                    ) : (
                      <h2 className="mt-0 mb-0.5 truncate text-base font-semibold">{project.name}</h2>
                    )}
                    <span className="block text-xs text-faint">
                      {meta?.count ?? 0} chat{(meta?.count ?? 0) === 1 ? "" : "s"}
                      {meta?.last ? ` · active ${relative(meta.last)}` : ""}
                    </span>
                  </div>
                  <IconButton
                    label={`Rename ${project.name}`}
                    tooltip={false}
                    onClick={() => {
                      setEditing(project.id);
                      setDraft(project.name);
                    }}
                    className="size-7 rounded-md max-[860px]:size-10"
                  >
                    <IconPencil size={15} />
                  </IconButton>
                  {confirming === project.id ? (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="shrink-0 rounded-full"
                      aria-label={`Delete ${project.name}`}
                      onClick={() => {
                        setConfirming(null);
                        onRemove(project.id);
                      }}
                    >
                      Sure?
                    </Button>
                  ) : (
                    <IconButton
                      label={`Delete ${project.name}`}
                      tooltip={false}
                      onClick={() => setConfirming(project.id)}
                      className="size-7 rounded-md text-faint hover:text-destructive max-[860px]:size-10"
                    >
                      <IconTrash size={15} />
                    </IconButton>
                  )}
                </div>
                <div className="mt-auto flex flex-wrap gap-2">
                  <Button
                    type="button"
                    className="rounded-full"
                    onClick={() => onOpen(project.id)}
                  >
                    Open project
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => onNewChat(project.id)}
                  >
                    New chat
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </Page>
  );
}
