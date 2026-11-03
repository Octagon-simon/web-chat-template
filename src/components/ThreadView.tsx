import { useEffect, useRef, useState } from "react";

import { IconButton } from "./icon-button";
import { formatBytes } from "@/lib/attachments";
import { useAutoResize } from "@/hooks/use-auto-resize";
import { useClipboard } from "@/hooks/use-clipboard";
import { useReadAloud } from "@/hooks/use-read-aloud";
import { useScrollAnchor } from "@/hooks/use-scroll-anchor";
import { Markdown } from "@/lib/markdown";
import { cn } from "@/lib/utils";
import type { Attachment, ChatMessage, Thread } from "@/lib/types";
import {
  IconArrowDown,
  IconCamera,
  IconCheck,
  IconCopy,
  IconFile,
  IconPencil,
  IconReload,
  IconThumbDown,
  IconThumbUp,
  IconVolume,
} from "./Icons";

const actionButton =
  "size-7 rounded-md text-faint hover:text-foreground max-[860px]:size-10";

function AttachmentList({ items }: { items: Attachment[] }) {
  return (
    <div className="mb-1.5 flex flex-wrap gap-1.5">
      {items.map((item) =>
        item.preview ? (
          <a
            key={item.id}
            href={item.preview}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="block max-w-[180px] overflow-hidden rounded-xl border border-border-soft bg-card"
          >
            <img src={item.preview} alt={item.name} className="block max-h-[140px] w-full object-cover" />
            <span className="block truncate px-2 py-1 text-xs text-muted-foreground">
              {item.name}
            </span>
          </a>
        ) : (
          <span
            key={item.id}
            className="flex max-w-[240px] items-center gap-2 rounded-xl border border-border-soft bg-card px-2.5 py-1.5"
          >
            {item.kind === "screenshot" ? <IconCamera size={15} /> : <IconFile size={15} />}
            <span className="min-w-0">
              <span className="block truncate text-xs font-medium">{item.name}</span>
              <span className="block text-xs text-faint">{formatBytes(item.size)}</span>
            </span>
          </span>
        ),
      )}
    </div>
  );
}

function UserRow({
  message,
  onEdit,
}: {
  message: ChatMessage;
  onEdit: (id: string, text: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);
  const { copied, copy } = useClipboard();
  const input = useRef<HTMLTextAreaElement>(null);

  useAutoResize(input, [editing, draft], 320);

  useEffect(() => {
    if (!editing) return;
    const el = input.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }, [editing]);

  const save = () => {
    const next = draft.trim();
    if (!next) return;
    setEditing(false);
    if (next !== message.content) onEdit(message.id, next);
  };

  return (
    <div className="group/row mt-6 mb-1.5 flex animate-rise justify-end">
      <div className="relative flex max-w-[82%] flex-col items-end max-[860px]:max-w-[88%]">
        {editing ? (
          <div className="w-[min(560px,100%)] rounded-bubble bg-card px-3 py-2.5 shadow-card">
            <textarea
              ref={input}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  save();
                }
                if (event.key === "Escape") setEditing(false);
              }}
              className="w-full resize-none border-0 bg-transparent p-0 text-base leading-6 text-foreground outline-none"
            />
            <div className="mt-1.5 flex justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-hover max-[860px]:min-h-10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                className="rounded-full bg-send px-3 py-1.5 text-sm font-medium text-send-foreground max-[860px]:min-h-10"
              >
                Send
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-bubble bg-bubble px-4 py-2.5 text-base leading-6 whitespace-pre-wrap text-bubble-foreground [overflow-wrap:anywhere]">
            {message.attachments?.length ? <AttachmentList items={message.attachments} /> : null}
            {message.content ? <span>{message.content}</span> : null}
          </div>
        )}
        <div className="mt-1 flex gap-0.5 opacity-0 transition-opacity group-hover/row:opacity-100 focus-within:opacity-100 max-[860px]:opacity-100 [@media(hover:none)]:opacity-100">
          <IconButton
            label="Copy message"
            onClick={() => copy(message.content)}
            className={actionButton}
          >
            {copied ? <IconCheck /> : <IconCopy />}
          </IconButton>
          <IconButton
            label="Edit message"
            onClick={() => setEditing((value) => !value)}
            className={actionButton}
          >
            <IconPencil />
          </IconButton>
        </div>
      </div>
    </div>
  );
}

