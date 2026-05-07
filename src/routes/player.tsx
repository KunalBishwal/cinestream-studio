import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Bookmark,
  BookmarkPlus,
  Expand,
  Gauge,
  Keyboard,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  StickyNote,
  Trash2,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { z } from "zod";
import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { fetchOEmbed, formatTime } from "@/lib/youtube";
import { upsertHistory } from "@/lib/storage";
import { NeonButton } from "@/components/ui/NeonButton";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  v: z.string().min(1),
  t: z.number().optional(),
});

export const Route = createFileRoute("/player")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Player — RotateTube" },
      {
        name: "description",
        content:
          "Cinematic YouTube player with rotation, notes, bookmarks and keyboard shortcuts.",
      },
    ],
  }),
  component: PlayerPage,
});

interface Bookmark {
  id: string;
  t: number;
  label: string;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

function PlayerPage() {
  const { v: videoId, t: startTime } = Route.useSearch();
  const navigate = useNavigate();

  const containerId = "yt-player";
  const stageRef = useRef<HTMLDivElement>(null);
  const stageInnerRef = useRef<HTMLDivElement>(null);

  const [rotation, setRotation] = useState(0);
  const [theater, setTheater] = useState(false);
  const [showSpeed, setShowSpeed] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [stageSize, setStageSize] = useState({ w: 16, h: 9 });
  const [meta, setMeta] = useState<{
    title: string;
    thumbnail: string;
    width: number;
    height: number;
  } | null>(null);

  const {
    state,
    play,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    setPlaybackRate,
  } = useYouTubePlayer(containerId, videoId);

  const [notes, setNotes] = useLocalStorage<string>(
    `rotatetube:notes:${videoId}`,
    "",
  );
  const [bookmarks, setBookmarks] = useLocalStorage<Bookmark[]>(
    `rotatetube:bookmarks:${videoId}`,
    [],
  );

  // Fetch metadata
  useEffect(() => {
    let cancelled = false;
    fetchOEmbed(videoId).then((data) => {
      if (cancelled || !data) return;
      setMeta({
        title: data.title,
        thumbnail: data.thumbnail_url,
        width: data.width,
        height: data.height,
      });
    });
    return () => {
      cancelled = true;
    };
  }, [videoId]);

  // Save to history (debounced via lastTime)
  useEffect(() => {
    if (!meta) return;
    const interval = setInterval(() => {
      upsertHistory({
        videoId,
        title: meta.title,
        thumbnail: meta.thumbnail,
        lastWatched: Date.now(),
        lastTime: state.currentTime,
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [videoId, meta, state.currentTime]);

  // Initial seek
  useEffect(() => {
    if (state.ready && startTime && startTime > 0) {
      seek(startTime);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.ready]);

  // Track stage size for rotation scaling
  useEffect(() => {
    if (!stageInnerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setStageSize({ w: r.width, h: r.height });
    });
    ro.observe(stageInnerRef.current);
    return () => ro.disconnect();
  }, []);

  const isPortraitVideo = useMemo(
    () => (meta ? meta.height > meta.width : false),
    [meta],
  );

  // Compute rotation scale to FILL container
  const rotationScale = useMemo(() => {
    if (rotation % 180 === 0) return 1;
    if (stageSize.w === 0 || stageSize.h === 0) return 1;
    // when rotated 90/270, swap dims; scale up so rotated content fills
    return Math.max(
      stageSize.w / stageSize.h,
      stageSize.h / stageSize.w,
    );
  }, [rotation, stageSize]);

  const rotateLeft = useCallback(
    () => setRotation((r) => (r - 90 + 360) % 360),
    [],
  );
  const rotateRight = useCallback(
    () => setRotation((r) => (r + 90) % 360),
    [],
  );

  const enterFullscreen = useCallback(() => {
    const el = stageRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  }, []);

  const addBookmark = useCallback(() => {
    const t = state.currentTime;
    setBookmarks((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        t,
        label: `Mark @ ${formatTime(t)}`,
      },
    ]);
  }, [state.currentTime, setBookmarks]);

  const removeBookmark = useCallback(
    (id: string) => setBookmarks((prev) => prev.filter((b) => b.id !== id)),
    [setBookmarks],
  );

  // Keyboard shortcuts
  useKeyboardShortcuts(
    useCallback(
      (e: KeyboardEvent) => {
        switch (e.key) {
          case " ":
          case "k":
          case "K":
            e.preventDefault();
            togglePlay();
            break;
          case "m":
          case "M":
            toggleMute();
            break;
          case "f":
          case "F":
            enterFullscreen();
            break;
          case "t":
          case "T":
            setTheater((v) => !v);
            break;
          case "ArrowLeft":
            seek(state.currentTime - 5);
            break;
          case "ArrowRight":
            seek(state.currentTime + 5);
            break;
          case "j":
          case "J":
            seek(state.currentTime - 10);
            break;
          case "l":
          case "L":
            seek(state.currentTime + 10);
            break;
          case "ArrowUp":
            e.preventDefault();
            setVolume(state.volume + 5);
            break;
          case "ArrowDown":
            e.preventDefault();
            setVolume(state.volume - 5);
            break;
          case ",":
            rotateLeft();
            break;
          case ".":
            rotateRight();
            break;
          case "b":
          case "B":
            addBookmark();
            break;
          case "n":
          case "N":
            setShowNotes((v) => !v);
            break;
          case "?":
            setShowHints((v) => !v);
            break;
          default:
            if (/^[0-9]$/.test(e.key) && state.duration) {
              seek((parseInt(e.key, 10) / 10) * state.duration);
            }
        }
      },
      [
        togglePlay,
        toggleMute,
        enterFullscreen,
        seek,
        setVolume,
        rotateLeft,
        rotateRight,
        addBookmark,
        state.currentTime,
        state.duration,
        state.volume,
      ],
    ),
  );

  const progressPct =
    state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Header */}
      <header className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="line-clamp-1 flex-1 text-center font-display text-sm font-semibold sm:text-base">
          {meta?.title ?? "Loading…"}
        </h1>
        <div className="flex items-center gap-2">
          <NeonButton size="icon" onClick={() => setShowHints(true)} aria-label="Keyboard shortcuts">
            <Keyboard className="h-4 w-4" />
          </NeonButton>
        </div>
      </header>

      <div
        className={cn(
          "mx-auto grid gap-6 px-4 pb-10 sm:px-6",
          theater
            ? "max-w-[1800px] grid-cols-1"
            : "max-w-[1600px] grid-cols-1 lg:grid-cols-[1fr_340px]",
        )}
      >
        {/* Stage column */}
        <div className="space-y-4">
          <div
            ref={stageRef}
            className="glass-card cinematic-shadow group relative overflow-hidden bg-black"
          >
            <div
              ref={stageInnerRef}
              className="relative aspect-video w-full"
            >
              {/* Blurred backdrop for portrait videos */}
              {isPortraitVideo && meta && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -z-0"
                  style={{
                    backgroundImage: `url(${meta.thumbnail.replace("hqdefault", "maxresdefault")})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: "blur(40px) brightness(0.5) saturate(1.4)",
                    transform: "scale(1.2)",
                  }}
                />
              )}

              {/* Video wrapper with rotation */}
              <motion.div
                animate={{ rotate: rotation, scale: rotationScale }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div
                  className={cn(
                    "relative",
                    isPortraitVideo
                      ? "h-full aspect-[9/16]"
                      : "h-full w-full",
                  )}
                >
                  <div id={containerId} className="h-full w-full" />
                  {/* Overlay to capture clicks (since native controls are off) */}
                  <button
                    aria-label={state.isPlaying ? "Pause" : "Play"}
                    onClick={togglePlay}
                    onDoubleClick={enterFullscreen}
                    className="absolute inset-0 cursor-pointer"
                  />
                </div>
              </motion.div>

              {/* Center play button when paused */}
              <AnimatePresence>
                {!state.isPlaying && state.ready && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={play}
                    aria-label="Play"
                    className="pointer-events-auto absolute left-1/2 top-1/2 z-10 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-primary/90 text-primary-foreground shadow-[0_0_40px_oklch(0.82_0.17_195/0.7)] backdrop-blur"
                  >
                    <Play className="h-8 w-8 translate-x-0.5 fill-current" />
                  </motion.button>
                )}
              </AnimatePresence>

              {!state.ready && (
                <div className="absolute inset-0 grid place-items-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-primary" />
                </div>
              )}
            </div>

            {/* Progress + controls bar */}
            <div className="relative z-10 border-t border-white/5 bg-black/40 px-3 py-3 backdrop-blur-md sm:px-4">
              {/* Progress */}
              <div className="mb-3 flex items-center gap-3">
                <span className="w-12 text-right text-[11px] tabular-nums text-muted-foreground">
                  {formatTime(state.currentTime)}
                </span>
                <input
                  type="range"
                  min={0}
                  max={state.duration || 100}
                  step={0.1}
                  value={state.currentTime}
                  onChange={(e) => seek(parseFloat(e.target.value))}
                  aria-label="Seek"
                  className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-white/10 accent-primary"
                  style={{
                    background: `linear-gradient(to right, oklch(0.82 0.17 195) 0%, oklch(0.82 0.17 195) ${progressPct}%, oklch(1 0 0 / 0.1) ${progressPct}%, oklch(1 0 0 / 0.1) 100%)`,
                  }}
                />
                <span className="w-12 text-[11px] tabular-nums text-muted-foreground">
                  {formatTime(state.duration)}
                </span>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <NeonButton size="icon" onClick={togglePlay} aria-label={state.isPlaying ? "Pause" : "Play"}>
                  {state.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </NeonButton>

                <div className="flex items-center gap-2">
                  <NeonButton size="icon" onClick={toggleMute} aria-label={state.muted ? "Unmute" : "Mute"}>
                    {state.muted || state.volume === 0 ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </NeonButton>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={state.muted ? 0 : state.volume}
                    onChange={(e) => setVolume(parseInt(e.target.value, 10))}
                    aria-label="Volume"
                    className="hidden h-1 w-24 cursor-pointer appearance-none rounded-full bg-white/10 accent-primary sm:block"
                  />
                </div>

                <div className="relative">
                  <NeonButton
                    size="sm"
                    onClick={() => setShowSpeed((v) => !v)}
                    active={state.playbackRate !== 1}
                  >
                    <Gauge className="h-3.5 w-3.5" />
                    {state.playbackRate}×
                  </NeonButton>
                  <AnimatePresence>
                    {showSpeed && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="glass-card absolute bottom-full left-0 z-20 mb-2 flex flex-col gap-0.5 p-1"
                      >
                        {SPEEDS.map((s) => (
                          <button
                            key={s}
                            onClick={() => {
                              setPlaybackRate(s);
                              setShowSpeed(false);
                            }}
                            className={cn(
                              "rounded-md px-3 py-1.5 text-left text-xs transition-colors hover:bg-white/10",
                              s === state.playbackRate && "text-primary",
                            )}
                          >
                            {s}×
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="ml-auto flex items-center gap-2">
                  <NeonButton size="icon" onClick={rotateLeft} aria-label="Rotate left">
                    <RotateCcw className="h-4 w-4" />
                  </NeonButton>
                  <NeonButton size="icon" onClick={rotateRight} aria-label="Rotate right">
                    <RotateCw className="h-4 w-4" />
                  </NeonButton>
                  <NeonButton size="icon" onClick={addBookmark} aria-label="Add bookmark">
                    <BookmarkPlus className="h-4 w-4" />
                  </NeonButton>
                  <NeonButton
                    size="icon"
                    onClick={() => setShowNotes((v) => !v)}
                    active={showNotes}
                    aria-label="Notes"
                  >
                    <StickyNote className="h-4 w-4" />
                  </NeonButton>
                  <NeonButton
                    size="icon"
                    onClick={() => setTheater((v) => !v)}
                    active={theater}
                    aria-label="Theater mode"
                    className="hidden md:inline-flex"
                  >
                    <Expand className="h-4 w-4" />
                  </NeonButton>
                  <NeonButton size="icon" onClick={enterFullscreen} aria-label="Fullscreen">
                    <Maximize2 className="h-4 w-4" />
                  </NeonButton>
                </div>
              </div>
            </div>
          </div>

          {/* Bookmarks bar */}
          <div className="glass-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-primary" />
                <h2 className="font-display text-sm font-semibold">
                  Bookmarks
                </h2>
                <span className="text-xs text-muted-foreground">
                  ({bookmarks.length})
                </span>
              </div>
              <NeonButton size="sm" onClick={addBookmark}>
                <BookmarkPlus className="h-3.5 w-3.5" />
                Mark moment
              </NeonButton>
            </div>
            {bookmarks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Press <kbd className="rounded bg-white/10 px-1.5">B</kbd> to
                bookmark the current moment.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {bookmarks
                  .slice()
                  .sort((a, b) => a.t - b.t)
                  .map((b) => (
                    <div
                      key={b.id}
                      className="group inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs"
                    >
                      <button
                        onClick={() => seek(b.t)}
                        className="font-mono tabular-nums text-primary hover:underline"
                      >
                        {formatTime(b.t)}
                      </button>
                      <span className="text-muted-foreground">·</span>
                      <input
                        defaultValue={b.label}
                        onBlur={(e) =>
                          setBookmarks((prev) =>
                            prev.map((x) =>
                              x.id === b.id ? { ...x, label: e.target.value } : x,
                            ),
                          )
                        }
                        className="w-32 bg-transparent focus:outline-none"
                      />
                      <button
                        onClick={() => removeBookmark(b.id)}
                        aria-label="Remove bookmark"
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Notes sidebar */}
        <AnimatePresence initial={false}>
          {(!theater || showNotes) && (
            <motion.aside
              key="notes"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={cn(
                "glass-card flex flex-col p-4",
                theater &&
                  "fixed right-4 top-20 bottom-4 z-30 w-[340px] max-w-[90vw]",
              )}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StickyNote className="h-4 w-4 text-primary" />
                  <h2 className="font-display text-sm font-semibold">Notes</h2>
                </div>
                {notes && (
                  <button
                    onClick={() => setNotes("")}
                    className="text-xs text-muted-foreground hover:text-destructive"
                    aria-label="Clear notes"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Type your lecture notes here… auto-saved per video."
                className="scrollbar-thin min-h-[400px] flex-1 resize-none rounded-lg bg-black/30 p-3 font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
              <p className="mt-2 text-[10px] text-muted-foreground">
                Saved locally to your browser.
              </p>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Keyboard shortcuts modal */}
      <AnimatePresence>
        {showHints && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur"
            onClick={() => setShowHints(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card w-full max-w-md p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold">
                  Keyboard shortcuts
                </h3>
                <button
                  onClick={() => setShowHints(false)}
                  className="rounded-md p-1 hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <ul className="space-y-2 text-sm">
                {[
                  ["Space / K", "Play / pause"],
                  ["M", "Mute"],
                  ["F", "Fullscreen"],
                  ["T", "Theater mode"],
                  ["← / →", "Seek ±5s"],
                  ["J / L", "Seek ±10s"],
                  ["↑ / ↓", "Volume"],
                  [", / .", "Rotate left / right"],
                  ["B", "Add bookmark"],
                  ["N", "Toggle notes"],
                  ["0–9", "Seek to %"],
                  ["?", "Show shortcuts"],
                ].map(([k, label]) => (
                  <li
                    key={k}
                    className="flex items-center justify-between gap-4 rounded-md px-2 py-1.5 hover:bg-white/5"
                  >
                    <span className="text-muted-foreground">{label}</span>
                    <kbd className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-xs">
                      {k}
                    </kbd>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
