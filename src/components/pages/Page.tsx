import type { ReactNode } from "react";

interface PageProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function Page({ title, description, actions, children }: PageProps) {
  return (
    <section className="page" aria-label={title}>
      <div className="page-scroll">
        <div className="page-inner">
          {description || actions ? (
            <header className="page-lead">
              {description ? <p>{description}</p> : null}
              {actions ? <div className="page-actions">{actions}</div> : null}
            </header>
          ) : null}
          {children}
        </div>
      </div>
    </section>
  );
}

export function EmptyCard({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="empty-card">
      <strong>{title}</strong>
      <span>{detail}</span>
    </div>
  );
}
