# AGENT.md

Instructions for a coding agent (Claude Code, Codex, Cursor, Undisclosed, anything
that can read a repo and edit files). Give it this file and a one-line goal; it
should be able to clone this template and turn it into a working product without
asking you where things live.

---

## The job

This repo is a finished chat UI with a thin, honest seam to a backend. Your job is
usually one of three things:

1. **Rebrand it** into a specific product (name, copy, colour, icons).
2. **Wire it up** to a real model, storage, or auth.
3. **Extend it** with a screen or feature that matches the existing product.

Read the whole repo before editing. It is small: about 9k lines, and
`src/styles.css` is 3.6k of them. Do not rewrite files wholesale to "clean them
up".

## Ask before you build, only if it changes the shape of the work

Ask at most three questions, then proceed with sensible defaults:

- Product name and one-line description? (default: keep the template copy)
- Which model endpoint? (`OPENAI_BASE_URL`, key, model id; default: local demo mode)
- Does it need real auth or storage? (default: no, keep `localStorage`)

Do not ask about styling, file names, or which library to use. Those are decided
below.

## Ground rules

These are not preferences. The template is built this way on purpose.

- **React and React DOM are the only runtime dependencies.** No router, no state
  library, no UI kit, no markdown library, no CSS framework, no icon package.
  The whole tree is `react`, `react-dom`, their types, and the build tooling
  (`vite`, `@vitejs/plugin-react`, `typescript`). If you believe a task needs a
  new dependency, stop and ask.
- **One stylesheet.** All CSS lives in `src/styles.css`, tokens first in `:root`.
  Reuse existing classes. Do not add CSS modules, Tailwind, styled-components, or
  inline style objects for things that repeat.
- **Responsive down to 320px.** Two breakpoints matter: `860px` (rail becomes a
  drawer) and `560px` (composer chips go icon-only, model select pins left).
- **Tap targets are at least 40x40.** Inputs and textareas are 16px below 860px,
  because iOS Safari zooms any field smaller than that.
- **Themes.** System, Light and Dark all work today: the preference resolves to a
  concrete `light` or `dark` and lands on `<html data-theme="...">`, which selects
  `:root` or `:root[data-theme="dark"]` tokens. Every colour you add must resolve
  from a token that has both values. Never hard code a hex in a component or a
  one-off rule.
- **Comments are sparse.** `//` style, only where the code cannot say it itself.
  No narrative blocks, no file-header essays.
- **Never put a secret in a `VITE_` variable.** Those are baked into the bundle.
- **Do not commit `.env`.** `.env.example` is the template to extend.

## Repo map

```
index.html            app shell, fonts, meta
vite.config.ts        dev server, /api proxy to :8787
server/index.mjs      Node server: static host, SSE proxy, demo mode
src/App.tsx           shell, panel routing, dialogs, keyboard shortcuts
src/main.tsx          mount
src/styles.css        design tokens, then layout, then components
src/lib/adapter.ts    the transport seam: ChatAdapter.stream()
src/lib/useChat.ts    threads, streaming state machine, abort, retry, edit-and-resend
src/lib/workspace.ts  projects, connectors, skills, settings, profile
src/lib/attachments.ts  file picking and previews (bytes never leave the tab)
src/lib/markdown.tsx  streaming-safe markdown renderer
src/lib/useSpeech.ts  mic capture and dictation
src/lib/install.ts    beforeinstallprompt capture, install state
src/lib/greeting.ts   time-based empty-state greeting
src/components/       Sidebar, ThreadView, Composer, EmptyState, Dialogs, pages/
docs/                 measured specs for ChatGPT, Claude, DeepSeek, and the synthesis
```

## First run

```bash
npm install
npm run dev        # Vite on 5173, API on 8787, proxied
```

No key, no problem: the server streams a local demo reply, so a fresh clone is
usable. `?demo=1` seeds a thread and two projects. `?panel=settings` opens a
surface on load, which is the fastest way to reach a screen while building.

