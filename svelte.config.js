import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	kit: {
		// `fallback` is the safety net for anything the prerender step did not emit
		// (see static/.htaccess). It is a plain SPA shell — with `ssr = false` that
		// is what the real pages are too, so nothing is lost by falling back to it.
		adapter: adapter({ fallback: '200.html' }),
		// Absolute asset paths (`/_app/…`) in every page, not `./_app/…`. Cloudflare
		// Pages answers a path without a file with `index.html` (the build has no
		// top-level 404.html); with relative paths that page then loads its scripts
		// from below the requested path and stays blank (`/a/b` → `/a/_app/…`).
		// The site only ever runs at the root of its domain.
		paths: { relative: false }
	},
	vitePlugin: {
		inspector: {
			toggleKeyCombo: 'control-y'
		}
	}
};

export default config;
