/**
 * Zero-dependency chat server.
 *
 *   POST /api/chat  -> proxies an OpenAI-compatible /chat/completions stream
 *   GET  *          -> serves ./dist (SPA fallback)
 *
 * It also runs without any configuration: with no API key it streams a local
 * demo reply so `npm run dev` works on a fresh clone.
 */
import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const PORT = Number(process.env.PORT ?? 8787);
const BASE = (process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/+$/, "");
const KEY = process.env.OPENAI_API_KEY ?? "";
const DEFAULT_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
const SYSTEM_PROMPT = process.env.SYSTEM_PROMPT ?? "";
const MAX_BODY = 2 * 1024 * 1024;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", ...headers });
  res.end(body);
}

function readBody(req) {
  return new Promise((ok, fail) => {
    let size = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        fail(new Error("Body too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => ok(Buffer.concat(chunks).toString("utf8")));
    req.on("error", fail);
  });
}

function openStream(res) {
  res.writeHead(200, {
    "content-type": "text/event-stream; charset=utf-8",
    "cache-control": "no-cache, no-transform",
    connection: "keep-alive",
    "x-accel-buffering": "no",
  });
  res.flushHeaders?.();
}

function emit(res, payload) {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

const DEMO = [
  "**Demo mode.** No `OPENAI_API_KEY` is set, so this reply is streamed from the server itself.\n\n",
  "Point the app at any OpenAI-compatible endpoint:\n\n",
  "```bash\nOPENAI_BASE_URL=http://localhost:11434/v1\nOPENAI_API_KEY=ollama\nOPENAI_MODEL=llama3.1:8b\nnpm run dev\n```\n\n",
  "That covers Ollama, LM Studio, vLLM, TGI, Groq, Together, Fireworks and the hosted APIs. ",
  "The UI does not care which one answers; it only consumes the stream.",
];

async function demoAnswer(res) {
  for (const block of DEMO) {
    for (let i = 0; i < block.length; i += 4) {
      if (res.destroyed) return;
      emit(res, { delta: block.slice(i, i + 4) });
      await new Promise((r) => setTimeout(r, 14));
    }
  }
  emit(res, { done: true, usage: { completionTokens: 96 } });
  res.end();
}

async function proxyAnswer(res, { messages, model }) {
  const controller = new AbortController();
  res.on("close", () => controller.abort());

  const upstream = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      stream_options: { include_usage: true },
    }),
    signal: controller.signal,
  });

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    emit(res, { error: detail || `Upstream returned ${upstream.status}` });
    res.end();
    return;
  }

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let usage;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let cut = buffer.indexOf("\n\n");
    while (cut !== -1) {
      const frame = buffer.slice(0, cut);
      buffer = buffer.slice(cut + 2);
      for (const line of frame.split("\n")) {
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (!data || data === "[DONE]") continue;
        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) emit(res, { delta });
          if (parsed.usage) usage = parsed.usage;
        } catch {
          // Upstream keep-alive or partial frame; ignore.
        }
      }
      cut = buffer.indexOf("\n\n");
    }
  }

  emit(res, {
    done: true,
    usage: usage && {
      promptTokens: usage.prompt_tokens,
      completionTokens: usage.completion_tokens,
    },
  });
  res.end();
}

async function handleChat(req, res) {
  let body;
  try {
    body = JSON.parse(await readBody(req));
  } catch {
    send(res, 400, JSON.stringify({ error: "Invalid JSON body" }));
    return;
  }

  const incoming = Array.isArray(body.messages) ? body.messages : [];
  const messages = incoming
    .filter((m) => m && typeof m.content === "string")
    .slice(-40)
    .map((m) => ({ role: m.role, content: m.content }));

  if (SYSTEM_PROMPT) messages.unshift({ role: "system", content: SYSTEM_PROMPT });
  const model = typeof body.model === "string" && body.model ? body.model : DEFAULT_MODEL;

  openStream(res);

  try {
    if (!KEY) await demoAnswer(res);
    else await proxyAnswer(res, { messages, model });
  } catch (error) {
    if (!res.writableEnded) {
      emit(res, { error: error instanceof Error ? error.message : String(error) });
      res.end();
    }
  }
}

async function serveStatic(req, res) {
  const url = new URL(req.url ?? "/", "http://localhost");
  const requested = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
  let file = join(ROOT, "dist", requested);

  if (!file.startsWith(join(ROOT, "dist"))) {
    send(res, 403, JSON.stringify({ error: "Forbidden" }));
    return;
  }

  let info = await stat(file).catch(() => null);
  if (!info || info.isDirectory()) {
    file = join(ROOT, "dist", "index.html");
    info = await stat(file).catch(() => null);
  }

  if (!info) {
    send(res, 404, JSON.stringify({ error: "Not built. Run `npm run build` first." }));
    return;
  }

  res.writeHead(200, {
    "content-type": MIME[extname(file)] ?? "application/octet-stream",
    "cache-control": file.endsWith("index.html") ? "no-cache" : "public, max-age=31536000, immutable",
  });
  createReadStream(file).pipe(res);
}

createServer((req, res) => {
  if (req.method === "POST" && req.url?.startsWith("/api/chat")) {
    void handleChat(req, res);
    return;
  }
  if (req.method === "GET" && req.url?.startsWith("/api/health")) {
    send(res, 200, JSON.stringify({ ok: true, configured: Boolean(KEY) }));
    return;
  }
  if (req.method === "GET" || req.method === "HEAD") {
    void serveStatic(req, res);
    return;
  }
  send(res, 405, JSON.stringify({ error: "Method not allowed" }));
}).listen(PORT, () => {
  console.log(`chat server on http://localhost:${PORT}  (${KEY ? BASE : "demo mode, no API key"})`);
});
