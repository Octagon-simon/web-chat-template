import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { dataUrlBytes, fileToAttachment, formatBytes } from "../lib/attachments";
import type { Attachment } from "../lib/types";
import { useSpeech } from "../lib/useSpeech";
import type { Project } from "../lib/workspace";
import {
  IconCamera,
  IconCheck,
  IconFile,
  IconMic,
  IconPaperclip,
  IconPlug,
  IconPlus,
  IconSearch,
  IconSend,
  IconSpark,
  IconSparkles,
  IconStop,
  IconUpload,
  IconX,
} from "./Icons";

interface ComposerProps {
  streaming: boolean;
  onSend: (text: string, attachments: Attachment[]) => void;
  onStop: () => void;
  model: string;
  models: { id: string; label: string }[];
  onModel: (id: string) => void;
  modes: Record<string, boolean>;
  onToggleMode: (id: string) => void;
  placeholder: string;
  autoFocusKey: number;
  projects: Project[];
  activeProjectId: string | null;
  onAddToProject: (id: string | null) => void;
  onOpenProjects: () => void;
  onOpenSkills: () => void;
  onOpenConnectors: () => void;
  skillsOn: number;
  sendOnEnter: boolean;
}

const MODES = [
  { id: "thinking", label: "Thinking", Icon: IconSpark },
  { id: "search", label: "Search", Icon: IconSearch },
];

const MAX_FILES = 6;

