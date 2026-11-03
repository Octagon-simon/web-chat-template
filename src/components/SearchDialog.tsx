import { useEffect, useMemo, useState, type ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Thread } from "@/lib/types";
import { IconSearch } from "./Icons";
import { Dialog } from "./Dialog";

interface SearchDialogProps {
  threads: Thread[];
  onSelect: (id: string) => void;
  onClose: () => void;
}

interface Hit {
  thread: Thread;
  snippet: string;
  titleMatch: boolean;
}

function clip(text: string, at: number, length: number): string {
  const radius = 54;
  const start = Math.max(0, at - radius);
  const end = Math.min(text.length, at + length + radius);
  const body = text.slice(start, end).replace(/\s+/g, " ").trim();
  return `${start > 0 ? "…" : ""}${body}${end < text.length ? "…" : ""}`;
}

function lastContent(thread: Thread): string {
  for (let i = thread.messages.length - 1; i >= 0; i -= 1) {
    if (thread.messages[i].content.trim()) return thread.messages[i].content;
  }
  return "";
}

function find(threads: Thread[], query: string): Hit[] {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return threads
      .slice()
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 8)
      .map((thread) => ({ thread, snippet: lastContent(thread), titleMatch: false }));
  }

  const hits: Hit[] = [];
  for (const thread of threads) {
    const titleMatch = thread.title.toLowerCase().includes(needle);
    let snippet = "";
    for (const message of thread.messages) {
      const at = message.content.toLowerCase().indexOf(needle);
      if (at >= 0) {
        snippet = clip(message.content, at, needle.length);
        break;
      }
    }
    if (!titleMatch && !snippet) continue;
    hits.push({ thread, snippet: snippet || lastContent(thread), titleMatch });
  }
  return hits.sort(
    (a, b) => Number(b.titleMatch) - Number(a.titleMatch) || b.thread.updatedAt - a.thread.updatedAt,
  );
}

function Highlight({ text, query }: { text: string; query: string }) {
  const needle = query.trim();
  if (!needle) return <>{text}</>;
  const haystack = text.toLowerCase();
  const lower = needle.toLowerCase();
  const parts: ReactNode[] = [];
  let cursor = 0;
  let key = 0;
  while (cursor < text.length) {
    const at = haystack.indexOf(lower, cursor);
    if (at < 0) {
      parts.push(text.slice(cursor));
      break;
    }
    if (at > cursor) parts.push(text.slice(cursor, at));
    parts.push(
      <mark key={key++} className="bg-transparent font-semibold text-brand">
        {text.slice(at, at + needle.length)}
      </mark>,
    );
    cursor = at + needle.length;
  }
  return <>{parts}</>;
}

export function SearchDialog({ threads, onSelect, onClose }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const hits = useMemo(() => find(threads, query), [threads, query]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    if (active > hits.length - 1) setActive(Math.max(0, hits.length - 1));
  }, [active, hits.length]);

  useEffect(() => {
    document.getElementById(`search-hit-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const open = (index: number) => {
    const hit = hits[index];
    if (!hit) return;
    onSelect(hit.thread.id);
  };

  return (
    <Dialog
      title="Search chats"
      description="Looks through every title and message stored on this device."
      onClose={onClose}
      wide
    >
      <div className="relative">
        <IconSearch
          size={16}
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-faint"
        />
        <label className="sr-only" htmlFor="chat-search">
          Search chats
        </label>
        <Input
          id="chat-search"
          value={query}
          placeholder="Search chats"
          autoComplete="off"
          className="pl-9"
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActive((value) => Math.min(value + 1, hits.length - 1));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActive((value) => Math.max(value - 1, 0));
            } else if (event.key === "Enter") {
              event.preventDefault();
              open(active);
            }
          }}
        />
      </div>

      <p className="mt-3.5 mb-1.5 text-xs font-semibold tracking-[0.06em] text-faint uppercase">
        {query.trim() ? `${hits.length} result${hits.length === 1 ? "" : "s"}` : "Recent chats"}
      </p>

      <div role="listbox" aria-label="Chat results" className="flex flex-col gap-0.5">
        {hits.length === 0 && (
          <p className="mx-0.5 my-2.5 text-sm text-faint">No chats match “{query.trim()}”.</p>
        )}
        {hits.map((hit, index) => (
          <button
            key={hit.thread.id}
            id={`search-hit-${index}`}
            type="button"
            role="option"
            aria-selected={index === active}
            onMouseEnter={() => setActive(index)}
            onFocus={() => setActive(index)}
            onClick={() => open(index)}
            className={cn(
              "flex w-full flex-col gap-0.5 rounded-lg px-2.5 py-2 text-left",
              index === active && "bg-active",
            )}
          >
            <span className="truncate text-sm font-medium text-foreground">
              <Highlight text={hit.thread.title} query={query} />
            </span>
            <span className="truncate text-xs text-muted-foreground">
              <Highlight text={hit.snippet} query={query} />
            </span>
          </button>
        ))}
      </div>
    </Dialog>
  );
}
