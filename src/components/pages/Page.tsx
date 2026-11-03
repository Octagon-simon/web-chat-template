import type { ReactNode } from "react";

interface PageProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function Page({ title, description, actions, children }: PageProps) {
  return (
    <section aria-label={title} className="flex min-h-0 flex-1 flex-col">
      <div
        data-page-scroll
        className="min-h-0 flex-1 overflow-y-auto px-[clamp(16px,3vw,24px)] pt-6 pb-12 [scrollbar-width:thin] max-[860px]:px-4 max-[860px]:pb-[calc(32px+env(safe-area-inset-bottom))]"
      >
        <div className="mx-auto flex w-full max-w-[980px] flex-col gap-4">
          {description || actions ? (
            <header className="flex items-start justify-between gap-4 max-[560px]:flex-col max-[560px]:items-stretch max-[560px]:gap-3">
              {description ? (
                <p className="mt-0.5 mb-0 max-w-[76ch] text-sm leading-normal text-muted-foreground">
                  {description}
                </p>
              ) : null}
              {actions ? (
                <div className="flex flex-none items-center gap-2 max-[560px]:w-full">{actions}</div>
              ) : null}
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
    <div className="flex flex-col gap-2 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
      <strong className="text-sm text-foreground">{title}</strong>
      <span>{detail}</span>
    </div>
  );
}
