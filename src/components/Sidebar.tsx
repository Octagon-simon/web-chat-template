import { LogOut, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Session } from "@/hooks/use-auth";
import { useThreadGroups } from "@/hooks/use-thread-groups";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";
import type { Thread } from "@/lib/types";
import type { Project } from "@/lib/workspace";
import { IconButton } from "./icon-button";
import {
  IconArrowLeft,
  IconChevron,
  IconCog,
  IconFolder,
  IconGhost,
  IconMore,
  IconPanel,
  IconPhone,
  IconPlug,
  IconPlus,
  IconSearch,
  IconSliders,
  IconSparkles,
} from "./Icons";

interface SidebarProps {
  threads: Thread[];
  activeId: string | null;
  onNew: () => void;
  onNewTemporary: () => void;
  temporary: boolean;
  onSelect: (id: string) => void;
  onOpenThread: (id: string) => void;
  onClose: () => void;
  brand: string;
  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (id: string | null) => void;
  onOpenSearch: () => void;
  onOpenProjects: () => void;
  onOpenConnectors: () => void;
  onOpenCustomize: () => void;
  onOpenSkills: () => void;
  onOpenSettings: () => void;
  onOpenMobile: () => void;
  session: Session | null;
  onChangeAccount: () => void;
  onSignOut: () => void;
  connectorsOn: number;
  skillsOn: number;
}

const row =
  "flex min-h-10 items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-hover hover:text-foreground";

