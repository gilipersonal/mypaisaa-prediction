import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    // A prebuilt static app: no SvelteKit server runtime, no server session, no SSR action (MP-134).
    sveltekit({
      adapter: adapter({ pages: 'build', assets: 'build', fallback: undefined, precompress: false, strict: true }),
      serviceWorker: { register: true },
      version: { pollInterval: 0 }
    })
  ],
  server: {
    port: 5173,
    strictPort: true,
    // The dev server may read Prism in place, and nothing else outside web/.
    fs: { allow: ['../docs/design/prism'] }
  },
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node'
  }
});
