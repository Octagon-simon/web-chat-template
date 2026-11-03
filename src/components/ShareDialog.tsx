import { useState } from "react";
import type { Thread } from "../lib/types";
import { Dialog } from "./Dialog";
import { IconCheck, IconCopy, IconShare } from "./Icons";

interface ShareDialogProps {
  thread: Thread;
  onShared: (shared: boolean) => void;
  onClose: () => void;
}

export function ShareDialog({ thread, onShared, onClose }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const shared = Boolean(thread.sharedAt);
  const link = `${window.location.origin}${window.location.pathname}#/share/${thread.id}`;

  const copy = () => {
    void navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    });
  };

  return (
    <Dialog
      title="Share chat"
      description={thread.title}
      onClose={onClose}
      footer={
        <button type="button" className="btn btn-primary" onClick={onClose}>
          Done
        </button>
      }
    >
      <div className="share-state">
        <span className={shared ? "share-icon is-on" : "share-icon"} aria-hidden="true">
          <IconShare size={19} />
        </span>
        <div className="grow">
          <strong>{shared ? "Anyone with the link can view" : "Only you can open this chat"}</strong>
          <p className="hint">
            {shared
              ? `Shared ${new Date(thread.sharedAt ?? Date.now()).toLocaleDateString()}. Turning it off revokes the link.`
              : "Create a read-only link. The conversation stays out of search engines."}
          </p>
        </div>
      </div>

      <div className={shared ? "link-box" : "link-box is-muted"}>
        <code>{shared ? link : "Link sharing is off"}</code>
        <button type="button" className="icon-btn" onClick={copy} disabled={!shared} aria-label="Copy link">
          {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
        </button>
      </div>

      <div className="setting-row">
        <span className="grow">
          <span className="title">Public link</span>
          <span className="sub">Read-only. No editing, no new messages.</span>
        </span>
        <button
          type="button"
          className="switch-button"
          role="switch"
          aria-checked={shared}
          aria-label="Public link"
          onClick={() => onShared(!shared)}
        >
          <span className="switch" aria-hidden="true" />
        </button>
      </div>

      <div className="info-card">
        <strong>One honest caveat</strong>
        <p>
          This template flips a local flag. A real link needs a server that stores a snapshot of
          the thread and serves it at <code>#/share/{thread.id}</code>. Until you add that route,
          the URL opens the app, not the shared chat.
        </p>
      </div>
    </Dialog>
  );
}
