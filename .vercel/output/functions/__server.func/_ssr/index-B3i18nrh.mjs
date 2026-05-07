import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { g as getHistory, N as NeonButton, e as extractVideoId, r as removeHistory } from "./NeonButton-CMvBjjog.mjs";
import { d as RotateCw, g as Sparkles, h as ArrowRight, P as Play, H as History, T as Trash2 } from "../_libs/lucide-react.mjs";
import { m as motion } from "../_libs/framer-motion.mjs";
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
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
function Home() {
  const navigate = useNavigate();
  const [url, setUrl] = reactExports.useState("");
  const [error, setError] = reactExports.useState(null);
  const [history, setHistory] = reactExports.useState([]);
  reactExports.useEffect(() => {
    setHistory(getHistory());
  }, []);
  const submit = (e) => {
    e?.preventDefault();
    const id = extractVideoId(url);
    if (!id) {
      setError("That doesn't look like a valid YouTube URL.");
      return;
    }
    navigate({
      to: "/player",
      search: {
        v: id
      }
    });
  };
  const removeFromHistory = (videoId) => {
    removeHistory(videoId);
    setHistory(getHistory());
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "relative min-h-screen overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pointer-events-none absolute inset-0 -z-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1/3 right-0 h-[400px] w-[400px] rounded-full bg-accent/20 blur-[140px]" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mx-auto flex max-w-7xl items-center justify-between px-6 py-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-[0_0_20px_oklch(0.82_0.17_195/0.6)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCw, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-xl font-bold tracking-tight", children: "RotateTube" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://www.youtube.com", target: "_blank", rel: "noreferrer", className: "hidden text-sm text-muted-foreground hover:text-foreground sm:block", children: "Find a video on YouTube ↗" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mx-auto max-w-4xl px-6 pb-16 pt-12 sm:pt-20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
        opacity: 0,
        y: 20
      }, animate: {
        opacity: 1,
        y: 0
      }, transition: {
        duration: 0.6
      }, className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground backdrop-blur-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5 text-primary" }),
          "Built for students who study with YouTube"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "mt-6 font-display text-5xl font-bold leading-[1.05] sm:text-6xl md:text-7xl", children: [
          "Watch lectures",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent", children: "cinematically." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg", children: "Paste any YouTube URL. Rotate, take notes, bookmark moments, and stay focused — all in a beautiful glass player." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.form, { onSubmit: submit, initial: {
        opacity: 0,
        y: 20
      }, animate: {
        opacity: 1,
        y: 0
      }, transition: {
        duration: 0.6,
        delay: 0.15
      }, className: "mx-auto mt-10 max-w-2xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card cinematic-shadow flex flex-col gap-2 p-2 sm:flex-row sm:items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "url", value: url, onChange: (e) => {
            setUrl(e.target.value);
            setError(null);
          }, placeholder: "https://youtube.com/watch?v=…", "aria-label": "YouTube URL", className: "flex-1 bg-transparent px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/70 focus:outline-none" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(NeonButton, { type: "submit", variant: "primary", size: "md", className: "sm:w-auto", children: [
            "Watch",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" })
          ] })
        ] }),
        error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 px-2 text-sm text-destructive", children: error }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 px-2 text-center text-xs text-muted-foreground", children: "Works with youtube.com, youtu.be, /shorts/, /embed/ links" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: {
        opacity: 0
      }, animate: {
        opacity: 1
      }, transition: {
        duration: 0.6,
        delay: 0.3
      }, className: "mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4", children: [{
        icon: RotateCw,
        label: "Rotate video"
      }, {
        icon: Play,
        label: "Custom controls"
      }, {
        icon: Sparkles,
        label: "Glass UI"
      }, {
        icon: History,
        label: "Notes & bookmarks"
      }].map(({
        icon: Icon,
        label
      }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card flex flex-col items-center gap-2 p-4 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-5 w-5 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: label })
      ] }, label)) }),
      history.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.section, { initial: {
        opacity: 0,
        y: 20
      }, animate: {
        opacity: 1,
        y: 0
      }, transition: {
        duration: 0.6,
        delay: 0.45
      }, className: "mt-16", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center justify-between px-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg font-semibold", children: "Continue watching" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
            history.length,
            " saved"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", children: history.slice(0, 6).map((h) => /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { whileHover: {
          y: -3
        }, className: "glass-card group relative overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/player", search: {
            v: h.videoId,
            t: Math.floor(h.lastTime)
          }, className: "block", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-video overflow-hidden", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: h.thumbnail, alt: h.title, loading: "lazy", className: "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] backdrop-blur", children: [
                Math.floor(h.lastTime / 60),
                "m in"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "line-clamp-2 text-sm font-medium", children: h.title }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => removeFromHistory(h.videoId), "aria-label": "Remove from history", className: "absolute right-2 top-2 rounded-md bg-black/60 p-1.5 opacity-0 backdrop-blur transition-opacity hover:bg-destructive group-hover:opacity-100", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
        ] }, h.videoId)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("footer", { className: "border-t border-white/5 py-6 text-center text-xs text-muted-foreground", children: [
      "Made for focused study sessions • Press",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("kbd", { className: "rounded bg-white/10 px-1.5 py-0.5", children: "?" }),
      " in player for shortcuts"
    ] })
  ] });
}
export {
  Home as component
};
