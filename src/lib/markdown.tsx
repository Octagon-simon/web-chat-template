import { createElement, useState, type ReactNode } from "react";

const INLINE =
  /`([^`\n]+)`|\*\*([^*\n]+)\*\*|__([^_\n]+)__|\*([^*\n]+)\*|_([^_\n]+)_|~~([^~\n]+)~~|\[([^\]\n]+)\]\(([^)\s]+)\)/g;

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

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    });
  };

  return (
    <div className="md-codeblock">
      <div className="md-codeblock-bar">
        <span>{lang || "code"}</span>
        <button type="button" onClick={copy}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
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
        createElement(
          `h${heading[1].length}`,
          { key: key++ },
          inline(heading[2], `h${key}`),
        ),
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
      out.push(
        ordered ? <ol key={key++}>{items}</ol> : <ul key={key++}>{items}</ul>,
      );
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

  return <div className="md">{out}</div>;
}
