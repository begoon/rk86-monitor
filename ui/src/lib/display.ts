import type { CodeLine } from './types';

const BYTES_PER_ROW = 3;

export type DisplayRow = { entry: CodeLine; continuation: boolean };

// Rows with more than BYTES_PER_ROW bytes (e.g. `db "radio-86rk", 0`) are
// wrapped onto multiple display rows: the first carries the full label/op/
// arg/comment; subsequent rows show only incremented addr + next chunk of
// bytes/chars.
export function splitDataRow(e: CodeLine): DisplayRow[] {
  if (!e.bytes) return [{ entry: e, continuation: false }];
  const parts = e.bytes.split(' ');
  if (parts.length <= BYTES_PER_ROW) return [{ entry: e, continuation: false }];

  const chars = e.chars ?? '';
  const base = e.addr ? parseInt(e.addr, 16) : 0;
  const rows: DisplayRow[] = [];
  for (let i = 0; i < parts.length; i += BYTES_PER_ROW) {
    const bytes = parts.slice(i, i + BYTES_PER_ROW).join(' ');
    const chunk = chars.slice(i, i + BYTES_PER_ROW);
    if (i === 0) {
      rows.push({ entry: { ...e, bytes, chars: chunk }, continuation: false });
    } else {
      rows.push({
        entry: {
          line: e.line,
          addr: (base + i).toString(16).padStart(4, '0').toUpperCase(),
          bytes,
          chars: chunk,
        },
        continuation: true,
      });
    }
  }
  return rows;
}
