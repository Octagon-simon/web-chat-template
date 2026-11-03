import { useCallback, useEffect, useMemo, useState } from "react";
import { ArchiveDialog } from "./components/ArchiveDialog";
import { ChatOptionsDialog } from "./components/ChatOptionsDialog";
import { Composer } from "./components/Composer";
import { EmptyState } from "./components/EmptyState";
import {
  IconArrowLeft,
  IconGhost,
  IconMenu,
  IconMoon,
  IconMore,
  IconShare,
  IconSun,
} from "./components/Icons";
import { ShortcutsDialog } from "./components/ShortcutsDialog";
import { ConnectorsPage } from "./components/pages/ConnectorsPage";
import { CustomizePage } from "./components/pages/CustomizePage";
import { MobileAppPage } from "./components/pages/MobileAppPage";
import { ProjectsPage } from "./components/pages/ProjectsPage";
import { SettingsPage } from "./components/pages/SettingsPage";
import { SkillsPage } from "./components/pages/SkillsPage";
import { SearchDialog } from "./components/SearchDialog";
import { ShareDialog } from "./components/ShareDialog";
import { Sidebar } from "./components/Sidebar";
import { ThreadView } from "./components/ThreadView";
import { adapter } from "./lib/adapter";
import { greetingLine, greetingName, timeGreeting } from "./lib/greeting";
import { useChat } from "./lib/useChat";
import { systemPrompt, useWorkspace } from "./lib/workspace";
import type { ThemePref } from "./lib/types";

const env = import.meta.env;

const BRAND = String(env.VITE_BRAND ?? "Chat");
// set VITE_HEADLINE to replace the personalized greeting
const HEADLINE = env.VITE_HEADLINE ? String(env.VITE_HEADLINE) : null;
const PLACEHOLDER = String(env.VITE_PLACEHOLDER ?? "Ask anything");
const DISCLAIMER = String(
  env.VITE_DISCLAIMER ?? "Model output can be wrong. Verify anything that matters.",
);
const SUGGESTIONS = String(
  env.VITE_SUGGESTIONS ??
    "Summarize a long document,Write a regex I can trust,Explain this error message",
)
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

const THEME_KEY = "chat-template.theme";

type View = "chat" | "projects" | "connectors" | "customize" | "skills" | "settings" | "mobile";

const VIEWS: View[] = ["projects", "connectors", "customize", "skills", "settings", "mobile"];

const VIEW_TITLE: Record<Exclude<View, "chat">, string> = {
  projects: "Projects",
  connectors: "Connectors",
  customize: "Customize",
  skills: "Skills",
  settings: "Settings",
  mobile: "Mobile app",
};

function readPref(): ThemePref {
  const saved = localStorage.getItem(THEME_KEY);
  return saved === "light" || saved === "dark" ? saved : "system";
}

