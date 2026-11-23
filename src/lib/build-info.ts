// Which version this build is: the same values as the BUILD.json next to it
// (docs/build-info.md). vite.config.ts compiles them in as __BUILD_INFO__ from
// scripts/build-info.mjs. Kept out of wuchale's extraction (wuchale.config.js):
// versions and package names read the same in every language.

/** A shared package's state in a build: its release tag ("" on dev) and commit. */
export interface PackageState {
	tag: string;
	commit: string;
}

export interface BuildInfo {
	channel: 'live' | 'dev' | 'local';
	/** live: the tag (vX.Y.Z); dev: the branch (calliope-main). */
	version: string;
	commit: string;
	builtAt: string;
	ui: PackageState | null;
	widget: PackageState | null;
	libs: Record<string, string>;
}

const fallback: BuildInfo = {
	channel: 'local',
	version: 'local',
	commit: '',
	builtAt: '',
	ui: null,
	widget: null,
	libs: {}
};

export const toBuildInfo = (value: unknown): BuildInfo =>
	value && typeof value === 'object' ? { ...fallback, ...(value as Partial<BuildInfo>) } : fallback;

export const buildInfo: BuildInfo = toBuildInfo(
	typeof __BUILD_INFO__ === 'undefined' ? undefined : __BUILD_INFO__
);

export const shortCommit = (commit: string): string => commit.slice(0, 7);

const joined = (...parts: string[]) => parts.filter(Boolean).join(' · ');

/** "v1.0.0 · 7ea9962" (live), "calliope-main · a1b2c3d" (dev). */
export const versionLine = (info: BuildInfo): string =>
	joined(info.version, shortCommit(info.commit));

const packageState = (label: string, state: PackageState | null) => {
	const ref = state ? state.tag || shortCommit(state.commit) : '';
	return ref ? `${label} ${ref}` : '';
};

/**
 * "UI v0.3.0 · Widget v0.4.1" (live), "UI 6faa0c1 · Widget 9e8d7c6" (dev), or
 * null when the build carries neither.
 */
export const packagesLine = (info: BuildInfo): string | null =>
	joined(packageState('UI', info.ui), packageState('Widget', info.widget)) || null;
