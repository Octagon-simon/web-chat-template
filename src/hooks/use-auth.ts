import { useCallback, useEffect, useState } from "react";

export interface Session {
  name: string;
  email: string;
  plan: string;
}

const KEY = "chat-template.session.v1";

/** "ada.lovelace@mail.dev" -> "Ada Lovelace" */
export function nameFromEmail(email: string): string {
  return (email.split("@")[0] ?? "")
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function read(): Session | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as Partial<Session>;
    if (typeof saved.email !== "string" || !saved.email) return null;
    return {
      email: saved.email,
      name: typeof saved.name === "string" ? saved.name : nameFromEmail(saved.email),
      plan: typeof saved.plan === "string" ? saved.plan : "Free",
    };
  } catch {
    return null;
  }
}

/**
 * Local-only session. `signIn` is the seam: swap its body for your provider
 * call and keep the same return shape.
 */
export function useAuth() {
  const [session, setSession] = useState<Session | null>(read);
  const [lastEmail, setLastEmail] = useState(() => read()?.email ?? "");

  useEffect(() => {
    if (session) localStorage.setItem(KEY, JSON.stringify(session));
    else localStorage.removeItem(KEY);
  }, [session]);

  const signIn = useCallback((email: string, name = "") => {
    const clean = email.trim().toLowerCase();
    const next: Session = {
      email: clean,
      name: name.trim() || nameFromEmail(clean),
      plan: "Free",
    };
    setLastEmail(clean);
    setSession(next);
    return next;
  }, []);

  const signOut = useCallback(() => setSession(null), []);

  const rename = useCallback((name: string) => {
    setSession((current) => (current ? { ...current, name } : current));
  }, []);

  return { session, lastEmail, signIn, signOut, rename };
}

export type Auth = ReturnType<typeof useAuth>;
