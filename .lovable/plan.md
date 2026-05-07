
# RotateTube — Implementation Plan

A premium, dark, glassmorphism YouTube viewer focused on students watching lectures. Two routes: a hero landing with URL input, and a `/player` route with custom controls, rotation, notes, and bookmarks.

## Routes

- `/` — Hero landing with URL input, recent watch history, feature highlights.
- `/player` — Player workspace. Reads video ID from search params (`?v=ID&t=0`).

## Design system (src/styles.css)

Dark gradient background, neon cyan/violet accents, glass surfaces.
- `--background`: deep near-black with subtle blue tint
- `--foreground`: near-white
- `--primary`: neon cyan accent; `--accent`: violet
- New tokens: `--glass-bg`, `--glass-border`, `--glow-primary`, `--gradient-hero`, `--shadow-cinematic`
- Fonts: Space Grotesk (display) + Inter (body) via Google Fonts in `__root.tsx` head.
- Reusable utility classes: `.glass-card`, `.neon-glow`, `.cinematic-bg`.

## Component structure

```
src/
  routes/
    __root.tsx            (add fonts + global head)
    index.tsx             (Hero landing)
    player.tsx            (Player workspace)
  components/
    Hero.tsx
    UrlInput.tsx
    HistoryList.tsx
    player/
      VideoStage.tsx      (iframe + rotation transform + blurred bg)
      ControlsBar.tsx     (play/pause, mute/volume, speed, fullscreen, theater, rotate L/R)
      RotateControls.tsx
      SpeedMenu.tsx
      VolumeSlider.tsx
      NotesSidebar.tsx
      BookmarksList.tsx
      KeyboardHints.tsx
    ui/GlassCard.tsx
    ui/NeonButton.tsx
  hooks/
    useYouTubePlayer.ts   (loads IFrame API, exposes play/pause/seek/volume/rate/state)
    useVideoOrientation.ts(detects portrait via oEmbed-derived aspect or iframe size sampling)
    useLocalStorage.ts
    useKeyboardShortcuts.ts
  lib/
    youtube.ts            (extractVideoId for watch?v=, youtu.be, shorts, embed URLs)
    storage.ts            (typed history/notes/bookmarks helpers, namespaced keys)
```

## Feature details

**URL parsing** — `extractVideoId(url)` handles `youtube.com/watch?v=`, `youtu.be/`, `/shorts/`, `/embed/`, and bare IDs. Invalid input shows inline error toast.

**YouTube IFrame API** — `useYouTubePlayer` injects `https://www.youtube.com/iframe_api` once, creates `YT.Player` on a div, and returns imperative controls plus reactive state (isPlaying, currentTime, duration, volume, muted, playbackRate). Polls currentTime via `requestAnimationFrame` while playing.

**Custom controls** — Native YouTube chrome hidden via `controls: 0, modestbranding: 1, rel: 0`. Our `ControlsBar` renders animated glass buttons (Framer Motion `whileHover`/`whileTap`). Progress scrubber with hover preview time. Speed menu: 0.5/0.75/1/1.25/1.5/1.75/2.

**Rotate** — Local state `rotation ∈ {0,90,180,270}`. Apply `transform: rotate(Xdeg) scale(s)` on the iframe wrapper, animated via Framer Motion `animate`. For 90/270, scale = container aspect / video aspect to FILL container (per user choice); may crop edges.

**Vertical/portrait enhancement** — `useVideoOrientation` uses YouTube oEmbed (`https://www.youtube.com/oembed?url=...&format=json`) to read width/height; if height > width, render a blurred, scaled-up duplicate of the iframe behind the centered video as a backdrop fill (CSS `filter: blur(40px) brightness(0.6)`).

**Theater mode** — Toggles a class that expands video stage to viewport width and collapses sidebars.

**Fullscreen** — `requestFullscreen()` on the stage container.

**Notes sidebar** — Per-video notes stored in `localStorage` under `rotatetube:notes:{videoId}`. Auto-save (debounced). Markdown-lite (plain textarea, monospace).

**Bookmarks** — Click "Bookmark" to capture `currentTime` + optional label. Stored under `rotatetube:bookmarks:{videoId}` as `{t, label}[]`. Click jumps to time.

**Watch history** — On player open, append `{videoId, title, thumbnail, lastWatched, lastTime}` to `rotatetube:history` (max 30, dedup by videoId). Title/thumbnail from oEmbed. Shown on home as glass cards.

**Keyboard shortcuts** (`useKeyboardShortcuts`):
- Space / K — play/pause
- M — mute
- F — fullscreen
- T — theater
- ← / → — seek ±5s; J / L — ±10s
- ↑ / ↓ — volume
- , / . — rotate left/right
- B — add bookmark
- N — toggle notes
- 0–9 — seek to %

A `KeyboardHints` modal lists them (toggle with `?`).

## Animations (Framer Motion)

- Hero: staggered fade-up for headline, subhead, input.
- Route transition: `AnimatePresence` fade between landing and player.
- Buttons: scale 0.96 on tap, subtle glow on hover.
- Rotation: `animate={{ rotate, scale }}` with `transition={{ type: "spring", stiffness: 120, damping: 18 }}`.
- Sidebar: slide-in from right with spring.

## Responsive

Mobile-first. On `<md`: notes/bookmarks become bottom sheets via Drawer; controls bar wraps; hero input stacks. Stage maintains 16:9 aspect with `aspect-video`.

## Dependencies

Already present: framer-motion (verify), tailwind, shadcn. Will `bun add framer-motion` if missing. Use existing `lucide-react` for icons.

## Out of scope

- No backend, no auth, no Lovable Cloud (per your choice).
- No transcript/AI features.
- No download or screenshot capture.

## Build order

1. Design tokens + fonts + global styles.
2. `lib/youtube.ts`, `hooks/useLocalStorage.ts`, `hooks/useYouTubePlayer.ts`.
3. `/` route: Hero, UrlInput, HistoryList.
4. `/player` route shell + VideoStage with rotation + blurred portrait backdrop.
5. ControlsBar + Speed/Volume + Fullscreen/Theater.
6. NotesSidebar + BookmarksList + history write-through.
7. Keyboard shortcuts + hints modal.
8. Polish animations and responsive pass.
