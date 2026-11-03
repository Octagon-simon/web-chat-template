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
      <ul className="shortcut-list">
        {SHORTCUTS.map((shortcut) => (
          <li key={shortcut.label}>
            <span>{shortcut.label}</span>
            <kbd>{shortcut.keys}</kbd>
          </li>
        ))}
      </ul>
    </Dialog>
  );
}
