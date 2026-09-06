"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, RefreshCw } from "lucide-react";
import type { BookingRecord } from "@/lib/booking-store";
import { formatINR, formatDate, cn } from "@/lib/utils";
import { summarise, inRange, matches, byDriver } from "@/lib/analytics";
import { PageTitle, Panel, StatCard } from "@/components/admin/ui";
import { FilterBar, useDateRange, filterChip } from "@/components/admin/filter-bar";
import { useAdminBookings } from "@/components/admin/use-admin-bookings";

/* A trip settles in three moves: assign a driver, record what actually
   happened (odometer and money taken), then pay the driver. The filters
   below follow that order. */
const FILTERS = {
  closeout: { label: "Awaiting close-out", test: (b: BookingRecord) => !b.finance.closed },
  unsettled: {
    label: "To pay drivers",
    test: (b: BookingRecord) => b.finance.closed && !b.driverSettled,
  },
  balance: { label: "Balance due", test: (b: BookingRecord) => b.finance.balanceDue > 0 },
  unassigned: { label: "No driver", test: (b: BookingRecord) => !b.driverName },
  settled: { label: "Settled", test: (b: BookingRecord) => b.driverSettled },
  all: { label: "All trips", test: () => true },
} as const;

type FilterKey = keyof typeof FILTERS;

