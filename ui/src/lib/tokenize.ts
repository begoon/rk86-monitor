import { REGISTERS } from './mnemonics';
import type { Token } from './types';

const ARG_REGEX = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|[0-9][0-9A-Fa-f_]*[hHdDbBoOqQ]?|[A-Za-z_][A-Za-z0-9_]*|[+\-*/,()<>&|^~%!])/g;

export function tokenizeArg(text: string, symbols: Record<string, string>): Token[] {
  const out: Token[] = [];
  let last = 0;
  for (const m of text.matchAll(ARG_REGEX)) {
    const i = m.index ?? 0;
    if (i > last) out.push({ kind: 'text', text: text.slice(last, i) });
    const t = m[0];
    out.push(classify(t, symbols));
    last = i + t.length;
  }
  if (last < text.length) out.push({ kind: 'text', text: text.slice(last) });
  return out;
}

function classify(t: string, symbols: Record<string, string>): Token {
  const c = t[0];
  if (c === '"' || c === "'") return { kind: 'str', text: t };
  if (c >= '0' && c <= '9') return { kind: 'num', text: t };
  if (/^[+\-*/,()<>&|^~%!]$/.test(t)) return { kind: 'punct', text: t };
  const lower = t.toLowerCase();
  if (REGISTERS.has(lower)) return { kind: 'reg', text: t };
  const addr = symbols[t] ?? symbols[t.toUpperCase()];
  if (addr) return { kind: 'label-ref', text: t, addr: addr.toUpperCase() };
  return { kind: 'text', text: t };
}
