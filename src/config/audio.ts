/**
 * Optional audio files. Every cue and music track has a built-in synthesized version, so this
 * map can stay empty. To use recorded audio instead, put files you own or have licensed in
 * /public/audio and map them here, e.g.
 *
 *   select: "/audio/select.ogg",
 *   "music:menu": "/audio/menu-loop.ogg",
 *
 * Music files should loop seamlessly. Files are fetched lazily after the first interaction;
 * until a file has loaded (or if it fails to load), the synthesized version plays.
 * Do not add Nintendo's own audio: it is copyrighted.
 */
export type SoundCue =
  | "hover"
  | "buttonHover"
  | "select"
  | "zoomOut"
  | "start"
  | "back"
  | "homeOpen"
  | "homeClose"
  | "page"
  | "toggle";

export type MusicTrack = "menu" | "channel";

export const audioFiles: Partial<Record<SoundCue | `music:${MusicTrack}`, string>> = {};
