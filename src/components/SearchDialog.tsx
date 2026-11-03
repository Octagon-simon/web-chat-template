import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { Thread } from "../lib/types";
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
    parts.push(<mark key={key++}>{text.slice(at, at + needle.length)}</mark>);
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
      <div className="search-field">
        <IconSearch size={16} />
        <label className="sr-only" htmlFor="chat-search">
          Search chats
        </label>
        <input
          id="chat-search"
          className="input"
          data-autofocus
          value={query}
          placeholder="Search chats"
          autoComplete="off"
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

      <p className="search-count">
        {query.trim() ? `${hits.length} result${hits.length === 1 ? "" : "s"}` : "Recent chats"}
      </p>

      <div className="search-list" role="listbox" aria-label="Chat results">
        {hits.length === 0 && <p className="empty-note">No chats match “{query.trim()}”.</p>}
        {hits.map((hit, index) => (
          <button
            key={hit.thread.id}
            id={`search-hit-${index}`}
            type="button"
            role="option"
            aria-selected={index === active}
            className="search-item"
            onMouseEnter={() => setActive(index)}
            onFocus={() => setActive(index)}
            onClick={() => open(index)}
          >
            <span className="title">
              <Highlight text={hit.thread.title} query={query} />
            </span>
            <span className="snippet">
              <Highlight text={hit.snippet} query={query} />
            </span>
          </button>
        ))}
      </div>
    </Dialog>
  );
}
