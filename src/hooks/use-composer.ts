import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

import { dataUrlBytes, fileToAttachment } from "@/lib/attachments";
import type { Attachment } from "@/lib/types";
import { useSpeech } from "@/lib/useSpeech";
import { useAutoResize } from "./use-auto-resize";

const MAX_FILES = 6;

interface UseComposerOptions {
  streaming: boolean;
  sendOnEnter: boolean;
  autoFocusKey: number;
  onSend: (text: string, attachments: Attachment[]) => void;
}

/** Everything the composer owns: draft, files, attach menu, dictation, capture. */
export function useComposer({ streaming, sendOnEnter, autoFocusKey, onSend }: UseComposerOptions) {
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  // `?menu=files` opens the attach menu on load, for docs and screenshots.
  const [menuOpen, setMenuOpen] = useState(
    () => new URLSearchParams(location.search).get("menu") === "files",
  );
  const [note, setNote] = useState<string | null>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const files = useRef<HTMLInputElement>(null);
  const speechBase = useRef("");

  const speech = useSpeech((text) => setValue(speechBase.current + text));

  useAutoResize(input, [value]);

  useLayoutEffect(() => {
    if (autoFocusKey > 0) input.current?.focus();
  }, [autoFocusKey]);

  const submit = useCallback(() => {
    const text = value.trim();
    if ((!text && attachments.length === 0) || streaming) return;
    onSend(text, attachments);
    setValue("");
    setAttachments([]);
    setNote(null);
  }, [attachments, onSend, streaming, value]);

  const addFiles = useCallback(
    async (picked: FileList | null) => {
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
    },
    [attachments.length],
  );

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const capture = useCallback(async () => {
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
  }, []);

  const toggleMic = useCallback(() => {
    if (speech.listening) {
      speech.stop();
      return;
    }
    speechBase.current = value.trim() ? `${value.trimEnd()} ` : "";
    speech.start();
  }, [speech, value]);

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
      const withMod = event.metaKey || event.ctrlKey;
      const sends = sendOnEnter
        ? event.key === "Enter" && !event.shiftKey && !withMod
        : event.key === "Enter" && withMod;
      if (sends && !event.nativeEvent.isComposing) {
        event.preventDefault();
        submit();
      }
    },
    [sendOnEnter, submit],
  );

  return {
    value,
    setValue,
    attachments,
    removeAttachment,
    menuOpen,
    setMenuOpen,
    note,
    input,
    files,
    speech,
    submit,
    addFiles,
    capture,
    toggleMic,
    handleKeyDown,
    canSend: value.trim() !== "" || attachments.length > 0,
  };
}
