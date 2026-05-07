import { useCallback, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<void> | null = null;

function loadYouTubeAPI(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT && window.YT.Player) return Promise.resolve();
  if (apiPromise) return apiPromise;

  apiPromise = new Promise<void>((resolve) => {
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

export interface PlayerState {
  ready: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  playbackRate: number;
  availableSpeeds: number[];
  quality: string;
  availableQualities: string[];
}

const QUALITY_LABELS: Record<string, string> = {
  highres: '4K+',
  hd2160: '2160p',
  hd1440: '1440p',
  hd1080: '1080p',
  hd720: '720p',
  large: '480p',
  medium: '360p',
  small: '240p',
  tiny: '144p',
  auto: 'Auto',
};

export { QUALITY_LABELS };

/** Access the <video> element inside a YouTube iframe */
function getIframeVideoElement(containerId: string): HTMLVideoElement | null {
  try {
    const container = document.getElementById(containerId);
    if (!container) return null;
    const iframe = container.tagName === 'IFRAME'
      ? container as HTMLIFrameElement
      : container.querySelector('iframe');
    if (!iframe) return null;
    // This only works on same-origin iframes (it won't for YouTube)
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return null;
    return doc.querySelector('video');
  } catch {
    return null;
  }
}

export function useYouTubePlayer(
  containerId: string,
  videoId: string | null,
) {
  const playerRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const desiredRateRef = useRef<number>(1);
  const [state, setState] = useState<PlayerState>({
    ready: false,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 100,
    muted: false,
    playbackRate: 1,
    availableSpeeds: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
    quality: 'auto',
    availableQualities: [],
  });

  useEffect(() => {
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
          iv_load_policy: 3,
        },
        events: {
          onReady: (e: any) => {
            const availRates: number[] = e.target.getAvailablePlaybackRates?.() || [1];
            const availQ: string[] = e.target.getAvailableQualityLevels?.() || [];
            setState((s) => ({
              ...s,
              ready: true,
              duration: e.target.getDuration() || 0,
              volume: e.target.getVolume(),
              muted: e.target.isMuted(),
              playbackRate: e.target.getPlaybackRate(),
              availableSpeeds: availRates,
              quality: e.target.getPlaybackQuality?.() || 'auto',
              availableQualities: availQ.filter((q: string) => q !== 'auto'),
            }));
          },
          onStateChange: (e: any) => {
            const YT = window.YT;
            const playing = e.data === YT.PlayerState.PLAYING;
            const availQ: string[] = e.target.getAvailableQualityLevels?.() || [];
            setState((s) => ({
              ...s,
              isPlaying: playing,
              duration: e.target.getDuration() || s.duration,
              quality: e.target.getPlaybackQuality?.() || s.quality,
              availableQualities: availQ.length > 0 ? availQ.filter((q: string) => q !== 'auto') : s.availableQualities,
            }));
          },
          onPlaybackRateChange: (e: any) => {
            // Only update if we didn't set a custom higher rate
            if (desiredRateRef.current <= 2) {
              setState((s) => ({ ...s, playbackRate: e.data }));
            }
          },
          onPlaybackQualityChange: (e: any) => {
            setState((s) => ({ ...s, quality: e.data }));
          },
        },
      });
    });

    return () => {
      cancelled = true;
      try {
        playerRef.current?.destroy?.();
      } catch {
        // ignore
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
        quality: 'auto',
        availableQualities: [],
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, containerId]);

  // Poll currentTime
  useEffect(() => {
    if (!state.ready) return;
    const tick = () => {
      const p = playerRef.current;
      if (p?.getCurrentTime) {
        const t = p.getCurrentTime();
        setState((s) => (Math.abs(t - s.currentTime) > 0.05 ? { ...s, currentTime: t } : s));
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [state.ready]);

  const play = useCallback(() => playerRef.current?.playVideo?.(), []);
  const pause = useCallback(() => playerRef.current?.pauseVideo?.(), []);
  const togglePlay = useCallback(() => {
    if (state.isPlaying) playerRef.current?.pauseVideo?.();
    else playerRef.current?.playVideo?.();
  }, [state.isPlaying]);
  const seek = useCallback((t: number) => {
    playerRef.current?.seekTo?.(Math.max(0, t), true);
  }, []);
  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(100, v));
    playerRef.current?.setVolume?.(clamped);
    if (clamped > 0) playerRef.current?.unMute?.();
    setState((s) => ({ ...s, volume: clamped, muted: clamped === 0 }));
  }, []);
  const toggleMute = useCallback(() => {
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
  const setPlaybackRate = useCallback((r: number) => {
    desiredRateRef.current = r;
    const p = playerRef.current;
    if (!p) return;

    if (r <= 2) {
      // Standard YouTube-supported rates – use the API directly
      p.setPlaybackRate?.(r);
      setState((s) => ({ ...s, playbackRate: r }));
    } else {
      // For >2x: set YouTube API to max (2x) then override via the
      // internal <video> element's native playbackRate property.
      p.setPlaybackRate?.(2);

      // The YouTube player renders a <video> inside the iframe.
      // On same-origin embeds we can reach it; otherwise we fall
      // back to the iframe's contentWindow postMessage approach.
      // In practice, the embedded player also exposes the video
      // node as a child of the player div after the iframe replaces it.
      const trySetVideoRate = () => {
        // Try to find the video element – YouTube's IFrame API replaces
        // the container div with an iframe, but we can try same-origin access
        const videoEl = getIframeVideoElement(containerId);
        if (videoEl) {
          videoEl.playbackRate = r;
          setState((s) => ({ ...s, playbackRate: r }));
          return true;
        }
        return false;
      };

      // If direct access fails (cross-origin), just use the max API rate
      if (!trySetVideoRate()) {
        // Retry briefly in case iframe is still initializing
        setTimeout(() => {
          if (!trySetVideoRate()) {
            // Fallback: YouTube only supports up to 2x via official API
            // Update state to reflect actual rate
            setState((s) => ({ ...s, playbackRate: 2 }));
          }
        }, 200);
      }
    }
  }, [containerId]);

  const setQuality = useCallback((q: string) => {
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
    setQuality,
  };
}
