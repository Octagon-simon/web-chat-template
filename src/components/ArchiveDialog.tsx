import { Button } from "@/components/ui/button";
import type { Thread } from "@/lib/types";
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
        <p className="m-0 text-sm text-muted-foreground">
          Archive a chat from its options menu to hide it from the sidebar without deleting it.
        </p>
      ) : (
        <div className="flex flex-col gap-0.5">
          {threads.map((thread) => (
            <div key={thread.id} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
              <IconArchive size={17} className="shrink-0 text-faint" />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">{thread.title}</span>
                <span className="truncate text-xs text-faint">
                  {thread.messages.length} message{thread.messages.length === 1 ? "" : "s"} ·
                  archived {age(thread.archivedAt ?? thread.updatedAt)}
                </span>
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => onRestore(thread.id)}
              >
                Restore
              </Button>
            </div>
          ))}
        </div>
      )}
    </Dialog>
  );
}
