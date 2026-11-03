const LINES = [
  "How's it going?",
  "What are we working on today?",
  "What's on your mind?",
  "Ready when you are.",
];

const DEFAULT_NAMES = ["workspace owner", "you"];

/** "Still up" covers the small hours, when "Good morning" would be a lie. */
export function timeGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/** First name only, capitalized, and blank when the profile still holds the seed value. */
export function greetingName(raw: string): string {
  const clean = raw.trim().split(/\s+/)[0] ?? "";
  if (!clean || DEFAULT_NAMES.includes(clean.toLowerCase())) return "";
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

export function greetingLine(date: Date = new Date()): string {
  return LINES[Math.floor(date.getHours() / 6) % LINES.length];
}
