# Builds, releases and the version line

The Teachable Machine follows the scheme of all Calliope editors (calliope-campus
`docs/design/2026-editor-channels.md`): one branch `calliope-main`, a tag goes
live, every commit goes to dev. The format of `BUILD.json` and the version line
is defined by calliope-mini-python-editor `docs/build-info.md`; this app copies
it.

## Channels

| Channel | Built from                       | Build branch | Served at                          |
| ------- | -------------------------------- | ------------ | ---------------------------------- |
| `live`  | a tag `vX.Y.Z`                   | `build-live` | `teachablemachine.calliope.cc`     |
| `dev`   | a push to `calliope-main`        | `build-dev`  | `teachablemachine-dev.calliope.cc` |
| `local` | `pnpm dev`, a local `pnpm build` | none         | your machine                       |

The workflow `.github/workflows/calliope-build.yml` builds and pushes one commit
per build onto the build branch, with the site at its root. Nobody commits to
`build-live` or `build-dev` by hand; they only ever grow. There is no Campus
variant: Campus does not embed this app.

calliope-ui and the connection widget follow the channel too: before the
install, the shared action `resolve-calliope-deps` (in calliope-ui) sets them to
their newest release tags within the pinned major (live) or their newest commits
on `calliope-main` (dev). The pins in `package.json` only serve local
development.

## Releasing

```sh
gh workflow run release.yml -R calliope-edu/Teachable-Calliope-Svelte -f bump=minor
```

`release.yml` sets `version` in `package.json` on `calliope-main`, tags that
commit `vX.Y.Z`, publishes a GitHub release and starts `calliope-build` for the
tag. `bump` is `patch`, `minor`, `major` or an explicit `X.Y.Z`. Pushing a tag
`vX.Y.Z` by hand builds it as well, without the version commit.

## Hosting

Two Cloudflare Pages projects, each connected to this repository and serving a
build branch as it is:

| Pages project          | Production branch | Custom domain                      |
| ---------------------- | ----------------- | ---------------------------------- |
| `teachablemachine`     | `build-live`      | `teachablemachine.calliope.cc`     |
| `teachablemachine-dev` | `build-dev`       | `teachablemachine-dev.calliope.cc` |

Build settings: framework preset none, no build command, build output directory
`/` (the repository root). Preview deployments off. The build has no top-level
`404.html`, so Pages serves `index.html` for paths without a file, the same SPA
shell as `200.html`. Swapping the host later means pointing another host at the
same build branches. `static/.htaccess` is for the Apache at Strato that served
the live site before.

## `BUILD.json`

At the root of every build (`/BUILD.json`):

```json
{
	"channel": "live",
	"version": "v1.0.0",
	"commit": "69632cbbc1fc…",
	"builtAt": "2026-11-23T22:05:55Z",
	"ui": { "tag": "v0.1.0", "commit": "4e01532…" },
	"widget": { "tag": "v0.3.0", "commit": "53a8a25…" },
	"libs": {}
}
```

On dev, `version` is `calliope-main` and the `tag` fields are `""`. Local builds
say `"channel": "local"`, the checked-out branch, and the pins from
`package.json`.

[`scripts/build-info.mjs`](../scripts/build-info.mjs) makes the object from
`BUILD_CHANNEL`, `BUILD_VERSION`, `BUILD_COMMIT`, `BUILD_AT` and `CALLIOPE_DEPS`
(the action's `json` output), which the workflow sets once per build.
`vite.config.ts` compiles it in as `__BUILD_INFO__`
([`src/lib/build-info.ts`](../src/lib/build-info.ts)) and the workflow writes it
as `BUILD.json`, so both always agree.

## The version line

At the bottom of the settings menu (the gear in the header), below a separator,
black text:

- live: `v1.0.0 · 69632cb`, then `UI v0.1.0 · Widget v0.3.0`
- dev: a framed `dev` mark, `calliope-main · a1b2c3d`, then
  `UI 4e01532 · Widget 53a8a25`
- local: a framed `local` mark, the branch and commit, then the pins
