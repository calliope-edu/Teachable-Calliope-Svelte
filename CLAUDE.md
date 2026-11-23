# Calliope Teachable Machine (Teachable-Calliope-Svelte)

Browser app for training image and pose classifiers and using them with the
Calliope mini (live at https://teachablemachine.calliope.cc/). SvelteKit 2 with
Svelte 5 runes, built as a static site (`@sveltejs/adapter-static`). It lives in
the calliope-dev superrepo as `editors/teachable`, next to `lib/calliope-ui` and
`lib/mini-connection-widget`.

## Branches

- Work on `calliope-main`: branch off it and merge back into it. `main` is
  history.
- A tag `vX.Y.Z` on `calliope-main` goes live: the `calliope-build` workflow
  builds it onto `build-live` (teachablemachine.calliope.cc). Every push to
  `calliope-main` builds onto `build-dev` (teachablemachine-dev.calliope.cc).
  Cut a release with the `release` workflow (docs/build-info.md).
- Never commit to `build-live` or `build-dev` by hand; only the workflow writes
  them.
- calliope-ui and the widget are set per channel at build time
  (`resolve-calliope-deps`): live takes their newest release tags, dev their
  newest commits. The pins in `package.json` only serve local development.

## Version

- `BUILD.json` and the settings menu's version line follow docs/build-info.md,
  which copies the format of calliope-mini-python-editor.

## Running it

- `pnpm install --frozen-lockfile`, then `pnpm dev` inside the superrepo.
- Outside the superrepo (an Obeya workspace, a plain clone) `pnpm dev` is broken:
  `vite.config.ts` aliases calliope-ui and the widget to `../../lib/` and falls
  back to the node_modules copies, whose `.svelte` styles are not compiled in
  dev. Use `pnpm build && pnpm preview --port <port>` there instead.
- All data is in the browser: projects in IndexedDB (`teachable-calliope`,
  store `projects`), the last opened project in localStorage
  (`teachable-last-project-id`). No backend, no login.

## Working here

- The UI text is German and is extracted for translation by wuchale
  (`wuchale.config.js`, catalogs in `src/locales/`). Write new UI strings in
  German; `pnpm i18n` syncs the catalogs.
- `pnpm build` / `svelte-kit sync` rewrite `src/locales/*.js` with LF line
  endings. Restore them (`git checkout -- src/locales`) before committing unless
  the change is about translations.
- Styling: calliope-ui tokens and components (`@calliope-edu/ui`), the app's
  global styles in `src/lib/styles/global.scss`. The body is a fixed grid
  (header + content) with `overflow: hidden`, and `.view` clips too, so a page
  that can grow longer than the window must make its own view the scroll
  container (see `src/routes/+page.svelte`).
- The start page (`/`) is `src/routes/+page.svelte` with
  `src/lib/components/training/ProjectStartScreen.svelte`; training and tryout
  are `/training` and `/tryout`.
- Do not run broad verification on your own (full test runs, `pnpm check`,
  `pnpm lint` over the whole repo): the owner verifies manually. Targeted checks
  are fine.
- Code, comments, commit messages and docs are in English.
