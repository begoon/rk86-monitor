<script lang="ts">
  import type { CodeLine } from '../types';
  import { MNEMONICS, DIRECTIVES } from '../mnemonics';
  import ArgTokens from './ArgTokens.svelte';
  import Highlighted from './Highlighted.svelte';

  interface Props {
    entry: CodeLine;
    index: number;
    onNavigate?: (addr: string, ev: MouseEvent) => void;
    onHover?: (addr: string | null, el: HTMLElement | null) => void;
    highlight?: string;
    anchor?: boolean;
    dim?: boolean;
    focus?: boolean;
    layout?: 'normal' | 'equ' | 'jmp';
    continuation?: boolean;
  }

  let {
    entry, index, onNavigate, onHover, highlight,
    anchor = true, dim, focus, layout = 'normal', continuation,
  }: Props = $props();

  const addrUpper = $derived(entry.addr?.toUpperCase() ?? '');
  const opKind = $derived.by(() => {
    if (!entry.op) return '';
    const o = entry.op.toLowerCase();
    if (MNEMONICS.has(o)) return 'mnemonic';
    if (DIRECTIVES.has(o)) return 'directive';
    return 'other';
  });

  const commentOnly = $derived(
    !!entry.comment && !entry.label && !entry.op && !entry.addr && !entry.bytes
  );
  const alignedCell = $derived(layout !== 'normal' && entry.op === layout);
  const labelColon = $derived(layout !== 'equ');
</script>

{#snippet addrCell()}
  {#if addrUpper}
    <a
      class="col addr addr-link"
      href={`#${addrUpper}`}
      onclick={(e) => onNavigate?.(addrUpper, e)}
      title="Скопировать ссылку на этот адрес"
    ><Highlighted text={addrUpper} query={highlight} /></a>
  {:else}
    <span class="col addr"></span>
  {/if}
{/snippet}

{#snippet bytesCell()}
  <span class="col bytes"><Highlighted text={entry.bytes ?? ''} query={highlight} /></span>
{/snippet}

{#snippet charsCell()}
  <span class="col chars"><Highlighted text={entry.chars ?? ''} query={highlight} /></span>
{/snippet}

{#snippet commentCell(cls = 'col comment')}
  <span class={cls}>{#if entry.comment}<Highlighted text={entry.comment} query={highlight} />{/if}</span>
{/snippet}

<div
  class="line"
  class:dim
  class:focus
  class:comment-only={commentOnly}
  class:aligned-row={alignedCell}
  class:continuation
  id={anchor && addrUpper ? `L${addrUpper}` : undefined}
  data-line={index}
>
  {#if continuation}
    {@render addrCell()}
    {@render bytesCell()}
    {@render charsCell()}
    <span class="col span-to-end"></span>
  {:else if commentOnly}
    <span class="col comment span-to-end"><Highlighted text={entry.comment!} query={highlight} /></span>
  {:else if alignedCell}
    {@render addrCell()}
    {@render bytesCell()}
    {@render charsCell()}
    <span class="col label-cell"><span class="label-def"><Highlighted text={entry.label ?? ''} query={highlight} /></span>{#if labelColon}<span class="punct">:</span>{/if}</span>
    <span class="col op-cell"><span class={opKind}><Highlighted text={entry.op ?? ''} query={highlight} /></span></span>
    <span class="col value-cell">{#if entry.arg1}<ArgTokens text={entry.arg1} {highlight} {onNavigate} {onHover} />{/if}{#if entry.arg2}<span class="punct">,{' '}</span><ArgTokens text={entry.arg2} {highlight} {onNavigate} {onHover} />{/if}</span>
    {@render commentCell()}
  {:else}
    {@render addrCell()}
    {@render bytesCell()}
    {@render charsCell()}
    <span class="col label-cell">{#if entry.label}<span class="label-def"><Highlighted text={entry.label} query={highlight} /></span>{#if entry.op !== 'equ'}<span class="punct">:</span>{/if}{/if}</span>
    <span class="col op-args-cell">{#if entry.op}<span class={opKind}><Highlighted text={entry.op} query={highlight} /></span>{/if}{#if entry.data}{' '}<ArgTokens text={entry.data} {highlight} {onNavigate} {onHover} />{:else}{#if entry.arg1}{' '}<ArgTokens text={entry.arg1} {highlight} {onNavigate} {onHover} />{/if}{#if entry.arg2}<span class="punct">,{' '}</span><ArgTokens text={entry.arg2} {highlight} {onNavigate} {onHover} />{/if}{/if}</span>
    {@render commentCell()}
  {/if}
</div>

<style>
  .line {
    display: grid;
    grid-template-columns: subgrid;
    grid-column: 1 / -1;
    white-space: pre;
    min-height: 1.5em;
    scroll-margin-top: 52px;
  }
  .line:hover { background: var(--bg-hover); }
  .line:target { background: var(--bg-flash); }
  .line.dim { opacity: 0.6; }
  .line.focus { background: var(--bg-hover); }
  .col { min-width: 0; }
  .span-to-end { grid-column: 4 / -1; }
  .comment { white-space: pre-wrap; overflow-wrap: anywhere; }
  .addr { color: var(--addr); }
  .addr-link {
    text-decoration: none;
    cursor: pointer;
  }
  .addr-link:hover { text-decoration: underline; }
  .bytes { color: var(--byte); letter-spacing: 0.5px; }
  .chars { color: var(--char); }
  .comment { color: var(--comment); }
  .label-cell, .op-cell, .value-cell, .op-args-cell { color: var(--fg); }
  .label-def { color: var(--label-def); font-weight: 600; }
  .mnemonic { color: var(--mnemonic); font-weight: 600; }
  .directive { color: var(--directive); font-weight: 600; }
  .other { color: var(--fg); }
  .punct { color: var(--fg-dim); }
</style>
