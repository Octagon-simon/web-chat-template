interface EmptyStateProps {
  headline: string;
  detail?: string;
  suggestions: string[];
  onPick: (text: string) => void;
}

export function EmptyState({ headline, detail, suggestions, onPick }: EmptyStateProps) {
  return (
    <div className="empty">
      <div className="empty-intro">
        <h1>{headline}</h1>
        {detail && <p className="empty-detail">{detail}</p>}
      </div>
      {suggestions.length > 0 && (
        <div className="suggestions">
          {suggestions.map((text) => (
            <button key={text} type="button" onClick={() => onPick(text)}>
              {text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
