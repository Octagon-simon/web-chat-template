import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { Connector } from "@/lib/workspace";
import { IconButton } from "../icon-button";
import { IconPlug, IconPlus, IconSearch, IconTrash, IconX } from "../Icons";
import { EmptyCard, Page } from "./Page";

interface ConnectorsPageProps {
  connectors: Connector[];
  enabled: Record<string, boolean>;
  onToggle: (id: string) => void;
  onAdd: (name: string, detail: string) => void;
  onRemove: (id: string) => void;
}

export function ConnectorsPage({
  connectors,
  enabled,
  onToggle,
  onAdd,
  onRemove,
}: ConnectorsPageProps) {
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [detail, setDetail] = useState("");

  const on = connectors.filter((connector) => enabled[connector.id]).length;
  const needle = query.trim().toLowerCase();
  const visible = needle
    ? connectors.filter((connector) =>
        `${connector.name} ${connector.detail}`.toLowerCase().includes(needle),
      )
    : connectors;
  const builtIn = visible.filter((connector) => !connector.custom);
  const custom = visible.filter((connector) => connector.custom);

  return (
    <Page
      title="Connectors"
      description="Tool sources the model can call. This page is the wiring point: the template stores the toggles, your backend owns the transport."
      actions={
        <Button
          type="button"
          className="rounded-full max-[560px]:w-full"
          onClick={() => setAdding((open) => !open)}
        >
          <IconPlus size={15} />
          Add connector
        </Button>
      }
    >
      <div className="flex items-center gap-2.5">
        <div className="relative min-w-0 flex-1">
          <IconSearch
            size={16}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-faint"
          />
          <label className="sr-only" htmlFor="connector-search">
            Search connectors
          </label>
          <Input
            id="connector-search"
            value={query}
            placeholder="Search connectors"
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
          {on} of {connectors.length} on
        </Badge>
      </div>

      {adding && (
        <Card className="gap-3 rounded-2xl border-border-soft p-4">
          <h2 className="m-0 text-base font-semibold">Custom connector</h2>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!name.trim()) return;
              onAdd(name, detail);
              setName("");
              setDetail("");
              setAdding(false);
            }}
            className="flex flex-col gap-3"
          >
            <div className="flex gap-2 max-[560px]:flex-col">
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <Label htmlFor="connector-name" className="text-muted-foreground">
                  Name
                </Label>
                <Input
                  id="connector-name"
                  value={name}
                  maxLength={40}
                  placeholder="e.g. Linear"
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <Label htmlFor="connector-detail" className="text-muted-foreground">
                  What it exposes
                </Label>
                <Input
                  id="connector-detail"
                  value={detail}
                  maxLength={80}
                  placeholder="Issues and cycles"
                  onChange={(event) => setDetail(event.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" className="rounded-full" onClick={() => setAdding(false)}>
                Cancel
              </Button>
              <Button type="submit" className="rounded-full" disabled={!name.trim()}>
                Add connector
              </Button>
            </div>
          </form>
        </Card>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="mx-0.5 mt-1.5 mb-0 text-xs font-semibold tracking-[0.07em] text-faint uppercase">
          Built in
        </h2>
        <Card className="gap-0 divide-y divide-border-soft overflow-hidden rounded-xl border-border-soft p-0">
          {builtIn.map((connector) => (
            <div key={connector.id} className="flex items-center gap-3 px-3.5 py-3">
              <span
                aria-hidden="true"
                className="grid size-[34px] shrink-0 place-items-center rounded-[10px] bg-hover text-muted-foreground"
              >
                <IconPlug size={17} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{connector.name}</span>
                <span className="block text-xs text-faint">{connector.detail}</span>
              </span>
              <Switch
                checked={Boolean(enabled[connector.id])}
                aria-label={`Enable ${connector.name}`}
                onCheckedChange={() => onToggle(connector.id)}
              />
            </div>
          ))}
        </Card>
        {builtIn.length === 0 && <EmptyCard title="Nothing matched" detail="Try a different search." />}
      </section>

      {custom.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="mx-0.5 mt-1.5 mb-0 text-xs font-semibold tracking-[0.07em] text-faint uppercase">
            Custom
          </h2>
          <Card className="gap-0 divide-y divide-border-soft overflow-hidden rounded-xl border-border-soft p-0">
            {custom.map((connector) => (
              <div key={connector.id} className="flex items-center gap-3 px-3.5 py-3">
                <span
                  aria-hidden="true"
                  className="grid size-[34px] shrink-0 place-items-center rounded-[10px] bg-hover text-muted-foreground"
                >
                  <IconPlug size={17} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{connector.name}</span>
                  <span className="block text-xs text-faint">{connector.detail}</span>
                </span>
                <Switch
                  checked={Boolean(enabled[connector.id])}
                  aria-label={`Enable ${connector.name}`}
                  onCheckedChange={() => onToggle(connector.id)}
                />
                <IconButton
                  label={`Remove ${connector.name}`}
                  tooltip={false}
                  onClick={() => onRemove(connector.id)}
                  className="size-8 shrink-0 rounded-md text-faint hover:text-destructive"
                >
                  <IconTrash size={15} />
                </IconButton>
              </div>
            ))}
          </Card>
        </section>
      )}

      <div className="rounded-xl border border-brand/20 bg-brand-soft px-4 py-3.5">
        <strong className="mb-1 block text-sm text-foreground">Why this is a stub</strong>
        <p className="m-0 text-sm leading-relaxed text-muted-foreground">
          A connector needs three things outside this UI: an auth handshake, a tool schema the
          model can read, and a server that runs the call. The template keeps the catalog and the
          on/off state so you can point each id at your own tool server in{" "}
          <code className="font-mono text-xs">src/lib/workspace.ts</code>. Nothing here reaches the
          network.
        </p>
      </div>
    </Page>
  );
}
