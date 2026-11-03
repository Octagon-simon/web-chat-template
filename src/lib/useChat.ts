import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { adapter } from "./adapter";
import { uid, type Attachment, type ChatMessage, type Thread } from "./types";

const THREADS_KEY = "chat-template.threads.v1";
const MODEL_KEY = "chat-template.model.v1";

let cache: Thread[] | null = null;

/** `?demo=1` seeds one thread so the layout can be reviewed without a backend. */
function sampleThread(): Thread {
  const now = Date.now();
  return {
    id: "demo",
    title: "How does streaming work here?",
    model: adapter.defaultModel,
    updatedAt: now,
    messages: [
      {
        id: "demo-u1",
        role: "user",
        content: "How does streaming work here?",
        createdAt: now - 60_000,
      },
      {
        id: "demo-a1",
        role: "assistant",
        createdAt: now - 59_000,
        model: adapter.defaultModel,
        ttft: 412,
        usage: { completionTokens: 128 },
        content: [
          "Short version: the server emits **SSE** frames, the client appends each delta to one message.",
          "",
          "### The three pieces",
          "",
          "1. `server/index.mjs` proxies `/chat/completions` with `stream: true`.",
          "2. `src/lib/adapter.ts` turns the byte stream into `{ type: \"delta\" }` events.",
          "3. `useChat` appends each delta to the assistant message it already rendered.",
          "",
          "```ts",
          "for await (const event of adapter.stream({ messages, model, signal })) {",
          "  if (event.type === \"delta\") text += event.text;",
          "}",
          "```",
          "",
          "Because the message exists before the first token, the *Stop* button and the",
          "scroll pinning both work from the first frame. Point `OPENAI_BASE_URL` at any",
          "compatible endpoint and nothing above changes.",
        ].join("\n"),
      },
    ],
  };
}

function readThreads(): Thread[] {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(THREADS_KEY);
    if (raw) cache = JSON.parse(raw) as Thread[];
    else if (new URLSearchParams(location.search).has("demo")) cache = [sampleThread()];
    else cache = [];
  } catch {
    cache = [];
  }
  return cache;
}

function titleFrom(text: string): string {
  const line = text.trim().split("\n")[0];
  return line.length > 48 ? `${line.slice(0, 47)}…` : line || "New chat";
}

