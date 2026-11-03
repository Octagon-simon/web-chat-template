import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  headline: string;
  detail?: string;
  suggestions: string[];
  onPick: (text: string) => void;
}

export function EmptyState({ headline, detail, suggestions, onPick }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-0 pt-6 pb-[10vh] text-center max-[860px]:min-h-[44vh]">
      <div className="flex flex-col gap-2">
        <h1 className="max-w-[26ch] text-[clamp(24px,3.4vw,32px)] leading-tight font-semibold tracking-[-0.02em] text-balance">
          {headline}
        </h1>
        {detail && <p className="m-0 text-base text-muted-foreground">{detail}</p>}
      </div>
      {suggestions.length > 0 && (
        <div className="flex max-w-[620px] flex-wrap justify-center gap-2">
          {suggestions.map((text) => (
            <Button
              key={text}
              type="button"
              variant="outline"
              onClick={() => onPick(text)}
              className="rounded-full px-3.5 py-2 text-sm font-normal text-muted-foreground transition-transform hover:-translate-y-px hover:text-foreground"
            >
              {text}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
