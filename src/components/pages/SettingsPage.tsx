import { useEffect, useState } from "react";
import type { ThemePref } from "../../lib/types";
import type { Profile, Settings } from "../../lib/workspace";
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
    <div className="setting-row">
      <span className="grow">
        <span className="title">{title}</span>
        <span className="sub">{detail}</span>
      </span>
      <button
        type="button"
        className="switch-button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={onChange}
      >
        <span className="switch" aria-hidden="true" />
      </button>
    </div>
  );
}

export function SettingsPage({
  profile,
  onProfile,
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
    const scroller = document.querySelector(".page-scroll");
    if (!scroller) return;
    const track = () => {
      const line = scroller.getBoundingClientRect().top + 96;
      let next = SECTIONS[0][0];
      for (const [id] of SECTIONS) {
        const section = document.getElementById(id);
        if (section && section.getBoundingClientRect().top <= line) next = id;
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

  const initials =
    profile.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?";

  return (
    <Page
      title="Settings"
      description="Profile, appearance and the two behaviours that change how the composer feels. Everything is stored in this browser."
    >
      <div className="settings-layout">
        <nav className="settings-nav" aria-label="Settings sections">
          {SECTIONS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={active === id ? "is-on" : undefined}
              aria-current={active === id ? "true" : undefined}
              onClick={() => {
                setActive(id);
                jump(id);
              }}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="settings-stack">
          <section className="page-card" id="settings-profile">
            <div className="profile-head">
              <span className="avatar is-large" aria-hidden="true">
                {initials}
              </span>
              <div>
                <h2 className="card-title">{profile.name || "Workspace owner"}</h2>
                <p className="card-sub">
                  No auth layer ships with the template. Wire this identity to your own session
                  provider.
                </p>
              </div>
            </div>
            <div className="field-row">
              <div className="field grow">
                <label htmlFor="settings-name">Display name</label>
                <input
                  id="settings-name"
                  className="input"
                  value={profile.name}
                  maxLength={40}
                  onChange={(event) => onProfile({ name: event.target.value })}
                />
              </div>
              <div className="field grow">
                <label htmlFor="settings-plan">Plan label</label>
                <div className="select-wrap is-block">
                  <select
                    id="settings-plan"
                    value={profile.plan}
                    onChange={(event) => onProfile({ plan: event.target.value })}
                  >
                    {PLANS.map((plan) => (
                      <option key={plan} value={plan}>
                        {plan}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          <section className="page-card" id="settings-appearance">
            <h2 className="card-title">Appearance</h2>
            <p className="card-sub">System follows your OS. The choice is remembered here.</p>
            <div className="theme-grid" role="group" aria-label="Theme">
              {THEMES.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  className={theme === entry.id ? "theme-card is-active" : "theme-card"}
                  aria-pressed={theme === entry.id}
                  onClick={() => onTheme(entry.id)}
                >
                  <span className={`theme-swatch is-${entry.id}`} aria-hidden="true">
                    {entry.id === "dark" ? <IconMoon size={15} /> : <IconSun size={15} />}
                  </span>
                  <span>{entry.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="page-card" id="settings-chat">
            <h2 className="card-title">Chat</h2>
            <div className="setting-list">
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
          </section>

          <button type="button" className="page-card mobile-card" onClick={onOpenMobile}>
            <span className="mobile-card-icon" aria-hidden="true">
              <IconPhone size={20} />
            </span>
            <span className="grow">
              <strong>Download the mobile app</strong>
              <span className="hint">
                Add to your home screen, or point the buttons at your own store listings.
              </span>
            </span>
            <span className="sub">Open</span>
          </button>

          <section className="page-card" id="settings-data">
            <h2 className="card-title">Data</h2>
            <p className="card-sub">
              {stats.chats} chat{stats.chats === 1 ? "" : "s"}, {stats.projects} project
              {stats.projects === 1 ? "" : "s"}, {stats.skills} skill
              {stats.skills === 1 ? "" : "s"} and {stats.connectors} connector
              {stats.connectors === 1 ? "" : "s"} on. All of it lives in localStorage.
            </p>
            <div className="setting-row">
              <span className="grow">
                <span className="title">Archived chats</span>
                <span className="sub">
                  {archived === 0
                    ? "No archived chats."
                    : `${archived} chat${archived === 1 ? "" : "s"} hidden from the sidebar.`}
                </span>
              </span>
              <button type="button" className="btn" onClick={onOpenArchive}>
                <IconArchive size={15} />
                Review
              </button>
            </div>
            <div className="setting-row">
              <span className="grow">
                <span className="title">Export workspace</span>
                <span className="sub">Download chats and settings as JSON.</span>
              </span>
              <button type="button" className="btn" onClick={onExport}>
                <IconDownload size={15} />
                Export
              </button>
            </div>
            <div className="danger-zone">
              <div>
                <strong>Clear local data</strong>
                <span className="hint">
                  Removes every chat, project, skill and setting from this browser. Cannot be
                  undone.
                </span>
              </div>
              <button
                type="button"
                className={armed ? "btn btn-danger is-armed" : "btn btn-danger"}
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
              </button>
            </div>
          </section>

          <section className="page-card" id="settings-about">
            <h2 className="card-title">About</h2>
            <dl className="about-list">
              <div>
                <dt>Template</dt>
                <dd>Web chat · v0.1.0</dd>
              </div>
              <div>
                <dt>Stack</dt>
                <dd>React + Vite. React is the only runtime dependency.</dd>
              </div>
              <div>
                <dt>Transport</dt>
                <dd>OpenAI-compatible SSE through one ChatAdapter contract.</dd>
              </div>
              <div>
                <dt>Telemetry</dt>
                <dd>None. Nothing leaves this browser unless your adapter sends it.</dd>
              </div>
            </dl>
            <div className="setting-row">
              <span className="grow">
                <span className="title">Keyboard shortcuts</span>
                <span className="sub">New chat, search, sidebar, send and stop.</span>
              </span>
              <button type="button" className="btn" onClick={onOpenShortcuts}>
                <IconKeyboard size={15} />
                View
              </button>
            </div>
          </section>
        </div>
      </div>
    </Page>
  );
}