export function useChat(options: { systemPrompt?: string; projectId?: string | null } = {}) {
  const { systemPrompt = "", projectId = null } = options;
  const [threads, setThreads] = useState<Thread[]>(readThreads);
  const [activeId, setActiveId] = useState<string | null>(() => readThreads()[0]?.id ?? null);
  const [model, setModelState] = useState(
    () => localStorage.getItem(MODEL_KEY) ?? adapter.defaultModel,
  );
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [temporary, setTemporary] = useState(false);
  const [modes, setModes] = useState<Record<string, boolean>>({});
  const abortRef = useRef<AbortController | null>(null);
  const modesRef = useRef(modes);
  const systemRef = useRef(systemPrompt);

  useEffect(() => {
    try {
      localStorage.setItem(
        THREADS_KEY,
        JSON.stringify(threads.filter((thread) => !thread.temporary)),
      );
    } catch {
      // Quota is the realistic failure once screenshot thumbnails pile up.
    }
  }, [threads]);

  useEffect(() => {
    modesRef.current = modes;
  }, [modes]);

  useEffect(() => {
    systemRef.current = systemPrompt;
  }, [systemPrompt]);

  const toggleMode = useCallback((id: string) => {
    setModes((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const setModel = useCallback((next: string) => {
    localStorage.setItem(MODEL_KEY, next);
    setModelState(next);
  }, []);

  const patch = useCallback(
    (threadId: string, messageId: string, next: Partial<ChatMessage>) => {
      setThreads((prev) =>
        prev.map((thread) =>
          thread.id !== threadId
            ? thread
            : {
                ...thread,
                updatedAt: Date.now(),
                messages: thread.messages.map((m) =>
                  m.id === messageId ? { ...m, ...next } : m,
                ),
              },
        ),
      );
    },
    [],
  );

  const run = useCallback(
    async (threadId: string, history: ChatMessage[], chosenModel: string) => {
      const assistant: ChatMessage = {
        id: uid(),
        role: "assistant",
        content: "",
        createdAt: Date.now(),
        model: chosenModel,
      };
      setThreads((prev) =>
        prev.map((thread) =>
          thread.id === threadId
            ? { ...thread, messages: [...history, assistant], updatedAt: Date.now() }
            : thread,
        ),
      );

      const controller = new AbortController();
      abortRef.current = controller;
      setStreamingId(assistant.id);

      const started = performance.now();
      let ttft: number | undefined;
      let text = "";
      let failure: string | undefined;

      const outgoing: ChatMessage[] = systemRef.current
        ? [
            {
              id: `system-${threadId}`,
              role: "system",
              content: systemRef.current,
              createdAt: Date.now(),
            },
            ...history,
          ]
        : history;

      try {
        for await (const event of adapter.stream({
          messages: outgoing,
          model: chosenModel,
          signal: controller.signal,
          modes: modesRef.current,
        })) {
          if (event.type === "delta") {
            ttft ??= Math.round(performance.now() - started);
            text += event.text;
            patch(threadId, assistant.id, { content: text });
          } else if (event.type === "done") {
            if (event.usage) patch(threadId, assistant.id, { usage: event.usage });
          } else {
            failure = event.message;
          }
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          failure = err instanceof Error ? err.message : String(err);
        }
      } finally {
        patch(threadId, assistant.id, { content: text, ttft, error: failure });
        abortRef.current = null;
        setStreamingId(null);
      }
    },
    [patch],
  );

  const send = useCallback(
    (raw: string, attachments: Attachment[] = []) => {
      const content = raw.trim();
      if ((!content && attachments.length === 0) || abortRef.current) return;

      const message: ChatMessage = {
        id: uid(),
        role: "user",
        content,
        createdAt: Date.now(),
        attachments: attachments.length ? attachments : undefined,
      };

      let threadId = activeId;
      let history: ChatMessage[];

      if (!threadId) {
        threadId = uid();
        history = [message];
        const created: Thread = {
          id: threadId,
          title: titleFrom(content || attachments[0]?.name || ""),
          messages: history,
          model,
          projectId: projectId ?? undefined,
          temporary: temporary || undefined,
          updatedAt: Date.now(),
        };
        setThreads((prev) => [created, ...prev]);
        setActiveId(threadId);
      } else {
        const existing = threads.find((t) => t.id === threadId);
        history = [...(existing?.messages ?? []), message];
        setThreads((prev) =>
          prev.map((t) => (t.id === threadId ? { ...t, messages: history } : t)),
        );
      }

      void run(threadId, history, model);
    },
    [activeId, model, projectId, run, temporary, threads],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const regenerate = useCallback(() => {
    const thread = threads.find((t) => t.id === activeId);
    if (!thread || abortRef.current) return;
    const history = [...thread.messages];
    while (history.length && history[history.length - 1].role === "assistant") history.pop();
    if (!history.length) return;
    setThreads((prev) =>
      prev.map((t) => (t.id === thread.id ? { ...t, messages: history } : t)),
    );
    void run(thread.id, history, thread.model ?? model);
  }, [activeId, model, run, threads]);

  const edit = useCallback(
    (messageId: string, content: string) => {
      const thread = threads.find((t) => t.id === activeId);
      if (!thread || abortRef.current) return;
      const index = thread.messages.findIndex((m) => m.id === messageId);
      if (index < 0) return;
      const history = thread.messages.slice(0, index + 1);
      history[index] = { ...history[index], content };
      setThreads((prev) =>
        prev.map((t) => (t.id === thread.id ? { ...t, messages: history } : t)),
      );
      void run(thread.id, history, thread.model ?? model);
    },
    [activeId, model, run, threads],
  );

  const dropTemporary = useCallback(() => {
    setThreads((prev) => prev.filter((thread) => !thread.temporary));
  }, []);

  const newThread = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    dropTemporary();
    setTemporary(false);
    setActiveId(null);
  }, [dropTemporary]);

  const newTemporary = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    dropTemporary();
    setTemporary(true);
    setActiveId(null);
  }, [dropTemporary]);

  const selectThread = useCallback((id: string) => {
    abortRef.current?.abort();
    setTemporary(false);
    setActiveId(id);
  }, []);

  const deleteThread = useCallback(
    (id: string) => {
      setThreads((prev) => prev.filter((t) => t.id !== id));
      setActiveId((current) => (current === id ? null : current));
      setTemporary(false);
    },
    [],
  );

  const renameThread = useCallback((id: string, title: string) => {
    const clean = title.trim();
    if (!clean) return;
    setThreads((prev) =>
      prev.map((thread) => (thread.id === id ? { ...thread, title: clean } : thread)),
    );
  }, []);

  const moveThread = useCallback((id: string, nextProjectId: string | null) => {
    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === id ? { ...thread, projectId: nextProjectId ?? undefined } : thread,
      ),
    );
  }, []);

  const setShared = useCallback((id: string, shared: boolean) => {
    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === id
          ? { ...thread, sharedAt: shared ? (thread.sharedAt ?? Date.now()) : undefined }
          : thread,
      ),
    );
  }, []);

  const togglePin = useCallback((id: string) => {
    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === id
          ? { ...thread, pinnedAt: thread.pinnedAt ? undefined : Date.now() }
          : thread,
      ),
    );
  }, []);

  const setArchived = useCallback((id: string, archived: boolean) => {
    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === id
          ? {
              ...thread,
              archivedAt: archived ? (thread.archivedAt ?? Date.now()) : undefined,
              pinnedAt: archived ? undefined : thread.pinnedAt,
            }
          : thread,
      ),
    );
  }, []);

  const setFeedback = useCallback(
    (threadId: string, messageId: string, value: "up" | "down" | null) => {
      patch(threadId, messageId, { feedback: value ?? undefined });
    },
    [patch],
  );

  const clearAll = useCallback(() => {
    abortRef.current?.abort();
    cache = [];
    localStorage.removeItem(THREADS_KEY);
    setThreads([]);
    setActiveId(null);
  }, []);

  const thread = useMemo(
    () => threads.find((t) => t.id === activeId) ?? null,
    [activeId, threads],
  );

  return {
    threads,
    thread,
    model,
    setModel,
    modes,
    toggleMode,
    streamingId,
    isStreaming: streamingId !== null,
    send,
    stop,
    regenerate,
    edit,
    newThread,
    newTemporary,
    temporary,
    selectThread,
    deleteThread,
    renameThread,
    moveThread,
    setShared,
    togglePin,
    setArchived,
    setFeedback,
    clearAll,
  };
}

export type Chat = ReturnType<typeof useChat>;
