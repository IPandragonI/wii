# Channel Menu Portfolio

A personal portfolio presented as a console-style channel menu, inspired by the Nintendo Wii Menu (not affiliated with Nintendo; all icons, sounds, and artwork are original or open-licensed). Projects are discovered from GitHub, enriched with Vercel deployment data, and curated through a single config file.

**Stack:** Next.js 16 (App Router, Cache Components) · TypeScript (strict) · Tailwind CSS 4 · Motion · Lucide · Zod · Vitest

## Quick start

```bash
npm install
cp .env.example .env.local   # optional; see below
npm run dev                  # http://localhost:3000
```

With no environment variables the site runs on a small **sample dataset** (`fallbackProjects` in `src/config/projects.ts`), and every page shows a "Sample data" notice. Set `GITHUB_USERNAME` to switch to live data; no token is needed for public repositories.

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server |
| `npm test` | Unit and component tests (no network, no credentials) |
| `npm run typecheck` | Generates route types, then runs `tsc --noEmit` |
| `npm run lint` | ESLint |

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `GITHUB_USERNAME` | For live data | Account whose **public** repositories are listed |
| `GITHUB_TOKEN` | No | Raises the GitHub rate limit (60 → 5,000/h). A fine-grained token with no extra permissions is enough. If it is rejected, the sync retries without it |
| `VERCEL_TOKEN` | For Vercel data | Read access to your Vercel projects (deployments, domains) |
| `VERCEL_TEAM_ID` | No | Only for team-owned Vercel projects |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical URL for metadata, Open Graph, and the sitemap. Falls back to Vercel's production domain |
| `REVALIDATE_SECRET` | No | Enables the protected refresh endpoint (min. 16 characters) |

All secrets are read only in server modules (`import "server-only"`). None are prefixed with `NEXT_PUBLIC_`, and none are included in HTML, client bundles, API responses, or error messages. A build with fake tokens was scanned to confirm they appear nowhere in `.next` output, served pages, or server logs.

## Curating the portfolio

Everything is in **`src/config/projects.ts`**. The sync never writes to this file.

```ts
export const projectOverrides: ProjectOverride[] = [
  {
    repositoryName: "islebound", // or repositoryId: 123456 (survives renames)
    title: "Islebound",
    description: "A cozy 3D island-building game.",
    category: "Game",
    channelIcon: "island",       // island | kart | chess | car | cherry | scan | game | code
    banner: "island",            // board | race | road | music | darts | network | island | arcade | app (inferred if omitted)
    coverImage: "/covers/islebound.png", // file in /public, or an https URL
    technologies: ["TypeScript", "React", "Three.js"],
    highlights: ["Procedural terrain with…"],
    featured: true,              // appears on the main menu
    order: 1,                    // lower comes first
    vercelProjectId: "prj_…",    // force a Vercel association
    productionUrl: "https://…",  // force a launch URL
    visible: false,              // hide completely
  },
];
```

> The four overrides that ship with the repo (`islebound`, `kart-racing`, `checkmate`, `carspotter`) use **guessed repository names**. Rename them to your real repository names. Until they match, they are skipped and reported in the server log, and no channel is created for them.

**Precedence:** manual override → GitHub metadata → safe defaults.

**Visibility rules** (`discoveryRules`):

- Private repositories are never shown.
- `visible: false` or `hiddenRepositories` always hides a repository, even a featured one.
- Forks and archived repositories are excluded unless `includeForks` / `includeArchived` is set, **or** the repository is featured or explicitly `visible: true`.
- `autoDiscover: false` limits the site to repositories that have an override.
- `recentLimit` (default 12) sizes the GitHub "recent" view. `menuFeaturedLimit` (default 6) caps project channels on the menu. With nothing featured, the most recently updated projects fill the menu.

The menu order is in `src/config/menu.ts`. All personal information lives in **`src/config/profile.ts`**, taken from `cv.jpg`: name, title, location, introduction, experience, study projects, education, skills, languages, interests, email, and links. The About, Contact, and LinkedIn channels and the site metadata all read from it. The phone number, age, and driving licence on the CV are intentionally not published. The LinkedIn channel only appears when a `linkedin` link is configured there.

