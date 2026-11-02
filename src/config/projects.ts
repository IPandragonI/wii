import type { DiscoveryRules, FallbackProject, ProjectOverride } from "@/types/config";

/**
 * Manual curation. Overrides always win over GitHub and Vercel data, and the sync never
 * writes to this file.
 *
 * An override only applies when its repository is actually found on GitHub. If the
 * repository is missing or renamed, the override is skipped and reported, and no channel
 * is created for it. Prefer `repositoryId` (stable across renames) once you know it:
 * `curl https://api.github.com/repos/<user>/<repo> | grep '"id"'`.
 *
 * Deployment links. Each repository below is pinned by its GitHub `repositoryId` and, when it
 * is deployed on Vercel, by its `vercelProjectId` (`prj_...`). Both are stable identifiers
 * (checked against the GitHub and Vercel APIs); names can change, IDs cannot. The production
 * URL itself is then read from Vercel at sync time, so it follows domain changes. A project
 * with no `vercelProjectId` and no `productionUrl` has no deployment and opens its detail page.
 * To pin a URL by hand (no Vercel lookup at all), set `productionUrl`.
 */
export const projectOverrides: ProjectOverride[] = [
  {
    repositoryId: 1426707666,
    repositoryName: "Checkout",
    vercelProjectId: "prj_KsXuERfThA0r8Mnu6bsXw2Ws5Omq",
    title: "Checkout",
    channelIcon: "dart",
    featured: true,
    order: 1,
    technologies: ["TypeScript", "Zustand", "Supabase", "PWA", "Vitest"],
    details: [
      "A mobile-first PWA that replaces the calculator during 501 / 301 darts games, so scoring a visit takes one to four taps. Keys fire on pointer-down for zero tap latency, and a live checkout helper shows the best finish for the darts you have left.",
      "Game state is never stored: it is replayed from the configuration, the players and the ordered visits by a pure engine. Local and online games share the same engine and screen, with local visits kept in a persisted Zustand store and online ones in Supabase.",
    ].join("\n\n"),
    highlights: [
      "Dart-by-dart keypad and a quick-total mode that rejects impossible totals",
      "Checkout helper brute-forced over every 1–3 dart route for finishes up to 170, with bogey numbers flagged",
      "Online rooms with 4-character codes, one phone per player, synced with Supabase Realtime; a unique (room, match, seq) key prevents double-scoring a turn",
      "Pass-and-play for 1–8 players offline, plus per-player stats (3-dart average, checkout %, 180s)",
      "French and English, typed so a missing translation fails the build; installable with an offline service worker",
    ],
  },
  {
    repositoryId: 1433429338,
    repositoryName: "Karting",
    vercelProjectId: "prj_h8OkCbF9nDNrtyBcDFkA9rUfx2uj",
    title: "Karting",
    channelIcon: "kart",
    featured: true,
    order: 2,
    technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS", "daisyUI", "three.js"],
    details: [
      "A small browser karting game with arcade drift physics, time trials with sector splits, a live delta and a best-lap ghost. It includes a grid track editor with elevation and bridges, and nine built-in circuits (Monaco, Spa, Monza and Suzuka among them). It was inspired by mrdoob's Starter-Kit-Racing.",
      "Everything runs in the browser with no backend: records, ghosts, settings and the last circuit are kept in localStorage. Touch screens get on-screen pedals and gamepads are supported.",
    ].join("\n\n"),
    highlights: [
      "Endless time trial with checkpoints that prevent shortcuts and three timed sectors per lap, coloured like F1 timing",
      "Best-lap ghost replayed in sync with the lap clock, and a live delta computed from position along the circuit",
      "Track editor with elevation and bridges; records are keyed to the circuit layout",
      "Garage of vehicles with a turntable preview, three camera modes, remappable keys",
    ],
  },
  {
    repositoryId: 1431569754,
    repositoryName: "Outpost",
    vercelProjectId: "prj_Fgp0iNIrVaHhz6l24l80RBfcVsX9",
    title: "Outpost",
    channelIcon: "outpost",
    featured: true,
    order: 3,
    technologies: ["Next.js", "TypeScript", "Stockfish", "WebAssembly", "Web Workers", "IndexedDB", "Playwright"],
    details: [
      "A client-side chess analysis workstation: import games, analyze them with Stockfish running in your browser, review classified moves, explore opening theory and train a repertoire. There is no backend, no account and no telemetry, and games and analyses stay on the device.",
      "Stockfish 19 (lite NNUE, WebAssembly) runs in a Web Worker, multi-threaded when the page is cross-origin isolated. The app works offline once its files are cached.",
    ].join("\n\n"),
    highlights: [
      "Whole-game analysis with per-move classifications (brilliant to blunder), engine-grounded explanations and an evaluation graph",
      "PGN import with variations, comments and clocks kept, plus recent games from a Chess.com account (opt-in)",
      "Theory lessons and opening explorer; every exercise and endgame verdict is checked against Stockfish by the tests",
      "Games stored in IndexedDB; French by default with English available",
    ],
  },
  {
    repositoryId: 1428104371,
    repositoryName: "Cherry",
    vercelProjectId: "prj_SRFvwhawiga0wnh9Cx0gamuN8Aw1",
    title: "Cherry",
    channelIcon: "cherry",
    featured: true,
    order: 4,
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "daisyUI", "Zustand", "Serwist", "Vitest", "Playwright"],
    details: [
      "A mobile-first guitar tuner PWA with a chord library, a chord finder and a metronome. Everything runs in the browser with no backend or account, and preferences live in localStorage.",
      "Pitch detection runs in an AudioWorklet using the McLeod Pitch Method plus phase-vocoder partials, so it follows a turning peg in real time. The interface is available in French and English.",
    ].join("\n\n"),
    highlights: [
      "19 tuning presets for guitar, bass and ukulele, custom tunings, and adjustable reference pitch (A4)",
      "Needle or strobe display, reference tones and a sustained drone",
      "204 chords (724 voicings) with SVG diagrams, and a finder that names the chord from a 12-fret board",
      "Metronome with clicks scheduled on the audio clock from a worker timer, so it keeps time in a background tab",
      "Tested with synthetic pitch signals and a fake desktop microphone in Playwright",
    ],
  },
  {
    repositoryId: 1432125260,
    repositoryName: "Calandre",
    vercelProjectId: "prj_CAwVIMA4IJNrlMecZfIYKzXbSCf6",
    title: "Calandre",
    channelIcon: "calandre",
    featured: true,
    order: 5,
    technologies: ["TypeScript", "PWA", "Vitest", "Playwright"],
    details: [
      "A car-guessing game: one photo, one text box, name the make and model (and the generation, for purists). French by default with English available, installable as a PWA, with no backend or account; preferences, statistics and the garage live in localStorage.",
      "The interface is deliberately understated: ivory and ink with a single bordeaux accent, flat surfaces and short fades, with the photo always given the most room. The swan emblem is redrawn as vectors and reused for the logo, favicon and PWA icons.",
    ].join("\n\n"),
    highlights: [
      "Seven modes: classic, daily challenge (same five cars for everyone each day), endless, time attack, generations, zoom and themed challenges",
      "Forgiving answer checking: near misses give a hint without costing an attempt",
      "A garage of every car identified, with a shareable page and Wikipedia description for each",
      "Achievements, a daily streak and an emoji-grid share",
    ],
  },
  {
    // Not deployed on Vercel: no vercelProjectId, so it opens its detail page.
    repositoryId: 1409005892,
    repositoryName: "Autonomous_Vehicles",
    title: "Autonomous Vehicles",
    channelIcon: "autonomous",
    featured: true,
    order: 6,
    technologies: ["Java", "JavaFX", "Maven", "Neural networks", "Genetic algorithm"],
    details: [
      "A population of cars, each driven by its own neural network with no ML library, learns to drive around 2D tracks by evolution. It was built for the course \"TP — une voiture qui apprend à conduire\" (steps 0 to 38), and a final report with experiments A–F and a champion analysis is in the repository.",
      "A JavaFX interface shows the evolution live and lets you inspect any car's network, and a keyboard test bench lets you drive yourself. 24 real circuits are built in from TU Munich's open racetrack database, and other tracks can be imported.",
    ].join("\n\n"),
    highlights: [
      "Neural network and genetic algorithm written by hand in Java",
      "260 tests, plus a batch experiment runner (100 evolutions, generalization and champion analysis)",
      "Car dashboard with gears, tyre compound and wear; sensor rays and a Brain tab to inspect the network",
      "24 real circuits (TUM racetrack-database, LGPL-3.0) and importable custom tracks",
    ],
  },
];

