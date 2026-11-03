import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";

import { ArchiveDialog } from "@/components/ArchiveDialog";
import { ChatOptionsDialog } from "@/components/ChatOptionsDialog";
import { Composer } from "@/components/Composer";
import { EmptyState } from "@/components/EmptyState";
import { IconButton } from "@/components/icon-button";
import {
  IconArrowLeft,
  IconGhost,
  IconMenu,
  IconMoon,
  IconMore,
  IconShare,
  IconSun,
} from "@/components/Icons";
import { SearchDialog } from "@/components/SearchDialog";
import { ShareDialog } from "@/components/ShareDialog";
import { ShortcutsDialog } from "@/components/ShortcutsDialog";
import { Sidebar } from "@/components/Sidebar";
import { ThreadView } from "@/components/ThreadView";

import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { useDialogs } from "@/hooks/use-dialogs";
import { useHotkeys } from "@/hooks/use-hotkeys";
import { useShell } from "@/hooks/use-shell";
import { useTheme } from "@/hooks/use-theme";
import { useWorkspaceExport } from "@/hooks/use-workspace-export";
import { adapter } from "@/lib/adapter";
import { greetingLine, greetingName, timeGreeting } from "@/lib/greeting";
import { useChat } from "@/lib/useChat";
import { cn } from "@/lib/utils";
import { VIEW_TITLE } from "@/lib/views";
import { systemPrompt, useWorkspace } from "@/lib/workspace";

//panels load on demand so the chat shell stays in the entry chunk
const AuthPage = lazy(() =>
  import("@/components/pages/AuthPage").then((m) => ({ default: m.AuthPage })),
);
const ConnectorsPage = lazy(() =>
  import("@/components/pages/ConnectorsPage").then((m) => ({ default: m.ConnectorsPage })),
);
const CustomizePage = lazy(() =>
  import("@/components/pages/CustomizePage").then((m) => ({ default: m.CustomizePage })),
);
const MobileAppPage = lazy(() =>
  import("@/components/pages/MobileAppPage").then((m) => ({ default: m.MobileAppPage })),
);
const ProjectsPage = lazy(() =>
  import("@/components/pages/ProjectsPage").then((m) => ({ default: m.ProjectsPage })),
);
const SettingsPage = lazy(() =>
  import("@/components/pages/SettingsPage").then((m) => ({ default: m.SettingsPage })),
);
const SkillsPage = lazy(() =>
  import("@/components/pages/SkillsPage").then((m) => ({ default: m.SkillsPage })),
);

const env = import.meta.env;

const BRAND = String(env.VITE_BRAND ?? "Chat");
//set VITE_HEADLINE to replace the personalized greeting
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