## How synchronization works

```
GitHub REST ─┐                                        ┌─ / (menu)
             ├─ validate (zod) ─ match ─ overrides ─ visibility ─ sort ─┤─ /projects, /github
Vercel REST ─┘    src/lib/github.ts, vercel.ts        └─ /projects/[slug], /api/projects
                      src/lib/project-normalizer.ts  (pure, unit-tested)
```

1. **GitHub**: `GET /users/{user}/repos?type=owner` with full `Link`-header pagination. Each entry is validated; malformed or private entries are dropped. Per-repository language data is only fetched for curated repositories (12 at most per sync).
2. **Vercel**: `GET /v10/projects` (paginated, `teamId` optional). Each project's Git link, production domains, and production/latest deployments are extracted.
3. **Matching** GitHub → Vercel, in priority order:
   1. `vercelProjectId` from the override. If it is set but not found, nothing is guessed.
   2. Vercel projects whose Git link points at the repository (by repo ID, else owner/name).
   3. An exact name match, only for Vercel projects with no Git link.

   If several projects tie at one level, the repository is left **unmatched** and a log message asks for an explicit `vercelProjectId`. A Vercel project claimed by an override is never auto-matched to another repository.
4. **Production URL**: only deployments with `target: "production"` and `readyState: "READY"` count. Previews, building, queued, failed, and canceled deployments are never offered. The link is a production **domain** (custom domain first, apex before `www`, else the shortest `*.vercel.app`), never a per-deployment or branch URL. If a newer production build is in progress, the last ready one is still used. Fallbacks: the override's `productionUrl`, then the repository's GitHub "website" field. With none of these, there is no Launch button and the status reads "In development".
5. **Slugs** come from the override or repository name, are deduplicated deterministically, and IDs are `gh-<repositoryId>`, so they are stable across renames of display titles.

### Caching (≈30 minutes)

- Every provider request goes through the Next.js **data cache** (`revalidate: 1800`). On Vercel this cache is durable and shared across all function instances, and only `200` responses are stored, so an error never replaces good data.
- `getPortfolio()` (`src/lib/portfolio.ts`) is a `"use cache"` function with the `portfolio` cache profile (`next.config.ts`: revalidate 30 min, expire 7 days). Pages and `/api/projects` are prerendered and regenerated in the background (ISR), so navigation never triggers provider calls.
- **Failure policy:** if a provider fails *transiently* (timeout, 5xx, rate limit) during a background regeneration, the regeneration throws on purpose, so Next.js keeps serving the last good version and retries later. Permanent problems (bad credentials, unknown user) degrade gracefully instead: the site falls back to GitHub-only data, or to the labeled sample data if GitHub itself is unavailable at build time.
- **Manual refresh:** `curl -X POST -H "Authorization: Bearer $REVALIDATE_SECRET" https://your-site/api/revalidate` marks the data stale (stale-while-revalidate), so the next visit refreshes it. The endpoint returns 404 unless the secret is configured.

### API

`GET /api/projects` returns `{ projects, source, lastSyncedAt }`. `source` is `"live"` or `"fallback"`. Projects contain only public portfolio fields; provider responses, tokens, and internal sync issues are never included.

## Verifying the integrations

1. `GITHUB_USERNAME=<you> npm run build` lists each discovered project route and logs `[portfolio]` lines for anything unmatched (unknown override names, ambiguous Vercel matches, rejected tokens).
2. `npm start`, then open `/api/projects`: `source` should be `"live"`, and Vercel-deployed projects should have `productionUrl` and `lastDeploymentAt`.
3. The GitHub integration was verified against the public `octocat` account. **The Vercel integration is covered by unit tests with mocked API responses, but has not been run against a real Vercel account**, because no Vercel token was available during development. Run step 2 with your `VERCEL_TOKEN` to confirm it.

## Deploying to Vercel

1. Import the repository into Vercel (framework preset: Next.js, no extra build settings).
2. Add the environment variables above (Production, plus Preview if wanted).
3. Deploy. Project pages are prerendered at build time. New repositories get a page on their first visit and appear on the menu within ~30 minutes.

## Project structure

