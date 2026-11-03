//small hand-rolled tokenizer so code blocks are coloured without a highlighter dependency
export type TokenKind =
  | "plain"
  | "comment"
  | "string"
  | "number"
  | "keyword"
  | "literal"
  | "function"
  | "type"
  | "property"
  | "tag"
  | "attr"
  | "punctuation";

export interface Token {
  text: string;
  kind: TokenKind;
}

interface Rule {
  kind: TokenKind;
  re: RegExp;
}

const JS_KEYWORDS =
  "as|async|await|break|case|catch|class|const|continue|debugger|declare|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|infer|instanceof|interface|is|keyof|let|module|namespace|new|of|private|protected|public|readonly|return|satisfies|set|static|super|switch|this|throw|try|type|typeof|var|void|while|yield";
const LITERALS = "true|false|null|undefined|NaN|Infinity|this";
const PY_KEYWORDS =
  "and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield";
const GO_KEYWORDS =
  "break|case|chan|const|continue|default|defer|else|fallthrough|for|func|go|goto|if|import|interface|map|package|range|return|select|struct|switch|type|var";
const SQL_KEYWORDS =
  "select|from|where|insert|into|values|update|set|delete|create|table|alter|drop|join|left|right|inner|outer|on|group|order|by|having|limit|offset|and|or|not|null|as|distinct|union|case|when|then|end";

const js: Rule[] = [
  { kind: "comment", re: /\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$)/y },
  {
    kind: "string",
    re: /"(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?|`(?:[^`\\]|\\[\s\S])*`?/y,
  },
  { kind: "number", re: /\b(?:0[xX][\da-fA-F]+|\d[\d_]*(?:\.\d+)?(?:e[+-]?\d+)?)n?\b/y },
  { kind: "keyword", re: new RegExp(`\\b(?:${JS_KEYWORDS})\\b`, "y") },
  { kind: "literal", re: new RegExp(`\\b(?:${LITERALS})\\b`, "y") },
  { kind: "function", re: /[A-Za-z_$][\w$]*(?=\s*\()/y },
  { kind: "property", re: /[A-Za-z_$][\w$]*(?=\s*:)/y },
  { kind: "type", re: /\b[A-Z][\w$]*\b/y },
  { kind: "punctuation", re: /[{}()[\].,;:?!=<>+\-*/%&|^~]+/y },
];

const python: Rule[] = [
  { kind: "comment", re: /#[^\n]*/y },
  { kind: "string", re: /"""[\s\S]*?(?:"""|$)|'''[\s\S]*?(?:'''|$)/y },
  { kind: "string", re: /"(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?/y },
  { kind: "number", re: /\b(?:0[xX][\da-fA-F]+|\d[\d_]*(?:\.\d+)?)\b/y },
  { kind: "keyword", re: new RegExp(`\\b(?:${PY_KEYWORDS})\\b`, "y") },
  { kind: "literal", re: /\b(?:True|False|None)\b/y },
  { kind: "function", re: /[A-Za-z_]\w*(?=\s*\()/y },
  { kind: "property", re: /\b[A-Za-z_]\w*(?=\s*=)/y },
  { kind: "type", re: /\b[A-Z]\w*\b/y },
  { kind: "punctuation", re: /[{}()[\].,;:+\-*/%<>=!&|^~]+/y },
];

const shell: Rule[] = [
  { kind: "comment", re: /#[^\n]*/y },
  { kind: "string", re: /"(?:[^"\\\n]|\\.)*"?|'[^']*'?/y },
  { kind: "property", re: /\$[A-Za-z_]\w*|\$\{[^}]*\}/y },
  { kind: "number", re: /\b\d+\b/y },
  {
    kind: "keyword",
    re: /\b(?:if|then|else|elif|fi|for|in|do|done|case|esac|while|until|function|return|export|local|source|echo|cd|npm|npx|node|git|curl)\b/y,
  },
  { kind: "attr", re: /--?[A-Za-z][\w-]*/y },
  { kind: "punctuation", re: /[{}()[\].,;:?=<>|&]+/y },
];

const css: Rule[] = [
  { kind: "comment", re: /\/\*[\s\S]*?(?:\*\/|$)/y },
  { kind: "string", re: /"(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?/y },
  { kind: "keyword", re: /@[\w-]+/y },
  { kind: "property", re: /[-a-zA-Z]+(?=\s*:)/y },
  { kind: "function", re: /[\w-]+(?=\()/y },
  { kind: "number", re: /#[0-9a-fA-F]{3,8}\b|\b\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw|s|ms|fr|ch|deg)?\b/y },
  { kind: "literal", re: /\b(?:inherit|initial|unset|none|auto|transparent|currentColor)\b/y },
  { kind: "punctuation", re: /[{}();:,>+~*[\]]+/y },
];

const markup: Rule[] = [
  { kind: "comment", re: /<!--[\s\S]*?(?:-->|$)/y },
  { kind: "tag", re: /<\/?[A-Za-z][\w.:-]*/y },
  { kind: "string", re: /"(?:[^"]*)"?|'(?:[^']*)'?/y },
  { kind: "attr", re: /[A-Za-z_:][\w:.-]*(?==)/y },
  { kind: "punctuation", re: /[<>=/]+/y },
];

const json: Rule[] = [
  { kind: "property", re: /"(?:[^"\\\n]|\\.)*"(?=\s*:)/y },
  { kind: "string", re: /"(?:[^"\\\n]|\\.)*"?/y },
  { kind: "number", re: /-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/y },
  { kind: "literal", re: /\b(?:true|false|null)\b/y },
  { kind: "punctuation", re: /[{}[\],:]+/y },
];

