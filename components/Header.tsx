"use client";

import { ChevronDown } from "lucide-react";

export function Header() {
  return (
    <header className="flex h-[104px] shrink-0 items-center justify-between border-b border-zinc-200 px-8">
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 text-sm font-bold text-white">
          V
        </div>
        <span className="text-lg font-semibold tracking-tight">vidpod</span>
      </div>

      <div className="flex items-center gap-6">
        <button
          type="button"
          className="relative rounded-lg p-2 text-zinc-500 hover:bg-zinc-100"
          aria-label="Notifications"
        >
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>

        <button
          type="button"
          className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-sm hover:bg-zinc-50"
        >
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-400" />
          <span className="text-sm font-medium">Alex Morgan</span>
          <ChevronDown className="h-4 w-4 text-zinc-500" />
        </button>
      </div>
    </header>
  );
}
