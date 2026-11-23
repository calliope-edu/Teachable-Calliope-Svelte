import { describe, expect, it } from 'vitest';
import { packagesLine, toBuildInfo, versionLine, type BuildInfo } from './build-info';
import { buildInfo, packageStates, pinState } from '../../scripts/build-info.mjs';

const live: BuildInfo = {
	channel: 'live',
	version: 'v1.0.0',
	commit: '7ea99620f3c4d5e6f708192a3b4c5d6e7f809123',
	builtAt: '2026-11-23T17:00:00Z',
	ui: { tag: 'v0.1.0', commit: '4e015326cdd155e6db7e74bc08138ee3f870dbfb' },
	widget: { tag: 'v0.3.0', commit: '53a8a25d108f808e9b9ad1364e5568374eb2246a' },
	libs: {}
};

const dev: BuildInfo = {
	...live,
	channel: 'dev',
	version: 'calliope-main',
	commit: 'a1b2c3d4e5f60718293a4b5c6d7e8f9012345678',
	ui: { tag: '', commit: '6faa0c1aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' },
	widget: { tag: '', commit: '9e8d7c6bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' }
};

describe('version line', () => {
	it('names the tag on live and the branch on dev, each with the short commit', () => {
		expect(versionLine(live)).toBe('v1.0.0 · 7ea9962');
		expect(versionLine(dev)).toBe('calliope-main · a1b2c3d');
	});

	it('names calliope-ui and the widget by tag on live and by commit on dev', () => {
		expect(packagesLine(live)).toBe('UI v0.1.0 · Widget v0.3.0');
		expect(packagesLine(dev)).toBe('UI 6faa0c1 · Widget 9e8d7c6');
	});

	it('leaves the second line out for a build without them', () => {
		expect(packagesLine({ ...live, ui: null, widget: null })).toBeNull();
	});

	it('falls back to a local build when nothing was compiled in', () => {
		expect(toBuildInfo(undefined)).toMatchObject({ channel: 'local', version: 'local' });
	});
});

describe('scripts/build-info.mjs', () => {
	const pkg = {
		dependencies: {
			'@calliope-edu/ui':
				'github:calliope-edu/calliope-ui#8a2aeb11e4828a66a9ebef05e091a2d77829c737',
			'@calliope-edu/mini-connection-widget': 'github:calliope-edu/mini-connection-widget#v0.3.0'
		}
	};

	it('reads a pin as a commit or a tag', () => {
		expect(pinState('github:o/r#8a2aeb1')).toEqual({ tag: '', commit: '8a2aeb1' });
		expect(pinState('github:o/r#v0.3.0')).toEqual({ tag: 'v0.3.0', commit: '' });
		expect(pinState('github:o/r#semver:^0.3.0')).toBeNull();
		expect(pinState(undefined)).toBeNull();
	});

	it('takes the states resolve-calliope-deps found, with an empty tag on dev', () => {
		const json = JSON.stringify({ ui: { tag: null, commit: 'abc' }, widget: null });
		expect(packageStates(json, pkg)).toEqual({ ui: { tag: '', commit: 'abc' }, widget: null });
	});

	it('takes the package.json pins without them', () => {
		expect(packageStates(undefined, pkg)).toEqual({
			ui: { tag: '', commit: '8a2aeb11e4828a66a9ebef05e091a2d77829c737' },
			widget: { tag: 'v0.3.0', commit: '' }
		});
	});

	it('writes what the workflow sets', () => {
		const info = buildInfo(
			{
				BUILD_CHANNEL: 'live',
				BUILD_VERSION: 'v1.0.0',
				BUILD_COMMIT: live.commit,
				BUILD_AT: live.builtAt,
				CALLIOPE_DEPS: JSON.stringify({ ui: live.ui, widget: live.widget })
			},
			pkg
		);
		expect(info).toEqual(live);
	});

	it('refuses an unknown channel', () => {
		expect(() => buildInfo({ BUILD_CHANNEL: 'beta' }, pkg)).toThrow(/BUILD_CHANNEL/);
	});
});
