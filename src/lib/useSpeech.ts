import { useCallback, useEffect, useRef, useState } from "react";

interface SpeechAlternative {
  transcript: string;
}

interface SpeechResult {
  readonly isFinal: boolean;
  readonly length: number;
  [index: number]: SpeechAlternative;
}

interface SpeechResultList {
  readonly length: number;
  [index: number]: SpeechResult;
}

interface SpeechEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechResultList;
}

interface SpeechErrorEvent extends Event {
  readonly error?: string;
}

interface Recognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechEvent) => void) | null;
  onerror: ((event: SpeechErrorEvent) => void) | null;
  onend: (() => void) | null;
}

type RecognitionCtor = new () => Recognition;

function recognitionCtor(): RecognitionCtor | null {
  const scope = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition ?? null;
}

const ERRORS: Record<string, string> = {
  "not-allowed": "Microphone permission was blocked.",
  "service-not-allowed": "Speech recognition is unavailable here.",
  "audio-capture": "No microphone was found.",
  "no-speech": "No speech detected. Try again.",
  network: "Speech recognition needs a network connection.",
};

/** Dictation via the browser's speech engine. Nothing is sent to your server. */
export function useSpeech(onTranscript: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const instance = useRef<Recognition | null>(null);
  const supported = typeof window !== "undefined" && recognitionCtor() !== null;

  const stop = useCallback(() => {
    instance.current?.stop();
  }, []);

  const start = useCallback(() => {
    const Ctor = recognitionCtor();
    if (!Ctor) {
      setError("This browser has no speech recognition.");
      return;
    }
    instance.current?.abort();
    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = navigator.language || "en-US";

    recognition.onresult = (event) => {
      let text = "";
      for (let i = 0; i < event.results.length; i += 1) {
        text += event.results[i][0]?.transcript ?? "";
      }
      onTranscript(text.trim());
    };
    recognition.onerror = (event) => {
      setError(ERRORS[event.error ?? ""] ?? "Speech recognition stopped.");
      setListening(false);
    };
    recognition.onend = () => setListening(false);

    instance.current = recognition;
    setError(null);
    try {
      recognition.start();
      setListening(true);
    } catch {
      setError("Could not start the microphone.");
    }
  }, [onTranscript]);

  useEffect(() => {
    return () => {
      try {
        instance.current?.abort();
      } catch {
        // abort() throws if the engine never started.
      }
    };
  }, []);

  return {
    supported,
    listening,
    error,
    start,
    stop,
    clearError: () => setError(null),
  };
}
