import type { ChatAdapter, StreamEvent, Usage } from "./types";

const env = import.meta.env;

/** `VITE_MODELS="id:Label,id2:Label2"` lets an operator publish its own list. */
function readModels(): { id: string; label: string }[] {
  const raw = env.VITE_MODELS;
  if (typeof raw === "string" && raw.trim()) {
    return raw.split(",").map((pair) => {
      const trimmed = pair.trim();
      // Split on the LAST colon so ids may contain one, e.g. "llama3.1:8b:Label".
      const split = trimmed.lastIndexOf(":");
      const id = split > 0 ? trimmed.slice(0, split) : trimmed;
      const label = split > 0 ? trimmed.slice(split + 1) : trimmed;
      return { id: id.trim(), label: label.trim() || id.trim() };
    });
  }
  return [
    { id: "gpt-4o-mini", label: "GPT-4o mini" },
    { id: "gpt-4.1-mini", label: "GPT-4.1 mini" },
    { id: "llama3.1:8b", label: "Llama 3.1 8B (local)" },
    { id: "qwen2.5:14b", label: "Qwen 2.5 14B (local)" },
  ];
}

/**
 * Talks to the bundled `/api/chat` route, which speaks the OpenAI chat
 * completions stream. Any server that emits that format works unchanged.
 */
export const openAICompatible: ChatAdapter = {
  id: "openai-compatible",
  label: env.VITE_PROVIDER_LABEL ?? "OpenAI-compatible",
  models: readModels(),
  defaultModel: env.VITE_MODEL ?? "gpt-4o-mini",

  async *stream({ messages, model, signal, modes }) {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model,
        modes,
        messages: messages
          .filter((m) => m.role !== "system" || m.content.trim() !== "")
          .map((m) => ({ role: m.role, content: m.content })),
      }),
      signal,
    });

    if (!res.ok || !res.body) {
      const text = await res.text().catch(() => "");
      yield { type: "error", message: text || `Request failed (${res.status})` };
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let cut = buffer.indexOf("\n\n");
      while (cut !== -1) {
        const chunk = buffer.slice(0, cut);
        buffer = buffer.slice(cut + 2);
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          const event = parseEvent(payload);
          if (event) yield event;
        }
        cut = buffer.indexOf("\n\n");
      }
    }
  },
};

function parseEvent(payload: string): StreamEvent | null {
  try {
    const data = JSON.parse(payload) as {
      delta?: string;
      done?: boolean;
      usage?: Usage;
      error?: string;
    };
    if (typeof data.error === "string") return { type: "error", message: data.error };
    if (data.done) return { type: "done", usage: data.usage };
    if (typeof data.delta === "string") return { type: "delta", text: data.delta };
    return null;
  } catch {
    return null;
  }
}

export const adapter: ChatAdapter = openAICompatible;
