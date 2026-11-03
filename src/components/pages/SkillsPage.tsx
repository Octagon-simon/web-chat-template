import { useMemo, useState } from "react";
import type { Skill } from "../../lib/workspace";
import { IconPlus, IconSearch, IconSparkles, IconTrash, IconX } from "../Icons";
import { EmptyCard, Page } from "./Page";

interface SkillsPageProps {
  skills: Skill[];
  skillOn: Record<string, boolean>;
  onToggle: (id: string) => void;
  onAdd: (name: string, detail: string, prompt: string) => void;
  onRemove: (id: string) => void;
}

export function SkillsPage({
  skills,
  skillOn,
  onToggle,
  onAdd,
  onRemove,
}: SkillsPageProps) {
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
        <button type="button" className="btn btn-primary" onClick={() => setAdding((open) => !open)}>
          <IconPlus size={15} />
          New skill
        </button>
      }
    >
      <div className="page-toolbar">
        <div className="search-field grow">
          <IconSearch size={16} />
          <label className="sr-only" htmlFor="skill-search">
            Search skills
          </label>
          <input
            id="skill-search"
            className="input"
            value={query}
            placeholder="Search skills"
            onChange={(event) => setQuery(event.target.value)}
          />
          {query ? (
            <button type="button" className="field-clear" onClick={() => setQuery("")} aria-label="Clear search">
              <IconX size={14} />
            </button>
          ) : null}
        </div>
        <span className="pill">
          {activeCount} of {skills.length} active
        </span>
      </div>

      <div className="chip-row" role="group" aria-label="Filter by category">
        {categories.map((entry) => (
          <button
            key={entry}
            type="button"
            className={category === entry ? "chip is-on" : "chip"}
            aria-pressed={category === entry}
            onClick={() => setCategory(entry)}
          >
            {entry}
          </button>
        ))}
      </div>

      {adding && (
        <form
          className="page-card add-skill"
          onSubmit={(event) => {
            event.preventDefault();
            if (!name.trim()) return;
            onAdd(name, detail, prompt);
            setName("");
            setDetail("");
            setPrompt("");
            setAdding(false);
          }}
        >
          <h2 className="card-title">New skill</h2>
          <div className="field-row">
            <div className="field grow">
              <label htmlFor="skill-name">Name</label>
              <input
                id="skill-name"
                className="input"
                data-autofocus
                value={name}
                maxLength={40}
                placeholder="e.g. Release notes"
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="field grow">
              <label htmlFor="skill-detail">One-line description</label>
              <input
                id="skill-detail"
                className="input"
                value={detail}
                maxLength={80}
                placeholder="Turn merged PRs into a changelog"
                onChange={(event) => setDetail(event.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="skill-prompt">Instruction block</label>
            <textarea
              id="skill-prompt"
              className="textarea"
              rows={4}
              value={prompt}
              placeholder="The exact guidance the model should follow when this skill is on."
              onChange={(event) => setPrompt(event.target.value)}
            />
          </div>
          <div className="form-foot">
            <button type="button" className="btn btn-ghost" onClick={() => setAdding(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!name.trim()}>
              Add skill
            </button>
          </div>
        </form>
      )}

      {visible.length === 0 ? (
        <EmptyCard title="Nothing matched" detail="Try another search or category." />
      ) : (
        <div className="skill-grid">
          {visible.map((skill) => {
            const active = Boolean(skillOn[skill.id]);
            return (
              <article key={skill.id} className={active ? "skill-card is-on" : "skill-card"}>
                <div className="skill-card-top">
                  <span className="skill-icon" aria-hidden="true">
                    {skill.icon}
                  </span>
                  <div className="skill-card-head">
                    <h2>{skill.name}</h2>
                    <span className="sub">{skill.category}</span>
                  </div>
                  <button
                    type="button"
                    className="switch-button"
                    role="switch"
                    aria-checked={active}
                    aria-label={`${active ? "Disable" : "Enable"} ${skill.name}`}
                    onClick={() => onToggle(skill.id)}
                  >
                    <span className="switch" aria-hidden="true" />
                  </button>
                </div>
                <p>{skill.detail}</p>
                <div className="skill-card-foot">
                  <span className={active ? "status is-on" : "status"}>
                    <IconSparkles size={13} />
                    {active ? "In system message" : "Off"}
                  </span>
                  {skill.custom ? (
                    <button
                      type="button"
                      className="icon-btn is-danger"
                      aria-label={`Delete ${skill.name}`}
                      onClick={() => onRemove(skill.id)}
                    >
                      <IconTrash size={15} />
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="info-card">
        <strong>How a skill reaches the model</strong>
        <p>
          Every active skill appends one line to the system message: the skill name and its
          instruction block. They never enter the transcript, so turning one off changes the next
          request without rewriting history. See <code>systemPrompt()</code> in{" "}
          <code>src/lib/workspace.ts</code>.
        </p>
      </div>
    </Page>
  );
}
