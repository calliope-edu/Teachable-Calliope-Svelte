<script lang="ts">
  import { Button, Dialog } from '@calliope-edu/ui';
  import { classes, addClass, activeClass } from '$lib/stores';

  let {
    open = $bindable(false),
    images = [],
    detectedClass = null,
    oncancel,
    onconfirm
  }: {
    open?: boolean;
    images?: string[];
    detectedClass?: string | null;
    oncancel?: () => void;
    onconfirm?: (detail: { images: string[]; selectedClass: string | null }) => void;
  } = $props();

  // Preselected once per opening: the detected class, else the active one.
  let selectedClass = $state<string | null>(null);
  let newClassName = $state('');
  let importButton = $state<HTMLElement | null>(null);

  $effect(() => {
    if (open) selectedClass = detectedClass || $activeClass || null;
  });

  function cancel() {
    open = false;
    oncancel?.();
  }

  function createClass() {
    const name = newClassName.trim();
    if (!name) return;
    addClass(name);
    selectedClass = name;
    newClassName = '';
  }

  function confirm() {
    if (!selectedClass) createClass();
    onconfirm?.({ images, selectedClass });
    open = false;
  }
</script>

<!-- The importing button holds the focus as the dialog opens, so Enter or Space
     carries the import out; picking a different class is a step, not the way
     through. -->
<Dialog
  {open}
  title="Bilder importieren"
  description="{images.length} Bilder importieren. Wähle eine Klasse:"
  initialFocus={() => importButton}
  onOpenChange={(o) => {
    if (!o) cancel();
  }}
>
  <div class="import-classes">
    <div role="group" aria-label="Vorhandene Klassen" class="class-list">
      {#each $classes as c (c)}
        <Button
          variant="secondary"
          size="s"
          pressed={c === selectedClass}
          onclick={() => (selectedClass = c)}
        >
          {c}
        </Button>
      {/each}
    </div>
    <label for="new-class">Neue Klasse erstellen:</label>
    <div class="new-class">
      <input id="new-class" type="text" bind:value={newClassName} placeholder="Name für neue Klasse" />
      <Button variant="secondary" onclick={createClass}>Erstellen</Button>
    </div>
  </div>

  {#snippet actions()}
    <Button variant="secondary" onclick={cancel}>Abbrechen</Button>
    <Button bind:ref={importButton} onclick={confirm}>Importieren</Button>
  {/snippet}
</Dialog>

<style>
  .import-classes {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .class-list {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
  .new-class {
    display: flex;
    gap: 4px;
  }
</style>
