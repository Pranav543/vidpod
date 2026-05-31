# Vidpod — Dynamic Ads Editor

Mark ad placements on a podcast video, choose static / auto / A/B modes, and preview playback with ads inserted at each marker.

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Video files

Default episode and sample ads live in the **`data/`** folder (served via `/api/media/...`):

```
data/
  main-video.mp4      # default episode
  sample-ad-1.mp4
  sample-ad-2.mp4
  sample-ad-3.mp4
  sample-ad-4.mp4
```

- **Upload episode** — sidebar → “Upload video” (saved to `data/`, selected automatically)
- **Select episode** — dropdown lists all `.mp4` files in `data/` (excluding `sample-ad-*`)
- **Upload ad** — Ad library modal → “Upload ad”

Metadata for the four sample ads is in [`data/ads.json`](data/ads.json). Durations are probed in the browser after load.

## Ad modes (demo scenarios)

| Mode | Behavior |
|------|----------|
| **Static** | Always plays the first selected ad (e.g. `ad-1`) |
| **Auto** | Random ad from selected pool on each play-through |
| **A/B** | Rotates through all selected ads in order |

## Features

- SQLite persistence for markers (`data/vidpod.db`)
- Draggable timeline markers, zoom, undo/redo
- Player scrubber, skip ±10s, spacebar play/pause
- Episode + ad playback with timeline including ad duration

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/markers` | List markers |
| POST | `/api/markers` | Create marker |
| PUT | `/api/markers/[id]` | Update marker |
| DELETE | `/api/markers/[id]` | Delete marker |
| GET | `/api/episode` | Current episode + available files |
| POST | `/api/episode` | Select filename (JSON) or upload (multipart) |
| GET | `/api/ads` | List ads |
| POST | `/api/ads` | Upload ad (multipart) |
| GET | `/api/media/[filename]` | Stream video from `data/` |

## Tests

```bash
# Unit tests (playback, media paths)
npm test

# API smoke test (dev server must be running)
node scripts/test-api.mjs
# or: BASE_URL=http://localhost:3001 node scripts/test-api.mjs
```

## Stack

Next.js 15, React 19, Tailwind CSS 4, better-sqlite3, @dnd-kit/core, vitest.
