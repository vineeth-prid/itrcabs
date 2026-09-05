"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { summarise, inRange, byVehicle, byRoute, byDay } from "@/lib/analytics";
import { formatINR, formatDate, isoDate, isoDateOffset, cn } from "@/lib/utils";
import { PageTitle, Panel, StatCard, StatusBadge, BarList } from "@/components/admin/ui";
import { useAdminBookings } from "@/components/admin/use-admin-bookings";

/* ── Trip-date range ─────────────────────────────────────────────────
   Filters on the date of travel, not the date of sale: money, driver
   payouts and settlement all follow the trip. */

/** Last day of the IST month `value` falls in. Day 0 of the next month. */
function monthEnd(value: string): string {
  const [y, m] = value.split("-").map(Number);
  return isoDate(new Date(Date.UTC(y, m, 0)));
}

const PRESETS = {
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

type PresetKey = keyof typeof PRESETS;
type Metric = "trips" | "fare" | "profit";

const METRICS: { id: Metric; label: string }[] = [
  { id: "trips", label: "Trips" },
  { id: "fare", label: "Fare" },
  { id: "profit", label: "Profit" },
];

export function Dashboard() {
  const { data: bookings = [], isLoading, isFetching, refetch } = useAdminBookings();

  const [preset, setPreset] = useState<PresetKey | "custom">("month");
  const [custom, setCustom] = useState(() => ({
    from: PRESETS.month.from(),
    to: PRESETS.month.to(),
  }));
  const [metric, setMetric] = useState<Metric>("trips");

  const { from, to } =
    preset === "custom"
      ? custom
      : { from: PRESETS[preset].from(), to: PRESETS[preset].to() };

  const rows = useMemo(
    () => bookings.filter((b) => inRange(b, from, to)),
    [bookings, from, to]
  );
  const t = useMemo(() => summarise(rows), [rows]);

  const vehicles = useMemo(() => byVehicle(rows), [rows]);
  const routes = useMemo(() => byRoute(rows), [rows]);
  const days = useMemo(() => byDay(rows).slice(-21), [rows]);

  const pick = (s: { trips: number; fare: number; profit: number }) =>
    metric === "trips" ? s.trips : metric === "fare" ? s.fare : s.profit;
  const asValue = (n: number) => (metric === "trips" ? String(n) : formatINR(n));
  const dayMax = Math.max(1, ...days.map((d) => Math.abs(pick(d))));
  const vehicleMax = Math.max(1, ...vehicles.map((v) => v.trips));
  const routeMax = Math.max(1, ...routes.map((r) => r.trips));

  const setRange = (key: PresetKey) => {
    setCustom({ from: PRESETS[key].from(), to: PRESETS[key].to() });
    setPreset(key);
  };

  return (
    <>
      <PageTitle
        title="Dashboard"
        sub={
          from || to
            ? `Trips from ${from ? formatDate(from) : "the start"} to ${to ? formatDate(to) : "today"}`
            : "Every trip on record"
        }
      >
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm font-bold text-cream/70 transition-colors hover:border-gold-500/40 hover:text-gold-300"
          >
            <RefreshCw className={cn("size-4", isFetching && "animate-spin")} aria-hidden /> Refresh
          </button>
          <Link
            href="/admin/bookings"
            className="rounded-full bg-gradient-gold px-6 py-2.5 text-sm font-bold text-ink shadow-glow transition-transform hover:-translate-y-0.5"
          >
            Manage bookings
          </Link>
        </div>
      </PageTitle>

      {/* Filters sit in one row above everything they affect. */}
      <Panel className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-3">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Trip date range">
          {(Object.keys(PRESETS) as PresetKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setRange(k)}
              aria-pressed={preset === k}
              className={cn(
                "rounded-full px-4 py-2 text-xs font-bold tracking-wide transition-all",
                preset === k ? "bg-gradient-gold text-ink" : "bg-white/5 text-cream/50 hover:text-white"
              )}
            >
              {PRESETS[k].label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs text-cream/50">
          <label className="flex items-center gap-2">
            From
            <input
              type="date"
              value={custom.from}
              onChange={(e) => {
                setCustom((c) => ({ ...c, from: e.target.value }));
                setPreset("custom");
              }}
              className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-cream/80 focus:border-gold-500 focus:outline-none"
            />
          </label>
          <label className="flex items-center gap-2">
            To
            <input
              type="date"
              value={custom.to}
              onChange={(e) => {
                setCustom((c) => ({ ...c, to: e.target.value }));
                setPreset("custom");
              }}
              className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-cream/80 focus:border-gold-500 focus:outline-none"
            />
          </label>
        </div>
      </Panel>

      {isLoading ? (
        <p className="py-20 text-center text-sm text-cream/40">Loading dashboard…</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Trips"
              value={String(t.trips)}
              hint={`${t.pending} pending · ${t.confirmed} confirmed · ${t.completed} done`}
              accent
            />
            <StatCard
              label="Gross fare"
              value={formatINR(t.grossFare)}
              hint={`${formatINR(t.avgFare)} average per trip`}
            />
            <StatCard
              label="Collected"
              value={formatINR(t.collected)}
              hint="Deposits and payments taken"
            />
            <StatCard
              label="Balance to collect"
              value={formatINR(t.balanceDue)}
              hint="Due from customers at drop-off"
            />
            <StatCard
              label="Driver payout"
              value={formatINR(t.driverPayout)}
              hint="Owed to drivers on these trips"
            />
            <StatCard
              label="Profit"
              value={formatINR(t.profit)}
              hint={`${t.margin}% margin · ${formatINR(t.avgProfit)} per trip`}
              accent
            />
            <StatCard
              label="Unsettled with drivers"
              value={formatINR(t.unsettledAmount)}
              hint={`${t.unsettledCount} closed trip${t.unsettledCount === 1 ? "" : "s"} awaiting payout`}
            />
            <StatCard
              label="Cancelled"
              value={String(t.cancelled)}
              hint={t.trips ? `${Math.round((t.cancelled / t.trips) * 100)}% of bookings` : "—"}
            />
          </div>

          {t.awaitingCloseout > 0 && (
            <Panel className="mt-6 flex flex-wrap items-center gap-3 border-amber-500/30 bg-amber-500/10">
              <AlertTriangle className="size-5 text-amber-300" aria-hidden />
              <p className="flex-1 text-sm text-cream/80">
                <strong className="text-white">{t.awaitingCloseout}</strong> completed trip
                {t.awaitingCloseout === 1 ? " has" : "s have"} no actual kilometres recorded — the
                balance and driver payout stay provisional until they do.
              </p>
              <Link
                href="/admin/payments"
                className="rounded-full border border-amber-500/40 px-4 py-2 text-xs font-bold text-amber-200 transition-colors hover:bg-amber-500/15"
              >
                Close them out
              </Link>
            </Panel>
          )}

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <Panel>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-lg font-bold text-white">
                  Daily {METRICS.find((m) => m.id === metric)!.label.toLowerCase()}
                </h2>
                <div className="flex gap-1.5" role="group" aria-label="Metric">
                  {METRICS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMetric(m.id)}
                      aria-pressed={metric === m.id}
                      className={cn(
                        "rounded-full px-3.5 py-1.5 text-xs font-bold transition-all",
                        metric === m.id
                          ? "bg-gradient-gold text-ink"
                          : "bg-white/5 text-cream/50 hover:text-white"
                      )}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
              {days.length === 0 ? (
                <p className="py-16 text-center text-sm text-cream/40">
                  No trips in this range yet.
                </p>
              ) : (
                <div className="flex h-52 gap-1.5 overflow-x-auto">
                  {days.map((d) => {
                    const v = pick(d);
                    return (
                      <div
                        key={d.key}
                        className="flex h-full min-w-6 max-w-16 flex-1 flex-col items-center gap-1.5"
                        title={`${formatDate(d.key)} — ${asValue(v)}`}
                      >
                        <span className="text-[10px] tabular-nums text-cream/40">
                          {metric === "trips" ? v : `${Math.round(v / 1000)}k`}
                        </span>
                        {/* The track takes the leftover height, so the bar's
                            percentage has something definite to resolve against. */}
                        <div className="flex w-full flex-1 items-end">
                          <div
                            className="w-full rounded-t bg-gradient-gold"
                            style={{ height: `${Math.max(2, (Math.abs(v) / dayMax) * 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] tabular-nums text-cream/35">
                          {d.key.slice(8)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </Panel>

            <Panel>
              <h2 className="mb-5 font-display text-lg font-bold text-white">Top routes</h2>
              <BarList
                empty="Popular routes surface here."
                rows={routes.map((r) => ({
                  key: r.key,
                  label: r.key,
                  value: `${r.trips} · ${formatINR(r.profit)}`,
                  fraction: r.trips / routeMax,
                  title: `${r.key} — ${r.trips} trips, ${formatINR(r.fare)} fare, ${formatINR(r.profit)} profit`,
                }))}
              />
            </Panel>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.5fr]">
            <Panel>
              <h2 className="mb-5 font-display text-lg font-bold text-white">Trips by vehicle</h2>
              <BarList
                empty="Vehicle mix appears with your first trips."
                rows={vehicles.map((v) => ({
                  key: v.key,
                  label: v.key,
                  value: `${v.trips} · ${formatINR(v.profit)}`,
                  fraction: v.trips / vehicleMax,
                  title: `${v.key} — ${v.trips} trips, ${formatINR(v.fare)} fare, ${formatINR(v.profit)} profit`,
                }))}
              />
            </Panel>

            <Panel>
              <h2 className="mb-4 font-display text-lg font-bold text-white">Recent trips</h2>
              {rows.length === 0 ? (
                <p className="py-10 text-center text-sm text-cream/40">
                  No trips in this range — widen the dates or add a booking.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/8 text-[11px] uppercase tracking-wider text-cream/40">
                        {["Booking", "Route", "Pickup", "Fare", "Profit", "Status"].map((h) => (
                          <th key={h} className="pb-3 pr-4 font-semibold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.slice(0, 8).map((b) => (
                        <tr key={b.id} className="border-b border-white/5 last:border-0">
                          <td className="py-3 pr-4">
                            <p className="whitespace-nowrap font-mono text-[13px] font-bold text-gold-300">
                              {b.bookingCode}
                            </p>
                            <p className="text-xs text-cream/40">{b.name}</p>
                          </td>
                          <td className="py-3 pr-4 text-cream/70">
                            {b.pickup} → {b.destination}
                          </td>
                          <td className="py-3 pr-4 text-cream/70">
                            {formatDate(b.pickupDate)} · {b.pickupTime}
                          </td>
                          <td className="py-3 pr-4 font-semibold tabular-nums text-white">
                            {formatINR(b.finance.customerTotal)}
                          </td>
                          <td className="py-3 pr-4 tabular-nums text-cream/70">
                            {b.status === "CANCELLED" ? "—" : formatINR(b.finance.profit)}
                          </td>
                          <td className="py-3">
                            <StatusBadge status={b.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Panel>
          </div>
        </>
      )}
    </>
  );
}
