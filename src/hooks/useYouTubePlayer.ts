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
}

export function useYouTubePlayer(
  containerId: string,
  videoId: string | null,
) {
  const playerRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const [state, setState] = useState<PlayerState>({
    ready: false,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 100,
    muted: false,
    playbackRate: 1,
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
            setState((s) => ({
              ...s,
              ready: true,
              duration: e.target.getDuration() || 0,
              volume: e.target.getVolume(),
              muted: e.target.isMuted(),
              playbackRate: e.target.getPlaybackRate(),
            }));
          },
          onStateChange: (e: any) => {
            const YT = window.YT;
            const playing = e.data === YT.PlayerState.PLAYING;
            setState((s) => ({
              ...s,
              isPlaying: playing,
              duration: e.target.getDuration() || s.duration,
            }));
          },
          onPlaybackRateChange: (e: any) => {
            setState((s) => ({ ...s, playbackRate: e.data }));
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
      setState({
        ready: false,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: 100,
        muted: false,
        playbackRate: 1,
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
    playerRef.current?.setPlaybackRate?.(r);
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
  };
}
