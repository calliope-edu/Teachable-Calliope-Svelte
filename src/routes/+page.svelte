<script lang="ts">
  import { onMount } from 'svelte';
  import ProjectStartScreen from '$lib/components/training/ProjectStartScreen.svelte';
  import { refreshProjectList } from '$lib/stores/projects';

  onMount(() => {
    void refreshProjectList();
  });
</script>

<div class="view overview-view">
  <ProjectStartScreen />
</div>

<style lang="scss">
  // `.view` clips its overflow (the training views size their panels to the
  // window). The start screen instead grows with its project list, so this
  // view is the scroll container: the whole page scrolls, with the scrollbar at
  // the window's edge, as on the Campus start page.
  .overview-view {
    display: block;
    padding: 16px;
    min-height: 0;
    overflow-y: auto;
  }
</style>
