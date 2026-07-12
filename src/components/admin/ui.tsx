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
