import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { f as fetchOEmbed, u as upsertHistory, a as formatTime, N as NeonButton, c as cn } from "./NeonButton-CMvBjjog.mjs";
import { R as Route$1 } from "./router-HMYgPWaY.mjs";
import { A as ArrowLeft, K as Keyboard, P as Play, S as SkipBack, a as Pause, b as SkipForward, V as VolumeX, c as Volume2, G as Gauge, C as Check, d as Settings, R as RotateCcw, e as RotateCw, B as BookmarkPlus, f as StickyNote, E as Expand, M as Maximize2, g as Bookmark, X, T as Trash2 } from "../_libs/lucide-react.mjs";
import { m as motion, A as AnimatePresence } from "../_libs/framer-motion.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/zod.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
let apiPromise = null;
function loadYouTubeAPI() {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT && window.YT.Player) return Promise.resolve();
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve) => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
  });
  return apiPromise;
}
const QUALITY_LABELS = {
  highres: "4K+",
  hd2160: "2160p",
  hd1440: "1440p",
  hd1080: "1080p",
  hd720: "720p",
  large: "480p",
  medium: "360p",
  small: "240p",
  tiny: "144p",
  auto: "Auto"
};
function getIframeVideoElement(containerId) {
  try {
    const container = document.getElementById(containerId);
    if (!container) return null;
    const iframe = container.tagName === "IFRAME" ? container : container.querySelector("iframe");
    if (!iframe) return null;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return null;
    return doc.querySelector("video");
  } catch {
    return null;
  }
}
function useYouTubePlayer(containerId, videoId) {
  const playerRef = reactExports.useRef(null);
  const rafRef = reactExports.useRef(null);
  const desiredRateRef = reactExports.useRef(1);
  const [state, setState] = reactExports.useState({
    ready: false,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 100,
    muted: false,
    playbackRate: 1,
    availableSpeeds: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
    quality: "auto",
    availableQualities: []
  });
  reactExports.useEffect(() => {
    if (!videoId) return;
    let cancelled = false;
    loadYouTubeAPI().then(() => {
      if (cancelled) return;
      const el = document.getElementById(containerId);
      if (!el) return;
      playerRef.current = new window.YT.Player(containerId, {
        videoId,
        playerVars: {
          controls: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          disablekb: 1,
          iv_load_policy: 3
        },
        events: {
          onReady: (e) => {
            const availRates = e.target.getAvailablePlaybackRates?.() || [1];
            const availQ = e.target.getAvailableQualityLevels?.() || [];
            setState((s) => ({
              ...s,
              ready: true,
              duration: e.target.getDuration() || 0,
              volume: e.target.getVolume(),
              muted: e.target.isMuted(),
              playbackRate: e.target.getPlaybackRate(),
              availableSpeeds: availRates,
              quality: e.target.getPlaybackQuality?.() || "auto",
              availableQualities: availQ.filter((q) => q !== "auto")
            }));
          },
          onStateChange: (e) => {
            const YT = window.YT;
            const playing = e.data === YT.PlayerState.PLAYING;
            const availQ = e.target.getAvailableQualityLevels?.() || [];
            setState((s) => ({
              ...s,
              isPlaying: playing,
              duration: e.target.getDuration() || s.duration,
              quality: e.target.getPlaybackQuality?.() || s.quality,
              availableQualities: availQ.length > 0 ? availQ.filter((q) => q !== "auto") : s.availableQualities
            }));
          },
          onPlaybackRateChange: (e) => {
            if (desiredRateRef.current <= 2) {
              setState((s) => ({ ...s, playbackRate: e.data }));
            }
          },
          onPlaybackQualityChange: (e) => {
            setState((s) => ({ ...s, quality: e.data }));
          }
        }
      });
    });
    return () => {
      cancelled = true;
      try {
        playerRef.current?.destroy?.();
      } catch {
      }
      playerRef.current = null;
      desiredRateRef.current = 1;
      setState({
        ready: false,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: 100,
        muted: false,
        playbackRate: 1,
        availableSpeeds: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
        quality: "auto",
        availableQualities: []
      });
    };
  }, [videoId, containerId]);
  reactExports.useEffect(() => {
    if (!state.ready) return;
    const tick = () => {
      const p = playerRef.current;
      if (p?.getCurrentTime) {
        const t = p.getCurrentTime();
        setState((s) => Math.abs(t - s.currentTime) > 0.05 ? { ...s, currentTime: t } : s);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [state.ready]);
  const play = reactExports.useCallback(() => playerRef.current?.playVideo?.(), []);
  const pause = reactExports.useCallback(() => playerRef.current?.pauseVideo?.(), []);
  const togglePlay = reactExports.useCallback(() => {
    if (state.isPlaying) playerRef.current?.pauseVideo?.();
    else playerRef.current?.playVideo?.();
  }, [state.isPlaying]);
  const seek = reactExports.useCallback((t) => {
    playerRef.current?.seekTo?.(Math.max(0, t), true);
  }, []);
  const setVolume = reactExports.useCallback((v) => {
    const clamped = Math.max(0, Math.min(100, v));
    playerRef.current?.setVolume?.(clamped);
    if (clamped > 0) playerRef.current?.unMute?.();
    setState((s) => ({ ...s, volume: clamped, muted: clamped === 0 }));
  }, []);
  const toggleMute = reactExports.useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    if (p.isMuted()) {
      p.unMute();
      setState((s) => ({ ...s, muted: false }));
    } else {
      p.mute();
      setState((s) => ({ ...s, muted: true }));
    }
  }, []);
  const setPlaybackRate = reactExports.useCallback((r) => {
    desiredRateRef.current = r;
    const p = playerRef.current;
    if (!p) return;
    if (r <= 2) {
      p.setPlaybackRate?.(r);
      setState((s) => ({ ...s, playbackRate: r }));
    } else {
      p.setPlaybackRate?.(2);
      const trySetVideoRate = () => {
        const videoEl = getIframeVideoElement(containerId);
        if (videoEl) {
          videoEl.playbackRate = r;
          setState((s) => ({ ...s, playbackRate: r }));
          return true;
        }
        return false;
      };
      if (!trySetVideoRate()) {
        setTimeout(() => {
          if (!trySetVideoRate()) {
            setState((s) => ({ ...s, playbackRate: 2 }));
          }
        }, 200);
      }
    }
  }, [containerId]);
  const setQuality = reactExports.useCallback((q) => {
    const p = playerRef.current;
    if (!p) return;
    p.setPlaybackQuality?.(q);
    setState((s) => ({ ...s, quality: q }));
  }, []);
  return {
    state,
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    setPlaybackRate,
    setQuality
  };
}
function useKeyboardShortcuts(handler, enabled = true) {
  reactExports.useEffect(() => {
    if (!enabled) return;
    const onKey = (e) => {
      const target = e.target;
      if (target) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable) {
          return;
        }
      }
      handler(e);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handler, enabled]);
}
function useLocalStorage(key, initial) {
  const [value, setValue] = reactExports.useState(() => {
    if (typeof window === "undefined") return initial;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  reactExports.useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
    }
  }, [key, value]);
  const reset = reactExports.useCallback(() => setValue(initial), [initial]);
  return [value, setValue, reset];
}
const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 3.5, 4];
function PlayerPage() {
  const {
    v: videoId,
    t: startTime
  } = Route$1.useSearch();
  const containerId = "yt-player";
  const stageRef = reactExports.useRef(null);
  const stageInnerRef = reactExports.useRef(null);
  const speedRef = reactExports.useRef(null);
  const qualityRef = reactExports.useRef(null);
  const [rotation, setRotation] = reactExports.useState(0);
  const [theater, setTheater] = reactExports.useState(false);
  const [showSpeed, setShowSpeed] = reactExports.useState(false);
  const [showQuality, setShowQuality] = reactExports.useState(false);
  const [showNotes, setShowNotes] = reactExports.useState(false);
  const [showBookmarks, setShowBookmarks] = reactExports.useState(false);
  const [showHints, setShowHints] = reactExports.useState(false);
  const [stageSize, setStageSize] = reactExports.useState({
    w: 16,
    h: 9
  });
  const [meta, setMeta] = reactExports.useState(null);
  const {
    state,
    play,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    setPlaybackRate,
    setQuality
  } = useYouTubePlayer(containerId, videoId);
  const [notes, setNotes] = useLocalStorage(`rotatetube:notes:${videoId}`, "");
  const [bookmarks, setBookmarks] = useLocalStorage(`rotatetube:bookmarks:${videoId}`, []);
  reactExports.useEffect(() => {
    let cancelled = false;
    fetchOEmbed(videoId).then((data) => {
      if (cancelled || !data) return;
      setMeta({
        title: data.title,
        thumbnail: data.thumbnail_url,
        width: data.width,
        height: data.height
      });
    });
    return () => {
      cancelled = true;
    };
  }, [videoId]);
  reactExports.useEffect(() => {
    if (!meta) return;
    const interval = setInterval(() => {
      upsertHistory({
        videoId,
        title: meta.title,
        thumbnail: meta.thumbnail,
        lastWatched: Date.now(),
        lastTime: state.currentTime
      });
    }, 5e3);
    return () => clearInterval(interval);
  }, [videoId, meta, state.currentTime]);
  reactExports.useEffect(() => {
    if (state.ready && startTime && startTime > 0) {
      seek(startTime);
    }
  }, [state.ready]);
  reactExports.useEffect(() => {
    if (!stageInnerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setStageSize({
        w: r.width,
        h: r.height
      });
    });
    ro.observe(stageInnerRef.current);
    return () => ro.disconnect();
  }, []);
  const isPortraitVideo = reactExports.useMemo(() => meta ? meta.height > meta.width : false, [meta]);
  const rotationScale = reactExports.useMemo(() => {
    if (rotation % 180 === 0) return 1;
    if (stageSize.w === 0 || stageSize.h === 0) return 1;
    return Math.max(stageSize.w / stageSize.h, stageSize.h / stageSize.w);
  }, [rotation, stageSize]);
  const rotateLeft = reactExports.useCallback(() => setRotation((r) => (r - 90 + 360) % 360), []);
  const rotateRight = reactExports.useCallback(() => setRotation((r) => (r + 90) % 360), []);
  const enterFullscreen = reactExports.useCallback(() => {
    const el = stageRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  }, []);
  const addBookmark = reactExports.useCallback(() => {
    const t = state.currentTime;
    setBookmarks((prev) => [...prev, {
      id: `${Date.now()}`,
      t,
      label: `Mark @ ${formatTime(t)}`
    }]);
  }, [state.currentTime, setBookmarks]);
  const removeBookmark = reactExports.useCallback((id) => setBookmarks((prev) => prev.filter((b) => b.id !== id)), [setBookmarks]);
  reactExports.useEffect(() => {
    const handleMouseDown = (e) => {
      if (speedRef.current && !speedRef.current.contains(e.target)) {
        setShowSpeed(false);
      }
      if (qualityRef.current && !qualityRef.current.contains(e.target)) {
        setShowQuality(false);
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);
  useKeyboardShortcuts(reactExports.useCallback((e) => {
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
          seek(parseInt(e.key, 10) / 10 * state.duration);
        }
    }
  }, [togglePlay, toggleMute, enterFullscreen, seek, setVolume, rotateLeft, rotateRight, addBookmark, state.currentTime, state.duration, state.volume]));
  const progressPct = state.duration > 0 ? state.currentTime / state.duration * 100 : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "relative min-h-screen overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
        "Back"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "line-clamp-1 flex-1 text-center font-display text-sm font-semibold sm:text-base", children: meta?.title ?? "Loading…" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { size: "icon", onClick: () => setShowHints(true), "aria-label": "Keyboard shortcuts", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Keyboard, { className: "h-4 w-4" }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("mx-auto grid gap-6 px-4 pb-10 sm:px-6", theater ? "max-w-[1800px] grid-cols-1" : "max-w-[1600px] grid-cols-1 lg:grid-cols-[1fr_340px]"), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: stageRef, className: "glass-card cinematic-shadow group relative overflow-hidden bg-black", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: stageInnerRef, className: "relative aspect-video w-full", children: [
            isPortraitVideo && meta && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, className: "pointer-events-none absolute inset-0 -z-0", style: {
              backgroundImage: `url(${meta.thumbnail.replace("hqdefault", "maxresdefault")})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(40px) brightness(0.5) saturate(1.4)",
              transform: "scale(1.2)"
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { animate: {
              rotate: rotation,
              scale: rotationScale
            }, transition: {
              type: "spring",
              stiffness: 120,
              damping: 20
            }, className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("relative", isPortraitVideo ? "h-full aspect-[9/16]" : "h-full w-full"), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { id: containerId, className: "h-full w-full" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { "aria-label": state.isPlaying ? "Pause" : "Play", onClick: togglePlay, onDoubleClick: enterFullscreen, className: "absolute inset-0 cursor-pointer" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: !state.isPlaying && state.ready && /* @__PURE__ */ jsxRuntimeExports.jsx(motion.button, { initial: {
              opacity: 0,
              scale: 0.8
            }, animate: {
              opacity: 1,
              scale: 1
            }, exit: {
              opacity: 0,
              scale: 0.8
            }, onClick: play, "aria-label": "Play", className: "pointer-events-auto absolute left-1/2 top-1/2 z-10 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-primary/90 text-primary-foreground shadow-[0_0_40px_oklch(0.82_0.17_195/0.7)] backdrop-blur", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-8 w-8 translate-x-0.5 fill-current" }) }) }),
            !state.ready && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-primary" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 border-t border-white/5 bg-black/40 px-3 py-3 backdrop-blur-md sm:px-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-12 text-right text-[11px] tabular-nums text-muted-foreground", children: formatTime(state.currentTime) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "range", min: 0, max: state.duration || 100, step: 0.1, value: state.currentTime, onChange: (e) => seek(parseFloat(e.target.value)), "aria-label": "Seek", className: "h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-white/10 accent-primary", style: {
                background: `linear-gradient(to right, oklch(0.82 0.17 195) 0%, oklch(0.82 0.17 195) ${progressPct}%, oklch(1 0 0 / 0.1) ${progressPct}%, oklch(1 0 0 / 0.1) 100%)`
              } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-12 text-[11px] tabular-nums text-muted-foreground", children: formatTime(state.duration) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { size: "icon", onClick: () => seek(state.currentTime - 10), "aria-label": "Rewind 10 seconds", title: "Rewind 10s", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SkipBack, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -bottom-1 -right-1 text-[7px] font-bold leading-none", children: "10" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { size: "icon", onClick: togglePlay, "aria-label": state.isPlaying ? "Pause" : "Play", children: state.isPlaying ? /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { size: "icon", onClick: () => seek(state.currentTime + 10), "aria-label": "Forward 10 seconds", title: "Forward 10s", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SkipForward, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -bottom-1 -right-1 text-[7px] font-bold leading-none", children: "10" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { size: "icon", onClick: toggleMute, "aria-label": state.muted ? "Unmute" : "Mute", children: state.muted || state.volume === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(VolumeX, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Volume2, { className: "h-4 w-4" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "range", min: 0, max: 100, value: state.muted ? 0 : state.volume, onChange: (e) => setVolume(parseInt(e.target.value, 10)), "aria-label": "Volume", className: "hidden h-1 w-24 cursor-pointer appearance-none rounded-full bg-white/10 accent-primary sm:block" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", ref: speedRef, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(NeonButton, { size: "sm", onClick: () => {
                  setShowSpeed((v) => !v);
                  setShowQuality(false);
                }, active: state.playbackRate !== 1, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Gauge, { className: "h-3.5 w-3.5" }),
                  state.playbackRate,
                  "×"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showSpeed && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
                  opacity: 0,
                  y: 8,
                  scale: 0.95
                }, animate: {
                  opacity: 1,
                  y: 0,
                  scale: 1
                }, exit: {
                  opacity: 0,
                  y: 8,
                  scale: 0.95
                }, transition: {
                  duration: 0.15
                }, className: "absolute bottom-full left-0 z-30 mb-2 min-w-[140px] overflow-hidden rounded-xl border border-white/15 bg-[#1a1a2e]/95 p-1 shadow-2xl backdrop-blur-xl", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/40", children: "Playback Speed" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-[280px] overflow-y-auto scrollbar-thin", children: SPEEDS.map((s) => {
                    const isActive = s === state.playbackRate;
                    const isHighSpeed = s > 2;
                    return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
                      setPlaybackRate(s);
                      setShowSpeed(false);
                    }, className: cn("flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition-all", isActive ? "bg-primary/20 text-primary" : "text-white/80 hover:bg-white/10 hover:text-white"), children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
                        s === 1 ? "Normal" : `${s}×`,
                        isHighSpeed && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded bg-amber-500/20 px-1 py-0.5 text-[9px] font-bold text-amber-400", children: "β" })
                      ] }),
                      isActive && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5 text-primary" })
                    ] }, s);
                  }) })
                ] }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", ref: qualityRef, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(NeonButton, { size: "sm", onClick: () => {
                  setShowQuality((v) => !v);
                  setShowSpeed(false);
                }, active: state.quality !== "auto" && state.quality !== "", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-3.5 w-3.5" }),
                  QUALITY_LABELS[state.quality] || state.quality || "Auto"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showQuality && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
                  opacity: 0,
                  y: 8,
                  scale: 0.95
                }, animate: {
                  opacity: 1,
                  y: 0,
                  scale: 1
                }, exit: {
                  opacity: 0,
                  y: 8,
                  scale: 0.95
                }, transition: {
                  duration: 0.15
                }, className: "absolute bottom-full left-0 z-30 mb-2 min-w-[140px] overflow-hidden rounded-xl border border-white/15 bg-[#1a1a2e]/95 p-1 shadow-2xl backdrop-blur-xl", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/40", children: "Video Quality" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
                    setQuality("auto");
                    setShowQuality(false);
                  }, className: cn("flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition-all", state.quality === "auto" || state.quality === "" ? "bg-primary/20 text-primary" : "text-white/80 hover:bg-white/10 hover:text-white"), children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Auto" }),
                    (state.quality === "auto" || state.quality === "") && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5 text-primary" })
                  ] }),
                  state.availableQualities.length > 0 ? state.availableQualities.map((q) => {
                    const isActive = q === state.quality;
                    return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
                      setQuality(q);
                      setShowQuality(false);
                    }, className: cn("flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition-all", isActive ? "bg-primary/20 text-primary" : "text-white/80 hover:bg-white/10 hover:text-white"), children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: QUALITY_LABELS[q] || q }),
                      isActive && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5 text-primary" })
                    ] }, q);
                  }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-2 text-[11px] text-white/40", children: "Start playing to see options" })
                ] }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-auto flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-0.5 rounded-lg bg-white/5 border border-white/10 p-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline-block pl-2 pr-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase", children: "Rotate" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(NeonButton, { size: "sm", onClick: rotateLeft, "aria-label": "Rotate left 90°", title: "Rotate left 90°", className: "h-7 px-2 bg-transparent border-0 hover:bg-white/10", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-3.5 w-3.5 mr-1" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px]", children: "90°" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(NeonButton, { size: "sm", onClick: rotateRight, "aria-label": "Rotate right 90°", title: "Rotate right 90°", className: "h-7 px-2 bg-transparent border-0 hover:bg-white/10", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px]", children: "90°" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCw, { className: "h-3.5 w-3.5 ml-1" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden sm:block h-4 w-px bg-white/10 mx-1" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { size: "icon", onClick: addBookmark, "aria-label": "Add bookmark", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BookmarkPlus, { className: "h-4 w-4" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { size: "icon", onClick: () => setShowNotes((v) => !v), active: showNotes, "aria-label": "Notes", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StickyNote, { className: "h-4 w-4" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { size: "icon", onClick: () => setTheater((v) => !v), active: theater, "aria-label": "Theater mode", className: "hidden md:inline-flex", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Expand, { className: "h-4 w-4" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { size: "icon", onClick: enterFullscreen, "aria-label": "Fullscreen", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Maximize2, { className: "h-4 w-4" }) })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Bookmark, { className: "h-4 w-4 text-primary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-sm font-semibold", children: "Bookmarks" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                "(",
                bookmarks.length,
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(NeonButton, { size: "sm", onClick: addBookmark, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(BookmarkPlus, { className: "h-3.5 w-3.5" }),
              "Mark moment"
            ] })
          ] }),
          bookmarks.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
            "Press ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("kbd", { className: "rounded bg-white/10 px-1.5", children: "B" }),
            " to bookmark the current moment."
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: bookmarks.slice().sort((a, b) => a.t - b.t).map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => seek(b.t), className: "font-mono tabular-nums text-primary hover:underline", children: formatTime(b.t) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "·" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { defaultValue: b.label, onBlur: (e) => setBookmarks((prev) => prev.map((x) => x.id === b.id ? {
              ...x,
              label: e.target.value
            } : x)), className: "w-32 bg-transparent focus:outline-none" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => removeBookmark(b.id), "aria-label": "Remove bookmark", className: "opacity-0 transition-opacity group-hover:opacity-100", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3 text-muted-foreground hover:text-destructive" }) })
          ] }, b.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { initial: false, children: (!theater || showNotes) && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.aside, { initial: {
        opacity: 0,
        x: 20
      }, animate: {
        opacity: 1,
        x: 0
      }, exit: {
        opacity: 0,
        x: 20
      }, className: cn("glass-card flex flex-col p-4", theater && "fixed right-4 top-20 bottom-4 z-30 w-[340px] max-w-[90vw]"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(StickyNote, { className: "h-4 w-4 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-sm font-semibold", children: "Notes" })
          ] }),
          notes && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setNotes(""), className: "text-xs text-muted-foreground hover:text-destructive", "aria-label": "Clear notes", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: notes, onChange: (e) => setNotes(e.target.value), placeholder: "Type your lecture notes here… auto-saved per video.", className: "scrollbar-thin min-h-[400px] flex-1 resize-none rounded-lg bg-black/30 p-3 font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/40" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-[10px] text-muted-foreground", children: "Saved locally to your browser." })
      ] }, "notes") })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showHints && /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: {
      opacity: 0
    }, animate: {
      opacity: 1
    }, exit: {
      opacity: 0
    }, className: "fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur", onClick: () => setShowHints(false), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
      scale: 0.95,
      opacity: 0
    }, animate: {
      scale: 1,
      opacity: 1
    }, exit: {
      scale: 0.95,
      opacity: 0
    }, onClick: (e) => e.stopPropagation(), className: "glass-card w-full max-w-md p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-semibold", children: "Keyboard shortcuts" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowHints(false), className: "rounded-md p-1 hover:bg-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2 text-sm", children: [["Space / K", "Play / pause"], ["M", "Mute"], ["F", "Fullscreen"], ["T", "Theater mode"], ["← / →", "Seek ±5s"], ["J / L", "Seek ±10s"], ["↑ / ↓", "Volume"], [", / .", "Rotate left / right"], ["B", "Add bookmark"], ["N", "Toggle notes"], ["0–9", "Seek to %"], ["?", "Show shortcuts"]].map(([k, label]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between gap-4 rounded-md px-2 py-1.5 hover:bg-white/5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("kbd", { className: "rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-xs", children: k })
      ] }, k)) })
    ] }) }) })
  ] });
}
export {
  PlayerPage as component
};
