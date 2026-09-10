"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { isoDate, isoDateOffset, cn } from "@/lib/utils";
import { Panel } from "@/components/admin/ui";

/* ── Trip-date range ─────────────────────────────────────────────────
   Filters on the date of travel, not the date of sale: fares, driver
   payouts and settlement all follow the trip. */

/** Last day of the IST month `value` falls in — day 0 of the next month. */
function monthEnd(value: string): string {
  const [y, m] = value.split("-").map(Number);
  return isoDate(new Date(Date.UTC(y, m, 0)));
}

export const PRESETS = {
  "7d": { label: "Last 7 days", from: () => isoDateOffset(-7), to: () => isoDate() },
  "30d": { label: "Last 30 days", from: () => isoDateOffset(-30), to: () => isoDate() },
  month: {
    label: "This month",
    from: () => `${isoDate().slice(0, 7)}-01`,
    to: () => monthEnd(isoDate()),
  },
  upcoming: { label: "Next 30 days", from: () => isoDate(), to: () => isoDateOffset(30) },
  all: { label: "All time", from: () => "", to: () => "" },
} as const;

export type PresetKey = keyof typeof PRESETS;
export interface Range {
  from: string;
  to: string;
}

/** Range state plus the preset chip that is currently lit. */
export function useDateRange(initial: PresetKey = "month") {
  const [preset, setPreset] = useState<PresetKey | "custom">(initial);
  const [custom, setCustom] = useState<Range>(() => ({
    from: PRESETS[initial].from(),
    to: PRESETS[initial].to(),
  }));

  const range: Range =
    preset === "custom" ? custom : { from: PRESETS[preset].from(), to: PRESETS[preset].to() };

  return {
    range,
    preset,
    custom,
    setPreset: (key: PresetKey) => {
      setCustom({ from: PRESETS[key].from(), to: PRESETS[key].to() });
      setPreset(key);
    },
    setCustom: (patch: Partial<Range>) => {
      setCustom((c) => ({ ...c, ...patch }));
      setPreset("custom");
    },
  };
}

const chip = (active: boolean) =>
  cn(
    "rounded-full px-4 py-2 text-xs font-bold tracking-wide transition-all",
    active ? "bg-gradient-gold text-ink" : "bg-white/5 text-cream/50 hover:text-white"
  );

/* dark-select carries color-scheme: dark, which the native date picker and
   its calendar icon need to stay legible on this surface. */
const dateInput =
  "dark-select rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-cream/80 focus:border-gold-500 focus:outline-none";

/** Filters sit in one row above everything they affect. */
export function FilterBar({
  dates,
  query,
  onQuery,
  placeholder = "Search…",
  children,
}: {
  dates: ReturnType<typeof useDateRange>;
  query?: string;
  onQuery?: (v: string) => void;
  placeholder?: string;
  children?: React.ReactNode;
}) {
  return (
    <Panel className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-3">
      {onQuery && (
        <div className="relative min-w-56 flex-1">
          <Search
            className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-cream/30"
            aria-hidden
          />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
            className="h-10 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-3 text-sm text-white placeholder:text-white/30 focus:border-gold-500 focus:outline-none"
          />
        </div>
      )}

      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Trip date range">
        {(Object.keys(PRESETS) as PresetKey[]).map((k) => (
          <button
            key={k}
            onClick={() => dates.setPreset(k)}
            aria-pressed={dates.preset === k}
            className={chip(dates.preset === k)}
          >
            {PRESETS[k].label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs text-cream/50">
        <label className="flex items-center gap-2">
          From
          <input
            type="date"
            value={dates.custom.from}
            onChange={(e) => dates.setCustom({ from: e.target.value })}
            className={dateInput}
          />
        </label>
        <label className="flex items-center gap-2">
          To
          <input
            type="date"
            value={dates.custom.to}
            onChange={(e) => dates.setCustom({ to: e.target.value })}
            className={dateInput}
          />
        </label>
      </div>

      {children}
    </Panel>
  );
}

export { chip as filterChip };