Before you change anything, run `npm run build` once. It should pass. If it does
not, that is the first bug you fix, not something you work around.

## Recipes

### Rebrand

Edit `.env` (copy `.env.example`), not the source: `VITE_BRAND`, `VITE_HEADLINE`,
`VITE_PLACEHOLDER`, `VITE_DISCLAIMER`, `VITE_SUGGESTIONS`, `VITE_PROVIDER_LABEL`.
Accent and surface colours are tokens in `:root` in `src/styles.css`. Icons are
`public/icon.svg`; regenerate the PNGs with the `rsvg-convert` lines in the README.
The default profile name lives in `src/lib/workspace.ts`.

### Change the empty state

`src/components/EmptyState.tsx` plus `src/lib/greeting.ts`. The greeting takes the
profile name from `workspace.ts`, so a rename in Settings updates it live. Opening
a project shows the project name instead; keep that.

### Add or change a model

`VITE_MODELS` is a comma-separated list of `id:Label`. The split happens at the
last colon, so an id that contains one still works:
`llama3.1:8b:Llama 3.1 8B` is id `llama3.1:8b`, label `Llama 3.1 8B`. The client
sends the id; the server falls back to `OPENAI_MODEL` when the client sends none.
Anything that speaks OpenAI chat completions works: Ollama, LM Studio, vLLM,
llama.cpp, Groq, Together, DeepSeek, OpenAI.

### Swap the backend

Implement `ChatAdapter.stream()` in `src/lib/adapter.ts` and yield
`{ type: "delta", text }` then `{ type: "done", usage }`. That is the whole
contract. Components do not change. If the transport is not SSE, keep the same
shape and feed the queue yourself.

### Add a screen

Four small edits, all in the same chain:

1. `src/components/pages/YourPage.tsx`, wrapping its body in `<Page title description actions>`
   so it inherits the page shell.
2. `src/App.tsx`: add the id to the `View` union and to `VIEWS` (that array is what
   makes `?panel=yourpage` work), then add a `{view === "yourpage" && <YourPage />}`
   block beside the existing ones.
3. `src/components/Sidebar.tsx`: an `onOpenYourPage` prop and a nav entry.
4. `src/App.tsx`: pass that prop where the other `onOpen*` props are passed.

Match an existing page for spacing. A page is a description plus actions: no
repeated screen title, no back button. The `title` on `Page` becomes the
`aria-label`, it is not displayed.

### Persist somewhere real

Two stores, both listed in the map: `workspace.ts` holds projects, connectors,
skills, settings and profile under `chat-template.workspace.v1`; `useChat.ts`
holds threads under `chat-template.threads.v1`. localStorage is the storage layer,
not the data model. Keep the exported shape and replace the load/save functions
with fetch calls, one resource per store. Bump the version suffix in a key if its
shape changes.

### Add uploads or auth

Both are deliberately stubs with the seam marked. `src/lib/attachments.ts` holds
file bytes in the tab only. Auth has no code path; add it at the panel boundary in
`App.tsx` and gate by a single `session` value rather than sprinkling checks.

## Before you say it is done

1. `npm run build` passes (`tsc --noEmit` + Vite). No `any` added to silence it.
2. Grep your own diff for `TODO`, stray `console.log`, dead props, unused imports.
3. Check the layout at 320, 390, 760, 1440 in both themes. 40px controls, no
   horizontal scroll, no truncated model name.
4. Confirm nothing secret landed in a `VITE_` var and `.env` is not staged.
5. Summarise what changed in files and behaviour, and state anything you could not
   verify. Do not claim a screenshot or a click-through you did not do.

## Do not

- Add a dependency for something 40 lines of code solves.
- Replace `src/styles.css` with a framework.
- Invent an API endpoint. If the backend is missing, label the seam and leave it.
- Delete `docs/`; it is the measurement behind the layout.
- Rewrite copy to be cleverer. The template reads plainly on purpose.