function resolve(pref: ThemePref): "light" | "dark" {
  if (pref !== "system") return pref;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** `?panel=projects` opens a page on load, for docs and screenshots. */
function initialView(): View {
  const value = new URLSearchParams(location.search).get("panel");
  if (value === "account") return "settings";
  if (value && (VIEWS as string[]).includes(value)) return value as View;
  return "chat";
}

function initialSearch(): boolean {
  return new URLSearchParams(location.search).get("panel") === "search";
}

export default function App() {
  const workspace = useWorkspace();
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [pref, setPref] = useState<ThemePref>(readPref);
  const [theme, setTheme] = useState<"light" | "dark">(() => resolve(pref));
  const [view, setView] = useState<View>(initialView);
  const [searchOpen, setSearchOpen] = useState(initialSearch);
  const [threadMenuId, setThreadMenuId] = useState<string | null>(null);
  const [shareId, setShareId] = useState<string | null>(null);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [railOpen, setRailOpen] = useState(() => window.innerWidth > 860);
  const [focusKey, setFocusKey] = useState(0);

  const activeSkills = useMemo(
    () => workspace.skills.filter((skill) => workspace.skillOn[skill.id]),
    [workspace.skills, workspace.skillOn],
  );
  const prompt = useMemo(
    () => systemPrompt(workspace.instructions, workspace.style, activeSkills),
    [workspace.instructions, workspace.style, activeSkills],
  );

  const chat = useChat({ systemPrompt: prompt, projectId: activeProjectId });

  const activeProject = workspace.projects.find((item) => item.id === activeProjectId) ?? null;
  const name = greetingName(workspace.profile.name);
  const greetingHeadline =
    HEADLINE ?? (name ? `${timeGreeting()}, ${name}.` : `${timeGreeting()}.`);
  const visibleThreads = chat.threads.filter(
    (thread) =>
      !thread.archivedAt &&
      !thread.temporary &&
      (!activeProjectId || thread.projectId === activeProjectId),
  );
  const archivedThreads = chat.threads.filter((thread) => thread.archivedAt);
  const connectorsOn = workspace.connectors.filter((item) => workspace.enabled[item.id]).length;
  const skillsOn = activeSkills.length;
  const activeThread = chat.thread;
  const menuThread = chat.threads.find((thread) => thread.id === threadMenuId) ?? null;
  const shareThread = chat.threads.find((thread) => thread.id === shareId) ?? null;

  useEffect(() => {
    localStorage.setItem(THEME_KEY, pref);
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () =>
      setTheme(pref === "system" ? (media.matches ? "dark" : "light") : pref);
    apply();
    if (pref !== "system") return;
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [pref]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    //an in-app theme override has to win over the OS preference in the manifest metas
    const color = theme === "dark" ? "#0f0f10" : "#ffffff";
    document
      .querySelectorAll('meta[name="theme-color"]')
      .forEach((meta) => meta.setAttribute("content", color));
  }, [theme]);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const apply = () => {
      document.documentElement.style.setProperty(
        "--app-height",
        `${Math.round(viewport.height)}px`,
      );
    };
    apply();
    viewport.addEventListener("resize", apply);
    return () => viewport.removeEventListener("resize", apply);
  }, []);

  useEffect(() => {
    if (activeProjectId && !workspace.projects.some((item) => item.id === activeProjectId)) {
      setActiveProjectId(null);
    }
  }, [activeProjectId, workspace.projects]);

  const openPage = useCallback((next: View) => {
    setView(next);
    if (window.innerWidth <= 860) setRailOpen(false);
    const url = new URL(window.location.href);
    if (next === "chat") url.searchParams.delete("panel");
    else url.searchParams.set("panel", next);
    window.history.replaceState(null, "", url);
  }, []);

  const openSearch = useCallback(() => {
    setSearchOpen(true);
    if (window.innerWidth <= 860) setRailOpen(false);
  }, []);

  const newChat = useCallback(() => {
    chat.newThread();
    openPage("chat");
    setFocusKey((value) => value + 1);
  }, [chat.newThread, openPage]);

  const newTemporaryChat = useCallback(() => {
    chat.newTemporary();
    openPage("chat");
    setFocusKey((value) => value + 1);
  }, [chat.newTemporary, openPage]);

  const chooseProject = useCallback(
    (id: string | null) => {
      setActiveProjectId(id);
      if (id && chat.thread?.projectId !== id) chat.newThread();
      openPage("chat");
    },
    [chat.newThread, chat.thread, openPage],
  );

  const assignProject = useCallback(
    (id: string | null) => {
      if (chat.thread) chat.moveThread(chat.thread.id, id);
      setActiveProjectId(id);
    },
    [chat.moveThread, chat.thread],
  );

  const newChatInProject = useCallback(
    (id: string) => {
      setActiveProjectId(id);
      chat.newThread();
      openPage("chat");
      setFocusKey((value) => value + 1);
    },
    [chat.newThread, openPage],
  );

  const removeProject = useCallback(
    (id: string) => {
      workspace.removeProject(id);
      if (activeProjectId === id) setActiveProjectId(null);
      for (const thread of chat.threads) {
        if (thread.projectId === id) chat.moveThread(thread.id, null);
      }
    },
    [activeProjectId, chat.moveThread, chat.threads, workspace.removeProject],
  );

  const exportData = useCallback(() => {
    const payload = {
      exportedAt: new Date().toISOString(),
      threads: chat.threads,
      projects: workspace.projects,
      skills: workspace.skills,
      skillOn: workspace.skillOn,
      connectors: workspace.connectors,
      enabled: workspace.enabled,
      instructions: workspace.instructions,
      style: workspace.style,
      profile: workspace.profile,
      settings: workspace.settings,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "chat-workspace.json";
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [chat.threads, workspace]);

  const clearData = useCallback(() => {
    chat.clearAll();
    workspace.reset();
    setActiveProjectId(null);
    setSearchOpen(false);
    setThreadMenuId(null);
    setShareId(null);
    openPage("chat");
  }, [chat.clearAll, openPage, workspace.reset]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey;
      if (mod && event.key.toLowerCase() === "j") {
        event.preventDefault();
        newChat();
      } else if (mod && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openSearch();
      } else if (mod && event.key.toLowerCase() === "b") {
        event.preventDefault();
        setRailOpen((open) => !open);
      } else if (event.key === "Escape" && chat.isStreaming) {
        chat.stop();
      } else if (event.key === "?" && !document.querySelector('[role="dialog"]')) {
        const target = event.target as HTMLElement | null;
        const typing =
          target?.tagName === "INPUT" ||
          target?.tagName === "TEXTAREA" ||
          target?.isContentEditable;
        if (typing) return;
        event.preventDefault();
        setShortcutsOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chat.isStreaming, chat.stop, newChat, openSearch]);

  return (
    <div className={railOpen ? "app" : "app no-rail"}>
      {railOpen && (
        <Sidebar
          brand={BRAND}
          threads={visibleThreads}
          activeId={chat.thread?.id ?? null}
          onNew={newChat}
          onNewTemporary={newTemporaryChat}
          temporary={chat.temporary || Boolean(chat.thread?.temporary)}
          onSelect={(id) => {
            chat.selectThread(id);
            openPage("chat");
          }}
          onOpenThread={(id) => setThreadMenuId(id)}
          onClose={() => setRailOpen(false)}
          projects={workspace.projects}
          activeProject={activeProject}
          onSelectProject={chooseProject}
          onOpenSearch={openSearch}
          onOpenProjects={() => openPage("projects")}
          onOpenConnectors={() => openPage("connectors")}
          onOpenCustomize={() => openPage("customize")}
          onOpenSkills={() => openPage("skills")}
          onOpenSettings={() => openPage("settings")}
          onOpenMobile={() => openPage("mobile")}
          profile={workspace.profile}
          connectorsOn={connectorsOn}
          skillsOn={skillsOn}
        />
      )}

      {railOpen && <div className="scrim" onClick={() => setRailOpen(false)} aria-hidden="true" />}

      <main className="main">
        <div className="topbar">
          <button
            type="button"
            className="icon-btn topbar-menu"
            onClick={() => setRailOpen((open) => !open)}
            aria-label={railOpen ? "Hide chats" : "Show chats"}
            aria-expanded={railOpen}
            title={railOpen ? "Hide chats" : "Show chats"}
          >
            <IconMenu />
          </button>
          {view !== "chat" && (
            <button
              type="button"
              className="icon-btn topbar-back"
              onClick={() => openPage("chat")}
              aria-label="Back to chat"
              title="Back to chat"
            >
              <IconArrowLeft size={18} />
            </button>
          )}
          <span className="topbar-title">
            {view === "chat"
              ? activeThread?.title ?? activeProject?.name ?? BRAND
              : VIEW_TITLE[view]}
          </span>
          <div className="topbar-actions">
            {view === "chat" && activeThread && !activeThread.temporary && (
              <button
                type="button"
                className="icon-btn"
                onClick={() => setShareId(activeThread.id)}
                aria-label="Share chat"
                title="Share chat"
              >
                <IconShare />
              </button>
            )}
            {view === "chat" && activeThread && (
              <button
                type="button"
                className="icon-btn"
                onClick={() => setThreadMenuId(activeThread.id)}
                aria-label="Chat options"
                title="Rename, move or delete"
              >
                <IconMore />
              </button>
            )}
            <button
              type="button"
              className="icon-btn"
              onClick={() => setPref(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <IconSun /> : <IconMoon />}
            </button>
          </div>
        </div>

        {view === "chat" && (
          <>
            {(chat.temporary || chat.thread?.temporary) && (
              <div className="temporary-bar" role="status">
                <IconGhost size={15} />
                <span>
                  Temporary chat. It disappears when you start another chat and is never written to
                  storage.
                </span>
                <button type="button" className="link-btn" onClick={newChat}>
                  Start a saved chat
                </button>
              </div>
            )}

            <ThreadView
              thread={chat.thread}
              streamingId={chat.streamingId}
              onRegenerate={chat.regenerate}
              onEdit={chat.edit}
              onFeedback={(id, value) => {
                if (chat.thread) chat.setFeedback(chat.thread.id, id, value);
              }}
              showMeta={workspace.settings.showMeta}
            >
              <EmptyState
                headline={activeProject ? activeProject.name : greetingHeadline}
                detail={
                  activeProject
                    ? "Everything you start here stays in this project."
                    : greetingLine()
                }
                suggestions={SUGGESTIONS}
                onPick={(text) => {
                  chat.send(text);
                  setFocusKey((value) => value + 1);
                }}
              />
            </ThreadView>

            <div className="dock">
              <Composer
                streaming={chat.isStreaming}
                onSend={chat.send}
                onStop={chat.stop}
                model={chat.model}
                models={adapter.models}
                onModel={chat.setModel}
                modes={chat.modes}
                onToggleMode={chat.toggleMode}
                placeholder={PLACEHOLDER}
                autoFocusKey={focusKey}
                projects={workspace.projects}
                activeProjectId={activeProjectId}
                onAddToProject={assignProject}
                onOpenProjects={() => openPage("projects")}
                onOpenSkills={() => openPage("skills")}
                onOpenConnectors={() => openPage("connectors")}
                skillsOn={skillsOn}
                sendOnEnter={workspace.settings.sendOnEnter}
              />
              <p className="disclaimer">{DISCLAIMER}</p>
            </div>
          </>
        )}

        {view === "projects" && (
          <ProjectsPage
            projects={workspace.projects}
            threads={chat.threads.filter((thread) => !thread.archivedAt && !thread.temporary)}
            activeProjectId={activeProjectId}
            onOpen={chooseProject}
            onCreate={(name) => {
              const id = workspace.addProject(name);
              if (id) setActiveProjectId(id);
            }}
            onRename={workspace.renameProject}
            onRemove={removeProject}
            onNewChat={newChatInProject}
          />
        )}

        {view === "skills" && (
          <SkillsPage
            skills={workspace.skills}
            skillOn={workspace.skillOn}
            onToggle={workspace.toggleSkill}
            onAdd={workspace.addSkill}
            onRemove={workspace.removeSkill}
          />
        )}

        {view === "connectors" && (
          <ConnectorsPage
            connectors={workspace.connectors}
            enabled={workspace.enabled}
            onToggle={workspace.toggleConnector}
            onAdd={workspace.addConnector}
            onRemove={workspace.removeConnector}
          />
        )}

        {view === "customize" && (
          <CustomizePage
            instructions={workspace.instructions}
            style={workspace.style}
            activeSkills={activeSkills}
            skillsOn={skillsOn}
            onInstructions={workspace.setInstructions}
            onStyle={workspace.setStyle}
            onOpenSkills={() => openPage("skills")}
            onReset={() => {
              workspace.setInstructions("");
              workspace.setStyle("balanced");
            }}
          />
        )}

        {view === "settings" && (
          <SettingsPage
            profile={workspace.profile}
            onProfile={workspace.setProfile}
            theme={pref}
            onTheme={setPref}
            settings={workspace.settings}
            onSettings={workspace.setSettings}
            stats={{
              chats: chat.threads.filter((thread) => !thread.temporary).length,
              projects: workspace.projects.length,
              connectors: connectorsOn,
              skills: skillsOn,
            }}
            archived={archivedThreads.length}
            onExport={exportData}
            onClear={clearData}
            onOpenArchive={() => setArchiveOpen(true)}
            onOpenShortcuts={() => setShortcutsOpen(true)}
            onOpenMobile={() => openPage("mobile")}
          />
        )}

        {view === "mobile" && <MobileAppPage brand={BRAND} />}
      </main>

      {searchOpen && (
        <SearchDialog
          threads={chat.threads}
          onClose={() => setSearchOpen(false)}
          onSelect={(id) => {
            const target = chat.threads.find((thread) => thread.id === id);
            if (activeProjectId && target?.projectId !== activeProjectId) setActiveProjectId(null);
            chat.selectThread(id);
            setSearchOpen(false);
            openPage("chat");
          }}
        />
      )}

      {menuThread && (
        <ChatOptionsDialog
          thread={menuThread}
          projects={workspace.projects}
          onRename={(title) => chat.renameThread(menuThread.id, title)}
          onMove={(projectId) => {
            chat.moveThread(menuThread.id, projectId);
            if (chat.thread?.id === menuThread.id) setActiveProjectId(projectId);
          }}
          onShare={() => {
            setThreadMenuId(null);
            setShareId(menuThread.id);
          }}
          onPin={() => {
            chat.togglePin(menuThread.id);
            setThreadMenuId(null);
          }}
          onArchive={() => {
            chat.setArchived(menuThread.id, true);
            setThreadMenuId(null);
          }}
          onDelete={() => {
            chat.deleteThread(menuThread.id);
            setThreadMenuId(null);
          }}
          onClose={() => setThreadMenuId(null)}
        />
      )}

      {shareThread && (
        <ShareDialog
          thread={shareThread}
          onShared={(shared) => chat.setShared(shareThread.id, shared)}
          onClose={() => setShareId(null)}
        />
      )}

      {archiveOpen && (
        <ArchiveDialog
          threads={archivedThreads}
          onRestore={(id) => chat.setArchived(id, false)}
          onClose={() => setArchiveOpen(false)}
        />
      )}

      {shortcutsOpen && <ShortcutsDialog onClose={() => setShortcutsOpen(false)} />}
    </div>
  );
}