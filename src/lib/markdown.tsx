import { createElement, useMemo, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";

import { useClipboard } from "@/hooks/use-clipboard";
import { highlight, languageLabel, type TokenKind } from "@/lib/highlight";

const INLINE =
  /`([^`\n]+)`|\*\*([^*\n]+)\*\*|__([^_\n]+)__|\*([^*\n]+)\*|_([^_\n]+)_|~~([^~\n]+)~~|\[([^\]\n]+)\]\(([^)\s]+)\)/g;

const PROSE = [
  "prose prose-neutral max-w-none text-base leading-[26px] text-foreground dark:prose-invert",
  "[overflow-wrap:anywhere]",
  "prose-headings:font-semibold prose-headings:text-foreground prose-headings:tracking-[-0.01em]",
  "prose-h1:mt-6 prose-h1:mb-2.5 prose-h1:text-2xl prose-h2:mt-6 prose-h2:mb-2.5 prose-h2:text-xl",
  "prose-h3:mt-6 prose-h3:mb-2.5 prose-h3:text-lg prose-h4:mt-4 prose-h4:mb-2 prose-h4:text-base",
  "prose-p:my-0 prose-p:mb-3.5 prose-ul:my-0 prose-ul:mb-3.5 prose-ol:my-0 prose-ol:mb-3.5",
  "prose-li:my-1 prose-blockquote:my-0 prose-blockquote:mb-3.5 prose-blockquote:border-l-2",
  "prose-blockquote:px-3.5 prose-blockquote:font-normal prose-blockquote:text-muted-foreground",
  "prose-hr:my-5 prose-hr:border-border-soft",
  "prose-a:font-normal prose-a:text-brand prose-a:underline-offset-2",
  "prose-code:rounded-md prose-code:bg-code prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono",
  "prose-code:text-sm prose-code:font-normal prose-code:text-foreground",
  "prose-code:before:content-none prose-code:after:content-none",
  "prose-strong:text-foreground",
].join(" ");

function safeHref(href: string): string {
  return /^(https?:\/\/|mailto:|\/)/i.test(href) ? href : "#";
}

function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  INLINE.lastIndex = 0;

  while ((match = INLINE.exec(text)) !== null) {
    if (match.index > last) out.push(text.slice(last, match.index));
    const key = `${keyBase}-${match.index}`;
    const [, code, bold, bold2, em, em2, strike, label, href] = match;

    if (code !== undefined) out.push(<code key={key}>{code}</code>);
    else if (bold !== undefined) out.push(<strong key={key}>{bold}</strong>);
    else if (bold2 !== undefined) out.push(<strong key={key}>{bold2}</strong>);
    else if (em !== undefined) out.push(<em key={key}>{em}</em>);
    else if (em2 !== undefined) out.push(<em key={key}>{em2}</em>);
    else if (strike !== undefined) out.push(<del key={key}>{strike}</del>);
    else if (label !== undefined)
      out.push(
        <a key={key} href={safeHref(href ?? "#")} target="_blank" rel="noreferrer noopener">
          {label}
        </a>,
      );

    last = match.index + match[0].length;
  }

  if (last < text.length) out.push(text.slice(last));
  return out;
}

const TOKEN_CLASS: Record<Exclude<TokenKind, "plain">, string> = {
  comment: "text-syn-comment",
  string: "text-syn-string",
  number: "text-syn-number",
  keyword: "text-syn-keyword",
  literal: "text-syn-number",
  function: "text-syn-function",
  type: "text-syn-type",
  property: "text-syn-property",
  tag: "text-syn-tag",
  attr: "text-syn-attr",
  punctuation: "text-syn-punct",
};

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const { copied, copy } = useClipboard();
  const tokens = useMemo(() => highlight(code, lang), [code, lang]);

  return (
    <figure className="not-prose my-4 overflow-hidden rounded-xl border border-border-soft bg-code">
      <figcaption className="flex items-center justify-between gap-3 border-b border-border-soft py-1 pr-1.5 pl-4 max-[860px]:py-0">
        <span className="truncate text-xs font-medium text-faint">{languageLabel(lang)}</span>
        <button
          type="button"
          onClick={() => copy(code)}
          className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md px-2 text-xs text-muted-foreground transition-colors hover:bg-hover hover:text-foreground max-[860px]:h-10 max-[860px]:px-3"
        >
          {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </figcaption>
      <pre className="m-0 overflow-x-auto px-4 py-3 font-mono text-sm leading-[22px] [tab-size:2] [scrollbar-width:thin] max-[860px]:overflow-x-visible max-[860px]:whitespace-pre-wrap max-[860px]:[overflow-wrap:anywhere] max-[860px]:pr-5">
        <code className="font-mono">
          {tokens.map((token, index) => (
            <span key={index} className={token.kind === "plain" ? undefined : TOKEN_CLASS[token.kind]}>
              {token.text}
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}

/**
 * Streaming-safe markdown. Re-parses the accumulated buffer on every token, so
 * an unterminated fence renders as a code block that keeps growing instead of
 * flashing raw backticks.
 */
export function Markdown({ source }: { source: string }) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const out: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i += 1;
      continue;
    }

    const fence = /^\s*```(\S*)\s*$/.exec(line);
    if (fence) {
      const body: string[] = [];
      i += 1;
      while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) {
        body.push(lines[i]);
        i += 1;
      }
      i += 1;
      out.push(<CodeBlock key={key++} lang={fence[1] ?? ""} code={body.join("\n")} />);
      continue;
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      out.push(
        createElement(`h${heading[1].length}`, { key: key++ }, inline(heading[2], `h${key}`)),
      );
      i += 1;
      continue;
    }

    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) {
      out.push(<hr key={key++} />);
      i += 1;
      continue;
    }

    const bullet = /^\s*[-*+]\s+/.test(line);
    const ordered = /^\s*\d+[.)]\s+/.test(line);
    if (bullet || ordered) {
      const items: ReactNode[] = [];
      const re = ordered ? /^\s*\d+[.)]\s+/ : /^\s*[-*+]\s+/;
      while (i < lines.length && re.test(lines[i])) {
        const text = lines[i].replace(re, "");
        items.push(<li key={key++}>{inline(text, `li${key}`)}</li>);
        i += 1;
      }
      out.push(ordered ? <ol key={key++}>{items}</ol> : <ul key={key++}>{items}</ul>);
      continue;
    }

    if (/^\s*>\s?/.test(line)) {
      const quoted: string[] = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        quoted.push(lines[i].replace(/^\s*>\s?/, ""));
        i += 1;
      }
      out.push(<blockquote key={key++}>{inline(quoted.join(" "), `q${key}`)}</blockquote>);
      continue;
    }

    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^\s*```/.test(lines[i]) &&
      !/^(#{1,6})\s/.test(lines[i]) &&
      !/^\s*[-*+]\s+/.test(lines[i]) &&
      !/^\s*\d+[.)]\s+/.test(lines[i]) &&
      !/^\s*>\s?/.test(lines[i])
    ) {
      para.push(lines[i]);
      i += 1;
    }
    out.push(<p key={key++}>{inline(para.join(" "), `p${key}`)}</p>);
  }

  return <div className={PROSE}>{out}</div>;
}
