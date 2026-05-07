# 🎬 RotateTube — Cinematic YouTube Player for Students

A modern, premium web application that lets you paste any YouTube URL and watch it inside a custom cinematic player interface. Built for students and productivity — rotate videos, take timestamped notes, bookmark key moments, and control playback with keyboard shortcuts.

![RotateTube Banner](https://img.shields.io/badge/RotateTube-Cinematic%20Player-00d4ff?style=for-the-badge&logo=youtube&logoColor=white)

---

## ✨ Features

### 🎥 Custom Video Player
- Paste any YouTube URL and start watching instantly
- Automatic YouTube video ID extraction
- Embedded via YouTube Iframe API with full control

### 🎮 Player Controls
- **Play / Pause** — Click or press `Space` / `K`
- **⏪ Rewind 10s / ⏩ Forward 10s** — Dedicated buttons + `J` / `L` keys
- **Seek ±5s** — `←` / `→` arrow keys
- **Volume** — Visual slider + `↑` / `↓` keys
- **Mute / Unmute** — `M` key
- **Playback Speed** — 0.5× to 4× (0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 3.5, 4)
- **Fullscreen** — `F` key
- **Theater Mode** — `T` key for immersive wide view

### 🔄 Rotate Video
- **Rotate Left / Right by 90°** — Clearly labeled buttons with `ROTATE` badge
- Smooth spring animations via Framer Motion
- Keyboard shortcuts: `,` (left) / `.` (right)

### 📐 Vertical Video Enhancement
- Auto-detects portrait/vertical videos
- Adds professional blurred background fill
- Centers video content perfectly

### 📝 Notes Sidebar
- Per-video notes saved to localStorage
- Auto-saved as you type
- Toggle with `N` key

### 🔖 Bookmark Timestamps
- Mark any moment with `B` key or click
- Editable labels for each bookmark
- Click to jump to bookmarked time
- Sorted chronologically

### 📜 Watch History
- Automatically tracks watched videos in localStorage
- Resume from last watched position
- Clear individual entries or full history

### ⌨️ Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `Space` / `K` | Play / Pause |
| `M` | Mute / Unmute |
| `F` | Fullscreen |
| `T` | Theater mode |
| `←` / `→` | Seek ±5s |
| `J` / `L` | Seek ±10s |
| `↑` / `↓` | Volume up / down |
| `,` / `.` | Rotate left / right |
| `B` | Bookmark current moment |
| `N` | Toggle notes panel |
| `0–9` | Jump to 0%–90% |
| `?` | Show shortcut help |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework |
| **Vite 7** | Build tool & dev server |
| **TanStack Start** | Full-stack React framework (SSR) |
| **TanStack Router** | Type-safe file-based routing |
| **TailwindCSS 4** | Utility-first styling |
| **Framer Motion** | Smooth animations & transitions |
| **Cloudflare Workers** | Edge deployment (SSR) |
| **Radix UI** | Accessible component primitives |
| **Lucide React** | Beautiful icon library |
| **Zod** | Schema validation |
| **TypeScript** | Type safety |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18
- **npm** (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/KunalBishwal/cinestream-studio.git
cd cinestream-studio

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173/`

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
cinestream-studio/
├── src/
│   ├── components/
│   │   └── ui/           # Reusable UI components (NeonButton, etc.)
│   ├── hooks/            # Custom React hooks
│   │   ├── useYouTubePlayer.ts
│   │   ├── useKeyboardShortcuts.ts
│   │   └── useLocalStorage.ts
│   ├── lib/              # Utilities & helpers
│   │   ├── youtube.ts    # YouTube API helpers
│   │   ├── storage.ts    # localStorage history management
│   │   └── utils.ts      # General utilities
│   ├── routes/
│   │   ├── __root.tsx    # Root layout with meta tags
│   │   ├── index.tsx     # Home page (hero + URL input + history)
│   │   └── player.tsx    # Player page (video + controls + notes)
│   ├── router.tsx        # TanStack Router setup
│   ├── server.ts         # SSR server entry (Cloudflare Workers)
│   ├── start.ts          # TanStack Start configuration
│   └── styles.css        # Global styles & design tokens
├── vite.config.ts        # Vite + TanStack Start + Cloudflare config
├── tsconfig.json         # TypeScript configuration
├── wrangler.jsonc        # Cloudflare Workers config
└── package.json
```

---

## 🎨 Design Philosophy

- **Dark glassmorphism UI** — Frosted glass cards with subtle blur and borders
- **Neon accent highlights** — Cyan primary color with glowing effects
- **Cinematic shadows** — Deep box shadows for depth
- **Apple-inspired minimalism** — Clean, distraction-free interface
- **Micro-animations** — Spring-based hover and tap animations
- **Mobile-first responsive** — Works on desktop, tablet, and mobile

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙋 Author

**Kunal Bishwal** — [@KunalBishwal](https://github.com/KunalBishwal)
