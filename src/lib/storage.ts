export interface HistoryItem {
  videoId: string;
  title: string;
  thumbnail: string;
  lastWatched: number;
  lastTime: number;
}

export interface Bookmark {
  id: string;
  t: number;
  label: string;
}

const HISTORY_KEY = "rotatetube:history";

export function getHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

export function upsertHistory(item: HistoryItem) {
  const list = getHistory().filter((h) => h.videoId !== item.videoId);
  list.unshift(item);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 30)));
}

export function removeHistory(videoId: string) {
  const list = getHistory().filter((h) => h.videoId !== videoId);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}
