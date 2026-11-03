import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { STYLES, systemPrompt, type Skill, type StyleId } from "@/lib/workspace";
import { IconCheck, IconSparkles } from "../Icons";
import { Page } from "./Page";

interface CustomizePageProps {
  instructions: string;
  style: StyleId;
  activeSkills: Skill[];
  skillsOn: number;
  onInstructions: (value: string) => void;
  onStyle: (value: StyleId) => void;
  onOpenSkills: () => void;
  onReset: () => void;
}

const LIMIT = 2000;

export function CustomizePage({
  instructions,
  style,
  activeSkills,
  skillsOn,
  onInstructions,
  onStyle,
  onOpenSkills,
  onReset,
}: CustomizePageProps) {
  const preview = systemPrompt(instructions, style, activeSkills);

  return (
    <Page
      title="Customize"
      description="Shape how every answer reads. Instructions and active skills ride along as one system message on each request."
      actions={
        <Button type="button" variant="outline" className="rounded-full" onClick={onReset}>
          Reset to defaults
        </Button>
      }
    >
      <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] items-start gap-4 max-[860px]:grid-cols-1">
        <Card className="gap-3 rounded-2xl border-border-soft p-4">
          <h2 className="m-0 text-base font-semibold tracking-[-0.01em]">Custom instructions</h2>
          <p className="m-0 text-sm leading-normal text-muted-foreground">
            Tell the model who it is and what it must not do. Keep it short; every request pays for
            it.
          </p>
          <label className="sr-only" htmlFor="custom-instructions">
            Custom instructions
          </label>
          <Textarea
            id="custom-instructions"
            rows={8}
            maxLength={LIMIT}
            value={instructions}
            placeholder="e.g. You are the support assistant for Acme. Answer from the product docs, cite the page, and never invent pricing."
            onChange={(event) => onInstructions(event.target.value)}
            className="min-h-[108px] resize-y leading-normal"
          />
          <div className="flex items-center justify-between gap-2.5">
            <span className="text-xs leading-relaxed text-faint">
              {instructions.length} / {LIMIT} characters
            </span>
            {instructions ? (
              <button
                type="button"
                onClick={() => onInstructions("")}
                className="rounded-md px-1 py-0.5 text-xs text-brand hover:bg-hover"
              >
                Clear
              </button>
            ) : null}
          </div>

          <h2 className="mt-6 mb-0 text-base font-semibold tracking-[-0.01em]">
            Response style
          </h2>
          <div
            role="group"
            aria-label="Response style"
            className="grid grid-cols-3 gap-2 max-[560px]:grid-cols-1"
          >
            {STYLES.map((entry) => {
              const active = style === entry.id;
              return (
                <button
                  key={entry.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onStyle(entry.id)}
                  className={cn(
                    "flex flex-col gap-1 rounded-xl border border-border bg-background p-3 text-left transition-colors hover:bg-hover",
                    active && "border-brand/45 bg-brand-soft hover:bg-brand-soft",
                  )}
                >
                  <span className="flex items-center justify-between gap-1.5 text-sm text-foreground">
                    <strong className="font-medium">{entry.label}</strong>
                    {active ? <IconCheck size={15} className="text-brand" /> : null}
                  </span>
                  <span className="text-xs leading-relaxed text-faint">{entry.hint}</span>
                </button>
              );
            })}
          </div>
        </Card>

        <aside className="flex flex-col gap-4">
          <Card className="gap-3 rounded-2xl border-border-soft p-4">
            <h2 className="m-0 text-base font-semibold tracking-[-0.01em]">What gets sent</h2>
            <p className="m-0 text-sm leading-normal text-muted-foreground">
              Prepended per request, never stored in the transcript.
            </p>
            <pre className="m-0 max-h-[250px] overflow-auto rounded-xl bg-code p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap text-muted-foreground">
              {preview ||
                "No instructions yet. Pick a response style and every request still carries it."}
            </pre>
          </Card>

          <button
            type="button"
            onClick={onOpenSkills}
            className="flex items-center gap-3 rounded-2xl border border-border-soft bg-card p-4 text-left transition-colors hover:border-border hover:bg-hover"
          >
            <span
              aria-hidden="true"
              className="grid size-[38px] shrink-0 place-items-center rounded-xl bg-brand-soft text-brand"
            >
              <IconSparkles size={19} />
            </span>
            <span className="min-w-0 flex-1">
              <strong className="block text-sm font-semibold">
                {skillsOn > 0 ? `${skillsOn} skill${skillsOn === 1 ? "" : "s"} active` : "No skills active"}
              </strong>
              <span className="text-xs leading-relaxed text-faint">
                Skills add a task-specific block to the same system message.
              </span>
            </span>
            <span className="shrink-0 text-xs text-faint">Manage</span>
          </button>
        </aside>
      </div>
    </Page>
  );
}
