import { Dialog } from "./Dialog";

const MOD = /Mac|iPhone|iPad/.test(navigator.userAgent) ? "⌘" : "Ctrl";

const SHORTCUTS: { label: string; keys: string }[] = [
  { label: "New chat", keys: `${MOD} J` },
  { label: "Search chats", keys: `${MOD} K` },
  { label: "Show or hide chats", keys: `${MOD} B` },
  { label: "Send message", keys: "Enter" },
  { label: "New line", keys: "Shift Enter" },
  { label: "Stop generating", keys: "Esc" },
  { label: "Close a dialog or panel", keys: "Esc" },
  { label: "Open this list", keys: "?" },
];

export function ShortcutsDialog({ onClose }: { onClose: () => void }) {
  return (
    <Dialog
      title="Keyboard shortcuts"
      description="These work anywhere outside a text field."
      onClose={onClose}
    >
      <ul className="m-0 list-none p-0">
        {SHORTCUTS.map((shortcut) => (
          <li
            key={shortcut.label}
            className="flex items-center justify-between gap-3 border-b border-border-soft py-2 text-sm last:border-0"
          >
            <span className="text-muted-foreground">{shortcut.label}</span>
            <kbd className="rounded-md bg-secondary px-2 py-0.5 font-mono text-xs text-foreground">
              {shortcut.keys}
            </kbd>
          </li>
        ))}
      </ul>
    </Dialog>
  );
}