export function Composer({
  streaming,
  onSend,
  onStop,
  model,
  models,
  onModel,
  modes,
  onToggleMode,
  placeholder,
  autoFocusKey,
  projects,
  activeProjectId,
  onAddToProject,
  onOpenProjects,
  onOpenSkills,
  onOpenConnectors,
  skillsOn,
  sendOnEnter,
}: ComposerProps) {
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  // `?menu=files` opens the attach menu on load, for docs and screenshots.
  const [menuOpen, setMenuOpen] = useState(
    () => new URLSearchParams(location.search).get("menu") === "files",
  );
  const [note, setNote] = useState<string | null>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const tools = useRef<HTMLDivElement>(null);
  const files = useRef<HTMLInputElement>(null);
  const speechBase = useRef("");

  const speech = useSpeech((text) => {
    setValue(speechBase.current + text);
  });

  useLayoutEffect(() => {
    const el = input.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
  }, [value]);

  useLayoutEffect(() => {
    if (autoFocusKey > 0) input.current?.focus();
  }, [autoFocusKey]);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (event: PointerEvent) => {
      if (!tools.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const submit = () => {
    const text = value.trim();
    if ((!text && attachments.length === 0) || streaming) return;
    onSend(text, attachments);
    setValue("");
    setAttachments([]);
    setNote(null);
  };

  const addFiles = async (picked: FileList | null) => {
    if (!picked?.length) return;
    const room = MAX_FILES - attachments.length;
    if (room <= 0) {
      setNote(`You can attach up to ${MAX_FILES} files.`);
      return;
    }
    const accepted = Array.from(picked).slice(0, room);
    const next = await Promise.all(accepted.map(fileToAttachment));
    setAttachments((prev) => [...prev, ...next]);
    if (picked.length > room) setNote(`Only ${MAX_FILES} files per message.`);
  };

  const capture = async () => {
    setMenuOpen(false);
    const media = navigator.mediaDevices;
    if (!media?.getDisplayMedia) {
      setNote("Screen capture is not available in this browser.");
      return;
    }
    setNote("Capturing a frame…");
    let stream: MediaStream | null = null;
    try {
      stream = await media.getDisplayMedia({ video: true, audio: false });
      const video = document.createElement("video");
      video.srcObject = stream;
      video.muted = true;
      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => resolve();
      });
      await video.play();
      await new Promise((resolve) => window.setTimeout(resolve, 180));
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      if (!canvas.width || !canvas.height) throw new Error("No frame was available.");
      canvas.getContext("2d")?.drawImage(video, 0, 0);
      const preview = canvas.toDataURL("image/jpeg", 0.72);
      setAttachments((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          name: `Screenshot ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
          kind: "screenshot",
          size: dataUrlBytes(preview),
          preview,
        },
      ]);
      setNote(null);
    } catch (error) {
      const aborted = error instanceof DOMException && error.name === "NotAllowedError";
      setNote(aborted ? "Screen capture was cancelled." : "Could not capture that screen.");
    } finally {
      stream?.getTracks().forEach((track) => track.stop());
    }
  };

  const toggleMic = () => {
    if (speech.listening) {
      speech.stop();
      return;
    }
    speechBase.current = value.trim() ? `${value.trimEnd()} ` : "";
    speech.start();
  };

  const canSend = value.trim() !== "" || attachments.length > 0;

  return (
    <form
      className="composer"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      {attachments.length > 0 && (
        <div className="attach-tray">
          {attachments.map((item) => (
            <div className={item.preview ? "attach is-image" : "attach"} key={item.id}>
              {item.preview ? (
                <img src={item.preview} alt="" />
              ) : item.kind === "screenshot" ? (
                <IconCamera size={16} />
              ) : (
                <IconFile size={16} />
              )}
              <span className="attach-text">
                <span className="attach-name">{item.name}</span>
                <span className="attach-size">{formatBytes(item.size)}</span>
              </span>
              <button
                type="button"
                className="attach-remove"
                aria-label={`Remove ${item.name}`}
                onClick={() =>
                  setAttachments((prev) => prev.filter((entry) => entry.id !== item.id))
                }
              >
                <IconX size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      <label className="sr-only" htmlFor="composer-input">
        Message
      </label>
      <textarea
        id="composer-input"
        ref={input}
        rows={1}
        value={value}
        placeholder={placeholder}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          const withMod = event.metaKey || event.ctrlKey;
          const sends = sendOnEnter
            ? event.key === "Enter" && !event.shiftKey && !withMod
            : event.key === "Enter" && withMod;
          if (sends && !event.nativeEvent.isComposing) {
            event.preventDefault();
            submit();
          }
        }}
      />

      {(note || speech.error) && (
        <p className="composer-note" role="status">
          {note || speech.error}
        </p>
      )}

      <div className="composer-bar">
        <div className="composer-left">
          <div className="composer-tool" ref={tools}>
            <button
              type="button"
              className={menuOpen ? "icon-btn is-on" : "icon-btn"}
              aria-label="Add files and tools"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <IconPlus />
            </button>

            {menuOpen && (
              <div className="tool-menu" role="menu">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    files.current?.click();
                  }}
                >
                  <IconUpload />
                  <span className="grow">Upload files</span>
                  <span className="tool-hint">Images, PDFs, text</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={capture}
                  disabled={!navigator.mediaDevices?.getDisplayMedia}
                >
                  <IconCamera />
                  <span className="grow">Take a screenshot</span>
                  <span className="tool-hint">Share a tab</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenSkills();
                  }}
                >
                  <IconSparkles />
                  <span className="grow">Skills</span>
                  <span className="tool-hint">
                    {skillsOn > 0 ? `${skillsOn} active` : "None active"}
                  </span>
                </button>

                <div className="tool-label">Add to project</div>
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={activeProjectId === null}
                  onClick={() => {
                    onAddToProject(null);
                    setMenuOpen(false);
                  }}
                >
                  <span className="tool-icon">
                    {activeProjectId === null && <IconCheck size={14} />}
                  </span>
                  <span className="grow">No project</span>
                </button>
                {projects.map((project) => {
                  const checked = project.id === activeProjectId;
                  return (
                    <button
                      key={project.id}
                      type="button"
                      role="menuitemradio"
                      aria-checked={checked}
                      onClick={() => {
                        onAddToProject(project.id);
                        setMenuOpen(false);
                      }}
                    >
                      <span className="tool-icon">
                        {checked ? (
                          <IconCheck size={14} />
                        ) : (
                          <span
                            className="project-dot"
                            style={{ background: project.color }}
                          />
                        )}
                      </span>
                      <span className="grow">{project.name}</span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenProjects();
                  }}
                >
                  <span className="tool-icon">
                    <IconPaperclip size={14} />
                  </span>
                  <span className="grow">Manage projects</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenConnectors();
                  }}
                >
                  <span className="tool-icon">
                    <IconPlug size={14} />
                  </span>
                  <span className="grow">Connect apps</span>
                  <span className="tool-hint">Tools and data</span>
                </button>
              </div>
            )}
          </div>

          {MODES.map(({ id, label, Icon }) => {
            const on = Boolean(modes[id]);
            return (
              <button
                key={id}
                type="button"
                className={on ? "chip is-on" : "chip is-icon"}
                aria-label={label}
                aria-pressed={on}
                title={label}
                onClick={() => onToggleMode(id)}
              >
                <Icon />
                {on && <span className="chip-label">{label}</span>}
              </button>
            );
          })}
        </div>

        <div className="composer-right">
          <div className="select-wrap">
            <select
              value={model}
              onChange={(event) => onModel(event.target.value)}
              aria-label="Model"
            >
              {models.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className={speech.listening ? "icon-btn is-live" : "icon-btn"}
            aria-label={speech.listening ? "Stop dictation" : "Dictate a message"}
            aria-pressed={speech.listening}
            title={speech.supported ? "Dictate" : "Speech recognition is not supported here"}
            onClick={toggleMic}
          >
            <IconMic />
          </button>

          {streaming ? (
            <button type="button" className="send is-stop" onClick={onStop} aria-label="Stop generating">
              <IconStop />
            </button>
          ) : (
            <button
              type="submit"
              className="send"
              disabled={!canSend}
              aria-label="Send message"
            >
              <IconSend />
            </button>
          )}
        </div>
      </div>

      <input
        ref={files}
        type="file"
        multiple
        hidden
        tabIndex={-1}
        accept="image/*,.pdf,.txt,.md,.csv,.json,.doc,.docx"
        onChange={(event) => {
          void addFiles(event.target.files);
          event.target.value = "";
        }}
      />
    </form>
  );
}
