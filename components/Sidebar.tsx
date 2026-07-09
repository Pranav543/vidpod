"use client";

import {
  IconChevronDown,
  IconCircleHelp,
  IconLightbulb,
  IconNavAds,
  IconNavAnalytics,
  IconNavChannels,
  IconNavDashboard,
  IconNavImport,
  IconNavSettings,
  IconUsers,
} from "./icons";
import { useRef, useState } from "react";

const NAV = [
  { icon: IconNavDashboard, label: "Dashboard" },
  { icon: IconNavAnalytics, label: "Analytics", active: true },
  { icon: IconNavAds, label: "Ads" },
  { icon: IconNavChannels, label: "Channels" },
  { icon: IconNavImport, label: "Import" },
  { icon: IconNavSettings, label: "Settings" },
];

type SidebarProps = {
  episodeFilename: string | null;
  podcastVideos: { filename: string; name: string }[];
  episodeLoading: boolean;
  onUploadEpisode: (file: File) => Promise<void>;
  onSelectEpisode: (filename: string) => Promise<void>;
};

export function Sidebar({
  episodeFilename,
  podcastVideos,
  episodeLoading,
  onUploadEpisode,
  onSelectEpisode,
}: SidebarProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

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
    <aside className="flex h-screen w-[248px] shrink-0 flex-col overflow-y-auto border-r border-[#e5e7eb] bg-[#f8f8f8]">
      <div className="px-4 pt-5">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex h-[38px] w-full items-center justify-center rounded-lg bg-black text-[13px] font-medium text-white transition hover:bg-[#1a1a1a]"
        >
          Create an episode
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          className="hidden"
          onChange={handleFile}
        />

        <div className="relative mt-2.5">
          <div className="flex h-[38px] items-center gap-2.5 rounded-lg border border-[#e5e7eb] bg-white px-2.5">
            <div className="h-[22px] w-[22px] shrink-0 overflow-hidden rounded-[3px] bg-[#1a1a1a]">
              <div
                className="h-full w-full bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 44 44'%3E%3Crect width='44' height='44' fill='%231a1a1a'/%3E%3Crect x='0' y='28' width='44' height='16' fill='%23c2410c'/%3E%3Ctext x='22' y='38' font-size='7' font-family='system-ui,sans-serif' font-weight='700' fill='white' text-anchor='middle'%3EDOAC%3C/text%3E%3Ccircle cx='22' cy='16' r='10' fill='%23d4a574'/%3E%3C/svg%3E\")",
                }}
              />
            </div>
            <select
              className="min-w-0 flex-1 appearance-none truncate bg-transparent pr-4 text-[13px] font-medium text-[#374151] outline-none"
              value={episodeFilename ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                if (v) void onSelectEpisode(v);
              }}
            >
              <option value="" disabled>
                {episodeLoading || uploading ? "Loading…" : "The Diary Of A CEO"}
              </option>
              {podcastVideos.map((v) => (
                <option key={v.filename} value={v.filename}>
                  {v.name}
                </option>
              ))}
            </select>
            <IconChevronDown
              className="pointer-events-none absolute right-3 h-3 w-3 text-[#9ca3af]"
              size={12}
            />
          </div>
        </div>
      </div>

      <nav className="mt-5 flex flex-col gap-0.5 px-4">
        {NAV.map(({ icon: Icon, label, active }) => (
          <button
            key={label}
            type="button"
            className={`flex items-center gap-2.5 rounded-lg px-2 py-[7px] text-[13px] transition ${
              active
                ? "font-semibold text-[#111827]"
                : "font-medium text-[#6b7280] hover:text-[#374151]"
            }`}
          >
            <Icon
              size={17}
              className={active ? "text-[#111827]" : "text-[#6b7280]"}
            />
            {label}
          </button>
        ))}
      </nav>

      <div className="mx-4 mt-5 rounded-xl border border-[#e5e7eb] bg-white p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex items-start justify-between">
          <p className="text-[11px] font-medium text-[#9ca3af]">Weekly plays</p>
          <span className="flex items-center gap-0.5 rounded-sm bg-[#ecfdf5] px-1.5 py-0.5 text-[10px] font-semibold text-[#059669]">
            ↑ 17%
          </span>
        </div>
        <p className="mt-0.5 text-[22px] font-semibold tracking-tight text-[#111827]">
          738,849
        </p>
        <svg viewBox="0 0 120 32" className="mt-2 h-7 w-full" aria-hidden>
          <defs>
            <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0 26 L12 20 L24 23 L36 14 L48 18 L60 10 L72 15 L84 8 L96 12 L108 6 L120 9"
            fill="none"
            stroke="#10b981"
            strokeWidth="1.75"
          />
          <path
            d="M0 26 L12 20 L24 23 L36 14 L48 18 L60 10 L72 15 L84 8 L96 12 L108 6 L120 9 L120 32 L0 32 Z"
            fill="url(#spark)"
          />
        </svg>
        <div className="mt-2.5 flex justify-center gap-1">
          <span className="h-1 w-1 rounded-full bg-[#111827]" />
          <span className="h-1 w-1 rounded-full bg-[#d1d5db]" />
          <span className="h-1 w-1 rounded-full bg-[#d1d5db]" />
        </div>
      </div>

      <div className="mt-auto px-4 pb-4 pt-3">
        <div className="flex flex-col gap-0.5 border-t border-[#e5e7eb] pt-3">
          <label className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-[13px] text-[#6b7280] hover:bg-white">
            <span>Demo mode</span>
            <button
              type="button"
              role="switch"
              aria-checked={demoMode}
              onClick={() => setDemoMode((v) => !v)}
              className={`relative h-[18px] w-8 rounded-full transition ${demoMode ? "bg-[#111827]" : "bg-[#d1d5db]"}`}
            >
              <span
                className={`absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white shadow transition ${demoMode ? "left-[14px]" : "left-0.5"}`}
              />
            </button>
          </label>
          {[
            { icon: IconUsers, label: "Invite your team" },
            { icon: IconLightbulb, label: "Give feedback" },
            { icon: IconCircleHelp, label: "Help & support" },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              type="button"
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] text-[#6b7280] transition hover:bg-white hover:text-[#374151]"
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
        <p className="mt-3 px-2 text-[11px] text-[#9ca3af]">Video first podcasts</p>
      </div>
    </aside>
  );
}
