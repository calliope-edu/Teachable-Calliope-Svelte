<script lang="ts">
	// The build's version at the bottom of the settings menu, as every Calliope
	// editor shows it (docs/build-info.md): live "v1.0.0 · 7ea9962", dev and
	// local a framed mark before "calliope-main · a1b2c3d", and a second line
	// with the calliope-ui and widget states. Plain text, not a menu item: it is
	// read (and selected to copy), not picked.
	import {
		buildInfo as defaultBuildInfo,
		packagesLine,
		versionLine,
		type BuildInfo
	} from '$lib/build-info';

	let { info = defaultBuildInfo }: { info?: BuildInfo } = $props();

	const packages = $derived(packagesLine(info));
</script>

<div class="build-info" data-testid="build-info">
	<span class="line">
		{#if info.channel !== 'live'}<span class="channel">{info.channel}</span>{/if}
		<span>{versionLine(info)}</span>
	</span>
	{#if packages}<span class="line">{packages}</span>{/if}
</div>

<style>
	.build-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: var(--cui-space-1) var(--cui-space-2);
		font-size: 12px;
		line-height: 1.4;
		/* The menu's own text colour: black, never tinted. */
		color: var(--cui-text-default);
		user-select: text;
	}
	.line {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.channel {
		border: 1px solid currentColor;
		border-radius: 3px;
		padding: 0 4px;
	}
</style>