export default function App() {
  const workspace = useWorkspace();
  const auth = useAuth();
  const { theme, pref, setPref } = useTheme();
  const { view, openPage, railOpen, setRailOpen } = useShell();
  const dialogs = useDialogs();
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [focusKey, setFocusKey] = useState(0);
  const [authEmail, setAuthEmail] = useState(auth.lastEmail);

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
  const menuThread = chat.threads.find((thread) => thread.id === dialogs.threadMenuId) ?? null;
  const shareThread = chat.threads.find((thread) => thread.id === dialogs.shareId) ?? null;

  const exportData = useWorkspaceExport(chat.threads, workspace);

  useEffect(() => {
    if (activeProjectId && !workspace.projects.some((item) => item.id === activeProjectId)) {
      setActiveProjectId(null);
    }
  }, [activeProjectId, workspace.projects]);

  const openSearch = useCallback(() => {
    dialogs.setSearchOpen(true);
    if (window.innerWidth <= 860) setRailOpen(false);
  }, [dialogs.setSearchOpen, setRailOpen]);

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

  const clearData = useCallback(() => {
    chat.clearAll();
    workspace.reset();
    auth.signOut();
    setActiveProjectId(null);
    dialogs.closeAll();
    openPage("chat");
  }, [auth.signOut, chat.clearAll, dialogs.closeAll, openPage, workspace.reset]);

  const signIn = useCallback(
    (email: string, name = "") => {
      const next = auth.signIn(email, name);
      workspace.setProfile({ name: next.name, plan: next.plan });
      openPage("chat");
    },
    [auth.signIn, openPage, workspace.setProfile],
  );

  const changeAccount = useCallback(() => {
    setAuthEmail(auth.session?.email ?? "");
    auth.signOut();
    openPage("login");
  }, [auth.session?.email, auth.signOut, openPage]);

  const signOut = useCallback(() => {
    setAuthEmail("");
    auth.signOut();
    openPage("login");
  }, [auth.signOut, openPage]);

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
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
        dialogs.setShortcutsOpen(true);
      }
    },
    [
      chat.isStreaming,
      chat.stop,
      dialogs.setShortcutsOpen,
      newChat,
      openSearch,
      setRailOpen,
    ],
  );

  useHotkeys(onKeyDown);

  if (view === "login" || view === "signup") {
    return (
      <TooltipProvider>
        <Suspense fallback={null}>
          <AuthPage
            mode={view}
            brand={BRAND}
            theme={theme}
            defaultEmail={authEmail}
            onTheme={() => setPref(theme === "dark" ? "light" : "dark")}
            onSignIn={signIn}
            onSignUp={(name, email) => signIn(email, name)}
            onSwitch={openPage}
            onClose={() => openPage("chat")}
          />
        </Suspense>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div
        className={cn(
          "grid h-[var(--app-height,100dvh)] overflow-hidden",
          railOpen
            ? "grid-cols-1 min-[861px]:grid-cols-[280px_minmax(0,1fr)]"
            : "grid-cols-1",
        )}
      >
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
            onOpenThread={(id) => dialogs.setThreadMenuId(id)}
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
            session={auth.session}
            onChangeAccount={changeAccount}
            onSignOut={signOut}
            connectorsOn={connectorsOn}
            skillsOn={skillsOn}
          />
        )}

        {railOpen && (
          <div
            aria-hidden="true"
            onClick={() => setRailOpen(false)}
            className="fixed inset-0 z-30 bg-black/30 min-[861px]:hidden"
          />
        )}

        <main className="relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
          <div className="flex min-h-[52px] items-center gap-2 border-b border-border-soft px-3 py-2 pt-[calc(8px+env(safe-area-inset-top))] pr-[max(12px,env(safe-area-inset-right))] pl-[max(12px,env(safe-area-inset-left))]">
            <IconButton
              label={railOpen ? "Hide chats" : "Show chats"}
              aria-expanded={railOpen}
              onClick={() => setRailOpen((open) => !open)}
              className={cn(railOpen && "inline-flex min-[861px]:hidden")}
            >
              <IconMenu />
            </IconButton>
            {view !== "chat" && (
              <IconButton label="Back to chat" onClick={() => openPage("chat")}>
                <IconArrowLeft size={18} />
              </IconButton>
            )}
            <span className="min-w-0 flex-1 truncate text-sm font-semibold">
              {view === "chat"
                ? (activeThread?.title ?? activeProject?.name ?? BRAND)
                : VIEW_TITLE[view]}
            </span>
            <div className="flex flex-none items-center gap-0.5">
              {view === "chat" && activeThread && !activeThread.temporary && (
                <IconButton
                  label="Share chat"
                  onClick={() => dialogs.setShareId(activeThread.id)}
                >
                  <IconShare />
                </IconButton>
              )}
              {view === "chat" && activeThread && (
                <IconButton
                  label="Chat options"
                  onClick={() => dialogs.setThreadMenuId(activeThread.id)}
                >
                  <IconMore />
                </IconButton>
              )}
              <IconButton
                label="Toggle theme"
                onClick={() => setPref(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? <IconSun /> : <IconMoon />}
              </IconButton>
            </div>
          </div>

          {view === "chat" && (
            <>
              {(chat.temporary || chat.thread?.temporary) && (
                <div
                  role="status"
                  className="flex flex-wrap items-center gap-2 border-b border-border-soft bg-brand-soft px-4 py-2 text-sm"
                >
                  <IconGhost size={15} className="shrink-0 text-brand" />
                  <span>
                    Temporary chat. It disappears when you start another chat and is never written
                    to storage.
                  </span>
                  <button
                    type="button"
                    onClick={newChat}
                    className="ml-auto text-sm font-medium whitespace-nowrap text-brand hover:underline max-[860px]:ml-0"
                  >
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

              <div className="flex-none bg-[linear-gradient(to_top,var(--background)_68%,transparent)] px-4 pt-2.5 pb-[calc(12px+env(safe-area-inset-bottom))] max-[860px]:px-2.5 max-[860px]:pb-[calc(10px+env(safe-area-inset-bottom))]">
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
                <p className="mx-auto mt-2 max-w-column text-center text-xs text-faint">
                  {DISCLAIMER}
                </p>
              </div>
            </>
          )}

          <Suspense fallback={null}>
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
                session={auth.session}
                onChangeAccount={changeAccount}
                onSignOut={signOut}
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
                onOpenArchive={() => dialogs.setArchiveOpen(true)}
                onOpenShortcuts={() => dialogs.setShortcutsOpen(true)}
                onOpenMobile={() => openPage("mobile")}
              />
            )}

            {view === "mobile" && <MobileAppPage brand={BRAND} />}
          </Suspense>
        </main>

        {dialogs.searchOpen && (
          <SearchDialog
            threads={chat.threads}
            onClose={() => dialogs.setSearchOpen(false)}
            onSelect={(id) => {
              const target = chat.threads.find((thread) => thread.id === id);
              if (activeProjectId && target?.projectId !== activeProjectId)
                setActiveProjectId(null);
              chat.selectThread(id);
              dialogs.setSearchOpen(false);
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
              dialogs.setThreadMenuId(null);
              dialogs.setShareId(menuThread.id);
            }}
            onPin={() => {
              chat.togglePin(menuThread.id);
              dialogs.setThreadMenuId(null);
            }}
            onArchive={() => {
              chat.setArchived(menuThread.id, true);
              dialogs.setThreadMenuId(null);
            }}
            onDelete={() => {
              chat.deleteThread(menuThread.id);
              dialogs.setThreadMenuId(null);
            }}
            onClose={() => dialogs.setThreadMenuId(null)}
          />
        )}

        {shareThread && (
          <ShareDialog
            thread={shareThread}
            onShared={(shared) => chat.setShared(shareThread.id, shared)}
            onClose={() => dialogs.setShareId(null)}
          />
        )}

        {dialogs.archiveOpen && (
          <ArchiveDialog
            threads={archivedThreads}
            onRestore={(id) => chat.setArchived(id, false)}
            onClose={() => dialogs.setArchiveOpen(false)}
          />
        )}

        {dialogs.shortcutsOpen && (
          <ShortcutsDialog onClose={() => dialogs.setShortcutsOpen(false)} />
        )}
      </div>
    </TooltipProvider>
  );
}
