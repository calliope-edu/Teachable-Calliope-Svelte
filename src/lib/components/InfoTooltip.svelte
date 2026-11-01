<!--
  The "?" next to a figure or chart: a calliope-ui Popover with a short
  explanation, opened by click or keyboard (the texts are too long for a hover
  Tooltip and hold the reader's attention while they read).
-->
<script lang="ts">
  import { IconButton, Popover } from '@calliope-edu/ui';

  let { text, title = '' }: { text: string; title?: string } = $props();
</script>

<span class="info-tooltip">
  <Popover title={title || undefined} align="end" size="m">
    {#snippet trigger({ props })}
      <IconButton {...props} icon="help" label="Info" size="s" tooltip={false} />
    {/snippet}
    <p class="body">{text}</p>
  </Popover>
</span>

<style>
  .info-tooltip {
    display: inline-flex;
    align-items: center;
    margin-left: 6px;
    vertical-align: middle;
  }
  .body {
    margin: 0;
    color: var(--cui-text-muted);
  }
</style>
