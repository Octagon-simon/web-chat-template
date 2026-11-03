import { useState } from "react";
import type { Connector } from "../../lib/workspace";
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
        <button type="button" className="btn btn-primary" onClick={() => setAdding((open) => !open)}>
          <IconPlus size={15} />
          Add connector
        </button>
      }
    >
      <div className="page-toolbar">
        <div className="search-field grow">
          <IconSearch size={16} />
          <label className="sr-only" htmlFor="connector-search">
            Search connectors
          </label>
          <input
            id="connector-search"
            className="input"
            value={query}
            placeholder="Search connectors"
            onChange={(event) => setQuery(event.target.value)}
          />
          {query ? (
            <button type="button" className="field-clear" onClick={() => setQuery("")} aria-label="Clear search">
              <IconX size={14} />
            </button>
          ) : null}
        </div>
        <span className="pill">
          {on} of {connectors.length} on
        </span>
      </div>

      {adding && (
        <form
          className="page-card add-connector"
          onSubmit={(event) => {
            event.preventDefault();
            if (!name.trim()) return;
            onAdd(name, detail);
            setName("");
            setDetail("");
            setAdding(false);
          }}
        >
          <h2>Custom connector</h2>
          <div className="field-row">
            <div className="field grow">
              <label htmlFor="connector-name">Name</label>
              <input
                id="connector-name"
                className="input"
                data-autofocus
                value={name}
                maxLength={40}
                placeholder="e.g. Linear"
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="field grow">
              <label htmlFor="connector-detail">What it exposes</label>
              <input
                id="connector-detail"
                className="input"
                value={detail}
                maxLength={80}
                placeholder="Issues and cycles"
                onChange={(event) => setDetail(event.target.value)}
              />
            </div>
          </div>
          <div className="form-foot">
            <button type="button" className="btn btn-ghost" onClick={() => setAdding(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!name.trim()}>
              Add connector
            </button>
          </div>
        </form>
      )}

      <section className="page-section">
        <h2 className="section-title">Built in</h2>
        <div className="connector-list">
          {builtIn.map((connector) => (
            <div className="connector-row" key={connector.id}>
              <span className="connector-icon" aria-hidden="true">
                <IconPlug size={17} />
              </span>
              <span className="grow">
                <span className="title">{connector.name}</span>
                <span className="sub">{connector.detail}</span>
              </span>
              <button
                type="button"
                className="switch-button"
                role="switch"
                aria-checked={Boolean(enabled[connector.id])}
                aria-label={`Enable ${connector.name}`}
                onClick={() => onToggle(connector.id)}
              >
                <span className="switch" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
        {builtIn.length === 0 && <EmptyCard title="Nothing matched" detail="Try a different search." />}
      </section>

      {custom.length > 0 && (
        <section className="page-section">
          <h2 className="section-title">Custom</h2>
          <div className="connector-list">
            {custom.map((connector) => (
              <div className="connector-row" key={connector.id}>
                <span className="connector-icon" aria-hidden="true">
                  <IconPlug size={17} />
                </span>
                <span className="grow">
                  <span className="title">{connector.name}</span>
                  <span className="sub">{connector.detail}</span>
                </span>
                <button
                  type="button"
                  className="switch-button"
                  role="switch"
                  aria-checked={Boolean(enabled[connector.id])}
                  aria-label={`Enable ${connector.name}`}
                  onClick={() => onToggle(connector.id)}
                >
                  <span className="switch" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="icon-btn is-danger"
                  aria-label={`Remove ${connector.name}`}
                  onClick={() => onRemove(connector.id)}
                >
                  <IconTrash size={15} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="info-card">
        <strong>Why this is a stub</strong>
        <p>
          A connector needs three things outside this UI: an auth handshake, a tool schema the
          model can read, and a server that runs the call. The template keeps the catalog and the
          on/off state so you can point each id at your own tool server in{" "}
          <code>src/lib/workspace.ts</code>. Nothing here reaches the network.
        </p>
      </div>
    </Page>
  );
}
