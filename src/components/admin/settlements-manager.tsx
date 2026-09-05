"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, RefreshCw, X } from "lucide-react";
import type { BookingRecord } from "@/lib/booking-store";
import type { VehicleSpec } from "@/config/fleet";
import { computeRideFinance } from "@/lib/pricing";
import { formatINR, formatDate, cn } from "@/lib/utils";
import { summarise } from "@/lib/analytics";
import { PageTitle, Panel, StatCard, Field, darkField } from "@/components/admin/ui";
import { Input } from "@/components/ui/input";
import { useAdminBookings } from "@/components/admin/use-admin-bookings";

/* A trip is settled in two moves: record what actually happened (kilometres and
   money taken), then pay the driver. The filters below follow that order. */
const FILTERS = {
  closeout: { label: "Awaiting close-out", test: (b: BookingRecord) => !b.finance.closed },
  unsettled: {
    label: "To pay drivers",
    test: (b: BookingRecord) => b.finance.closed && !b.driverSettled,
  },
  balance: {
    label: "Balance due",
    test: (b: BookingRecord) => b.finance.balanceDue > 0,
  },
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
  if (!res.ok) throw new Error(json.error ?? "Save failed");
  return json;
}

function CloseOutDialog({
  booking,
  onClose,
  onSaved,
}: {
  booking: BookingRecord;
  onClose: () => void;
  onSaved: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [actualKm, setActualKm] = useState(booking.actualKm?.toString() ?? "");
  const [collected, setCollected] = useState(
    (booking.collectedAmount ?? booking.bookingAmount).toString()
  );
  const [driverOverride, setDriverOverride] = useState(booking.driverAmount?.toString() ?? "");
  const [settled, setSettled] = useState(booking.driverSettled);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => ref.current?.showModal(), []);

  /* The vehicle's driver rates make the preview exact: extra kilometres cost
     the driver too, so the payout moves with the km field, not just the fare. */
  const { data: vehicles = [] } = useQuery<(VehicleSpec & { available: boolean })[]>({
    queryKey: ["admin-fleet"],
    queryFn: async () => {
      const res = await fetch("/api/admin/fleet");
      if (!res.ok) throw new Error("Failed to load fleet");
      return (await res.json()).vehicles;
    },
  });
  const rates = vehicles.find((v) => v.slug === booking.vehicleSlug);

  const preview = computeRideFinance(
    {
      ...booking,
      actualKm: actualKm === "" ? null : Number(actualKm),
      driverAmount: driverOverride === "" ? null : Number(driverOverride),
      collectedAmount: collected === "" ? null : Number(collected),
    },
    rates
  );
  /* Until the fleet loads, fall back to the payout the server last computed. */
  const driverTotal =
    rates || driverOverride !== "" ? preview.driverTotal : booking.finance.driverTotal;
  const profit = preview.customerTotal - driverTotal;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await patchBooking({
        id: booking.id,
        actualKm: actualKm === "" ? null : Number(actualKm),
        collectedAmount: collected === "" ? null : Number(collected),
        driverAmount: driverOverride === "" ? null : Number(driverOverride),
        driverSettled: settled,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const Row = ({ label, value, strong }: { label: string; value: string; strong?: boolean }) => (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="text-cream/50">{label}</span>
      <span className={cn("tabular-nums", strong ? "font-bold text-white" : "text-cream/80")}>
        {value}
      </span>
    </div>
  );

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current?.close()}
      className="m-auto w-[min(34rem,92vw)] rounded-2xl border border-white/10 bg-ink p-0 text-cream backdrop:bg-ink/80 backdrop:backdrop-blur-sm"
    >
      <form onSubmit={submit} className="max-h-[88vh] overflow-y-auto p-6 sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-white">Close out trip</h2>
            <p className="mt-1 text-sm text-cream/50">
              {booking.bookingCode} · {booking.vehicleName} · {booking.name}
            </p>
          </div>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            aria-label="Close"
            className="rounded-full p-2 text-cream/50 transition-colors hover:bg-white/5 hover:text-white"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Actual km run" hint={`${booking.includedKm} km included in the fare`}>
            <Input
              type="number"
              min={0}
              max={20000}
              value={actualKm}
              onChange={(e) => setActualKm(e.target.value)}
              placeholder="Not recorded"
              className={darkField}
            />
          </Field>
          <Field label="Collected from customer" hint="Deposit plus anything taken since">
            <Input
              required
              type="number"
              min={0}
              value={collected}
              onChange={(e) => setCollected(e.target.value)}
              className={darkField}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field
              label="Driver payout override"
              hint="Leave blank to use the driver rate card for this vehicle"
            >
              <Input
                type="number"
                min={0}
                value={driverOverride}
                onChange={(e) => setDriverOverride(e.target.value)}
                placeholder={String(booking.finance.driverTotal)}
                className={darkField}
              />
            </Field>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-white/8 bg-white/[0.03] p-4">
          <Row label="Quoted fare" value={formatINR(booking.estimateTotal)} />
          <Row
            label={`Extra km (${preview.extraKm} × ₹${booking.extraKmRate})`}
            value={formatINR(preview.customerExtra)}
          />
          <Row label="Customer total" value={formatINR(preview.customerTotal)} strong />
          <div className="my-2 border-t border-white/8" />
          <Row label="Collected" value={formatINR(preview.collected)} />
          <Row label="Balance to collect" value={formatINR(preview.balanceDue)} strong />
          <div className="my-2 border-t border-white/8" />
          <Row label="Driver payout" value={formatINR(driverTotal)} />
          <div className="flex justify-between gap-4 py-1.5 text-sm">
            <span className="text-cream/50">Profit</span>
            <span
              className={cn(
                "font-bold tabular-nums",
                profit < 0 ? "text-red-300" : "text-gold-300"
              )}
            >
              {formatINR(profit)}
            </span>
          </div>
        </div>

        <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 px-4 py-3">
          <input
            type="checkbox"
            checked={settled}
            onChange={(e) => setSettled(e.target.checked)}
            className="size-4 accent-gold-500"
          />
          <span className="text-sm font-semibold text-cream/80">
            Driver has been paid {formatINR(driverTotal)}
          </span>
        </label>

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            {error}
          </p>
        )}

        <div className="mt-7 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => ref.current?.close()}
            className="rounded-full border border-white/10 px-6 py-2.5 text-sm font-bold text-cream/70 transition-colors hover:border-white/25 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-full bg-gradient-gold px-6 py-2.5 text-sm font-bold text-ink shadow-glow transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {saving && <Loader2 className="size-4 animate-spin" aria-hidden />}
            Save close-out
          </button>
        </div>
      </form>
    </dialog>
  );
}

