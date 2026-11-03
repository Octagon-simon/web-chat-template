import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { formatBytes } from "../lib/attachments";
import { Markdown } from "../lib/markdown";
import type { Attachment, ChatMessage, Thread } from "../lib/types";
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

//browser speech synthesis; no key and no network
function useReadAloud() {
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const toggle = useCallback(
    (id: string, text: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      if (speakingId === id) {
        window.speechSynthesis.cancel();
        setSpeakingId(null);
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      window.speechSynthesis.speak(utterance);
      setSpeakingId(id);
    },
    [speakingId],
  );

  return { speakingId, toggle };
}

function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = useCallback((text: string) => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    });
  }, []);
  return { copied, copy };
}

function AttachmentList({ items }: { items: Attachment[] }) {
  return (
    <div className="msg-attachments">
      {items.map((item) =>
        item.preview ? (
          <a
            key={item.id}
            className="msg-attach is-image"
            href={item.preview}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
          >
            <img src={item.preview} alt={item.name} />
            <span>{item.name}</span>
          </a>
        ) : (
          <span key={item.id} className="msg-attach">
            {item.kind === "screenshot" ? <IconCamera size={15} /> : <IconFile size={15} />}
            <span className="msg-attach-text">
              <span className="msg-attach-name">{item.name}</span>
              <span className="msg-attach-size">{formatBytes(item.size)}</span>
            </span>
          </span>
        ),
      )}
    </div>
  );
}

function UserRow({ message, onEdit }: { message: ChatMessage; onEdit: (id: string, text: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);
  const { copied, copy } = useCopy();
  const input = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    if (!editing) return;
    const el = input.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 320)}px`;
  }, [editing, draft]);

  const save = () => {
    const next = draft.trim();
    if (!next) return;
    setEditing(false);
    if (next !== message.content) onEdit(message.id, next);
  };

  return (
    <div className="row row-user">
      <div className="bubble-stack">
        {editing ? (
          <div className="bubble is-editing">
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
            />
            <div className="edit-controls">
              <button type="button" className="ghost" onClick={() => setEditing(false)}>
                Cancel
              </button>
              <button type="button" className="primary" onClick={save}>
                Send
              </button>
            </div>
          </div>
        ) : (
          <div className="bubble">
            {message.attachments?.length ? <AttachmentList items={message.attachments} /> : null}
            {message.content ? <span className="bubble-text">{message.content}</span> : null}
          </div>
        )}
        <div className="actions actions-user">
          <button type="button" onClick={() => copy(message.content)} aria-label="Copy message">
            {copied ? <IconCheck /> : <IconCopy />}
          </button>
          <button type="button" onClick={() => setEditing((v) => !v)} aria-label="Edit message">
            <IconPencil />
          </button>
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
  const { copied, copy } = useCopy();
  const meta = showMeta
    ? [
        message.model,
        message.ttft !== undefined ? `${message.ttft} ms to first token` : null,
        message.usage?.completionTokens ? `${message.usage.completionTokens} tokens` : null,
      ].filter(Boolean)
    : [];

  return (
    <div className="row row-assistant">
      {message.error && <p className="row-error">{message.error}</p>}

      {message.content ? (
        <Markdown source={message.content} />
      ) : (
        <div className="thinking" aria-label="Waiting for the model">
          <span />
          <span />
          <span />
        </div>
      )}

      {streaming && message.content && <span className="caret" aria-hidden="true" />}

      {!streaming && message.content && (
        <div className="assistant-foot">
          <div className="actions">
            <button type="button" onClick={() => copy(message.content)} aria-label="Copy response">
              {copied ? <IconCheck /> : <IconCopy />}
            </button>
            <button
              type="button"
              className={message.feedback === "up" ? "is-on" : undefined}
              aria-label="Good response"
              aria-pressed={message.feedback === "up"}
              onClick={() => onFeedback(message.feedback === "up" ? null : "up")}
            >
              <IconThumbUp />
            </button>
            <button
              type="button"
              className={message.feedback === "down" ? "is-on" : undefined}
              aria-label="Bad response"
              aria-pressed={message.feedback === "down"}
              onClick={() => onFeedback(message.feedback === "down" ? null : "down")}
            >
              <IconThumbDown />
            </button>
            <button
              type="button"
              className={speaking ? "is-on" : undefined}
              aria-label={speaking ? "Stop reading" : "Read aloud"}
              aria-pressed={speaking}
              onClick={onRead}
            >
              <IconVolume />
            </button>
            {canRegenerate && (
              <button type="button" onClick={onRegenerate} aria-label="Regenerate response">
                <IconReload />
              </button>
            )}
          </div>
          {meta.length > 0 && <span className="meta">{meta.join(" · ")}</span>}
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
  const scroller = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(true);
  const { speakingId, toggle } = useReadAloud();
  const messages = thread?.messages ?? [];

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const onScroll = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      setPinned(distance < 96);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useLayoutEffect(() => {
    const el = scroller.current;
    if (el && pinned) el.scrollTop = el.scrollHeight;
  }, [messages, streamingId, pinned]);

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");

  return (
    <div className="thread-wrap">
      <div className="thread" ref={scroller}>
        <div className="thread-inner">
          {messages.length === 0 ? (
            children
          ) : (
            messages.map((message) =>
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
            )
          )}
        </div>
      </div>

      {!pinned && messages.length > 0 && (
        <button
          type="button"
          className="jump"
          onClick={() => {
            const el = scroller.current;
            if (el) el.scrollTop = el.scrollHeight;
            setPinned(true);
          }}
        >
          <IconArrowDown />
          Jump to latest
        </button>
      )}
    </div>
  );
}