```
src/
├── app/                  routes: menu, projects/[slug], github, about, contact, api/*, metadata
├── components/
│   ├── wii-menu/         WiiMenu (pages, keyboard nav, zooms), ChannelPreview (Menu/Start), WiiChannel, WiiBottomBar, WiiClock
│   ├── channel/          ChannelScreen: the inside of a channel (title band, console bar, fades, Esc)
│   ├── home-menu/        HomeMenu overlay with the settings
│   ├── project/          ProjectDetails, ProjectPreview, ProjectActions
│   ├── about/            MiiStage: the waving 3D character (three.js, loaded only on About)
│   └── ui/               ChannelArt (banners + animated scenes), MotionGate, MiiAvatar (2D fallback), Switch, ChannelIcon, ConsoleBar, …
├── config/               projects.ts (overrides + rules), menu.ts, profile.ts, site.ts, audio.ts (optional audio files)
├── lib/                  github.ts, vercel.ts, project-normalizer.ts, project-sync.ts, portfolio.ts,
│                         site-probe.ts (embeddability + site visuals), live-preview.ts,
│                         audio/ (engine, synthesized effects, music), screen-transition.ts, preferences.ts, …
└── types/                project.ts (normalized), providers.ts, config.ts
```

## The console experience

| Moment | What happens |
| --- | --- |
| Menu | 4×3 pages of channels that fill the screen, with recessed empty slots. Blue arrows at the screen edges turn pages (with more than 12 channels). Mobile shows a scrolling two-column grid instead. |
| Pointing | The channel frame lights up with a pulsing light-blue outline and a soft tick. Mouse users get a hand pointer (can be switched off). |
| Banners | Every channel has an animated scene that fills its banner. Projects get one matching what they are (see "Banner themes"). The built-in channels have their own: **Projects** is a fanned stack of miniature channel tiles, **GitHub** a contribution graph and commit graph, **About Me** the waving Mii (pre-rendered from the 3D model) in his plaza, **LinkedIn** a profile card in a pulsing network, and **Contact** an envelope and a paper plane. No icons, logos, or status badges are drawn on banners; a small title plate keeps each one labeled. A tile is the center crop of the full banner. |
| Select | The tile's banner zooms up to fill the screen (the rest of the menu zooms along), then **Menu** and **Start** rise in. |
| Menu (from preview) | Zooms back down into the tile. |
| Start | For a project with an HTTPS deployment, the deployed app opens in a new tab (`noopener,noreferrer`) and the portfolio stays where it is. For everything else (projects without a deployment and the built-in channels), chime, fade to white, and the channel opens. A deployed project's details page is still reachable from the Projects channel. |
| Inside a channel | Title band with the channel emblem, content panels, and the same curved bar: HOME Menu on the left, back to the menu on the right, the channel's actions (View source, Launch project) in the middle. Escape also returns. |
| Back to the menu | Fade to white, then the menu zooms out from the channel you left, with focus back on it. |
| HOME Menu | Screen dims, a dark bar drops from the top and another rises from the bottom. Big buttons: Menu / Reset. Settings: speaker volume (4 bars), music, sound effects, reduced motion, hand pointer. |

These screens are original renditions of the console's interface patterns. No Nintendo artwork, logos, fonts, or audio are included, and the site is not affiliated with Nintendo.

### Banner themes

| Theme | Scene | Example |
| --- | --- | --- |
| `board` | Board in perspective, a knight hopping, a best-move arrow, an evaluation bar | chess analysis |
| `race` | Top-down circuit with kerbs, a checkered line, two karts lapping | racing games |
| `road` | Road rushing to the horizon, light streaks, a camera viewfinder that "takes a photo" | car quiz |
| `music` | Fretboard with six vibrating strings and a tuner needle settling in tune | guitar tuner |
| `darts` | Slowly turning dartboard, a dart flying in and sticking, three throws per turn | darts scorer |
| `network` | Neural network with pulses travelling along its links | AI, agents |
| `island` | Island, sea, drifting clouds, a swaying palm | 3D / sandbox games |
| `arcade` | Scrolling pixel hills, bobbing coins, twinkling stars | other games |
| `app` | Calm geometric motion in the project's color (one of three patterns, picked from the title) | other web apps |