async function patchBooking(body: Record<string, unknown>) {
  const res = await fetch("/api/admin/bookings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? `Save failed (${res.status})`);
  return json;
}

export function SettlementsManager() {
  const qc = useQueryClient();
  const { data: bookings = [], isLoading, isFetching, refetch } = useAdminBookings();
  const dates = useDateRange("month");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("closeout");
  const [actionError, setActionError] = useState<string | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-bookings"] });

  const settle = useMutation({
    mutationFn: (b: BookingRecord) => patchBooking({ id: b.id, driverSettled: !b.driverSettled }),
    onSuccess: invalidate,
    onError: (e: Error) => setActionError(e.message),
  });

  const { from, to } = dates.range;
  /* Cancelled trips owe nobody anything. */
  const scope = useMemo(
    () =>
      bookings.filter((b) => b.status !== "CANCELLED" && inRange(b, from, to) && matches(b, query)),
    [bookings, from, to, query]
  );
  const rows = useMemo(() => scope.filter(FILTERS[filter].test), [scope, filter]);
  const t = useMemo(() => summarise(scope), [scope]);
  const drivers = useMemo(() => byDriver(scope), [scope]);

  return (
    <>
      <PageTitle
        title="Settlements"
        sub={
          from || to
            ? `Trips from ${from ? formatDate(from) : "the start"} to ${to ? formatDate(to) : "today"}`
            : "Every trip on record"
        }
      >
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm font-bold text-cream/70 transition-colors hover:border-gold-500/40 hover:text-gold-300"
        >
          <RefreshCw className={cn("size-4", isFetching && "animate-spin")} aria-hidden /> Refresh
        </button>
      </PageTitle>

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Collected"
          value={formatINR(t.collected)}
          hint="Taken from customers so far"
          accent
        />
        <StatCard
          label="Balance to collect"
          value={formatINR(t.balanceDue)}
          hint="Due on closed trips"
        />
        <StatCard
          label="Owed to drivers"
          value={formatINR(t.unsettledAmount)}
          hint={`${t.unsettledCount} closed trip${t.unsettledCount === 1 ? "" : "s"} unpaid`}
        />
        <StatCard
          label="Profit"
          value={formatINR(t.profit)}
          hint={`${t.margin}% margin on ${t.closedTrips} closed trip${t.closedTrips === 1 ? "" : "s"}`}
        />
      </div>

      <FilterBar
        dates={dates}
        query={query}
        onQuery={setQuery}
        placeholder="Search driver, car number, booking, customer…"
      />

      {drivers.length > 0 && (
        <Panel className="mb-5 overflow-x-auto p-0">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/8 text-[11px] uppercase tracking-wider text-cream/40">
                {["Driver", "Car number", "Trips", "Earned", "Paid", "Still owed"].map((h) => (
                  <th key={h} className="px-5 py-3.5 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {drivers.map((d) => (
                <tr
                  key={d.name}
                  className="cursor-pointer border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                  onClick={() => setQuery(d.name)}
                  title={`Show only ${d.name}'s trips`}
                >
                  <td className="px-5 py-3 font-semibold text-white">{d.name}</td>
                  <td className="px-5 py-3 font-mono text-xs text-cream/60">{d.vehicleNo || "—"}</td>
                  <td className="px-5 py-3 tabular-nums text-cream/70">
                    {d.trips}
                    {d.awaitingCloseout > 0 && (
                      <span className="ml-1 text-xs text-amber-300">({d.awaitingCloseout} open)</span>
                    )}
                  </td>
                  <td className="px-5 py-3 tabular-nums text-cream/80">{formatINR(d.earned)}</td>
                  <td className="px-5 py-3 tabular-nums text-emerald-300">{formatINR(d.paid)}</td>
                  <td
                    className={cn(
                      "px-5 py-3 font-bold tabular-nums",
                      d.due > 0 ? "text-amber-300" : "text-cream/30"
                    )}
                  >
                    {formatINR(d.due)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}

      <div className="mb-5 flex flex-wrap gap-1.5" role="group" aria-label="Filter trips">
        {(Object.keys(FILTERS) as FilterKey[]).map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            aria-pressed={filter === k}
            className={filterChip(filter === k)}
          >
            {FILTERS[k].label} ({scope.filter(FILTERS[k].test).length})
          </button>
        ))}
      </div>

      {actionError && (
        <p
          role="alert"
          className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {actionError}
        </p>
      )}

      <Panel className="overflow-x-auto p-0">
        {isLoading ? (
          <p className="py-16 text-center text-sm text-cream/40">Loading trips…</p>
        ) : rows.length === 0 ? (
          <p className="py-16 text-center text-sm text-cream/40">Nothing here — all clear.</p>
        ) : (
          <table className="w-full min-w-[1220px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/8 text-[11px] uppercase tracking-wider text-cream/40">
                {[
                  "Trip", "Pickup", "Driver", "Km", "Customer total",
                  "Collected", "Balance", "Driver total", "To pay driver", "Profit", "Settlement",
                ].map((h) => (
                  <th key={h} className="px-4 py-4 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => {
                const f = b.finance;
                return (
                  <tr
                    key={b.id}
                    className="border-b border-white/5 align-middle last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/admin/payments/${b.bookingCode}`}
                        className="whitespace-nowrap font-mono text-[13px] font-bold text-gold-300 hover:underline"
                      >
                        {b.bookingCode}
                      </Link>
                      <p className="text-xs text-cream/40">
                        {b.name} · {b.vehicleName}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-cream/70">
                      {formatDate(b.pickupDate)}
                    </td>
                    <td className="px-4 py-3.5">
                      {b.driverName ? (
                        <>
                          <p className="text-cream/80">{b.driverName}</p>
                          {b.driverVehicleNo && (
                            <p className="font-mono text-xs text-cream/40">{b.driverVehicleNo}</p>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-amber-300/70">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 tabular-nums text-cream/70">
                      {f.closed ? (
                        <>
                          {b.actualKm}
                          {f.extraKm > 0 && <span className="text-gold-300"> (+{f.extraKm})</span>}
                        </>
                      ) : (
                        <span className="text-cream/30">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 tabular-nums text-white">
                      <span className="font-semibold">{formatINR(f.customerTotal)}</span>
                      {!f.closed && <p className="text-xs font-normal text-cream/40">minimum</p>}
                    </td>
                    <td className="px-4 py-3.5 tabular-nums text-cream/70">
                      {formatINR(f.collected)}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3.5 font-semibold tabular-nums",
                        f.balanceDue > 0 ? "text-amber-300" : "text-cream/30"
                      )}
                    >
                      {f.closed ? formatINR(f.balanceDue) : "—"}
                    </td>
                    <td className="px-4 py-3.5 tabular-nums text-cream/70">
                      {formatINR(f.driverTotal)}
                    </td>
                    <td className="px-4 py-3.5 tabular-nums text-cream/80">
                      {formatINR(f.driverDue)}
                      {f.driverAdvance > 0 && (
                        <p className="text-xs text-cream/40">
                          {formatINR(f.driverAdvance)} advanced
                        </p>
                      )}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3.5 font-semibold tabular-nums",
                        !f.closed ? "text-cream/30" : f.profit < 0 ? "text-red-300" : "text-gold-300"
                      )}
                    >
                      {f.closed ? (
                        <>
                          {formatINR(f.profit)}
                          <span className="ml-1 text-xs font-normal text-cream/35">{f.margin}%</span>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {!f.closed ? (
                        <Link
                          href={`/admin/payments/${b.bookingCode}`}
                          className="inline-block whitespace-nowrap rounded-lg border border-amber-500/40 px-3 py-1.5 text-xs font-bold text-amber-200 transition-colors hover:bg-amber-500/10"
                        >
                          Close out
                        </Link>
                      ) : (
                        <button
                          onClick={() => {
                            setActionError(null);
                            settle.mutate(b);
                          }}
                          disabled={settle.isPending || !b.driverName}
                          title={
                            !b.driverName
                              ? "Assign a driver before settling"
                              : b.driverSettled && b.settledAt
                                ? `Settled ${formatDate(b.settledAt, true)}`
                                : "Mark the driver as paid"
                          }
                          className={cn(
                            "flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                            b.driverSettled
                              ? "border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10"
                              : "border-white/15 text-cream/70 hover:border-gold-500/40 hover:text-gold-300"
                          )}
                        >
                          {b.driverSettled ? (
                            <>
                              <Check className="size-3.5" aria-hidden /> Paid
                            </>
                          ) : (
                            "Mark paid"
                          )}
                        </button>
                      )}
                      {f.closed && (
                        <Link
                          href={`/admin/payments/${b.bookingCode}`}
                          className="mt-1 block text-xs font-semibold text-cream/40 underline-offset-4 hover:text-gold-300 hover:underline"
                        >
                          Edit close-out
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Panel>

    </>
  );
}