function AssistantRow({
  message,
  streaming,
  onRegenerate,
  onFeedback,
  onRead,
  speaking,
  canRegenerate,
  showMeta,
}: {
  message: ChatMessage;
  streaming: boolean;
  onRegenerate: () => void;
  onFeedback: (value: "up" | "down" | null) => void;
  onRead: () => void;
  speaking: boolean;
  canRegenerate: boolean;
  showMeta: boolean;
}) {
  const { copied, copy } = useClipboard();
  const meta = showMeta
    ? [
        message.model,
        message.ttft !== undefined ? `${message.ttft} ms to first token` : null,
        message.usage?.completionTokens ? `${message.usage.completionTokens} tokens` : null,
      ].filter(Boolean)
    : [];

  return (
    <div className="group/row mt-2.5 mb-[30px] animate-rise">
      {message.error && (
        <p className="mt-0 mb-3 rounded-xl border border-destructive/25 bg-destructive/8 px-3.5 py-2.5 text-sm leading-[21px] text-destructive">
          {message.error}
        </p>
      )}

      {message.content ? (
        <Markdown source={message.content} />
      ) : (
        <div className="flex gap-1 py-1.5" aria-label="Waiting for the model">
          <span className="size-1.5 animate-typing rounded-full bg-faint" />
          <span className="size-1.5 animate-typing rounded-full bg-faint [animation-delay:150ms]" />
          <span className="size-1.5 animate-typing rounded-full bg-faint [animation-delay:300ms]" />
        </div>
      )}

      {streaming && message.content && (
        <span aria-hidden="true" className="ml-1 inline-block size-2 animate-blink rounded-full bg-foreground align-middle" />
      )}

      {!streaming && message.content && (
        <div className="mt-0.5 flex min-h-7 items-center gap-3">
          <div className="flex gap-0.5 opacity-0 transition-opacity group-hover/row:opacity-100 focus-within:opacity-100 max-[860px]:opacity-100 [@media(hover:none)]:opacity-100">
            <IconButton
              label="Copy response"
              onClick={() => copy(message.content)}
              className={actionButton}
            >
              {copied ? <IconCheck /> : <IconCopy />}
            </IconButton>
            <IconButton
              label="Good response"
              active={message.feedback === "up"}
              aria-pressed={message.feedback === "up"}
              onClick={() => onFeedback(message.feedback === "up" ? null : "up")}
              className={cn(actionButton, message.feedback === "up" && "text-brand")}
            >
              <IconThumbUp />
            </IconButton>
            <IconButton
              label="Bad response"
              active={message.feedback === "down"}
              aria-pressed={message.feedback === "down"}
              onClick={() => onFeedback(message.feedback === "down" ? null : "down")}
              className={cn(actionButton, message.feedback === "down" && "text-brand")}
            >
              <IconThumbDown />
            </IconButton>
            <IconButton
              label={speaking ? "Stop reading" : "Read aloud"}
              active={speaking}
              aria-pressed={speaking}
              onClick={onRead}
              className={cn(actionButton, speaking && "text-brand")}
            >
              <IconVolume />
            </IconButton>
            {canRegenerate && (
              <IconButton
                label="Regenerate response"
                onClick={onRegenerate}
                className={actionButton}
              >
                <IconReload />
              </IconButton>
            )}
          </div>
          {meta.length > 0 && (
            <span className="text-xs text-faint opacity-0 transition-opacity group-hover/row:opacity-100 max-[860px]:opacity-100">
              {meta.join(" · ")}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

interface ThreadViewProps {
  thread: Thread | null;
  streamingId: string | null;
  onRegenerate: () => void;
  onEdit: (id: string, text: string) => void;
  onFeedback: (id: string, value: "up" | "down" | null) => void;
  showMeta: boolean;
  children: React.ReactNode;
}

export function ThreadView({
  thread,
  streamingId,
  onRegenerate,
  onEdit,
  onFeedback,
  showMeta,
  children,
}: ThreadViewProps) {
  const messages = thread?.messages ?? [];
  const { ref, pinned, toBottom } = useScrollAnchor(messages, streamingId);
  const { speakingId, toggle } = useReadAloud();

  const lastAssistant = [...messages].reverse().find((message) => message.role === "assistant");

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        ref={ref}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:thin]"
      >
        <div className="mx-auto flex min-h-full w-full max-w-column flex-col px-4 pt-7 pb-2 max-[860px]:px-3.5 max-[860px]:pt-4 max-[860px]:pb-1">
          {messages.length === 0
            ? children
            : messages.map((message) =>
                message.role === "user" ? (
                  <UserRow key={message.id} message={message} onEdit={onEdit} />
                ) : (
                  <AssistantRow
                    key={message.id}
                    message={message}
                    streaming={message.id === streamingId}
                    onRegenerate={onRegenerate}
                    onFeedback={(value) => onFeedback(message.id, value)}
                    onRead={() => toggle(message.id, message.content)}
                    speaking={speakingId === message.id}
                    canRegenerate={message.id === lastAssistant?.id && streamingId === null}
                    showMeta={showMeta}
                  />
                ),
              )}
        </div>
      </div>

      {!pinned && messages.length > 0 && (
        <button
          type="button"
          onClick={toBottom}
          className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-sm text-muted-foreground shadow-[0_4px_16px_rgba(0,0,0,0.1)]"
        >
          <IconArrowDown />
          Jump to latest
        </button>
      )}
    </div>
  );
}
