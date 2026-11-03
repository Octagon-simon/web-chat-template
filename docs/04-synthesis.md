# 04 - Dedup across ChatGPT / Claude / DeepSeek, and the template spec

Three production chat UIs, measured. This is what repeats, what differs on
purpose, and the single spec the template will implement.

## What all three agree on (do not redesign these)

1. **Two-pane shell.** A persistent left rail of conversations plus exactly one
   centered conversation column. None of them puts messages in a full-width flow.
2. **Tight column width.** ChatGPT 768px, Claude 768px, DeepSeek 840px. The
   read-line length is the product.
3. **The composer is a card, not a textarea.** Rounded container, elevation from
   a hairline plus a soft shadow, and *all* controls (attach, voice, modes, send)
   live inside that card.
4. **User messages are right-aligned tinted bubbles. Assistant messages are
   full-width, bubble-less prose.** All three. The bubble is a "sent message"
   affordance, not a chat-window convention.
5. **One button slot for send and stop.** Send becomes Stop the instant a
   response starts. No second control appears.
6. **An action row under each completed assistant message.** Copy is universal.
   Regenerate and read-aloud are near-universal.
7. **Empty state is one short question plus the composer.** No dashboard, no
   feature grid. ChatGPT is the only one that adds a single suggestion chip.
8. **Streaming is token-by-token, announced through a live region.**
9. **16px body, system sans stack, light + dark.**
10. **Enter sends, Shift+Enter breaks the line.**

Point 3 to point 5 are the ones people get wrong when they build this from
scratch. They are the whole "feels like a real product" delta.

## Where they diverge, and why it matters

| Axis | ChatGPT | Claude | DeepSeek |
|---|---|---|---|
| User bubble | #EDF3FF, r22, 10x16 | rgba(11,11,11,.05), r12, 12x16, max 85% | #EDF3FE, r22, 10x16, max calc(100%-88px) |
| Composer | r28, 1px border + 3-layer shadow | r14, shadow only | r24, 1px border + 2 shadows |
| Column | 768 | 768 | 840 |
| Assistant type | 16/26 | 15/21 | 16/28 |
| Actions | Copy, Share | Copy, Read aloud, Good, Bad, Retry, time | 6 buttons incl. Read aloud |
| Modes | model picker in the composer | model chip under the composer | "Deep thinking" / "Smart Search" toggles inside the card |
| History | sidebar shortcuts + plugins | pinned group + group/sort | date groups, auto-titles |

Two independent products landed on `#EDF3FF` vs `#EDF3FE` with the same radius
and padding. That is a strong signal for the template's default: tinted bubble,
22px radius, 10x16 padding.

The single biggest structural difference is where *mode selection* lives.
ChatGPT and DeepSeek put it inside the composer; Claude keeps the composer clean
and puts the model chip underneath. The template should support both slots.

## Canonical tokens

```css
:root {
  /* surface */
  --bg: #ffffff;
  --bg-sidebar: #fafafa;
  --bg-raised: #ffffff;
  --border: rgba(0, 0, 0, 0.1);
  --border-soft: rgba(0, 0, 0, 0.06);

  /* text */
  --text: #0d0d0d;
  --text-muted: #6b6b6b;
  --text-faint: #8f8f8f;

  /* accent + user bubble */
  --accent: #2451da;
  --bubble-bg: #edf3ff;
  --bubble-text: #0d0d0d;

  /* geometry */
  --rail: 280px;
  --column: 768px;
  --column-wide: 840px;
  --radius-bubble: 22px;
  --radius-card: 24px;
  --radius-sm: 10px;

  /* type */
  --font: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif;
  --fs-body: 16px;
  --lh-body: 26px;

  /* elevation */
  --shadow-card: 0 0 0 1px rgba(0,0,0,.04), 0 2px 8px rgba(0,0,0,.04), 0 4px 80px 8px rgba(0,0,0,.024);
}
```

Dark mode swaps `--bg`, `--bg-sidebar`, `--bubble-bg` (to a low-chroma indigo
tint), and the border alphas. Nothing else changes.

## Feature matrix

| Capability | ChatGPT | Claude | DeepSeek | Template |
|---|---|---|---|---|
| Streaming tokens | yes | yes | yes | yes |
| Stop generation | yes | yes | yes | yes |
| Copy message | yes | yes | yes | yes |
| Regenerate | yes | yes | yes | yes |
| Edit + resend user turn | yes | yes | yes | yes |
| Markdown + code blocks | yes | yes | yes | yes |
| Code block copy | yes | yes | yes | yes |
| File attach | yes | yes | yes | hook only |
| Voice / dictation | yes | yes | no | hook only |
| Read aloud | no (voice mode) | yes | yes | no |
| Model picker | yes | chip | no | yes |
| Tool / mode toggles | plugins | connectors | thinking + search | yes |
| Thread history | yes | yes | yes | localStorage |
| Search history | yes | yes | yes | no |
| Share conversation | yes | yes | yes | no |
| Mobile drawer | yes | yes | yes | yes |
| Dark mode | yes | yes | yes | yes |

## Where the template should go beyond the three

These are the gaps the three references leave open, and the reason a new
product can win on the same layout:

1. **Provider transparency.** None of them show which model answered, at what
   cost, or how long first-token took. A template for "your own model" should
   surface `model`, `latency-to-first-token`, and token counts per turn.
2. **Bring-your-own-endpoint.** One adapter contract over OpenAI-compatible
   chat completions covers vLLM, Ollama, LM Studio, Together, Groq, Fireworks
   and DeepSeek itself. That is the whole deploy story.
3. **Local-first history.** IndexedDB thread store so the template works with no
   account system at all.
4. **Keyboard-first.** ⌘K command palette for switching threads and models,
   ⌘J new chat, Esc to stop. All three have fragments of this; none has all.
5. **Honest empty state.** One line, and suggestion chips that come from the
   operator's config, not hardcoded marketing copy.
