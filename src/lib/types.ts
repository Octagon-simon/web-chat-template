/**
 * Transport-agnostic chat contract. Swap `ChatAdapter` and the UI works
 * against any provider: vLLM, Ollama, LM Studio, Groq, Together, Fireworks,
 * or a hosted API.
 */

export type Role = "user" | "assistant" | "system";

export type ThemePref = "system" | "light" | "dark";

export interface Usage {
  promptTokens?: number;
  completionTokens?: number;
}

export interface Attachment {
  id: string;
  name: string;
  kind: "image" | "file" | "screenshot";
  size: number;
  /** Small data-URL thumbnail; stripped for non-images. */
  preview?: string;
}

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  model?: string;
  /** Ms from request start to the first streamed token. */
  ttft?: number;
  usage?: Usage;
  error?: string;
  attachments?: Attachment[];
  feedback?: "up" | "down";
}

export interface Thread {
  id: string;
  title: string;
  messages: ChatMessage[];
  model?: string;
  updatedAt: number;
  projectId?: string;
  /** Set when the share link is turned on. */
  sharedAt?: number;
  pinnedAt?: number;
  archivedAt?: number;
  /** Never written to storage; dropped when you start another chat. */
  temporary?: boolean;
}

export interface ModelInfo {
  id: string;
  label: string;
}

export type StreamEvent =
  | { type: "delta"; text: string }
  | { type: "done"; usage?: Usage }
  | { type: "error"; message: string };

export interface StreamArgs {
  messages: ChatMessage[];
  model: string;
  signal: AbortSignal;
  /** Optional toggles (thinking, search, tools) the operator exposes. */
  modes?: Record<string, boolean>;
}

export interface ChatAdapter {
  id: string;
  label: string;
  models: ModelInfo[];
  defaultModel: string;
  stream(args: StreamArgs): AsyncGenerator<StreamEvent, void, unknown>;
}

export function uid(): string {
  return crypto.randomUUID();
}
