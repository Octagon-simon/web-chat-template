import { useState } from "react";
import type { Thread } from "../lib/types";
import type { Project } from "../lib/workspace";
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
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
          <button type="button" className="btn btn-primary" disabled={!changed} onClick={saveAndClose}>
            Save name
          </button>
        </>
      }
    >
      <form
        className="field"
        onSubmit={(event) => {
          event.preventDefault();
          saveAndClose();
        }}
      >
        <label htmlFor="chat-title">Chat name</label>
        <input
          id="chat-title"
          className="input"
          data-autofocus
          value={title}
          maxLength={80}
          onChange={(event) => setTitle(event.target.value)}
        />
      </form>

      <div className="field">
        <label htmlFor="chat-project">Project</label>
        <div className="select-wrap is-block">
          <select
            id="chat-project"
            value={thread.projectId ?? ""}
            onChange={(event) => onMove(event.target.value || null)}
          >
            <option value="">No project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
        <span className="hint">Changes where the chat is grouped in the sidebar and Projects.</span>
      </div>

      <div className="dialog-list">
        {!thread.temporary && (
          <button type="button" className="dialog-row" onClick={onShare}>
            <IconShare size={17} />
            <span className="grow">
              <span className="title">Share chat</span>
              <span className="sub">
                {thread.sharedAt ? "Link sharing is on" : "Create a read-only link"}
              </span>
            </span>
          </button>
        )}
        <button type="button" className="dialog-row" onClick={onPin}>
          <IconPin size={17} />
          <span className="grow">
            <span className="title">{thread.pinnedAt ? "Unpin chat" : "Pin chat"}</span>
            <span className="sub">
              {thread.pinnedAt ? "Back to the normal history order" : "Keep it above recent chats"}
            </span>
          </span>
        </button>
        <button type="button" className="dialog-row" onClick={onArchive}>
          <IconArchive size={17} />
          <span className="grow">
            <span className="title">Archive chat</span>
            <span className="sub">Hide it from the sidebar without deleting it</span>
          </span>
        </button>
        <button type="button" className="dialog-row" onClick={() => onMove(null)} disabled={!thread.projectId}>
          <IconFolder size={17} />
          <span className="grow">
            <span className="title">Remove from project</span>
            <span className="sub">
              {thread.projectId ? "Keep the chat, drop the grouping" : "This chat is not in a project"}
            </span>
          </span>
        </button>
      </div>

      <div className="danger-zone">
        <div>
          <strong>Delete chat</strong>
          <span className="hint">Removes the thread and its messages from this browser.</span>
        </div>
        <button
          type="button"
          className={armed ? "btn btn-danger is-armed" : "btn btn-danger"}
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
        </button>
      </div>
    </Dialog>
  );
}
