<script lang="ts">
  import type { Theme } from '../theme';
  import { plural } from '../plural';

  interface Props {
    query: string;
    mode: 'highlight' | 'filter';
    theme: Theme;
    matchCount: number;
    onQueryChange: (q: string) => void;
    onModeChange: (m: 'highlight' | 'filter') => void;
    onThemeToggle: () => void;
    onNext: () => void;
    onPrev: () => void;
  }
  let {
    query, mode, theme, matchCount,
    onQueryChange, onModeChange, onThemeToggle, onNext, onPrev,
  }: Props = $props();

  function handleKey(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      if (e.shiftKey) onPrev(); else onNext();
      e.preventDefault();
    }
  }

  const countLabel = $derived(
    query
      ? `${matchCount} ${plural(matchCount, 'совпадение', 'совпадения', 'совпадений')}`
      : ''
  );
</script>

<div class="bar">
  <span class="title">Монитор Радио-86РК (ПЗУ)</span>
  <input
    type="search"
    placeholder="Поиск (метка, мнемоника, hex, комментарий)…"
    value={query}
    oninput={(e) => onQueryChange((e.currentTarget as HTMLInputElement).value)}
    onkeydown={handleKey}
    autocomplete="off"
    spellcheck="false"
  />
  <span class="count">{countLabel}</span>
  <div class="toggle" role="group" aria-label="Режим поиска">
    <button
      class:active={mode === 'highlight'}
      onclick={() => onModeChange('highlight')}
      title="Подсвечивать совпадения, не скрывая строки"
    >Подсветка</button>
    <button
      class:active={mode === 'filter'}
      onclick={() => onModeChange('filter')}
      title="Скрыть строки без совпадений"
    >Фильтр</button>
  </div>
  <button
    class="theme"
    onclick={onThemeToggle}
    title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
    aria-label="Переключить тему"
  >{theme === 'dark' ? '☀' : '☾'}</button>
</div>

<style>
  .bar {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    background: var(--bg-alt);
    border-bottom: 1px solid var(--border);
  }
  .title {
    font-weight: 700;
    color: var(--accent-hover);
    margin-right: 8px;
  }
  input[type="search"] {
    flex: 1;
    max-width: 420px;
    padding: 4px 8px;
    font: inherit;
    background: var(--bg);
    color: var(--fg);
    border: 1px solid var(--border-soft);
    border-radius: 3px;
  }
  input[type="search"]:focus {
    outline: none;
    border-color: var(--accent);
  }
  .count {
    color: var(--fg-dim);
    flex: 0 0 auto;
    /* Wide enough for "9999 совпадений" so adjacent buttons don't jitter
       as the match count changes. */
    width: 16ch;
  }
  .toggle {
    display: flex;
    border: 1px solid var(--border-soft);
    border-radius: 3px;
    overflow: hidden;
  }
  .toggle button {
    background: var(--bg);
    color: var(--fg-dim);
    border: none;
    padding: 4px 10px;
    font: inherit;
    cursor: pointer;
  }
  .toggle button.active {
    background: var(--accent);
    color: var(--accent-fg);
  }
  .toggle button:not(.active):hover { background: var(--bg-hover); color: var(--fg); }
  .theme {
    background: var(--bg);
    color: var(--fg);
    border: 1px solid var(--border-soft);
    border-radius: 3px;
    padding: 4px 10px;
    font: inherit;
    cursor: pointer;
    min-width: 34px;
  }
  .theme:hover { background: var(--bg-hover); }
</style>
