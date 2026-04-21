<script lang="ts">
  import { code, addrToIndex } from '../data';
  import { splitDataRow } from '../display';
  import Line from './Line.svelte';

  interface Props {
    addr: string | null;
    anchor: HTMLElement | null;
  }
  let { addr, anchor }: Props = $props();

  const BEFORE = 3;
  const AFTER = 6; // 3 + target + 6 = 10 lines total

  const preview = $derived.by(() => {
    if (!addr) return null;
    const center = addrToIndex.get(addr);
    if (center === undefined) return null;
    const from = Math.max(0, center - BEFORE);
    const to = Math.min(code.length, center + AFTER + 1);
    return { from, to, center };
  });

  const pos = $derived.by(() => {
    if (!anchor) return null;
    const r = anchor.getBoundingClientRect();
    const top = r.bottom + 6;
    const left = Math.max(12, Math.min(window.innerWidth - 820 - 12, r.left));
    return { top, left };
  });
</script>

{#if preview && pos}
  <div class="preview" style="top: {pos.top}px; left: {pos.left}px;">
    <div class="block">
      {#each code.slice(preview.from, preview.to) as entry, i}
        {@const idx = preview.from + i}
        {#each splitDataRow(entry) as row, ri (ri)}
          <Line
            entry={row.entry}
            index={idx}
            anchor={false}
            continuation={row.continuation}
            dim={idx !== preview.center}
            focus={idx === preview.center && !row.continuation}
          />
        {/each}
      {/each}
    </div>
  </div>
{/if}

<style>
  .preview {
    position: fixed;
    z-index: 20;
    width: min(820px, calc(100vw - 24px));
    background: var(--bg-alt);
    border: 1px solid var(--border-soft);
    border-radius: 4px;
    box-shadow: var(--shadow);
    padding: 6px 0;
    pointer-events: none;
    font-size: 12px;
  }
  .block {
    display: grid;
    grid-template-columns:
      4.5ch
      minmax(11.5ch, max-content)
      minmax(4.5ch, max-content)
      minmax(16ch, max-content)
      max-content
      minmax(0, 1fr);
    column-gap: 12px;
    padding: 0 12px;
  }
</style>
