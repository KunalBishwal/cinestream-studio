export function extractVideoId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // Bare 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(
      trimmed.startsWith("http") ? trimmed : `https://${trimmed}`,
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
        /^\/(embed|shorts|live|v)\/([a-zA-Z0-9_-]{11})/,
      );
      if (m) return m[2];
    }
  } catch {
    // ignore
  }
  return null;
}

export interface OEmbedData {
  title: string;
  author_name: string;
  thumbnail_url: string;
  width: number;
  height: number;
}

export async function fetchOEmbed(videoId: string): Promise<OEmbedData | null> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
    );
    if (!res.ok) return null;
    return (await res.json()) as OEmbedData;
  } catch {
    return null;
  }
}

export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0)
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
