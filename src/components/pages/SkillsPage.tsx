import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Skill } from "@/lib/workspace";
import { IconButton } from "../icon-button";
import { IconPlus, IconSearch, IconSparkles, IconTrash, IconX } from "../Icons";
import { EmptyCard, Page } from "./Page";

interface SkillsPageProps {
  skills: Skill[];
  skillOn: Record<string, boolean>;
  onToggle: (id: string) => void;
  onAdd: (name: string, detail: string, prompt: string) => void;
  onRemove: (id: string) => void;
}

export function SkillsPage({ skills, skillOn, onToggle, onAdd, onRemove }: SkillsPageProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [detail, setDetail] = useState("");
  const [prompt, setPrompt] = useState("");

  const activeCount = skills.filter((skill) => skillOn[skill.id]).length;
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(skills.map((skill) => skill.category)))],
    [skills],
  );
  const needle = query.trim().toLowerCase();
  const visible = skills.filter((skill) => {
    const inCategory = category === "All" || skill.category === category;
    const text = `${skill.name} ${skill.detail} ${skill.category}`.toLowerCase();
    return inCategory && (!needle || text.includes(needle));
  });

  return (
    <Page
      title="Skills"
      description="Reusable instruction packs. Turn one on and its block joins the system message for every request, in every chat."
      actions={
        <Button
          type="button"
          className="rounded-full max-[560px]:w-full"
          onClick={() => setAdding((open) => !open)}
        >
          <IconPlus size={15} />
          New skill
        </Button>
      }
    >
      <div className="flex items-center gap-2.5">
        <div className="relative min-w-0 flex-1">
          <IconSearch
            size={16}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-faint"
          />
          <label className="sr-only" htmlFor="skill-search">
            Search skills
          </label>
          <Input
            id="skill-search"
            value={query}
            placeholder="Search skills"
            onChange={(event) => setQuery(event.target.value)}
            className="pl-9"
          />
          {query ? (
            <IconButton
              label="Clear search"
              tooltip={false}
              onClick={() => setQuery("")}
              className="absolute top-1/2 right-2 size-6 -translate-y-1/2 rounded-md"
            >
              <IconX size={14} />
            </IconButton>
          ) : null}
        </div>
        <Badge variant="outline" className="shrink-0 px-2.5 py-1">
          {activeCount} of {skills.length} active
        </Badge>
      </div>

      <div
        role="group"
        aria-label="Filter by category"
        className="flex flex-wrap gap-1.5 max-[560px]:-mr-4 max-[560px]:flex-nowrap max-[560px]:overflow-x-auto max-[560px]:pr-4 max-[560px]:[scrollbar-width:none]"
      >
        {categories.map((entry) => {
          const on = category === entry;
          return (
            <Button
              key={entry}
              type="button"
              size="sm"
              variant={on ? "secondary" : "ghost"}
              aria-pressed={on}
              onClick={() => setCategory(entry)}
              className={cn(
                "shrink-0 rounded-full text-sm font-normal text-muted-foreground max-[860px]:h-10",
                on && "border border-brand/22 bg-brand-soft text-brand hover:bg-brand-soft hover:text-brand",
              )}
            >
              {entry}
            </Button>
          );
        })}
      </div>

      {adding && (
        <Card className="gap-3 rounded-2xl border-border-soft p-4">
          <h2 className="m-0 text-base font-semibold">New skill</h2>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!name.trim()) return;
              onAdd(name, detail, prompt);
              setName("");
              setDetail("");
              setPrompt("");
              setAdding(false);
            }}
            className="flex flex-col gap-3"
          >
            <div className="flex gap-2 max-[560px]:flex-col">
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <Label htmlFor="skill-name" className="text-muted-foreground">
                  Name
                </Label>
                <Input
                  id="skill-name"
                  value={name}
                  maxLength={40}
                  placeholder="e.g. Release notes"
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <Label htmlFor="skill-detail" className="text-muted-foreground">
                  One-line description
                </Label>
                <Input
                  id="skill-detail"
                  value={detail}
                  maxLength={80}
                  placeholder="Turn merged PRs into a changelog"
                  onChange={(event) => setDetail(event.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="skill-prompt" className="text-muted-foreground">
                Instruction block
              </Label>
              <Textarea
                id="skill-prompt"
                rows={4}
                value={prompt}
                placeholder="The exact guidance the model should follow when this skill is on."
                onChange={(event) => setPrompt(event.target.value)}
                className="min-h-[108px] resize-y leading-normal"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" className="rounded-full" onClick={() => setAdding(false)}>
                Cancel
              </Button>
              <Button type="submit" className="rounded-full" disabled={!name.trim()}>
                Add skill
              </Button>
            </div>
          </form>
        </Card>
      )}

      {visible.length === 0 ? (
        <EmptyCard title="Nothing matched" detail="Try another search or category." />
      ) : (
        <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(262px,1fr))] max-[860px]:grid-cols-1">
          {visible.map((skill) => {
            const active = Boolean(skillOn[skill.id]);
            return (
              <article
                key={skill.id}
                className={cn(
                  "flex flex-col gap-2 rounded-2xl border border-border-soft bg-card p-4 transition-colors",
                  active && "border-brand/40",
                )}
              >
                <div className="flex items-start gap-2.5">
                  <span
                    aria-hidden="true"
                    className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-hover text-lg"
                  >
                    {skill.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="m-0 text-sm font-semibold">{skill.name}</h2>
                    <span className="block text-xs text-faint">{skill.category}</span>
                  </div>
                  <Switch
                    checked={active}
                    aria-label={`${active ? "Disable" : "Enable"} ${skill.name}`}
                    onCheckedChange={() => onToggle(skill.id)}
                  />
                </div>
                <p className="m-0 text-sm leading-normal text-muted-foreground">{skill.detail}</p>
                <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 text-xs text-faint",
                      active && "text-brand",
                    )}
                  >
                    <IconSparkles size={13} />
                    {active ? "In system message" : "Off"}
                  </span>
                  {skill.custom ? (
                    <IconButton
                      label={`Delete ${skill.name}`}
                      tooltip={false}
                      onClick={() => onRemove(skill.id)}
                      className="size-8 rounded-md text-faint hover:text-destructive"
                    >
                      <IconTrash size={15} />
                    </IconButton>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="rounded-xl border border-brand/20 bg-brand-soft px-4 py-3.5">
        <strong className="mb-1 block text-sm text-foreground">How a skill reaches the model</strong>
        <p className="m-0 text-sm leading-relaxed text-muted-foreground">
          Every active skill appends one line to the system message: the skill name and its
          instruction block. They never enter the transcript, so turning one off changes the next
          request without rewriting history. See <code className="font-mono text-xs">systemPrompt()</code>{" "}
          in <code className="font-mono text-xs">src/lib/workspace.ts</code>.
        </p>
      </div>
    </Page>
  );
}