export function SettlementsManager() {
  const qc = useQueryClient();
  const { data: bookings = [], isLoading, isFetching, refetch } = useAdminBookings();
  const [filter, setFilter] = useState<FilterKey>("closeout");
  const [editing, setEditing] = useState<BookingRecord | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-bookings"] });

  const settle = useMutation({
    mutationFn: (b: BookingRecord) =>
      patchBooking({ id: b.id, driverSettled: !b.driverSettled }),
    onSuccess: invalidate,
  });

  /* Cancelled trips owe nobody anything. */
  const live = useMemo(() => bookings.filter((b) => b.status !== "CANCELLED"), [bookings]);
  const rows = useMemo(() => live.filter(FILTERS[filter].test), [live, filter]);
  const t = useMemo(() => summarise(live), [live]);

  return (
    <>
      <PageTitle title="Settlements" sub="Balance to collect, driver payouts and trip margin">
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm font-bold text-cream/70 transition-colors hover:border-gold-500/40 hover:text-gold-300"
        >
          <RefreshCw className={cn("size-4", isFetching && "animate-spin")} aria-hidden /> Refresh
        </button>
      </PageTitle>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Collected"
          value={formatINR(t.collected)}
          hint="Taken from customers so far"
          accent
        />
        <StatCard
          label="Balance to collect"
          value={formatINR(t.balanceDue)}
          hint="Outstanding across live trips"
        />
        <StatCard
          label="Owed to drivers"
          value={formatINR(t.unsettledAmount)}
          hint={`${t.unsettledCount} closed trip${t.unsettledCount === 1 ? "" : "s"} unpaid`}
        />
        <StatCard
          label="Profit"
          value={formatINR(t.profit)}
          hint={`${t.margin}% margin after driver costs`}
        />
      </div>

      <Panel className="mt-6 mb-5 flex flex-wrap gap-1.5" role="group" aria-label="Filter">
        {(Object.keys(FILTERS) as FilterKey[]).map((k) => {
          const n = live.filter(FILTERS[k].test).length;
          return (
            <button
              key={k}
              onClick={() => setFilter(k)}
              aria-pressed={filter === k}
              className={cn(
                "rounded-full px-4 py-2 text-xs font-bold tracking-wide transition-all",
                filter === k ? "bg-gradient-gold text-ink" : "bg-white/5 text-cream/50 hover:text-white"
              )}
            >
              {FILTERS[k].label} ({n})
            </button>
          );
        })}
      </Panel>

      <Panel className="overflow-x-auto p-0">
        {isLoading ? (
          <p className="py-16 text-center text-sm text-cream/40">Loading trips…</p>
        ) : rows.length === 0 ? (
          <p className="py-16 text-center text-sm text-cream/40">Nothing here — all clear.</p>
        ) : (
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/8 text-[11px] uppercase tracking-wider text-cream/40">
                {[
                  "Trip", "Pickup", "Km", "Customer total", "Collected",
                  "Balance", "Driver", "Profit", "Settlement",
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
                      <button
                        onClick={() => setEditing(b)}
                        className="whitespace-nowrap font-mono text-[13px] font-bold text-gold-300 hover:underline"
                      >
                        {b.bookingCode}
                      </button>
                      <p className="text-xs text-cream/40">
                        {b.name} · {b.vehicleName}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-cream/70">{formatDate(b.pickupDate)}</td>
                    <td className="px-4 py-3.5 tabular-nums text-cream/70">
                      {f.closed ? (
                        <>
                          {b.actualKm}
                          {f.extraKm > 0 && (
                            <span className="text-gold-300"> (+{f.extraKm})</span>
                          )}
                        </>
                      ) : (
                        <span className="text-cream/30">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-semibold tabular-nums text-white">
                      {formatINR(f.customerTotal)}
                    </td>
                    <td className="px-4 py-3.5 tabular-nums text-cream/70">
                      {formatINR(f.collected)}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3.5 font-semibold tabular-nums",
                        f.balanceDue > 0 ? "text-amber-300" : "text-cream/40"
                      )}
                    >
                      {formatINR(f.balanceDue)}
                    </td>
                    <td className="px-4 py-3.5 tabular-nums text-cream/70">
                      {formatINR(f.driverTotal)}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3.5 font-semibold tabular-nums",
                        f.profit < 0 ? "text-red-300" : "text-gold-300"
                      )}
                    >
                      {formatINR(f.profit)}
                      <span className="ml-1 text-xs font-normal text-cream/35">{f.margin}%</span>
                    </td>
                    <td className="px-4 py-3.5">
                      {!f.closed ? (
                        <button
                          onClick={() => setEditing(b)}
                          className="rounded-lg border border-amber-500/40 px-3 py-1.5 text-xs font-bold text-amber-200 transition-colors hover:bg-amber-500/10"
                        >
                          Close out
                        </button>
                      ) : (
                        <button
                          onClick={() => settle.mutate(b)}
                          disabled={settle.isPending}
                          className={cn(
                            "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-50",
                            b.driverSettled
                              ? "border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10"
                              : "border-white/15 text-cream/70 hover:border-gold-500/40 hover:text-gold-300"
                          )}
                          title={
                            b.driverSettled && b.settledAt
                              ? `Settled ${formatDate(b.settledAt, true)}`
                              : "Mark the driver as paid"
                          }
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Panel>

      {editing && (
        <CloseOutDialog
          key={editing.id}
          booking={editing}
          onClose={() => setEditing(null)}
          onSaved={invalidate}
        />
      )}
    </>
  );
}
