import { mount } from 'svelte';
import App from './App.svelte';
import { loadTheme, applyTheme } from './lib/theme';
import './app.css';

applyTheme(loadTheme());

const app = mount(App, { target: document.getElementById('app')! });

export default app;