The theme comes from, in order: the override's `banner`, its `channelIcon`, GitHub topics, keywords (English and French) in the repository name, description, or production hostname, then **the production site's own title and description**, and finally the category (games → arcade, everything else → app). Add a topic, a description, or an override to steer it.

During each sync the server requests every production URL once (cached like the other provider calls) to read that title and description, its `theme-color` (used as the banner accent when readable), and its `og:image` (shown on the project's own page, never on menu banners).

All scene animations are CSS transform/opacity loops on composited layers, plus an SVG motion path for the karts. They all stop under reduced motion; the karts switch to a still version through `MotionGate`.

### Clock

The clock uses **DSEG7 Classic** (© keshikan, SIL Open Font License 1.1), bundled locally in `src/app/fonts` with its license, over faint "88:88" unlit segments.

### Audio

All audio is **original and synthesized in the browser** (Web Audio), so the repository ships no audio files:

- **Music:** a relaxed, swung electric-piano loop on the menu and a calmer pad-and-arpeggio loop inside channels. Both are original compositions, not transcriptions of any console music. Music crossfades between screens and pauses while the tab is hidden.
- **Effects:** pointing tick, button tick, select whoosh + chime, zoom-out, Start chime, back, HOME Menu open/close, page turn, toggle.
- **Autoplay:** nothing is created or played before the visitor's first click or key press. Volume, music, and effects can each be changed in the HOME Menu, and the settings persist locally.

**Using your own recordings:** put files you own or have licensed in `public/audio/` and map them in `src/config/audio.ts`, e.g. `select: "/audio/select.ogg"` or `"music:menu": "/audio/menu-loop.ogg"` (music should loop seamlessly). Files load lazily after the first interaction, and the synthesized version plays until a file is ready or if it fails. Do not add Nintendo's audio; it is copyrighted.

### About Me character

The About channel shows a 3D character who waves when the channel opens, every few seconds after, and when pointed at or tapped.

- **Model:** `character-male-e` from Kenney's *Mini Characters 1*, licensed **CC0** (public domain). The license is bundled at `public/models/mii/LICENSE-Kenney.txt`. Mii fan models were not used: they derive from Nintendo's designs, so their licensing is unclear.
- **Animation:** the model ships with an `idle` clip and a 7-joint rig, but no wave. The idle clip plays on the body, and the wave rotates the real `arm-right` bone (raise, three swings, lower). The rig has no elbow or wrist, so the whole raised arm swings, much like a Mii's.
- **Rendering:** three.js is imported dynamically, so it only loads on this channel (model and texture ≈ 250 KB). It renders only while visible on screen and the tab is visible, with the pixel ratio capped at 2 and no shadow maps (a soft blob shadow instead). Everything, including the WebGL context, is disposed when the channel closes.
- **Fallback:** without WebGL, or if the model fails to load, the illustrated 2D Mii is shown. Under reduced motion the character holds a still, raised hand.

## Accessibility and motion

- Real links for every channel (middle-click and new tab skip the preview and open the channel directly). Arrow keys move between channels across pages, Home/End jump to the ends, Enter opens the preview, Escape closes it or leaves a channel.
- The preview and HOME Menu are modal: focus moves into them and stays there until they close. Focus returns to the opened channel when you come back.
- Status is always shown as text and icon, never color alone.
- `prefers-reduced-motion` (or "Reduced motion" in the HOME Menu) turns the zooms and fades into instant changes and stops the ambient banner motion. The site works fully without animation.
- The hand pointer only applies to mouse-like pointers and can be turned off.
- Interface chrome (the menu, channel tiles, bars, headers, the preview, and the HOME Menu) can't be text-selected with the mouse, like a console. Channel content (descriptions, bio, contact details) stays selectable and copyable, and clicking, dragging, touch, and keyboard navigation are unaffected.

## Known limitations

- The very first request for an unknown `/projects/<slug>` returns the not-found page with HTTP 200 and `noindex` (Partial Prerendering streams from the route shell). Later requests get a cached HTTP 404.
- Channel art without a `coverImage` is generated from an icon and tint. Add cover images in `/public` for richer channels.
