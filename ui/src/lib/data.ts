import raw from '../../../monitor.json';
import type { Listing } from './types';

const listing = raw as Listing;

export const code = listing.code;
export const symbols = listing.symbols;
export const map = listing.map;

// Build an index: uppercase hex address -> first code-line index with that addr.
// Multiple entries can share an address (e.g., label line + first instr); we
// prefer the one with bytes, falling back to the label-only line.
export const addrToIndex: Map<string, number> = (() => {
  const m = new Map<string, number>();
  code.forEach((entry, i) => {
    if (!entry.addr) return;
    const key = entry.addr.toUpperCase();
    const prev = m.get(key);
    if (prev === undefined) {
      m.set(key, i);
    } else if (!code[prev].bytes && entry.bytes) {
      m.set(key, i);
    }
  });
  return m;
})();

// Reverse map: address -> symbol name (for display in tooltips / gutter).
export const addrToLabel: Map<string, string> = (() => {
  const m = new Map<string, string>();
  for (const [name, addr] of Object.entries(symbols)) {
    m.set(addr.toUpperCase(), name);
  }
  return m;
})();

// Address ranges that belong to the assembled code (ROM, from the .map file).
// Any symbol resolving outside is a RAM variable / memory-mapped I/O reference,
// which we render in a distinct color.
const codeRanges = map.sections.map((s) => ({
  from: parseInt(s.start, 16),
  to: parseInt(s.end, 16),
}));

export function isExternalAddr(addrHex: string): boolean {
  const a = parseInt(addrHex, 16);
  if (Number.isNaN(a)) return false;
  return !codeRanges.some((r) => a >= r.from && a <= r.to);
}
