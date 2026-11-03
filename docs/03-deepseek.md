# Reference 03 - DeepSeek web (chat.deepseek.com)

Observed 2026-11-02 in an agent-controlled Chrome, 1728px inner width, signed in,
route `/a/chat/s/<id>`.

## App shell

| Element | Value |
|---|---|
| Sidebar | 261px, history grouped under a date header ("Today") |
| Content column | max-width 840px, padding `0 32px 64px` -> 776px inner |
| Message row | 752px (846 column minus 44px gutters) |
| Body font | `quote-cjk-patch, Inter, system-ui, -apple-system, "Segoe UI", Roboto, ...` |
| Text color | `rgb(15,17,21)` |
| Empty-state heading | "Hi. How can I help?" - 24px / 32px, weight 600 |

Sidebar shortcuts: `New chat ⌘J`. Conversation header carries the chat title and
a share icon. DeepSeek auto-titles a thread from its first exchange ("Hello
reply" appeared in history immediately after one message).

## Composer

| Property | Value |
|---|---|
| Width | 776px |
| Radius | 24px |
| Background | #FFFFFF |
| Border | 1px `rgba(0,0,0,0.1)` |
| Shadow | `rgba(0,0,0,.02) 0 4px 12px 0, rgba(72,104,178,.01) ...` |
| Textarea | padding `12px 12px 0 16px`, 16px / 24px |

The composer carries a mode toolbar *inside* the card: `Deep thinking` and
`Smart Search` toggles plus attach and send. An active mode chip renders as
background `rgb(237,243,254)`, 1px `rgb(183,200,254)` border, text
`rgb(57,100,254)`, radius 18px. Below the card: "AI-generated, for reference only".

## Messages

**User row** - right aligned, max-width `calc(100% - 88px)`.

| Property | Value |
|---|---|
| Background | `rgb(237,243,254)` (#EDF3FE) |
| Radius | 22px |
| Padding | 10px 16px |
| Type | 16px / 24px |
| Color | `rgb(15,17,21)` |

**Assistant row** - no bubble, full 752px width, 16px / 28px, color `rgb(15,17,21)`.
Six action buttons under the response, one of them `Read aloud`.

## Convergence worth noting

DeepSeek's user bubble (#EDF3FE, 22px radius, 10x16 padding) is within one
channel of ChatGPT's (#EDF3FF, 22px radius, 10x16 padding). Two independent
products landed on the same "tinted right-aligned bubble, 22px, 10x16" choice.

## Coverage gaps

- Dark theme not measured.
- Deep-thinking / search reasoning panel not opened (the toggle was left off).
