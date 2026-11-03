# Reference 01 - ChatGPT web (chatgpt.com)

Observed 2026-11-02 in an agent-controlled Chrome for Testing, 1728px inner width,
logged out, build serving `unauth-mweb` assets (`stylex-initial-modern`, `stylex-remaining-modern`).

Evidence type is marked per line: `[O]` = measured in the live DOM,
`[I]` = inference from adjacent evidence, `[?]` = not verified.

## App shell

| Element | Value | Type |
|---|---|---|
| Sidebar nav rail | x=6, width 247px | [O] |
| Main content origin | x=260 | [O] |
| Header (banner) | height 61px, padding 8px 16px | [O] |
| Transcript column | 768px wide, centered in remaining space | [O] |
| Page background | `oklch(0.991069 0 none)` (~#FCFCFC) | [O] |
| Default body font | `-apple-system-body, ui-sans-serif, system-ui, "Segoe UI", Helvetica, Arial, sans-serif` | [O] |

## Composer

| Property | Value | Type |
|---|---|---|
| Width | 768px (same as transcript column) | [O] |
| Height, collapsed | 52px | [O] |
| Radius | 28px | [O] |
| Padding | 7px 10px | [O] |
| Background | #FFFFFF | [O] |
| Border | 1px `rgba(0,0,0,0.1)` | [O] |
| Shadow | `0 0 0 1px rgba(0,0,0,.04), 0 2px 8px rgba(0,0,0,.04), 0 4px 80px 8px rgba(0,0,0,.024)` | [O] |
| Input font | 17px / 24px, transparent bg, no border | [O] |
| Placeholder | "Ask ChatGPT" | [O] |

Composer controls, left to right: attach (`Add files and more`), then a right
cluster of dictation (`Start dictation`), voice mode, and send. Send is disabled
while the input is empty, and swaps to an aria-labelled `Stop generating` button
the moment a response starts streaming. [O]

## Messages

Markup contract: each row is `<li data-message-role="user|assistant">` inside a
single `<ol>`; the accessible name of the row heading is `You said:` /
`ChatGPT said:` (rendered visually hidden). [O]

**User row** - right aligned via `display:flex; align-items:flex-end` on a
768px-wide row container. The message text sits in a bubble: [O]

| Property | Value |
|---|---|
| Radius | 22px |
| Padding | 10px 16px |
| Background | `oklch(0.9627 0.0179 265.129)` (~#EDF3FF, light tint at the accent hue) |
| Type | 16px / 24px |

**Assistant row** - no bubble, no background. Message body is 768px wide, 16px /
26px, color `rgb(13,13,13)`, with 40px of bottom padding on the row. [O]

**Row actions** - user rows expose Copy; assistant rows expose a `Response
actions` group with Copy and Share. They are present in the DOM on completion;
whether they are hover-revealed or always visible at rest is [?] because the
screenshot path could not capture the live authenticated conversation.

## Empty state

Desktop: `h1` "Where should we begin?", one suggestion chip "What can you do?",
the composer, then a legal footer (Terms / Privacy / "Chats may be reviewed and
used to improve our AI models"). [O]

Mobile (390px): header collapses to a hamburger, a centered "ChatGPT" wordmark
and a "Log in" pill; headline changes to "What are you working on?"; the
composer keeps attach + dictation + voice, with the suggestion chip below it. [O]

## Coverage gaps

- Authenticated-only surfaces were not reachable: chat history list, sidebar
  hover states, project folders, model switcher, message editing.
- The unauth build may differ from the signed-in build in radius and color
  values; both should be confirmed once a session exists.
