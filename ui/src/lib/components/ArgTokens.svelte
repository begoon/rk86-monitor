<script lang="ts">
  import type { Token } from '../types';
  import { tokenizeArg } from '../tokenize';
  import { symbols, isExternalAddr } from '../data';
  import Highlighted from './Highlighted.svelte';

  interface Props {
    text: string;
    highlight?: string;
    onNavigate?: (addr: string, ev: MouseEvent) => void;
    onHover?: (addr: string | null, el: HTMLElement | null) => void;
  }

  let { text, highlight, onNavigate, onHover }: Props = $props();

  const tokens: Token[] = $derived(tokenizeArg(text, symbols));

  function handleClick(ev: MouseEvent, addr: string) {
    onNavigate?.(addr, ev);
  }
  function handleEnter(ev: MouseEvent, addr: string) {
    onHover?.(addr, ev.currentTarget as HTMLElement);
  }
  function handleLeave() {
    onHover?.(null, null);
  }
</script>

{#each tokens as t}
  {#if t.kind === 'label-ref'}
    <a
      class="tok label-ref"
      class:external={isExternalAddr(t.addr)}
      href="#{t.addr}"
      onclick={(e) => handleClick(e, t.addr)}
      onmouseenter={(e) => handleEnter(e, t.addr)}
      onmouseleave={handleLeave}
    ><Highlighted text={t.text} query={highlight} /></a>
  {:else if t.kind === 'reg'}<span class="tok reg"><Highlighted text={t.text} query={highlight} /></span>
  {:else if t.kind === 'num'}<span class="tok num"><Highlighted text={t.text} query={highlight} /></span>
  {:else if t.kind === 'str'}<span class="tok str"><Highlighted text={t.text} query={highlight} /></span>
  {:else if t.kind === 'punct'}<span class="tok punct">{t.text}</span>
  {:else}<span class="tok"><Highlighted text={t.text} query={highlight} /></span>{/if}
{/each}

<style>
  .tok {
    white-space: pre;
  }
  .reg { color: var(--reg); }
  .num { color: var(--num); }
  .str { color: var(--str); }
  .punct { color: var(--fg-dim); }
  .label-ref {
    color: var(--label-ref);
    text-decoration: none;
    cursor: pointer;
  }
  .label-ref.external { color: var(--label-ref-ext); }
  .label-ref:hover {
    text-decoration: underline;
    color: var(--accent-hover);
  }
</style>
