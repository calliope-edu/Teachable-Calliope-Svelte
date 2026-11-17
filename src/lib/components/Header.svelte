<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import {
    AppHeader,
    IconButton,
    Menu,
    MenuItem,
    MenuRadioGroup,
    MenuRadioItem,
    MenuSeparator,
    SegmentedControl,
    type SegmentedOption
  } from '@calliope-edu/ui';
  import { ConnectButton } from '@calliope-edu/mini-connection-widget';
  import { showLanguageOverlay, showCameraOverlay, showAIInfoOverlay } from '$lib/stores/app';
  import {
    activeModel,
    availableModels,
    currentProject,
    closeCurrentProject,
    renameCurrentProject
  } from '$lib/stores/projects';
  import { activateModel, modelLabel } from '$lib/models';
  import { exportCurrentProject } from '$lib/projects-io';
  import { showNotification } from '$lib/stores/notifications';

  let editingName = $state(false);
  let nameInput = $state('');

  const VIEWS: SegmentedOption[] = [
    { value: 'training', label: 'Trainieren' },
    { value: 'tryout', label: 'Programmieren' },
    { value: 'apply', label: 'Anwenden' }
  ];

  const active = $derived(
    $page.url.pathname.startsWith('/apply')
      ? 'apply'
      : $page.url.pathname.startsWith('/tryout')
        ? 'tryout'
        : 'training',
  );


  // The three project views. `$currentProject` on its own can't decide what the
  // header shows: the layout restores the last project on load, so it is set on
  // the overview too — and there the nav would point into a project the user has
  // not picked yet.
  const onProjectView = $derived(
    ['/training', '/tryout', '/apply'].some((p) => $page.url.pathname.startsWith(p))
  );

  // Newest first. `availableModels` runs oldest-first, the way the history in
  // Trainieren reads; a menu is picked from the top, so it is reversed here.
  const headerModels = $derived([...$availableModels].reverse());

  async function pickModel(id: string) {
    if (id === $activeModel?.id) return;
    try {
      // Loads the weights, and re-labels the open program's class blocks if
      // Programmieren is the view we are on.
      const model = await activateModel(id);
      if (model) showNotification(`Modell „${modelLabel(model)}“ geladen`, { type: 'success' });
    } catch (err) {
      showNotification('Fehler beim Laden: ' + (err as Error).message, { type: 'error' });
    }
  }

  function navTo(view: string) {
    if (view !== active) goto(`/${view}`);
  }

  function openLanguage() {
    showLanguageOverlay.set(true);
  }
  // Always offered, on every view. The picker used to be an inline list that
  // hid itself whenever the browser reported fewer than two devices — which is
  // exactly what a missing permission looks like, so the one control that could
  // have fixed it was the one that disappeared. The overlay asks for the camera
  // itself, so outside the feed views this sets the device for the next start.
  function openCamera() {
    showCameraOverlay.set(true);
  }
  function openAIInfo() {
    showAIInfoOverlay.set(true);
  }

  function startEditName() {
    nameInput = $currentProject?.name ?? '';
    editingName = true;
  }
  async function commitEditName() {
    if (editingName && nameInput.trim() && nameInput.trim() !== $currentProject?.name) {
      await renameCurrentProject(nameInput.trim());
    }
    editingName = false;
  }
  function onNameKey(e: KeyboardEvent) {
    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
    if (e.key === 'Escape') editingName = false;
  }
  // The brand is the only way back to the overview now that the back arrow is
  // gone, so it carries what the arrow did: close the project before navigating,
  // which is also what drops the loaded model (see $lib/models). AppHeader
  // renders it as a real <a href="/"> (middle-click and open in new tab still
  // work), so the click is caught here as it bubbles through the header and the
  // router then takes the link as usual.
  function onHeaderClick(e: MouseEvent) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    if (!(e.target as Element).closest('a[href="/"]')) return;
    closeCurrentProject();
  }
  async function onExport() {
    try {
      await exportCurrentProject();
      showNotification('Projekt exportiert', { type: 'success' });
    } catch (err) {
      showNotification((err as Error).message, { type: 'error' });
    }
  }
</script>

