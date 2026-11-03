import type { Thread } from "../lib/types";
import { Dialog } from "./Dialog";
import { IconArchive } from "./Icons";

interface ArchiveDialogProps {
  threads: Thread[];
  onRestore: (id: string) => void;
  onClose: () => void;
}

function age(timestamp: number): string {
  const days = Math.round((Date.now() - timestamp) / 86_400_000);
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  return new Date(timestamp).toLocaleDateString();
}

export function ArchiveDialog({ threads, onRestore, onClose }: ArchiveDialogProps) {
  return (
    <Dialog
      title="Archived chats"
      description={
        threads.length === 0
          ? "Nothing archived"
          : `${threads.length} hidden chat${threads.length === 1 ? "" : "s"}`
      }
      onClose={onClose}
    >
      {threads.length === 0 ? (
        <p className="dialog-empty">
          Archive a chat from its options menu to hide it from the sidebar without deleting it.
        </p>
      ) : (
        <div className="dialog-list">
          {threads.map((thread) => (
            <div key={thread.id} className="dialog-row is-static">
              <IconArchive size={17} />
              <span className="grow">
                <span className="title">{thread.title}</span>
                <span className="sub">
                  {thread.messages.length} message{thread.messages.length === 1 ? "" : "s"} ·
                  archived {age(thread.archivedAt ?? thread.updatedAt)}
                </span>
              </span>
              <button type="button" className="btn is-tiny" onClick={() => onRestore(thread.id)}>
                Restore
              </button>
            </div>
          ))}
        </div>
      )}
    </Dialog>
  );
}
