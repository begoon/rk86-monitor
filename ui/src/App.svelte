<script lang="ts">
  import { code, addrToIndex, map } from './lib/data';
  import { splitDataRow } from './lib/display';
  import Line from './lib/components/Line.svelte';
  import SearchBar from './lib/components/SearchBar.svelte';
  import HoverPreview from './lib/components/HoverPreview.svelte';
  import { loadTheme, applyTheme, type Theme } from './lib/theme';
  import { plural } from './lib/plural';

  let query = $state('');
  let mode = $state<'highlight' | 'filter'>('highlight');
  let theme = $state<Theme>(loadTheme());
  $effect(() => { applyTheme(theme); });
  let hoverAddr = $state<string | null>(null);
  let hoverAnchor = $state<HTMLElement | null>(null);
  let hoverTimer: ReturnType<typeof setTimeout> | null = null;

  // Which lines match the query. Searches label, op, arg1, arg2, data, comment,
  // addr, bytes. Case-insensitive substring match.
  const matchSet = $derived.by(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    const s = new Set<number>();
    code.forEach((e, i) => {
      const hay = [e.label, e.op, e.arg1, e.arg2, e.data, e.comment, e.addr, e.bytes]
        .filter(Boolean).join(' ').toLowerCase();
      if (hay.includes(q)) s.add(i);
    });
    return s;
  });

  const matchList = $derived(matchSet ? [...matchSet].sort((a, b) => a - b) : []);
  let matchCursor = $state(-1);

  $effect(() => {
    // Reset cursor when query changes.
    query;
    matchCursor = -1;
  });

  const visibleIndices = $derived.by(() => {
    if (mode === 'filter' && matchSet) {
      return [...matchSet].sort((a, b) => a - b);
    }
    return null;
  });

  // Split code into blocks. A new block begins at any `label` line — EXCEPT
  // that consecutive labeled lines sharing the same op (e.g. equ runs, jump
  // tables) merge, along with any blank / comment-only interstitials between
  // them. An aligned block renders on a 7-column grid
  // (addr|bytes|chars|label|op|arg|comment) so label, op, arg and comment align
  // across rows. Single-label aligned runs fall back to normal layout.
  type BlockKind = 'normal' | 'equ' | 'jmp';
  type Block = { kind: BlockKind; lines: number[] };

  const ALIGNED_OPS = new Set<BlockKind>(['equ', 'jmp']);

  function alignedKind(op?: string): BlockKind {
    if (op && ALIGNED_OPS.has(op as BlockKind)) return op as BlockKind;
    return 'normal';
  }

  const naturalBlocks = $derived.by(() => {
    const raw: Block[] = [];
    let cur: Block | null = null;
    for (let i = 0; i < code.length; i++) {
      const e = code[i];
      if (e.label) {
        const k = alignedKind(e.op);
        if (cur && k !== 'normal' && cur.kind === k) {
          cur.lines.push(i);
        } else {
          if (cur) raw.push(cur);
          cur = { kind: k, lines: [i] };
        }
      } else {
        if (!cur) cur = { kind: 'normal', lines: [] };
        cur.lines.push(i);
      }
    }
    if (cur) raw.push(cur);
    // A run of length 1 doesn't benefit from alignment — collapse to normal.
    return raw.map((b) => {
      if (b.kind === 'normal') return b;
      const labeled = b.lines.reduce((n, i) => n + (code[i].label ? 1 : 0), 0);
      return labeled >= 2 ? b : { ...b, kind: 'normal' as const };
    });
  });

  const blocks: Block[] = $derived(
    visibleIndices
      ? visibleIndices.map((i) => ({ kind: 'normal' as const, lines: [i] }))
      : naturalBlocks
  );

  function navigateTo(addr: string, ev?: MouseEvent) {
    ev?.preventDefault();
    const el = document.getElementById(`L${addr}`);
    if (el) {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      history.pushState(null, '', `#${addr}`);
      flash(el);
    }
    hoverAddr = null;
  }

  function flash(el: HTMLElement) {
    el.classList.add('flash');
    setTimeout(() => el.classList.remove('flash'), 900);
  }

  function onHover(addr: string | null, el: HTMLElement | null) {
    if (hoverTimer) clearTimeout(hoverTimer);
    if (addr && el) {
      hoverTimer = setTimeout(() => {
        hoverAddr = addr;
        hoverAnchor = el;
      }, 250);
    } else {
      hoverAddr = null;
      hoverAnchor = null;
    }
  }

  function nextMatch() {
    if (!matchList.length) return;
    matchCursor = (matchCursor + 1) % matchList.length;
    scrollToMatch();
  }
  function prevMatch() {
    if (!matchList.length) return;
    matchCursor = (matchCursor - 1 + matchList.length) % matchList.length;
    scrollToMatch();
  }
  function scrollToMatch() {
    const idx = matchList[matchCursor];
    if (idx === undefined) return;
    const entry = code[idx];
    if (entry.addr) {
      const el = document.getElementById(`L${entry.addr.toUpperCase()}`);
      if (el) {
        el.scrollIntoView({ block: 'center', behavior: 'smooth' });
        flash(el);
        return;
      }
    }
    const el = document.querySelector(`[data-line="${idx}"]`) as HTMLElement | null;
    if (el) {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      flash(el);
    }
  }

  function jumpToHash() {
    const h = location.hash.replace(/^#/, '').toUpperCase();
    if (!h) return;
    const el = document.getElementById(`L${h}`);
    if (el) {
      el.scrollIntoView({ block: 'center' });
      flash(el);
    }
  }

  // On load — and on browser back/forward — jump to the hash in the URL.
  $effect(() => {
    queueMicrotask(jumpToHash);
    const handler = () => jumpToHash();
    window.addEventListener('popstate', handler);
    window.addEventListener('hashchange', handler);
    return () => {
      window.removeEventListener('popstate', handler);
      window.removeEventListener('hashchange', handler);
    };
  });

  // Global keyboard shortcuts:
  //   "/"   focuses the search input (unless already editing)
  //   Esc   clears the query and drops focus from the search input
  $effect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      const editing = !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
      if (e.key === '/' && !editing) {
        const input = document.querySelector<HTMLInputElement>('input[type="search"]');
        if (input) {
          e.preventDefault();
          input.focus();
          input.select();
        }
        return;
      }
      if (e.key === 'Escape') {
        if (query) {
          e.preventDefault();
          query = '';
        }
        if (t && t.tagName === 'INPUT') (t as HTMLInputElement).blur();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const region = map.sections[0];
  const labelCount = code.reduce((n, e) => n + (e.label ? 1 : 0), 0);
</script>

<SearchBar
  {query}
  {mode}
  {theme}
  matchCount={matchSet ? matchSet.size : 0}
  onQueryChange={(q) => (query = q)}
  onModeChange={(m) => (mode = m)}
  onThemeToggle={() => (theme = theme === 'dark' ? 'light' : 'dark')}
  onNext={nextMatch}
  onPrev={prevMatch}
/>

<div class="legend">
  ПЗУ: <span class="addr">{region.start}–{region.end}</span>
  ({region.size} {plural(region.size, 'байт', 'байта', 'байт')})
  · {code.length} {plural(code.length, 'строка', 'строки', 'строк')}
  · {labelCount} {plural(labelCount, 'метка', 'метки', 'меток')}
</div>

<main class="listing">
  {#each blocks as block (block.lines[0])}
    <div class="block" class:aligned={block.kind !== 'normal'}>
      {#each block.lines as i (i)}
        {#each splitDataRow(code[i]) as row, ri (ri)}
          <Line
            entry={row.entry}
            index={i}
            layout={block.kind}
            continuation={row.continuation}
            onNavigate={navigateTo}
            onHover={onHover}
            highlight={query}
          />
        {/each}
      {/each}
    </div>
  {/each}
</main>

<HoverPreview addr={hoverAddr} anchor={hoverAnchor} />

<style>
  :global(.line.flash) {
    animation: flash 900ms ease-out;
  }
  @keyframes flash {
    0% { background: var(--accent); }
    100% { background: transparent; }
  }
  .legend {
    padding: 4px 12px;
    font-size: 11px;
    color: var(--fg-dim);
    background: var(--bg-alt);
    border-bottom: 1px solid var(--border);
  }
  .legend .addr { color: var(--addr); }
  .listing {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;
  }
  /* Label column is pinned to 16ch globally so op columns line up vertically
     across the whole listing. A handful of labels exceed 16 chars (function
     names like `print_hex_byte_and_space`, 24 ch); those push op right only
     within their own block via max-content. */
  .block {
    display: grid;
    grid-template-columns:
      4.5ch                            /* addr */
      minmax(11.5ch, max-content)      /* bytes */
      minmax(4.5ch, max-content)       /* chars */
      minmax(16ch, max-content)        /* label */
      max-content                      /* op + args */
      minmax(0, 1fr);                  /* comment */
    column-gap: 12px;
    padding: 0 12px;
  }
  .block.aligned {
    grid-template-columns:
      4.5ch                            /* addr */
      minmax(11.5ch, max-content)      /* bytes */
      minmax(4.5ch, max-content)       /* chars */
      minmax(16ch, max-content)        /* label */
      max-content                      /* op keyword (equ / jmp / …) */
      max-content                      /* arg */
      minmax(0, 1fr);                  /* comment */
  }
</style>
