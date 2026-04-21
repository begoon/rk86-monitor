import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [svelte(), viteSingleFile()],
  resolve: {
    alias: {
      '@data': resolve(__dirname, '../monitor.json'),
    },
  },
  build: {
    outDir: '../docs',
    emptyOutDir: true,
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
