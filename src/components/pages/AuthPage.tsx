import { useState } from "react";
import { ArrowLeft, Check, Eye, EyeOff, Loader2 } from "lucide-react";

import { IconButton } from "@/components/icon-button";
import { IconMoon, IconSun } from "@/components/Icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type AuthMode = "login" | "signup";

interface AuthPageProps {
  mode: AuthMode;
  brand: string;
  theme: "light" | "dark";
  defaultEmail?: string;
  onTheme: () => void;
  onSignIn: (email: string) => void;
  onSignUp: (name: string, email: string) => void;
  onSwitch: (mode: AuthMode) => void;
  onClose: () => void;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" width="17" height="17" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94a10.8 10.8 0 0 1-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65Z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59A14.4 14.4 0 0 1 9.77 24c0-1.6.27-3.14.76-4.59l-7.98-6.19A24 24 0 0 0 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19Z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
      />
    </svg>
  );
}

function GithubMark() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" className="fill-current">
      <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.55v-2.1c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.28-1.7-1.28-1.7-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.18-1.49 3.14-1.18 3.14-1.18.63 1.59.24 2.76.12 3.05.74.8 1.19 1.83 1.19 3.08 0 4.41-2.7 5.39-5.26 5.67.42.36.78 1.07.78 2.16v3.2c0 .3.21.66.8.55A11.5 11.5 0 0 0 23.5 12A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

const FEATURES = [
  "Every chat, project and skill stays in this browser.",
  "One adapter for OpenAI, Ollama, vLLM or anything compatible.",
  "Responsive, keyboard-first, and dark from the first paint.",
];

