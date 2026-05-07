import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowRight, History, Play, RotateCw, Sparkles, Trash2 } from "lucide-react";
import { extractVideoId } from "@/lib/youtube";
import { getHistory, removeHistory, type HistoryItem } from "@/lib/storage";
import { NeonButton } from "@/components/ui/NeonButton";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RotateTube — Cinematic YouTube Player for Students" },
      {
        name: "description",
        content:
          "Paste a YouTube URL and watch in a cinematic, distraction-free player with rotation, notes, and bookmarks.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const id = extractVideoId(url);
    if (!id) {
      setError("That doesn't look like a valid YouTube URL.");
      return;
    }
    navigate({ to: "/player", search: { v: id } });
  };

  const removeFromHistory = (videoId: string) => {
    removeHistory(videoId);
    setHistory(getHistory());
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute top-1/3 right-0 h-[400px] w-[400px] rounded-full bg-accent/20 blur-[140px]" />
      </div>

      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-[0_0_20px_oklch(0.82_0.17_195/0.6)]">
            <RotateCw className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">
            RotateTube
          </span>
        </Link>
        <a
          href="https://www.youtube.com"
          target="_blank"
          rel="noreferrer"
          className="hidden text-sm text-muted-foreground hover:text-foreground sm:block"
        >
          Find a video on YouTube ↗
        </a>
      </header>

      <section className="mx-auto max-w-4xl px-6 pb-16 pt-12 sm:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Built for students who study with YouTube
          </div>
          <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] sm:text-6xl md:text-7xl">
            Watch lectures{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              cinematically.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
            Paste any YouTube URL. Rotate, take notes, bookmark moments, and
            stay focused — all in a beautiful glass player.
          </p>
        </motion.div>

        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mx-auto mt-10 max-w-2xl"
        >
          <div className="glass-card cinematic-shadow flex flex-col gap-2 p-2 sm:flex-row sm:items-center">
            <input
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError(null);
              }}
              placeholder="https://youtube.com/watch?v=…"
              aria-label="YouTube URL"
              className="flex-1 bg-transparent px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
            />
            <NeonButton type="submit" variant="primary" size="md" className="sm:w-auto">
              Watch
              <ArrowRight className="h-4 w-4" />
            </NeonButton>
          </div>
          {error && (
            <p className="mt-2 px-2 text-sm text-destructive">{error}</p>
          )}
          <p className="mt-3 px-2 text-center text-xs text-muted-foreground">
            Works with youtube.com, youtu.be, /shorts/, /embed/ links
          </p>
        </motion.form>

        {/* Feature chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {[
            { icon: RotateCw, label: "Rotate video" },
            { icon: Play, label: "Custom controls" },
            { icon: Sparkles, label: "Glass UI" },
            { icon: History, label: "Notes & bookmarks" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="glass-card flex flex-col items-center gap-2 p-4 text-center"
            >
              <Icon className="h-5 w-5 text-primary" />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </motion.div>

        {/* History */}
        {history.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-16"
          >
            <div className="mb-4 flex items-center justify-between px-1">
              <h2 className="font-display text-lg font-semibold">
                Continue watching
              </h2>
              <span className="text-xs text-muted-foreground">
                {history.length} saved
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {history.slice(0, 6).map((h) => (
                <motion.div
                  key={h.videoId}
                  whileHover={{ y: -3 }}
                  className="glass-card group relative overflow-hidden"
                >
                  <Link
                    to="/player"
                    search={{ v: h.videoId, t: Math.floor(h.lastTime) }}
                    className="block"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={h.thumbnail}
                        alt={h.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] backdrop-blur">
                        {Math.floor(h.lastTime / 60)}m in
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="line-clamp-2 text-sm font-medium">
                        {h.title}
                      </p>
                    </div>
                  </Link>
                  <button
                    onClick={() => removeFromHistory(h.videoId)}
                    aria-label="Remove from history"
                    className="absolute right-2 top-2 rounded-md bg-black/60 p-1.5 opacity-0 backdrop-blur transition-opacity hover:bg-destructive group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </section>

      <footer className="border-t border-white/5 py-6 text-center text-xs text-muted-foreground">
        Made for focused study sessions • Press{" "}
        <kbd className="rounded bg-white/10 px-1.5 py-0.5">?</kbd> in player for
        shortcuts
      </footer>
    </main>
  );
}