export function Sidebar({
  threads,
  activeId,
  onNew,
  onNewTemporary,
  temporary,
  onSelect,
  onOpenThread,
  onClose,
  brand,
  projects,
  activeProject,
  onSelectProject,
  onOpenSearch,
  onOpenProjects,
  onOpenConnectors,
  onOpenCustomize,
  onOpenSkills,
  onOpenSettings,
  onOpenMobile,
  session,
  onChangeAccount,
  onSignOut,
  connectorsOn,
  skillsOn,
}: SidebarProps) {
  const groups = useThreadGroups(threads);

  return (
    <aside className="flex min-h-0 flex-col border-r border-border bg-rail max-[860px]:fixed max-[860px]:inset-y-0 max-[860px]:left-0 max-[860px]:z-40 max-[860px]:w-[min(320px,86vw)] max-[860px]:shadow-[0_0_40px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between gap-2 px-3 pt-[calc(14px+env(safe-area-inset-top))] pb-1.5 pl-[max(16px,env(safe-area-inset-left))]">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden="true"
            className="size-[22px] shrink-0 rounded-md bg-linear-to-br from-brand to-[#5464d6] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]"
          />
          <span className="truncate text-sm font-semibold tracking-[-0.01em]">{brand}</span>
        </div>
        <IconButton label="Hide sidebar" onClick={onClose}>
          <IconPanel />
        </IconButton>
      </div>

      <button
        type="button"
        onClick={onNew}
        className="mx-3 my-1.5 flex min-h-10 items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors hover:bg-hover"
      >
        <IconPlus />
        <span>New chat</span>
        <kbd className="ml-auto text-xs text-faint">⌘J</kbd>
      </button>

      <button
        type="button"
        onClick={onNewTemporary}
        aria-pressed={temporary}
        className={cn(
          "mx-3 mb-1.5 -mt-1 flex min-h-10 items-center gap-2.5 rounded-lg border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-hover hover:text-foreground",
          temporary && "border-brand/45 bg-brand-soft text-brand hover:bg-brand-soft hover:text-brand",
        )}
      >
        <IconGhost />
        <span>Temporary chat</span>
        {temporary ? (
          <Badge variant="brand" className="ml-auto bg-brand/15 px-2 py-px font-semibold">
            On
          </Badge>
        ) : null}
      </button>

      <nav aria-label="Workspace" className="flex flex-col gap-px px-2 pb-1.5">
        <button type="button" className={row} onClick={onOpenSearch}>
          <IconSearch size={17} className="shrink-0 opacity-85" />
          <span className="min-w-0 flex-1 truncate">Search chats</span>
          <kbd className="text-xs text-faint">⌘K</kbd>
        </button>
        <button type="button" className={row} onClick={onOpenProjects}>
          <IconFolder size={17} className="shrink-0 opacity-85" />
          <span className="min-w-0 flex-1 truncate">Projects</span>
          {projects.length > 0 && (
            <span className="rounded-full bg-hover px-1.5 py-px text-xs tabular-nums text-faint">
              {projects.length}
            </span>
          )}
        </button>
        <button type="button" className={row} onClick={onOpenSkills}>
          <IconSparkles size={17} className="shrink-0 opacity-85" />
          <span className="min-w-0 flex-1 truncate">Skills</span>
          {skillsOn > 0 && (
            <span className="rounded-full bg-hover px-1.5 py-px text-xs tabular-nums text-faint">
              {skillsOn}
            </span>
          )}
        </button>
        <button type="button" className={row} onClick={onOpenConnectors}>
          <IconPlug size={17} className="shrink-0 opacity-85" />
          <span className="min-w-0 flex-1 truncate">Connectors</span>
          {connectorsOn > 0 && (
            <span className="rounded-full bg-hover px-1.5 py-px text-xs tabular-nums text-faint">
              {connectorsOn}
            </span>
          )}
        </button>
        <button type="button" className={row} onClick={onOpenCustomize}>
          <IconSliders size={17} className="shrink-0 opacity-85" />
          <span className="min-w-0 flex-1 truncate">Customize</span>
        </button>
        <button type="button" className={row} onClick={onOpenMobile}>
          <IconPhone size={17} className="shrink-0 opacity-85" />
          <span className="min-w-0 flex-1 truncate">Mobile app</span>
          <Badge variant="brand" className="px-1.5 py-px">
            New
          </Badge>
        </button>
        <button type="button" className={row} onClick={onOpenSettings}>
          <IconCog size={17} className="shrink-0 opacity-85" />
          <span className="min-w-0 flex-1 truncate">Settings</span>
        </button>
      </nav>

      {activeProject && (
        <div className="mx-3 mb-1.5 flex items-center gap-2 rounded-lg bg-active px-2 py-1.5 text-sm">
          <IconButton
            label="Back to all chats"
            tooltip={false}
            onClick={() => onSelectProject(null)}
            className="size-[22px] rounded-md max-[860px]:size-[22px]"
          >
            <IconArrowLeft size={15} />
          </IconButton>
          <span
            aria-hidden="true"
            className="size-[9px] shrink-0 rounded-[4px]"
            style={{ background: activeProject.color }}
          />
          <span className="min-w-0 flex-1 truncate font-medium">{activeProject.name}</span>
        </div>
      )}

      <nav
        aria-label="Chat history"
        className="min-h-0 flex-1 overflow-y-auto px-2 pt-1 pb-3 [scrollbar-width:thin]"
      >
        {groups.length === 0 && (
          <p className="mx-2 my-2.5 text-sm text-faint">
            {activeProject ? "No chats in this project yet." : "No chats yet."}
          </p>
        )}
        {groups.map(([label, items]) => (
          <section key={label}>
            <h2 className="mx-2 mt-3 mb-0.5 text-xs font-semibold tracking-[0.06em] text-faint uppercase">
              {label}
            </h2>
            <ul className="m-0 list-none p-0">
              {items.map((thread) => {
                const active = thread.id === activeId;
                return (
                  <li key={thread.id} className="group relative flex items-center">
                    <button
                      type="button"
                      onClick={() => onSelect(thread.id)}
                      aria-current={active ? "true" : undefined}
                      className={cn(
                        "flex min-h-10 min-w-0 flex-1 items-center gap-1.5 rounded-lg py-1.5 pr-[34px] pl-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-hover hover:text-foreground",
                        active && "bg-active font-medium text-foreground",
                      )}
                    >
                      <span className="block truncate">{thread.title}</span>
                      {thread.sharedAt ? (
                        <Badge variant="brand" className="shrink-0 px-1.5 py-px font-semibold">
                          Shared
                        </Badge>
                      ) : null}
                    </button>
                    <IconButton
                      label={`Options for ${thread.title}`}
                      tooltip={false}
                      onClick={() => onOpenThread(thread.id)}
                      className="absolute right-1 size-[26px] rounded-md text-faint opacity-0 group-hover:opacity-100 focus-visible:opacity-100 max-[860px]:size-9"
                    >
                      <IconMore size={15} />
                    </IconButton>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </nav>

      <div className="shrink-0 border-t border-border-soft">
        {session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center gap-2.5 px-3 pt-2.5 pb-[calc(10px+env(safe-area-inset-bottom))] text-left transition-colors hover:bg-hover"
              >
                <span
                  aria-hidden="true"
                  className="grid size-7 shrink-0 place-items-center rounded-full bg-linear-to-br from-[#2451da] to-[#5464d6] text-xs font-semibold tracking-[0.02em] text-white"
                >
                  {initials(session.name)}
                </span>
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block truncate text-sm font-medium">{session.name}</span>
                  <span className="block truncate text-xs text-faint">{session.email}</span>
                </span>
                <IconChevron size={16} className="shrink-0 text-faint" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" sideOffset={8} className="w-[264px]">
              <DropdownMenuLabel className="flex flex-col gap-0.5 px-2 py-1.5">
                <span className="truncate text-sm font-semibold">{session.name}</span>
                <span className="truncate text-xs font-normal text-faint">{session.email}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={onOpenSettings}>
                <IconCog size={16} />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onChangeAccount}>
                <UserRound size={16} />
                Change account
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={onSignOut}>
                <LogOut size={16} />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <button
            type="button"
            onClick={onChangeAccount}
            className="flex w-full items-center gap-2.5 px-3 pt-2.5 pb-[calc(10px+env(safe-area-inset-bottom))] text-left transition-colors hover:bg-hover"
          >
            <span
              aria-hidden="true"
              className="grid size-7 shrink-0 place-items-center rounded-full border border-border text-faint"
            >
              <UserRound size={15} />
            </span>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-sm font-medium">Sign in</span>
              <span className="block truncate text-xs text-faint">Not signed in</span>
            </span>
            <IconChevron size={16} className="shrink-0 text-faint" />
          </button>
        )}
      </div>
    </aside>
  );
}
