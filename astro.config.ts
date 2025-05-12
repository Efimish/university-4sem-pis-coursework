// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import db from '@astrojs/db';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  site: 'http://localhost:4321',
  redirects: {
    "/": "/items"
  },

  devToolbar: {
    enabled: false
  },

  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark'
      },
      defaultColor: false,
      wrap: true,
    }
  },

  integrations: [sitemap(), db()],

  server: {
    allowedHosts: true
  },

  adapter: node({
    mode: 'standalone'
  })
});
