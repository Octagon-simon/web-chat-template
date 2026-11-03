import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useComposer } from "@/hooks/use-composer";
import { formatBytes } from "@/lib/attachments";
import type { Attachment } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/workspace";
import { IconButton } from "./icon-button";
import {
  IconCamera,
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
  const composer = useComposer({ streaming, sendOnEnter, autoFocusKey, onSend });
  const { speech } = composer;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        composer.submit();
      }}
      className="mx-auto w-full max-w-column rounded-card bg-card px-2.5 pt-2.5 pb-2 pl-3.5 shadow-card transition-shadow focus-within:shadow-card-focus max-[560px]:px-2 max-[560px]:pt-[9px] max-[560px]:pb-[7px] max-[560px]:pl-3"
    >
      {composer.attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {composer.attachments.map((item) => (
            <div
              key={item.id}
              className="flex max-w-[230px] items-center gap-2 rounded-lg border border-border-soft bg-background py-1 pr-1 pl-1.5"
            >
              {item.preview ? (
                <img src={item.preview} alt="" className="size-[34px] shrink-0 rounded-md object-cover" />
              ) : item.kind === "screenshot" ? (
                <IconCamera size={16} className="shrink-0 text-muted-foreground" />
              ) : (
                <IconFile size={16} className="shrink-0 text-muted-foreground" />
              )}
              <span className="flex min-w-0 flex-col text-xs leading-tight">
                <span className="truncate">{item.name}</span>
                <span className="text-faint">{formatBytes(item.size)}</span>
              </span>
              <IconButton
                label={`Remove ${item.name}`}
                tooltip={false}
                onClick={() => composer.removeAttachment(item.id)}
                className="size-5 shrink-0 rounded-md text-faint max-[860px]:size-8"
              >
                <IconX size={13} />
              </IconButton>
            </div>
          ))}
        </div>
      )}

      <label className="sr-only" htmlFor="composer-input">
        Message
      </label>
      <textarea
        id="composer-input"
        ref={composer.input}
        rows={1}
        value={composer.value}
        placeholder={placeholder}
        onChange={(event) => composer.setValue(event.target.value)}
        onKeyDown={composer.handleKeyDown}
        className="block max-h-[220px] min-h-6 w-full resize-none border-0 bg-transparent px-0.5 py-1 text-base leading-6 text-foreground outline-none placeholder:text-faint max-[860px]:min-h-10"
      />

      {(composer.note || speech.error) && (
        <p role="status" className="mt-0.5 mb-0 text-xs leading-snug text-destructive">
          {composer.note || speech.error}
        </p>
      )}

      <div className="mt-1.5 flex items-center justify-between gap-2 max-[560px]:flex-wrap max-[560px]:gap-y-1">
        <div className="flex min-w-0 items-center gap-1.5 overflow-visible max-[560px]:flex-[1_1_100%] max-[560px]:gap-0.5">
          <DropdownMenu open={composer.menuOpen} onOpenChange={composer.setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <IconButton label="Add files and tools" tooltip={false} active={composer.menuOpen}>
                <IconPlus />
              </IconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="max-h-[380px] w-[252px] overflow-y-auto">
              <DropdownMenuItem onSelect={() => composer.files.current?.click()}>
                <IconUpload />
                <span className="min-w-0 flex-1">Upload files</span>
                <span className="shrink-0 text-xs text-faint">Images, PDFs, text</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={!navigator.mediaDevices?.getDisplayMedia}
                onSelect={() => void composer.capture()}
              >
                <IconCamera />
                <span className="min-w-0 flex-1">Take a screenshot</span>
                <span className="shrink-0 text-xs text-faint">Share a tab</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onOpenSkills}>
                <IconSparkles />
                <span className="min-w-0 flex-1">Skills</span>
                <span className="shrink-0 text-xs text-faint">
                  {skillsOn > 0 ? `${skillsOn} active` : "None active"}
                </span>
              </DropdownMenuItem>

              <DropdownMenuLabel>Add to project</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={activeProjectId ?? "none"}
                onValueChange={(value) => onAddToProject(value === "none" ? null : value)}
              >
                <DropdownMenuRadioItem value="none">No project</DropdownMenuRadioItem>
                {projects.map((project) => (
                  <DropdownMenuRadioItem key={project.id} value={project.id}>
                    <span
                      aria-hidden="true"
                      className="size-[9px] shrink-0 rounded-[4px]"
                      style={{ background: project.color }}
                    />
                    {project.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>

              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={onOpenProjects}>
                <IconPaperclip />
                <span className="min-w-0 flex-1">Manage projects</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onOpenConnectors}>
                <IconPlug />
                <span className="min-w-0 flex-1">Connect apps</span>
                <span className="shrink-0 text-xs text-faint">Tools and data</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {MODES.map(({ id, label, Icon }) => {
            const on = Boolean(modes[id]);
            return (
              <Button
                key={id}
                type="button"
                size="sm"
                variant={on ? "secondary" : "ghost"}
                aria-label={label}
                aria-pressed={on}
                onClick={() => onToggleMode(id)}
                className={cn(
                  "h-8 rounded-full text-sm font-normal text-muted-foreground hover:text-foreground max-[860px]:h-10",
                  on
                    ? "gap-1.5 border border-brand/22 bg-brand-soft px-2.5 text-brand hover:bg-brand-soft hover:text-brand"
                    : "size-8 px-0 max-[860px]:size-10",
                )}
              >
                <Icon />
                {on && <span className="hidden min-[560px]:inline">{label}</span>}
                {on && <span className="sr-only min-[560px]:hidden">{label}</span>}
              </Button>
            );
          })}
        </div>

        <div className="flex flex-none items-center gap-1.5 max-[560px]:flex-[1_1_100%]">
          <Select value={model} onValueChange={onModel}>
            <SelectTrigger
              aria-label="Model"
              size="sm"
              className="h-8 max-w-[190px] gap-1 rounded-full border-0 bg-transparent px-2.5 text-sm text-muted-foreground hover:bg-hover hover:text-foreground max-[560px]:mr-auto max-[560px]:h-10 max-[560px]:max-w-[160px] max-[860px]:h-10"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {models.map((entry) => (
                <SelectItem key={entry.id} value={entry.id}>
                  {entry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <IconButton
            label={speech.listening ? "Stop dictation" : "Dictate a message"}
            active={speech.listening}
            aria-pressed={speech.listening}
            title={speech.supported ? undefined : "Speech recognition is not supported here"}
            onClick={composer.toggleMic}
            className={cn(speech.listening && "animate-live bg-destructive/15 text-destructive")}
          >
            <IconMic />
          </IconButton>

          {streaming ? (
            <Button
              type="button"
              size="icon"
              onClick={onStop}
              aria-label="Stop generating"
              className="size-8 rounded-full bg-send text-send-foreground hover:scale-105 hover:bg-send max-[860px]:size-10"
            >
              <IconStop />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              disabled={!composer.canSend}
              aria-label="Send message"
              className="size-8 rounded-full bg-send text-send-foreground transition-transform hover:scale-105 hover:bg-send disabled:opacity-28 max-[860px]:size-10"
            >
              <IconSend />
            </Button>
          )}
        </div>
      </div>

      <input
        ref={composer.files}
        type="file"
        multiple
        hidden
        tabIndex={-1}
        accept="image/*,.pdf,.txt,.md,.csv,.json,.doc,.docx"
        onChange={(event) => {
          void composer.addFiles(event.target.files);
          event.target.value = "";
        }}
      />
    </form>
  );
}
