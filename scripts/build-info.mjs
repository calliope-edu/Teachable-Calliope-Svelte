#!/usr/bin/env node
// The build's version as BUILD.json holds it (docs/build-info.md).
//
// The calliope-build workflow sets BUILD_CHANNEL, BUILD_VERSION, BUILD_COMMIT,
// BUILD_AT and CALLIOPE_DEPS once per job; vite.config.ts compiles the same
// object in as __BUILD_INFO__ and the workflow writes it as BUILD.json next to
// the build with `node scripts/build-info.mjs`. Without those variables (a
// local `pnpm dev` or `pnpm build`) the channel is "local", version and commit
// come from git, and calliope-ui and the widget from their pins in
// package.json.
//
// Copied from calliope-mini-python-editor bin/build-info.js, the editor that
// defines the format; only `ui`, `widget` and `libs` differ per editor.
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const CHANNELS = ['live', 'dev', 'local'];

const root = fileURLToPath(new URL('..', import.meta.url));

/** @param {string} args */
const git = (args) => {
	try {
		return execSync(`git ${args}`, { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] })
			.toString()
			.trim();
	} catch {
		return '';
	}
};

/**
 * @typedef {{ tag: string, commit: string }} PackageState
 * @typedef {{ ui: PackageState | null, widget: PackageState | null }} PackageStates
 */

/**
 * A git pin's state: `github:owner/repo#<sha>` is a commit, `#vX.Y.Z` a tag.
 * Anything else (a range, a branch) says nothing exact, so it is left out.
 * @param {string | undefined} spec
 * @returns {PackageState | null}
 */
export const pinState = (spec) => {
	const ref = spec?.split('#')[1];
	if (!ref) return null;
	if (/^[0-9a-f]{7,40}$/.test(ref)) return { tag: '', commit: ref };
	if (/^v\d+\.\d+\.\d+/.test(ref)) return { tag: ref, commit: '' };
	return null;
};

/**
 * calliope-ui and the widget: in CI the `json` output of resolve-calliope-deps
 * (CALLIOPE_DEPS, `tag` null on dev), locally the pins in package.json.
 * @param {string | undefined} json
 * @param {Record<string, Record<string, string>>} pkg
 * @returns {PackageStates}
 */
export const packageStates = (json, pkg) => {
	/** @param {{ tag?: string | null, commit?: string | null } | null | undefined} s */
	const norm = (s) => (s ? { tag: s.tag ?? '', commit: s.commit ?? '' } : null);
	if (json) {
		const deps = JSON.parse(json);
		return { ui: norm(deps.ui), widget: norm(deps.widget) };
	}
	const deps = { ...pkg.devDependencies, ...pkg.dependencies };
	return {
		ui: pinState(deps['@calliope-edu/ui']),
		widget: pinState(deps['@calliope-edu/mini-connection-widget'])
	};
};

/**
 * @param {Record<string, string | undefined>} env
 * @param {Record<string, Record<string, string>>} [pkg]
 */
export const buildInfo = (
	env = process.env,
	pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
) => {
	const channel = env.BUILD_CHANNEL || 'local';
	if (!CHANNELS.includes(channel)) {
		throw new Error(`BUILD_CHANNEL must be one of ${CHANNELS.join(', ')}, not "${channel}"`);
	}
	return {
		channel,
		// live: the tag (vX.Y.Z); dev: the branch (calliope-main).
		version: env.BUILD_VERSION || git('rev-parse --abbrev-ref HEAD') || 'local',
		commit: env.BUILD_COMMIT || git('rev-parse HEAD'),
		builtAt: env.BUILD_AT || new Date().toISOString().replace(/\.\d+Z$/, 'Z'),
		...packageStates(env.CALLIOPE_DEPS, pkg),
		// Pinned library forks, name → commit; Teachable has none of its own yet.
		libs: {}
	};
};

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
	process.stdout.write(JSON.stringify(buildInfo(), null, 2) + '\n');
}
