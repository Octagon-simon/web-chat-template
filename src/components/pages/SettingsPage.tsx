import { useEffect, useState } from "react";
import { LogOut, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { initials as initialsOf } from "@/lib/format";
import type { Session } from "@/hooks/use-auth";
import type { ThemePref } from "@/lib/types";
import type { Profile, Settings } from "@/lib/workspace";
import {
  IconArchive,
  IconDownload,
  IconKeyboard,
  IconMoon,
  IconPhone,
  IconSun,
  IconTrash,
} from "../Icons";
import { Page } from "./Page";

interface SettingsPageProps {
  profile: Profile;
  onProfile: (patch: Partial<Profile>) => void;
  session: Session | null;
  onChangeAccount: () => void;
  onSignOut: () => void;
  theme: ThemePref;
  onTheme: (value: ThemePref) => void;
  settings: Settings;
  onSettings: (patch: Partial<Settings>) => void;
  stats: { chats: number; projects: number; connectors: number; skills: number };
  archived: number;
  onExport: () => void;
  onClear: () => void;
  onOpenArchive: () => void;
  onOpenShortcuts: () => void;
  onOpenMobile: () => void;
}

const PLANS = ["Self-hosted", "Free", "Pro", "Team"];
const THEMES: { id: ThemePref; label: string }[] = [
  { id: "system", label: "System" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
];

const SECTIONS: [string, string][] = [
  ["settings-profile", "Profile"],
  ["settings-appearance", "Appearance"],
  ["settings-chat", "Chat"],
  ["settings-data", "Data"],
  ["settings-about", "About"],
];

function jump(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

const section = "scroll-mt-3 gap-3 rounded-2xl border-border-soft p-4";

function ToggleRow({
  title,
  detail,
  checked,
  onChange,
}: {
  title: string;
  detail: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center gap-3 border-t border-border-soft py-3 first:border-0 first:pt-0.5">
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-xs leading-relaxed text-faint">{detail}</span>
      </span>
      <Switch checked={checked} aria-label={title} onCheckedChange={onChange} />
    </div>
  );
}

export function SettingsPage({
  profile,
  onProfile,
  session,
  onChangeAccount,
  onSignOut,
  theme,
  onTheme,
  settings,
  onSettings,
  stats,
  archived,
  onExport,
  onClear,
  onOpenArchive,
  onOpenShortcuts,
  onOpenMobile,
}: SettingsPageProps) {
  const [armed, setArmed] = useState(false);
  const [active, setActive] = useState(SECTIONS[0][0]);

  useEffect(() => {
    const scroller = document.querySelector("[data-page-scroll]");
    if (!scroller) return;
    const track = () => {
      const line = scroller.getBoundingClientRect().top + 96;
      let next = SECTIONS[0][0];
      for (const [id] of SECTIONS) {
        const node = document.getElementById(id);
        if (node && node.getBoundingClientRect().top <= line) next = id;
      }
      if (scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 4) {
        next = SECTIONS[SECTIONS.length - 1][0];
      }
      setActive(next);
    };
    track();
    scroller.addEventListener("scroll", track, { passive: true });
    return () => scroller.removeEventListener("scroll", track);
  }, []);

  return (
    <Page
      title="Settings"
      description="Profile, appearance and the two behaviours that change how the composer feels. Everything is stored in this browser."
    >
      <div className="grid grid-cols-[168px_minmax(0,1fr)] items-start gap-6 max-[860px]:grid-cols-1 max-[860px]:gap-3">
        <nav
          aria-label="Settings sections"
          className="sticky top-0 flex flex-col gap-0.5 max-[860px]:static max-[860px]:flex-row max-[860px]:gap-1 max-[860px]:overflow-x-auto max-[860px]:pb-0.5 max-[860px]:[scrollbar-width:none]"
        >
          {SECTIONS.map(([id, label]) => {
            const on = active === id;
            return (
              <button
                key={id}
                type="button"
                aria-current={on ? "true" : undefined}
                onClick={() => {
                  setActive(id);
                  jump(id);
                }}
                className={cn(
                  "rounded-lg px-2.5 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-hover hover:text-foreground",
                  "max-[860px]:shrink-0 max-[860px]:whitespace-nowrap max-[860px]:bg-hover max-[860px]:py-2.5",
                  on && "bg-active font-semibold text-foreground max-[860px]:bg-brand-soft max-[860px]:text-brand",
                )}
              >
                {label}
              </button>
            );
          })}
        </nav>

        <div className="flex flex-col gap-4">
          <Card className={section} id="settings-profile">
            <div className="mb-3.5 flex items-center gap-3">
              <span
                aria-hidden="true"
                className="grid size-10 shrink-0 place-items-center rounded-full bg-linear-to-br from-[#2451da] to-[#5464d6] text-sm font-semibold tracking-[0.02em] text-white"
              >
                {initialsOf(session?.name || profile.name)}
              </span>
              <div className="min-w-0">
                <h2 className="m-0 truncate text-base font-semibold tracking-[-0.01em]">
                  {session?.name || profile.name || "Workspace owner"}
                </h2>
                <p className="mt-0.5 mb-0 truncate text-sm leading-normal text-muted-foreground">
                  {session
                    ? `${session.email} · ${session.plan}`
                    : "Browsing as a guest. Sign in to keep an account on this browser."}
                </p>
              </div>
            </div>
            <div className="flex gap-2 max-[560px]:flex-col">
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <Label htmlFor="settings-name" className="text-muted-foreground">
                  Display name
                </Label>
                <Input
                  id="settings-name"
                  value={profile.name}
                  maxLength={40}
                  onChange={(event) => onProfile({ name: event.target.value })}
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <Label htmlFor="settings-plan" className="text-muted-foreground">
                  Plan label
                </Label>
                <Select value={profile.plan} onValueChange={(plan) => onProfile({ plan })}>
                  <SelectTrigger id="settings-plan" className="h-10 w-full max-[860px]:text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLANS.map((plan) => (
                      <SelectItem key={plan} value={plan}>
                        {plan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-border-soft pt-3.5">
              <span className="min-w-0 flex-1 text-xs leading-relaxed text-faint">
                {session
                  ? "Signed in on this browser. Nothing is sent to a server."
                  : "The session is local to this browser until you wire a provider."}
              </span>
              <Button type="button" variant="outline" className="rounded-full" onClick={onChangeAccount}>
                <UserRound size={15} />
                {session ? "Change account" : "Sign in"}
              </Button>
              {session && (
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-full text-muted-foreground"
                  onClick={onSignOut}
                >
                  <LogOut size={15} />
                  Sign out
                </Button>
              )}
            </div>
          </Card>

          <Card className={section} id="settings-appearance">
            <h2 className="m-0 text-base font-semibold tracking-[-0.01em]">Appearance</h2>
            <p className="m-0 text-sm leading-normal text-muted-foreground">
              System follows your OS. The choice is remembered here.
            </p>
            <div
              role="group"
              aria-label="Theme"
              className="grid grid-cols-3 gap-2 max-[560px]:grid-cols-1"
            >
              {THEMES.map((entry) => {
                const on = theme === entry.id;
                return (
                  <button
                    key={entry.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => onTheme(entry.id)}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border border-border px-2.5 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-hover",
                      on && "border-brand/45 bg-brand-soft font-medium text-foreground hover:bg-brand-soft",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "grid size-[26px] shrink-0 place-items-center rounded-lg border border-border",
                        entry.id === "light" && "bg-white text-[#3c3c3c]",
                        entry.id === "dark" && "bg-[#1b1b1e] text-[#ededed]",
                        entry.id === "system" &&
                          "bg-[linear-gradient(135deg,#ffffff_50%,#1b1b1e_50%)] text-[#8b8b8b]",
                      )}
                    >
                      {entry.id === "dark" ? <IconMoon size={15} /> : <IconSun size={15} />}
                    </span>
                    <span>{entry.label}</span>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className={section} id="settings-chat">
            <h2 className="m-0 text-base font-semibold tracking-[-0.01em]">Chat</h2>
            <div>
              <ToggleRow
                title="Send with Enter"
                detail={
                  settings.sendOnEnter
                    ? "Shift + Enter adds a new line."
                    : "Cmd + Enter sends. Enter adds a new line."
                }
                checked={settings.sendOnEnter}
                onChange={() => onSettings({ sendOnEnter: !settings.sendOnEnter })}
              />
              <ToggleRow
                title="Show model details"
                detail="Time to first token and token count under each answer."
                checked={settings.showMeta}
                onChange={() => onSettings({ showMeta: !settings.showMeta })}
              />
            </div>
          </Card>

          <button
            type="button"
            onClick={onOpenMobile}
            className="flex items-center gap-3 rounded-2xl border border-border-soft bg-card p-4 text-left transition-colors hover:border-border hover:bg-hover"
          >
            <span
              aria-hidden="true"
              className="grid size-[38px] shrink-0 place-items-center rounded-xl bg-brand-soft text-brand"
            >
              <IconPhone size={20} />
            </span>
            <span className="min-w-0 flex-1">
              <strong className="block text-sm font-semibold">Download the mobile app</strong>
              <span className="text-xs leading-relaxed text-faint">
                Add to your home screen, or point the buttons at your own store listings.
              </span>
            </span>
            <span className="shrink-0 text-xs text-faint">Open</span>
          </button>

          <Card className={section} id="settings-data">
            <h2 className="m-0 text-base font-semibold tracking-[-0.01em]">Data</h2>
            <p className="m-0 text-sm leading-normal text-muted-foreground">
              {stats.chats} chat{stats.chats === 1 ? "" : "s"}, {stats.projects} project
              {stats.projects === 1 ? "" : "s"}, {stats.skills} skill
              {stats.skills === 1 ? "" : "s"} and {stats.connectors} connector
              {stats.connectors === 1 ? "" : "s"} on. All of it lives in localStorage.
            </p>
            <div className="border-t border-border-soft py-3 first:border-0 first:pt-0.5">
              <div className="flex items-center gap-3">
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">Archived chats</span>
                  <span className="block text-xs leading-relaxed text-faint">
                    {archived === 0
                      ? "No archived chats."
                      : `${archived} chat${archived === 1 ? "" : "s"} hidden from the sidebar.`}
                  </span>
                </span>
                <Button type="button" variant="outline" className="shrink-0 rounded-full" onClick={onOpenArchive}>
                  <IconArchive size={15} />
                  Review
                </Button>
              </div>
            </div>
            <div className="border-t border-border-soft py-3">
              <div className="flex items-center gap-3">
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">Export workspace</span>
                  <span className="block text-xs leading-relaxed text-faint">
                    Download chats and settings as JSON.
                  </span>
                </span>
                <Button type="button" variant="outline" className="shrink-0 rounded-full" onClick={onExport}>
                  <IconDownload size={15} />
                  Export
                </Button>
              </div>
            </div>
            <div className="mt-3 flex flex-col items-start gap-3 border-t border-border-soft pt-3.5 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <strong className="mb-0.5 block text-sm font-semibold">Clear local data</strong>
                <span className="text-xs leading-relaxed text-faint">
                  Removes every chat, project, skill and setting from this browser. Cannot be
                  undone.
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
                  onClear();
                }}
              >
                <IconTrash size={15} />
                {armed ? "Delete everything" : "Clear"}
              </Button>
            </div>
          </Card>

          <Card className={section} id="settings-about">
            <h2 className="m-0 text-base font-semibold tracking-[-0.01em]">About</h2>
            <dl className="mt-1.5 mb-0">
              {[
                ["Template", "Web chat · v0.1.0"],
                ["Stack", "React + Vite + Tailwind CSS, with shadcn/ui components."],
                ["Transport", "OpenAI-compatible SSE through one ChatAdapter contract."],
                ["Auth", "Local session in useAuth. Swap signIn for your provider."],
                ["Telemetry", "None. Nothing leaves this browser unless your adapter sends it."],
              ].map(([term, value]) => (
                <div
                  key={term}
                  className="flex justify-between gap-4 border-t border-border-soft py-2.5 text-sm first:border-0"
                >
                  <dt className="shrink-0 text-faint">{term}</dt>
                  <dd className="m-0 text-right text-muted-foreground">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="border-t border-border-soft py-3">
              <div className="flex items-center gap-3">
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">Keyboard shortcuts</span>
                  <span className="block text-xs leading-relaxed text-faint">
                    New chat, search, sidebar, send and stop.
                  </span>
                </span>
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0 rounded-full"
                  onClick={onOpenShortcuts}
                >
                  <IconKeyboard size={15} />
                  View
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Page>
  );
}