const yaml: Rule[] = [
  { kind: "comment", re: /#[^\n]*/y },
  { kind: "property", re: /[\w.-]+(?=\s*:)/y },
  { kind: "string", re: /"(?:[^"\\\n]|\\.)*"?|'(?:[^']*)'?/y },
  { kind: "number", re: /\b\d+(?:\.\d+)?\b/y },
  { kind: "literal", re: /\b(?:true|false|null|yes|no|on|off)\b/iy },
  { kind: "punctuation", re: /[-:[\]{},]+/y },
];

const sql: Rule[] = [
  { kind: "comment", re: /--[^\n]*|\/\*[\s\S]*?(?:\*\/|$)/y },
  { kind: "string", re: /'(?:[^']|'')*'?/y },
  { kind: "number", re: /\b\d+(?:\.\d+)?\b/y },
  { kind: "keyword", re: new RegExp(`\\b(?:${SQL_KEYWORDS})\\b`, "iy") },
  { kind: "function", re: /\b[A-Za-z_]\w*(?=\s*\()/y },
  { kind: "punctuation", re: /[(),;.*=<>+-]+/y },
];

const go: Rule[] = [
  { kind: "comment", re: /\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$)/y },
  { kind: "string", re: /"(?:[^"\\\n]|\\.)*"?|`[^`]*`?/y },
  { kind: "number", re: /\b\d+(?:\.\d+)?\b/y },
  { kind: "keyword", re: new RegExp(`\\b(?:${GO_KEYWORDS})\\b`, "y") },
  { kind: "literal", re: /\b(?:true|false|nil|iota)\b/y },
  { kind: "function", re: /[A-Za-z_]\w*(?=\s*\()/y },
  { kind: "type", re: /\b(?:string|int|int64|float64|bool|byte|rune|error|any)\b/y },
  { kind: "punctuation", re: /[{}()[\].,;:?!=<>+\-*/%&|^~]+/y },
];

const generic: Rule[] = [
  { kind: "comment", re: /\/\/[^\n]*|#[^\n]*|\/\*[\s\S]*?(?:\*\/|$)/y },
  { kind: "string", re: /"(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?/y },
  { kind: "number", re: /\b\d+(?:\.\d+)?\b/y },
];

const RULES: Record<string, Rule[]> = {
  js,
  jsx: js,
  ts: js,
  tsx: js,
  javascript: js,
  typescript: js,
  mjs: js,
  cjs: js,
  json,
  jsonc: json,
  py: python,
  python,
  sh: shell,
  bash: shell,
  shell,
  zsh: shell,
  console: shell,
  css,
  scss: css,
  html: markup,
  xml: markup,
  svg: markup,
  vue: markup,
  svelte: markup,
  yml: yaml,
  yaml,
  sql,
  postgres: sql,
  go,
  golang: go,
};

const LABELS: Record<string, string> = {
  js: "JavaScript", jsx: "JSX", ts: "TypeScript", tsx: "TSX",
  javascript: "JavaScript", typescript: "TypeScript", mjs: "JavaScript", cjs: "JavaScript",
  json: "JSON", jsonc: "JSON", py: "Python", python: "Python",
  sh: "Shell", bash: "Shell", shell: "Shell", zsh: "Shell", console: "Shell",
  css: "CSS", scss: "SCSS", html: "HTML", xml: "XML", svg: "SVG", vue: "Vue", svelte: "Svelte",
  yml: "YAML", yaml: "YAML", sql: "SQL", postgres: "SQL", go: "Go", golang: "Go",
  rs: "Rust", rb: "Ruby", md: "Markdown", diff: "Diff", text: "Text", txt: "Text",
};

/** Human label for a fence tag, e.g. `tsx` -> `TSX`. */
export function languageLabel(lang: string): string {
  const key = lang.trim().toLowerCase().replace(/^\./, "");
  if (!key) return "Code";
  return LABELS[key] ?? key.slice(0, 12);
}

/** Splits source into coloured tokens. Unterminated strings and comments stay coloured while streaming. */
export function highlight(code: string, lang: string): Token[] {
  const key = lang.trim().toLowerCase().replace(/^\./, "");
  const rules = RULES[key] ?? generic;
  const out: Token[] = [];
  let plain = "";
  let i = 0;

  const flush = () => {
    if (plain) out.push({ text: plain, kind: "plain" });
    plain = "";
  };

  while (i < code.length) {
    let matched = false;
    for (const rule of rules) {
      rule.re.lastIndex = i;
      const m = rule.re.exec(code);
      if (!m || !m[0]) continue;
      flush();
      out.push({ text: m[0], kind: rule.kind });
      i += m[0].length;
      matched = true;
      break;
    }
    if (!matched) {
      plain += code[i];
      i += 1;
    }
  }

  flush();
  return out;
}