export function AuthPage({
  mode,
  brand,
  theme,
  defaultEmail = "",
  onTheme,
  onSignIn,
  onSignUp,
  onSwitch,
  onClose,
}: AuthPageProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  const signup = mode === "signup";

  const validate = () => {
    const next: typeof errors = {};
    if (signup && !name.trim()) next.name = "Enter your name.";
    if (!EMAIL.test(email.trim())) next.email = "Enter a valid email address.";
    if (signup && password.length < 8) next.password = "Use at least 8 characters.";
    else if (!signup && !password) next.password = "Enter your password.";
    return next;
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    setNotice("");
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setPending(true);
    //stand-in for the provider round trip; replace with your auth call
    await new Promise((resolve) => setTimeout(resolve, 450));
    if (signup) onSignUp(name, email);
    else onSignIn(email);
  };

  const provider = (label: string) => {
    setNotice(`Sign in with ${label} is a stub in this template. Use the email form below.`);
  };

  const title = signup ? "Create your account" : "Welcome back";

  return (
    <div className="grid min-h-dvh grid-cols-1 bg-background lg:grid-cols-2">
      <aside className="relative hidden flex-col overflow-hidden border-r border-border-soft bg-rail p-12 lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 -left-32 size-[520px] rounded-full bg-brand/12 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -bottom-32 size-[420px] rounded-full bg-brand/8 blur-3xl"
        />
        <div className="relative flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="size-[22px] rounded-md bg-linear-to-br from-brand to-[#5464d6] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]"
          />
          <span className="text-sm font-semibold tracking-[-0.01em]">{brand}</span>
        </div>

        <div className="relative my-auto max-w-md py-10">
          <h2 className="m-0 text-[30px] leading-[38px] font-semibold tracking-[-0.02em] text-balance">
            The chat shell you already know, yours to change.
          </h2>
          <p className="mt-3 mb-0 text-base leading-[26px] text-pretty text-muted-foreground">
            Sign in to keep your threads, projects and prompts together. This account lives in
            your browser until you point it at a provider.
          </p>
          <ul className="mt-8 mb-0 flex list-none flex-col gap-3 p-0">
            {FEATURES.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm leading-normal text-pretty text-muted-foreground">
                <span className="mt-px grid size-5 shrink-0 place-items-center rounded-full bg-brand/12 text-brand">
                  <Check size={12} strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-10 mb-0 text-xs leading-relaxed text-faint">
            React, Vite and Tailwind CSS. No telemetry, no server storage.
          </p>
        </div>
      </aside>

      <div className="flex min-h-dvh flex-col lg:min-h-0">
        <div className="px-[max(16px,env(safe-area-inset-left))] pt-[calc(14px+env(safe-area-inset-top))] pb-2">
          <div className="mx-auto flex w-full max-w-sm items-center justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="-ml-2.5 gap-1.5 rounded-lg px-2.5 text-muted-foreground max-[860px]:h-10"
            >
              <ArrowLeft size={16} />
              Back to chat
            </Button>
            <IconButton
              label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              onClick={onTheme}
              className="-mr-2"
            >
              {theme === "dark" ? <IconSun /> : <IconMoon />}
            </IconButton>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-[max(16px,env(safe-area-inset-left))] pt-10 pb-20 max-[860px]:pb-[calc(32px+env(safe-area-inset-bottom))]">
          <div className="w-full max-w-sm">
            <div className="mb-7 flex items-center gap-2.5 lg:hidden">
              <span
                aria-hidden="true"
                className="size-[22px] rounded-md bg-linear-to-br from-brand to-[#5464d6] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]"
              />
              <span className="text-sm font-semibold tracking-[-0.01em]">{brand}</span>
            </div>

            <h1 className="m-0 text-2xl leading-8 font-semibold tracking-[-0.02em]">{title}</h1>
            <p className="mt-1.5 mb-0 text-sm leading-[22px] text-muted-foreground">
              {signup
                ? "One account for chats, projects and skills."
                : "Sign in to pick up where you left off."}
            </p>

            <form noValidate onSubmit={submit} className="mt-7 flex flex-col gap-4">
              {signup && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="auth-name">Name</Label>
                  <Input
                    id="auth-name"
                    name="name"
                    autoComplete="name"
                    placeholder="Ada Lovelace"
                    value={name}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "auth-name-error" : undefined}
                    onChange={(event) => setName(event.target.value)}
                  />
                  {errors.name && (
                    <p id="auth-name-error" role="alert" className="m-0 text-xs text-destructive">
                      {errors.name}
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="auth-email">Email</Label>
                <Input
                  id="auth-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "auth-email-error" : undefined}
                  onChange={(event) => setEmail(event.target.value)}
                />
                {errors.email && (
                  <p id="auth-email-error" role="alert" className="m-0 text-xs text-destructive">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-3">
                  <Label htmlFor="auth-password">Password</Label>
                  {!signup && (
                    <button
                      type="button"
                      onClick={() => setNotice("Password reset is not wired in this template.")}
                      className="inline-flex items-center text-xs font-medium text-brand hover:underline max-[860px]:min-h-10"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="auth-password"
                    name="password"
                    type={show ? "text" : "password"}
                    autoComplete={signup ? "new-password" : "current-password"}
                    placeholder={signup ? "At least 8 characters" : "Your password"}
                    className="pr-11"
                    value={password}
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? "auth-password-error" : undefined}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShow((value) => !value)}
                    aria-label={show ? "Hide password" : "Show password"}
                    className="absolute top-1/2 right-0.5 grid size-8 -translate-y-1/2 place-items-center rounded-md text-faint transition-colors hover:bg-hover hover:text-foreground max-[860px]:size-10"
                  >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p id="auth-password-error" role="alert" className="m-0 text-xs text-destructive">
                    {errors.password}
                  </p>
                )}
              </div>

              <Button type="submit" size="lg" disabled={pending} className="mt-1 w-full rounded-xl">
                {pending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {signup ? "Creating account" : "Signing in"}
                  </>
                ) : signup ? (
                  "Create account"
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs text-faint">or</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-10 w-full justify-center rounded-xl font-medium"
                onClick={() => provider("Google")}
              >
                <GoogleMark />
                Continue with Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-10 w-full justify-center rounded-xl font-medium"
                onClick={() => provider("GitHub")}
              >
                <GithubMark />
                Continue with GitHub
              </Button>
            </div>

            {notice && (
              <p role="status" className="mt-3 mb-0 text-center text-xs leading-relaxed text-faint">
                {notice}
              </p>
            )}

            <p className="mt-6 mb-0 text-center text-sm text-muted-foreground">
              {signup ? "Already have an account?" : "New here?"}{" "}
              <button
                type="button"
                onClick={() => onSwitch(signup ? "login" : "signup")}
                className={cn(
                  "inline-flex items-center font-medium text-brand hover:underline max-[860px]:min-h-10",
                )}
              >
                {signup ? "Sign in" : "Create an account"}
              </button>
            </p>

            <p className="mt-5 mb-0 border-t border-border-soft pt-4 text-center text-xs leading-relaxed text-pretty text-faint">
              UI only. Sign in with any email and password. Nothing leaves this tab.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
