"use client";

import {
  BarChart3,
  FolderOpen,
  Home,
  Mic2,
  Play,
  Plus,
  Settings,
  Upload,
  Volume2,
} from "lucide-react";
import { useRef, useState } from "react";

const NAV = [
  { icon: Home, label: "Home" },
  { icon: Mic2, label: "Episodes" },
  { icon: BarChart3, label: "Analytics" },
  { icon: FolderOpen, label: "Library" },
  { icon: Settings, label: "Settings" },
];

type SidebarProps = {
  playing: boolean;
  episodeFilename: string;
  onTogglePlay: () => void;
  onUploadEpisode: (file: File) => Promise<void>;
};

export function Sidebar({
  playing,
  episodeFilename,
  onTogglePlay,
  onUploadEpisode,
}: SidebarProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await onUploadEpisode(file);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <aside className="flex w-80 shrink-0 flex-col border-r border-zinc-200 bg-[#fafafa]">
      <div className="flex flex-col gap-1 p-4 pt-8">
        <button
          type="button"
          className="flex h-11 items-center justify-center gap-2 rounded-md bg-zinc-900 text-sm font-medium text-white hover:bg-zinc-800"
        >
          <Plus className="h-4 w-4" />
          New episode
        </button>

        <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-3">
          <p className="mb-2 text-xs font-medium text-zinc-500">Main episode video</p>
          <p className="mb-3 truncate text-sm font-medium" title={episodeFilename}>
            {episodeFilename || "main-video.mp4"}
          </p>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-zinc-300 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50">
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading…" : "Upload / replace video"}
            <input
              ref={fileRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className="hidden"
              onChange={handleFile}
            />
          </label>
          <p className="mt-2 text-xs text-zinc-400">
            Saves to data/ and replaces the current episode. Sample ads are fixed.
          </p>
        </div>

        <nav className="mt-6 flex flex-col gap-1">
          {NAV.map(({ icon: Icon, label }) => (
            <button
              key={label}
              type="button"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-600 transition-colors hover:bg-white hover:text-zinc-900"
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mx-4 mt-auto mb-4 rounded-2xl border border-zinc-200 bg-white p-4">
        <p className="mb-2 text-xs font-medium text-zinc-500">Episode performance</p>
        <div className="flex h-16 items-end gap-1">
          {[40, 55, 35, 70, 50, 80, 45, 65].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-green-500/30"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-zinc-200 px-4 py-4">
        <button
          type="button"
          onClick={onTogglePlay}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300 hover:bg-white"
          aria-label={playing ? "Pause" : "Play"}
          title={playing ? "Pause" : "Play"}
        >
          <Play className={`h-4 w-4 ${playing ? "hidden" : ""}`} />
          {playing && (
            <span className="flex gap-0.5">
              <span className="h-3 w-1 rounded-sm bg-zinc-800" />
              <span className="h-3 w-1 rounded-sm bg-zinc-800" />
            </span>
          )}
        </button>
        <Volume2 className="h-5 w-5 text-zinc-500" />
        <input type="range" className="flex-1" min={0} max={100} defaultValue={80} />
      </div>
    </aside>
  );
}
