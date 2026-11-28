import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import '@fontsource-variable/instrument-sans/wght.css'
import '@fontsource/ibm-plex-mono/latin-400.css'
import '@fontsource/ibm-plex-mono/latin-500.css'
import './custom.css'
import Landing from './Landing.vue'
import ExpiryChecker from './ExpiryChecker.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('Landing', Landing)
    app.component('ExpiryChecker', ExpiryChecker)
  },
} satisfies Theme
