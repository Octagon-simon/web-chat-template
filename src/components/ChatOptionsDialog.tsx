import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Thread } from "@/lib/types";
import type { Project } from "@/lib/workspace";
import { Dialog } from "./Dialog";
import { IconArchive, IconFolder, IconPin, IconShare, IconTrash } from "./Icons";

interface ChatOptionsDialogProps {
  thread: Thread;
  projects: Project[];
  onRename: (title: string) => void;
  onMove: (projectId: string | null) => void;
  onShare: () => void;
  onPin: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onClose: () => void;
}

const actionRow =
  "flex h-auto w-full items-center justify-start gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-normal";

export function ChatOptionsDialog({
  thread,
  projects,
  onRename,
  onMove,
  onShare,
  onPin,
  onArchive,
  onDelete,
  onClose,
}: ChatOptionsDialogProps) {
  const [title, setTitle] = useState(thread.title);
  const [armed, setArmed] = useState(false);
  const clean = title.trim();
  const changed = clean !== thread.title && clean.length > 0;

  const saveAndClose = () => {
    if (changed) onRename(clean);
    onClose();
  };

  return (
    <Dialog
      title="Chat options"
      description={`${thread.messages.length} message${thread.messages.length === 1 ? "" : "s"}`}
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="ghost" className="rounded-full" onClick={onClose}>
            Close
          </Button>
          <Button type="button" className="rounded-full" disabled={!changed} onClick={saveAndClose}>
            Save name
          </Button>
        </>
      }
    >
      <form
        className="mb-4 flex flex-col gap-1.5"
        onSubmit={(event) => {
          event.preventDefault();
          saveAndClose();
        }}
      >
        <Label htmlFor="chat-title" className="text-muted-foreground">
          Chat name
        </Label>
        <Input
          id="chat-title"
          value={title}
          maxLength={80}
          onChange={(event) => setTitle(event.target.value)}
        />
      </form>

      <div className="mb-4 flex flex-col gap-1.5">
        <Label htmlFor="chat-project" className="text-muted-foreground">
          Project
        </Label>
        <Select
          value={thread.projectId ?? "none"}
          onValueChange={(value) => onMove(value === "none" ? null : value)}
        >
          <SelectTrigger id="chat-project" className="h-10 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No project</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs leading-snug text-faint">
          Changes where the chat is grouped in the sidebar and Projects.
        </span>
      </div>

      <div className="flex flex-col gap-0.5">
        {!thread.temporary && (
          <Button type="button" variant="ghost" className={actionRow} onClick={onShare}>
            <IconShare size={17} className="shrink-0 text-faint" />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium">Share chat</span>
              <span className="truncate text-xs text-faint">
                {thread.sharedAt ? "Link sharing is on" : "Create a read-only link"}
              </span>
            </span>
          </Button>
        )}
        <Button type="button" variant="ghost" className={actionRow} onClick={onPin}>
          <IconPin size={17} className="shrink-0 text-faint" />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium">
              {thread.pinnedAt ? "Unpin chat" : "Pin chat"}
            </span>
            <span className="truncate text-xs text-faint">
              {thread.pinnedAt ? "Back to the normal history order" : "Keep it above recent chats"}
            </span>
          </span>
        </Button>
        <Button type="button" variant="ghost" className={actionRow} onClick={onArchive}>
          <IconArchive size={17} className="shrink-0 text-faint" />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium">Archive chat</span>
            <span className="truncate text-xs text-faint">
              Hide it from the sidebar without deleting it
            </span>
          </span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          className={actionRow}
          onClick={() => onMove(null)}
          disabled={!thread.projectId}
        >
          <IconFolder size={17} className="shrink-0 text-faint" />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium">Remove from project</span>
            <span className="truncate text-xs text-faint">
              {thread.projectId ? "Keep the chat, drop the grouping" : "This chat is not in a project"}
            </span>
          </span>
        </Button>
      </div>

      <div className="mt-4 flex flex-col items-start gap-3 border-t border-border-soft pt-3.5 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <strong className="mb-0.5 block text-sm font-semibold">Delete chat</strong>
          <span className="text-xs leading-relaxed text-faint">
            Removes the thread and its messages from this browser.
          </span>
        </div>
        <Button
          type="button"
          variant={armed ? "destructive" : "outline"}
          className={cn("w-full shrink-0 rounded-full sm:w-auto", !armed && "text-destructive")}
          onClick={() => {
            if (!armed) {
              setArmed(true);
              return;
            }
            onDelete();
          }}
        >
          <IconTrash size={15} />
          {armed ? "Delete now" : "Delete"}
        </Button>
      </div>
    </Dialog>
  );
}
