import { cn } from "@/lib/utils";

export function PageTitle({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">{title}</h1>
        {sub && <p className="mt-1.5 text-sm text-cream/50">{sub}</p>}
      </div>
      {children}
    </header>
  );
}

export function Panel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl border border-white/8 bg-white/[0.04] p-6", className)}
      {...props}
    />
  );
}

export function StatCard({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <Panel className={cn(accent && "border-gold-500/30 bg-gold-500/10")}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cream/50">{label}</p>
      <p className={cn("mt-2 font-display text-3xl font-bold", accent ? "text-gold-300" : "text-white")}>
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-cream/40">{hint}</p>}
    </Panel>
  );
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  CONFIRMED: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  COMPLETED: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  CANCELLED: "bg-red-500/15 text-red-300 border-red-500/30",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wide",
        statusStyles[status] ?? "bg-white/10 text-cream/60 border-white/10"
      )}
    >
      {status}
    </span>
  );
}

/** Shared input skin for the dark admin surfaces. */
export const darkField =
  "border-white/10 bg-white/5 text-white placeholder:text-white/25 hover:border-white/20";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-semibold tracking-wide text-cream/50">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-cream/35">{hint}</p>}
    </div>
  );
}

/**
 * Horizontal magnitude bars — one series, one hue, value labelled directly.
 * Single series needs no legend: the panel heading names what is being measured.
 */
export function BarList({
  rows,
  empty = "Nothing in this range yet.",
}: {
  rows: { key: string; label: string; value: string; fraction: number; title?: string }[];
  empty?: string;
}) {
  if (rows.length === 0) {
    return <p className="py-10 text-center text-sm text-cream/40">{empty}</p>;
  }
  return (
    <ul className="space-y-4">
      {rows.map((r) => (
        <li key={r.key} title={r.title}>
          <div className="mb-1.5 flex justify-between gap-4 text-sm">
            <span className="truncate font-semibold text-cream/80">{r.label}</span>
            <span className="shrink-0 tabular-nums text-cream/50">{r.value}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full bg-gradient-gold"
              style={{ width: `${Math.max(2, r.fraction * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
