# Reference 02 - Claude web (claude.ai)

Observed 2026-11-02 in an agent-controlled Chrome, 1728px inner width, signed in,
route `/chat/<id>?onboarding=1`. Source is the production web bundle (Tailwind
utility class names in the DOM, `anthropic-sans` font face).

## App shell

| Element | Value |
|---|---|
| Sidebar | 288px, background `rgb(250,250,250)`, border-right 1px `rgba(0,0,0,0.1)` |
| Sidebar type | 14px / 21px |
| Main surface | `rgb(255,255,255)` |
| Transcript column | 768px outer, 736px content (16px side padding) |
| Body font | `anthropic-sans, system-ui, "Segoe UI", Roboto, Helvetica, Arial, ...` |

Sidebar groups chat history under "Chats and tasks", with a "Pinned" group above
it, a `Group and sort` control, and per-row `More options` on hover. Nav items
carry their shortcut inline (`New ⌘⇧O`, `Search ⌘⇧K`). The composer exposes a
`Model: Sonnet 5.5 Medium` chip below the input, next to the disclaimer.

## Composer

| Property | Value |
|---|---|
| Width | 768px |
| Collapsed height | 44px (84px once the control row is included) |
| Radius | 14px |
| Padding | 8px |
| Background | #FFFFFF |
| Border | none (elevation via shadow only) |
| Input | contenteditable ProseMirror/tiptap, 15px / 21px |
| Input row | min-height 28px, 3.5px vertical padding, 36px left inset for the leading button |
| Placeholder | "Write a message…" |

Controls: `Add files, connectors, and more` on the left of the input; on the
right a `Dictate` group (Dictate + Microphone), `Use voice mode`, and Send.
While a response streams, Send is replaced by `Stop response`.

## Messages

**User row** - right aligned, max-width 85% of the column.

| Property | Value |
|---|---|
| Background | `rgba(11,11,11,0.05)` (reads as #F2F2F2 on white) |
| Radius | 12px |
| Padding | 12px 16px |
| Type | 15px / 21px |
| Actions | a single `Show message actions` trigger, revealed on hover |

**Assistant row** - no bubble. Body copy is full column width, 15px / 21px.
The action bar under a completed response is the richest of the three:

`Copy` · `Read aloud` · `Good response` · `Bad response` · `Retry` · relative
timestamp ("just now").

**Streaming** - the live response is an `article[aria-label="Currently
streaming message"]`, with a live-region status that reads "Claude is
responding" and then "Claude finished the response".

## Empty state

Heading "Tell Claude what you're working on" over the composer, with the model
chip and disclaimer below it. No suggestion chips.

## Coverage gaps

- Project / Artifact sidebars were listed but not opened.
- Dark theme was not measured; the app was in light mode and I did not toggle it.
- Exact composer shadow was truncated by the probe output.
