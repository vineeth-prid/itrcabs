"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, UserX } from "lucide-react";
import { summarise, inRange, matches, byVehicle, byRoute, byDay, byDriver } from "@/lib/analytics";
import { formatINR, formatDate, cn } from "@/lib/utils";
import { PageTitle, Panel, StatCard, StatusBadge, BarList } from "@/components/admin/ui";
import { FilterBar, useDateRange } from "@/components/admin/filter-bar";
import { useAdminBookings } from "@/components/admin/use-admin-bookings";

type Metric = "trips" | "fare" | "profit";

const METRICS: { id: Metric; label: string }[] = [
  { id: "trips", label: "Trips" },
  { id: "fare", label: "Fare" },
  { id: "profit", label: "Profit" },
];

export function Dashboard() {
  const { data: bookings = [], isLoading, isFetching, refetch } = useAdminBookings();
  const dates = useDateRange("month");
  const [query, setQuery] = useState("");
  const [metric, setMetric] = useState<Metric>("trips");

  const { from, to } = dates.range;
  const rows = useMemo(
    () => bookings.filter((b) => inRange(b, from, to) && matches(b, query)),
    [bookings, from, to, query]
  );

  const t = useMemo(() => summarise(rows), [rows]);
  const vehicles = useMemo(() => byVehicle(rows), [rows]);
  const routes = useMemo(() => byRoute(rows), [rows]);
  const days = useMemo(() => byDay(rows).slice(-21), [rows]);
  const drivers = useMemo(() => byDriver(rows).slice(0, 6), [rows]);

  const pick = (s: { trips: number; fare: number; profit: number }) =>
    metric === "trips" ? s.trips : metric === "fare" ? s.fare : s.profit;
  const asValue = (n: number) => (metric === "trips" ? String(n) : formatINR(n));
  const dayMax = Math.max(1, ...days.map((d) => Math.abs(pick(d))));
  const vehicleMax = Math.max(1, ...vehicles.map((v) => v.trips));
  const routeMax = Math.max(1, ...routes.map((r) => r.trips));
  const driverMax = Math.max(1, ...drivers.map((d) => d.earned));

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

      <FilterBar
        dates={dates}
        query={query}
        onQuery={setQuery}
        placeholder="Search booking, customer, driver, route…"
      />

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
              label="Revenue (closed trips)"
              value={formatINR(t.grossFare)}
              hint={
                t.closedTrips
                  ? `${t.closedTrips} costed · ${formatINR(t.avgFare)} average`
                  : "No trips costed yet"
              }
            />
            <StatCard
              label="Profit"
              value={formatINR(t.profit)}
              hint={
                t.closedTrips
                  ? `${t.margin}% margin · ${formatINR(t.avgProfit)} per trip`
                  : "Known once trips are closed out"
              }
              accent
            />
            <StatCard
              label="Driver payout"
              value={formatINR(t.driverPayout)}
              hint="Cost of the closed trips"
            />
            <StatCard
              label="Open pipeline"
              value={formatINR(t.openMinimum)}
              hint={`${t.openTrips} trip${t.openTrips === 1 ? "" : "s"} at minimum fare — not yet run`}
            />
            <StatCard
              label="Collected"
              value={formatINR(t.collected)}
              hint="Deposits and payments taken"
            />
            <StatCard
              label="Balance to collect"
              value={formatINR(t.balanceDue)}
              hint="Due on closed trips"
            />
            <StatCard
              label="Unsettled with drivers"
              value={formatINR(t.unsettledAmount)}
              hint={`${t.unsettledCount} closed trip${t.unsettledCount === 1 ? "" : "s"} awaiting payout`}
            />
          </div>

          {(t.awaitingCloseout > 0 || t.unassigned > 0) && (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {t.awaitingCloseout > 0 && (
                <Panel className="flex items-center gap-3 border-amber-500/30 bg-amber-500/10">
                  <AlertTriangle className="size-5 shrink-0 text-amber-300" aria-hidden />
                  <p className="flex-1 text-sm text-cream/80">
                    <strong className="text-white">{t.awaitingCloseout}</strong> completed trip
                    {t.awaitingCloseout === 1 ? "" : "s"} with no odometer reading — the fare is
                    still only the minimum.
                  </p>
                  <Link
                    href="/admin/payments"
                    className="shrink-0 rounded-full border border-amber-500/40 px-4 py-2 text-xs font-bold text-amber-200 transition-colors hover:bg-amber-500/15"
                  >
                    Close out
                  </Link>
                </Panel>
              )}
              {t.unassigned > 0 && (
                <Panel className="flex items-center gap-3 border-sky-500/30 bg-sky-500/10">
                  <UserX className="size-5 shrink-0 text-sky-300" aria-hidden />
                  <p className="flex-1 text-sm text-cream/80">
                    <strong className="text-white">{t.unassigned}</strong> costed trip
                    {t.unassigned === 1 ? " has" : "s have"} no driver assigned — there is nobody to
                    settle with.
                  </p>
                  <Link
                    href="/admin/bookings"
                    className="shrink-0 rounded-full border border-sky-500/40 px-4 py-2 text-xs font-bold text-sky-200 transition-colors hover:bg-sky-500/15"
                  >
                    Assign
                  </Link>
                </Panel>
              )}
            </div>
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
                <p className="py-16 text-center text-sm text-cream/40">No trips in this range.</p>
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

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
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
              <h2 className="mb-5 font-display text-lg font-bold text-white">Top drivers</h2>
              <BarList
                empty="Assign drivers to trips and they appear here."
                rows={drivers.map((d) => ({
                  key: d.name,
                  label: `${d.name}${d.vehicleNo ? ` · ${d.vehicleNo}` : ""}`,
                  value: `${d.trips} · ${formatINR(d.earned)}`,
                  fraction: d.earned / driverMax,
                  title: `${d.name} — ${d.trips} trips, ${formatINR(d.earned)} earned, ${formatINR(d.due)} unpaid`,
                }))}
              />
            </Panel>
          </div>

          <Panel className="mt-6">
            <h2 className="mb-4 font-display text-lg font-bold text-white">Recent trips</h2>
            {rows.length === 0 ? (
              <p className="py-10 text-center text-sm text-cream/40">
                No trips match — widen the dates or clear the search.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/8 text-[11px] uppercase tracking-wider text-cream/40">
                      {["Booking", "Route", "Pickup", "Driver", "Fare", "Profit", "Status"].map(
                        (h) => (
                          <th key={h} className="pb-3 pr-4 font-semibold">
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 10).map((b) => (
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
                        <td className="py-3 pr-4 whitespace-nowrap text-cream/70">
                          {formatDate(b.pickupDate)} · {b.pickupTime}
                        </td>
                        <td className="py-3 pr-4 text-cream/70">
                          {b.driverName ? (
                            <>
                              {b.driverName}
                              {b.driverVehicleNo && (
                                <p className="text-xs text-cream/40">{b.driverVehicleNo}</p>
                              )}
                            </>
                          ) : (
                            <span className="text-cream/30">—</span>
                          )}
                        </td>
                        <td className="py-3 pr-4 tabular-nums text-white">
                          <span className="font-semibold">{formatINR(b.finance.customerTotal)}</span>
                          {!b.finance.closed && (
                            <p className="text-xs font-normal text-cream/40">minimum</p>
                          )}
                        </td>
                        <td className="py-3 pr-4 tabular-nums text-cream/70">
                          {b.finance.closed ? formatINR(b.finance.profit) : "—"}
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
        </>
      )}
    </>
  );
}