export const discoveryRules: DiscoveryRules = {
  includeForks: false,
  includeArchived: false,
  autoDiscover: true,
  hiddenRepositories: [],
  recentLimit: 12,
  menuFeaturedLimit: 6,
};

/**
 * Shown only when GitHub cannot be reached and nothing is cached, or when GITHUB_USERNAME is
 * not configured (local development). The UI labels these entries as sample data and shows
 * no stars, dates, or links for them.
 */
export const fallbackProjects: FallbackProject[] = [
  {
    key: "karting",
    name: "Karting",
    slug: "karting",
    description: "A small browser karting game with drifting, time trials, and a track editor.",
    category: "Game",
    technologies: [],
    channelIcon: "kart",
    order: 1,
  },
  {
    key: "cherry",
    name: "Cherry",
    slug: "cherry",
    description: "A guitar tuner, chord library, and chord finder.",
    category: "Web app",
    technologies: [],
    channelIcon: "cherry",
    order: 2,
  },
  {
    key: "outpost",
    name: "Outpost",
    slug: "outpost",
    description:
      "Private chess game analysis in the browser: Stockfish evaluations, move classification, opening theory, and variation exploration. Works offline.",
    category: "Web app",
    technologies: [],
    channelIcon: "chess",
    order: 3,
  },
  {
    key: "calandre",
    name: "Calandre",
    slug: "calandre",
    description: "A car quiz: one photo, one car. Find the make and model, from the 2CV to the Bugatti.",
    category: "Game",
    technologies: [],
    channelIcon: "car",
    order: 4,
  },
  {
    key: "checkout",
    name: "Checkout",
    slug: "checkout",
    description: "A fast 501/301 darts scorer with checkout help and multi-device rooms.",
    category: "Web app",
    technologies: [],
    banner: "darts",
    order: 5,
  },
];
