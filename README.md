# Web chat template

A deploy-anywhere chat UI for your own model: one conversation column, a
composer that behaves like a product, streaming that does not flicker, and an
adapter you point at anything that speaks OpenAI chat completions.

The layout is the intersection of what ChatGPT, Claude and DeepSeek ship. The
measurements are in [`docs/`](docs) (`01`–`03` per product, `04` synthesis).

## Demo

Live: https://octagon-simon.github.io/web-chat-template/ (static build, replies
come from the browser, see [Deploy](#github-pages))

https://github.com/user-attachments/assets/cd81e895-bac7-43eb-a78c-bd665f3f3297

## Run

```bash
npm install
npm run dev     # Vite on 5173, API on 8787
```

Without an API key the server streams a local demo reply, so a fresh clone works
immediately. Keep the browser on 5173, since `/api` is proxied from there.

`?demo=1` seeds a sample thread and two projects.
`?panel=login|signup|search|projects|skills|connectors|customize|settings|mobile`
opens that surface on load.

## Build with an agent

This repo ships [`AGENT.md`](AGENT.md), so a coding agent can clone it and scaffold
the product for you: rebrand the shell, wire a model, add a screen, replace
localStorage with a real backend. It states the constraints (Tailwind v4 and shadcn/ui
for everything visual, logic in hooks, 40px controls, light and dark themes), maps
every file, and gives a per-task recipe with the exact seam to edit.

Point your agent at the repo and say what you want:

```text
Clone this repo and read AGENT.md first.

Then turn it into <product name>, a chat UI for <what it does>.
Point it at <endpoint> with model <id>. Keep the layout, change the copy and
colours, and tell me anything you could not verify.
```

Put this repo's URL on the first line if your agent needs a clone target. Swap the
second paragraph for the job you actually want: "add a settings screen for API
keys", "replace localStorage with Postgres", "make the empty state sell the
product". The agent follows the rules in `AGENT.md` and asks at most three
questions before it starts. You do not need to provide a key, because the template
runs in demo mode out of the box.

## Point it at your model

Anything with an OpenAI-compatible `/chat/completions` works: Ollama, LM Studio,
vLLM, llama.cpp, Groq, Together, DeepSeek, OpenAI.

```bash
OPENAI_BASE_URL=http://localhost:11434/v1
OPENAI_API_KEY=ollama
OPENAI_MODEL=llama3.1:8b
VITE_MODELS=llama3.1:8b:Llama 3.1 8B,qwen2.5:14b:Qwen 2.5 14B
```

| Variable | Purpose |
|---|---|
| `OPENAI_BASE_URL` | Upstream endpoint, no trailing slash |
| `OPENAI_API_KEY` | Sent as a bearer token; omit for demo mode |
| `OPENAI_MODEL` | Fallback when the client sends none |
| `SYSTEM_PROMPT` | Prepended to every request |
| `PORT` | API port, defaults to 8787 |
| `VITE_BRAND` / `VITE_HEADLINE` | Rail title / empty-state line |
| `VITE_PLACEHOLDER` / `VITE_DISCLAIMER` / `VITE_SUGGESTIONS` | Composer copy |
| `VITE_MODEL` / `VITE_MODELS` | Default and pickable models |

Only `VITE_` values reach the bundle. Never put a key there.

## Accounts

`?panel=login` and `?panel=signup` are finished screens: split layout, field
validation, password reveal, a pending state, and the same light and dark tokens
as the app. The session lives in `useAuth` under `chat-template.session.v1`, so it
survives a reload, the sidebar menu shows the signed-in email, and both that menu
and Settings can change account or sign out.

Nothing calls out. `signIn(email, name)` in `src/hooks/use-auth.ts` is the seam:
replace its body with your provider request and keep the returned
`{ name, email, plan }`. Google and GitHub say they are stubs when pressed. The
app does not gate on the session, so a fresh clone and `?demo=1` still work
without an account.

## Deploy

```bash
npm run build     # typecheck + bundle into dist/
npm start         # serves dist/ and /api/chat on one port
```

One Node process, and the server has no runtime dependencies of its own. Behind
Nginx or Cloudflare, disable response buffering for `/api/chat` (the server sends
`x-accel-buffering: no`).

### GitHub Pages

React is not the obstacle: `npm run build` emits plain HTML, JS and CSS. The
workflow at `.github/workflows/pages.yml` deploys `dist/` on every push to
`main`, and it handles the two things that actually differ from a Node host:

- **Base path.** A project site lives at `/<repo>/`, so the workflow builds with
  `BASE_PATH=/<repo>/` (`vite.config.ts` reads it). A repo named
  `<user>.github.io` builds at the root instead.
- **No server.** Pages cannot answer `POST /api/chat`, so the workflow builds
  with `VITE_DEMO=1`. That swaps the network adapter for `localDemo` in
  `src/lib/adapter.ts`, which streams a reply from the browser and says it is a
  demo. For real answers, deploy behind Node and drop that variable.

Turn it on once: **Settings → Pages → Source: GitHub Actions**. `index.html` is
also copied to `404.html`, so an unknown path still lands on the app.

## Install it on a phone

The build is a PWA. `public/manifest.webmanifest` declares the name, icons and
`standalone` display; `public/sw.js` is a network-only service worker that caches
nothing, so a deploy never serves a stale bundle. On the Mobile app page,
**Install app** fires `beforeinstallprompt`; where that never fires (iOS Safari)
the page shows the manual steps and store buttons stay hidden until
`VITE_IOS_STORE_URL` / `VITE_ANDROID_STORE_URL` are set.

```bash
rsvg-convert -w 192 -h 192 public/icon.svg -o public/icon-192.png
rsvg-convert -w 512 -h 512 public/icon.svg -o public/icon-512.png
```

## Layout

```
src/lib/            adapter, useChat, workspace, markdown, attachments, speech, install
src/hooks/          theme, routing, auth, shortcuts, dialogs, composer, clipboard, read-aloud
src/components/     Sidebar, ThreadView, Composer, EmptyState, pages/ (AuthPage is here)
src/components/ui/  shadcn primitives: button, dialog, select, switch, dropdown, badge, card
src/styles.css      Tailwind import, design tokens, base styles, keyframes
server/index.mjs    SSE proxy + static host + demo mode
```

Styling is Tailwind CSS v4 with shadcn/ui components: no hand-written class
system, no component stylesheet. Tokens live in `:root` and
`:root[data-theme="dark"]` in `src/styles.css` and are exported to utilities
through `@theme inline`, so `bg-card`, `border-border` and `text-muted-foreground`
switch with the theme. Behaviour lives in `src/hooks/`; components render.

Fenced code blocks are coloured by `src/lib/highlight.ts`, a small tokenizer for
JS/TS, JSON, Python, shell, CSS, HTML, YAML, SQL and Go. It is not a highlighter
dependency: unknown languages fall back to strings, numbers and comments, and
unterminated strings stay coloured while a reply streams.

Swap the transport by implementing `ChatAdapter.stream()` in `lib/adapter.ts`
and yielding `{ type: "delta", text }` then `{ type: "done", usage }`. Components
do not change.

## Notes

- Streaming: the assistant message exists before the first token, so Stop and the
  caret are there from frame one. The transcript follows the stream only within
  96px of the bottom, otherwise "Jump to latest" appears.
- Markdown is re-parsed per token, so an unterminated fence renders as a growing
  code block instead of raw backticks.
- Editing a user turn truncates everything after it and re-runs the request.
- Shortcuts: `⌘J` new chat, `⌘K` search, `Esc` stops or closes a panel.
- Workspace state lives in `localStorage` (`chat-template.workspace.v1`); threads
  persist separately. Below 860px the rail becomes a drawer; below 560px the
  composer chips go icon-only.
- Deliberately absent: a server session, server storage, upload transport, a real
  share route, server speech-to-text, connector and auth-provider OAuth. The UI
  is real and each one is labelled with the seam where your backend goes. File
  bytes never leave the tab.