<AppHeader title="Calliope Teachable Machine" href="/" onclick={onHeaderClick}>
  {#snippet start()}
    {#if $currentProject}
      <div class="project-bar">
        {#if editingName}
          <!-- svelte-ignore a11y_autofocus -->
          <input
            class="project-name-input"
            bind:value={nameInput}
            onblur={commitEditName}
            onkeydown={onNameKey}
            autofocus
          />
        {:else}
          <button class="project-name-btn" onclick={startEditName} title="Umbenennen">
            {$currentProject.name}
            <span class="edit-hint">✎</span>
          </button>
        {/if}
      </div>
    {/if}
  {/snippet}

  {#snippet center()}
    {#if $currentProject && onProjectView}
      <SegmentedControl
        label="Ansicht"
        options={VIEWS}
        value={active}
        onValueChange={navTo}
        size="m"
      />
    {/if}
  {/snippet}

  {#snippet end()}
    <!-- Which model is loaded, and the one place to change it. It used to be
         asked once per view — a picker in Anwenden, one per program card in
         Programmieren — but nothing is bound to a model any more: the classes
         a program's blocks show come from whichever one is loaded. So it is a
         single app-wide setting, and it belongs where the other ones are. -->
    {#if $currentProject && onProjectView && $availableModels.length}
      <Menu align="end">
        {#snippet trigger({ props })}
          <button
            {...props}
            type="button"
            class="model-btn"
            class:empty={!$activeModel}
            title={$activeModel ? `Modell: ${modelLabel($activeModel)}` : 'Kein Modell geladen'}
          >
            <span class="model-caption">Modell</span>
            <span class="model-name">
              {$activeModel ? modelLabel($activeModel) : 'keines'}
            </span>
            <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
              <path
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 9.5 12 15.5 18 9.5"
              />
            </svg>
          </button>
        {/snippet}
        <!-- Newest first, the direction the model list in Trainieren runs in. -->
        <MenuRadioGroup value={$activeModel?.id ?? ''} onValueChange={pickModel}>
          {#each headerModels as model (model.id)}
            <MenuRadioItem value={model.id}>
              <span class="model-option">
                <span class="option-name">{modelLabel(model)}</span>
                <span class="option-meta">
                  {model.classes.length} Klassen
                  {#if model.mode === 'pose'}· Pose{/if}
                  {#if model.source === 'imported'}· importiert{/if}
                </span>
              </span>
            </MenuRadioItem>
          {/each}
        </MenuRadioGroup>
      </Menu>
    {/if}

    <!-- Icon variant, as campus uses: a status-coloured circle with the
         Calliope logo instead of the labelled pill. It morphs into a short
         pill while transferring (percent, or a spinner for the
         indeterminate phases). -->
    <ConnectButton appearance="icon" />

    <Menu align="end">
      {#snippet trigger({ props })}
        <IconButton {...props} icon="settings" label="Einstellungen" />
      {/snippet}
      {#if $currentProject}
        <MenuItem onSelect={onExport}>Projekt herunterladen</MenuItem>
        <MenuSeparator />
      {/if}
      <MenuItem onSelect={openCamera}>Kamera</MenuItem>
      <MenuItem onSelect={openLanguage}>Sprachen</MenuItem>
      <MenuItem onSelect={openAIInfo}>KI-Hinweise</MenuItem>
    </Menu>
  {/snippet}
</AppHeader>

<style lang="scss">
  .project-bar {
    display: flex;
    align-items: center;
    gap: 4px;
    padding-left: 12px;
    border-left: 1px solid rgba(255, 255, 255, 0.15);
    min-width: 0;
  }
  .project-name-btn {
    background: transparent;
    border: none;
    color: #fff;
    font-size: 15px;
    font-weight: 500;
    padding: 4px 10px;
    border-radius: 6px;
    cursor: pointer;
    min-height: unset;
    box-shadow: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    max-width: 240px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    .edit-hint { opacity: 0; font-size: 12px; }
    &:hover {
      background: rgba(255, 255, 255, 0.12);
      .edit-hint { opacity: 0.8; }
    }
  }
  .project-name-input {
    font-size: 15px;
    font-weight: 500;
    padding: 4px 10px;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.4);
    background: rgba(0, 0, 0, 0.3);
    color: #fff;
    max-width: 240px;
  }
  // Field-shaped rather than button-shaped, like the model picker in Anwenden
  // was: a caption, the value, a chevron. On the dark bar that means a hairline
  // outline instead of a border.
  .model-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    max-width: 280px;
    padding: 5px 10px;
    border: 1px solid rgba(255, 255, 255, 0.28);
    border-radius: 20px;
    background: rgba(0, 0, 0, 0.18);
    color: rgba(255, 255, 255, 0.93);
    font: inherit;
    font-size: 13px;
    min-height: unset;
    box-shadow: none;
    cursor: pointer;
    transition: background-color 0.2s, border-color 0.2s;

    &:hover {
      background: rgba(255, 255, 255, 0.14);
      border-color: rgba(255, 255, 255, 0.5);
    }
    svg { opacity: 0.7; flex-shrink: 0; }
    &:hover svg { opacity: 1; }
    &.empty .model-name { font-style: italic; opacity: 0.75; }
  }
  .model-caption {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    opacity: 0.6;
    flex-shrink: 0;
  }
  .model-name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 500;
  }
  // Menu items follow the page theme (the menu opens in a portal), so these
  // use the library's text roles rather than the header's.
  .model-option {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .option-name { font-weight: 500; }
  .option-meta {
    font-size: 11px;
    color: var(--cui-text-muted);
  }

  @media (max-width: 900px) {
    // The value alone still reads as the model; the caption is what goes first.
    .model-caption { display: none; }
    .model-btn { max-width: 180px; }
  }
</style>
