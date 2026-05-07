import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { c as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { m as motion } from "../_libs/framer-motion.mjs";
function extractVideoId(input) {
  if (!input) return null;
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  try {
    const url = new URL(
      trimmed.startsWith("http") ? trimmed : `https://${trimmed}`
    );
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = url.pathname.slice(1).split("/")[0];
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }
    if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      if (url.pathname === "/watch") {
        const v = url.searchParams.get("v");
        return v && /^[a-zA-Z0-9_-]{11}$/.test(v) ? v : null;
      }
      const m = url.pathname.match(
        /^\/(embed|shorts|live|v)\/([a-zA-Z0-9_-]{11})/
      );
      if (m) return m[2];
    }
  } catch {
  }
  return null;
}
async function fetchOEmbed(videoId) {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
function formatTime(seconds) {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0)
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
const HISTORY_KEY = "rotatetube:history";
function getHistory() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}
function upsertHistory(item) {
  const list = getHistory().filter((h) => h.videoId !== item.videoId);
  list.unshift(item);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 30)));
}
function removeHistory(videoId) {
  const list = getHistory().filter((h) => h.videoId !== videoId);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
}
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
function NeonButton({
  children,
  variant = "ghost",
  size = "md",
  active,
  className,
  ...props
}) {
  const base = "relative inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none select-none";
  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    icon: "h-10 w-10"
  };
  const variants = {
    primary: "bg-primary text-primary-foreground hover:brightness-110 shadow-[0_0_24px_oklch(0.82_0.17_195/0.45)]",
    accent: "bg-accent text-accent-foreground hover:brightness-110 shadow-[0_0_24px_oklch(0.7_0.2_305/0.5)]",
    ghost: "bg-white/5 text-foreground border border-white/10 hover:bg-white/10 backdrop-blur-md"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.button,
    {
      whileHover: { y: -1 },
      whileTap: { scale: 0.96 },
      transition: { type: "spring", stiffness: 400, damping: 22 },
      className: cn(
        base,
        sizes[size],
        variants[variant],
        active && "ring-2 ring-primary/70",
        className
      ),
      ...props,
      children
    }
  );
}
export {
  NeonButton as N,
  formatTime as a,
  cn as c,
  extractVideoId as e,
  fetchOEmbed as f,
  getHistory as g,
  removeHistory as r,
  upsertHistory as u
};
