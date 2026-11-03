import { STYLES, systemPrompt, type Skill, type StyleId } from "../../lib/workspace";
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
        <button type="button" className="btn" onClick={onReset}>
          Reset to defaults
        </button>
      }
    >
      <div className="two-col">
        <section className="page-card grow">
          <h2 className="card-title">Custom instructions</h2>
          <p className="card-sub">
            Tell the model who it is and what it must not do. Keep it short; every request pays for
            it.
          </p>
          <label className="sr-only" htmlFor="custom-instructions">
            Custom instructions
          </label>
          <textarea
            id="custom-instructions"
            className="textarea"
            rows={8}
            maxLength={LIMIT}
            value={instructions}
            placeholder="e.g. You are the support assistant for Acme. Answer from the product docs, cite the page, and never invent pricing."
            onChange={(event) => onInstructions(event.target.value)}
          />
          <div className="field-meta">
            <span className="hint">
              {instructions.length} / {LIMIT} characters
            </span>
            {instructions ? (
              <button type="button" className="link-btn" onClick={() => onInstructions("")}>
                Clear
              </button>
            ) : null}
          </div>

          <h2 className="card-title is-spaced">Response style</h2>
          <div className="style-grid" role="group" aria-label="Response style">
            {STYLES.map((entry) => {
              const active = style === entry.id;
              return (
                <button
                  key={entry.id}
                  type="button"
                  className={active ? "style-card is-active" : "style-card"}
                  aria-pressed={active}
                  onClick={() => onStyle(entry.id)}
                >
                  <span className="style-card-head">
                    <strong>{entry.label}</strong>
                    {active ? <IconCheck size={15} /> : null}
                  </span>
                  <span className="hint">{entry.hint}</span>
                </button>
              );
            })}
          </div>
        </section>

        <aside className="side-stack">
          <section className="page-card preview-card">
            <h2 className="card-title">What gets sent</h2>
            <p className="card-sub">Prepended per request, never stored in the transcript.</p>
            <pre className="prompt-preview">
              {preview ||
                "No instructions yet. Pick a response style and every request still carries it."}
            </pre>
          </section>

          <button type="button" className="page-card skill-shortcut" onClick={onOpenSkills}>
            <span className="skill-shortcut-icon" aria-hidden="true">
              <IconSparkles size={19} />
            </span>
            <span className="grow">
              <strong>
                {skillsOn > 0 ? `${skillsOn} skill${skillsOn === 1 ? "" : "s"} active` : "No skills active"}
              </strong>
              <span className="hint">Skills add a task-specific block to the same system message.</span>
            </span>
            <span className="sub">Manage</span>
          </button>
        </aside>
      </div>
    </Page>
  );
}
