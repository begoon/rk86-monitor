<script lang="ts">
  interface Props {
    text: string;
    query?: string;
  }
  let { text, query }: Props = $props();

  const parts = $derived.by(() => {
    if (!query) return [{ t: text, m: false }];
    const needle = query.toLowerCase();
    const hay = text.toLowerCase();
    const out: { t: string; m: boolean }[] = [];
    let i = 0;
    while (i < text.length) {
      const hit = hay.indexOf(needle, i);
      if (hit < 0) {
        out.push({ t: text.slice(i), m: false });
        break;
      }
      if (hit > i) out.push({ t: text.slice(i, hit), m: false });
      out.push({ t: text.slice(hit, hit + needle.length), m: true });
      i = hit + needle.length;
    }
    return out;
  });
</script>

{#each parts as p}{#if p.m}<mark>{p.t}</mark>{:else}{p.t}{/if}{/each}

<style>
  mark {
    background: var(--match);
    color: inherit;
    border-radius: 2px;
  }
</style>
