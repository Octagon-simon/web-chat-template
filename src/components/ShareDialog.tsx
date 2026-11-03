import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useClipboard } from "@/hooks/use-clipboard";
import { cn } from "@/lib/utils";
import type { Thread } from "@/lib/types";
import { Dialog } from "./Dialog";
import { IconButton } from "./icon-button";
import { IconCheck, IconCopy, IconShare } from "./Icons";

interface ShareDialogProps {
  thread: Thread;
  onShared: (shared: boolean) => void;
  onClose: () => void;
}

export function ShareDialog({ thread, onShared, onClose }: ShareDialogProps) {
  const { copied, copy } = useClipboard(1600);
  const shared = Boolean(thread.sharedAt);
  const link = `${window.location.origin}${window.location.pathname}#/share/${thread.id}`;

  return (
    <Dialog
      title="Share chat"
      description={thread.title}
      onClose={onClose}
      footer={
        <Button type="button" onClick={onClose} className="rounded-full">
          Done
        </Button>
      }
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground",
            shared && "bg-brand-soft text-brand",
          )}
        >
          <IconShare size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <strong className="block text-sm font-semibold">
            {shared ? "Anyone with the link can view" : "Only you can open this chat"}
          </strong>
          <p className="mt-0.5 mb-0 text-xs leading-relaxed text-faint">
            {shared
              ? `Shared ${new Date(thread.sharedAt ?? Date.now()).toLocaleDateString()}. Turning it off revokes the link.`
              : "Create a read-only link. The conversation stays out of search engines."}
          </p>
        </div>
      </div>

      <div
        className={cn(
          "mt-4 flex items-center gap-2 rounded-lg border border-border px-3 py-2",
          shared ? "bg-background" : "bg-secondary",
        )}
      >
        <code className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">
          {shared ? link : "Link sharing is off"}
        </code>
        <IconButton
          label="Copy link"
          tooltip={false}
          onClick={() => copy(link)}
          disabled={!shared}
          className="size-7 shrink-0 rounded-md max-[860px]:size-8"
        >
          {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
        </IconButton>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium">Public link</span>
          <span className="block text-xs text-faint">Read-only. No editing, no new messages.</span>
        </span>
        <Switch
          checked={shared}
          aria-label="Public link"
          onCheckedChange={(next) => onShared(next)}
        />
      </div>

      <div className="mt-4 rounded-xl border border-border-soft bg-secondary/60 px-3.5 py-3">
        <strong className="block text-sm font-semibold">One honest caveat</strong>
        <p className="mt-1 mb-0 text-sm leading-relaxed text-muted-foreground">
          This template flips a local flag. A real link needs a server that stores a snapshot of
          the thread and serves it at <code className="rounded bg-code px-1 font-mono text-xs">#/share/{thread.id}</code>.
          Until you add that route, the URL opens the app, not the shared chat.
        </p>
      </div>
    </Dialog>
  );
}
