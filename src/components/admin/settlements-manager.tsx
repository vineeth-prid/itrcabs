"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Plus, RefreshCw, Trash2, X } from "lucide-react";
import type { BookingRecord } from "@/lib/booking-store";
import { computeRideFinance, EXTRA_BILLING, type RideExtra } from "@/lib/pricing";
import { formatINR, formatDate, cn } from "@/lib/utils";
import { summarise, inRange, matches, byDriver, knownDrivers } from "@/lib/analytics";
import { PageTitle, Panel, StatCard, Field, darkField } from "@/components/admin/ui";
import { FilterBar, useDateRange, filterChip } from "@/components/admin/filter-bar";
import { Input, Select } from "@/components/ui/input";
import { useAdminBookings } from "@/components/admin/use-admin-bookings";
import { useAdminFleet } from "@/components/admin/use-admin-fleet";

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

function CloseOutDialog({
  booking,
  drivers,
  onClose,
  onSaved,
}: {
  booking: BookingRecord;
  drivers: { name: string; vehicleNo: string }[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [driverName, setDriverName] = useState(booking.driverName ?? "");
  const [vehicleNo, setVehicleNo] = useState(booking.driverVehicleNo ?? "");
  const [actualKm, setActualKm] = useState(booking.actualKm?.toString() ?? "");
  const [collected, setCollected] = useState(
    (booking.collectedAmount ?? booking.bookingAmount).toString()
  );
  const [driverOverride, setDriverOverride] = useState(booking.driverAmount?.toString() ?? "");
  const [extras, setExtras] = useState<RideExtra[]>(booking.extras ?? []);
  const [settled, setSettled] = useState(booking.driverSettled);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  /* The vehicle's driver rates make the preview exact: extra kilometres cost
     the driver too, so the payout moves with the odometer, not just the fare. */
  const { data: fleet } = useAdminFleet();
  const rates = fleet?.vehicles.find((v) => v.slug === booking.vehicleSlug);

  /* Blank rows are scratch space until they have a label and an amount. */
  const cleanExtras = extras.filter((e) => e.label.trim() !== "" && Number(e.amount) > 0);
  const setExtra = (i: number, patch: Partial<RideExtra>) =>
    setExtras((list) => list.map((e, n) => (n === i ? { ...e, ...patch } : e)));

  const km = actualKm.trim();
  const preview = computeRideFinance(
    {
      ...booking,
      actualKm: km === "" ? null : Number(km),
      driverAmount: driverOverride === "" ? null : Number(driverOverride),
      collectedAmount: collected === "" ? null : Number(collected),
      extras: cleanExtras,
    },
    rates
  );
  /* Until the fleet loads, fall back to the payout the server last computed. */
  const driverTotal =
    rates || driverOverride !== "" ? preview.driverTotal : booking.finance.driverTotal;
  const profit = preview.customerTotal - driverTotal;

  /* Picking a known driver fills in the car they usually drive. */
  const onDriverPicked = (value: string) => {
    setDriverName(value);
    const known = drivers.find((d) => d.name === value);
    if (known?.vehicleNo && !vehicleNo) setVehicleNo(known.vehicleNo);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (settled && km === "") {
      setError("Record the odometer reading before marking the driver paid.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await patchBooking({
        id: booking.id,
        driverName: driverName.trim() || null,
        driverVehicleNo: vehicleNo.trim() || null,
        actualKm: km === "" ? null : Number(km),
        collectedAmount: collected === "" ? null : Number(collected),
        driverAmount: driverOverride === "" ? null : Number(driverOverride),
        extras: cleanExtras,
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
      className="m-auto w-[min(36rem,92vw)] rounded-2xl border border-white/10 bg-ink p-0 text-cream backdrop:bg-ink/80 backdrop:backdrop-blur-sm"
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
          <Field label="Driver" hint="Who ran this trip">
            <Input
              list="known-drivers"
              value={driverName}
              onChange={(e) => onDriverPicked(e.target.value)}
              placeholder="Driver name"
              className={darkField}
            />
          </Field>
          <Field label="Car number" hint="Registration on the trip sheet">
            <Input
              value={vehicleNo}
              onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
              placeholder="KL 07 AB 1234"
              className={darkField}
            />
          </Field>
          <datalist id="known-drivers">
            {drivers.map((d) => (
              <option key={d.name} value={d.name} />
            ))}
          </datalist>

          <Field
            label="Odometer — km run"
            hint={`${booking.includedKm} km included in the minimum fare`}
          >
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
                placeholder={String(driverTotal)}
                className={darkField}
              />
            </Field>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-cream/40">
              Tolls, parking & other costs
            </p>
            <button
              type="button"
              onClick={() =>
                setExtras((list) => [...list, { label: "", amount: 0, billing: "both" }])
              }
              className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-bold text-cream/70 transition-colors hover:border-gold-500/40 hover:text-gold-300"
            >
              <Plus className="size-3.5" aria-hidden /> Add cost
            </button>
          </div>
          {extras.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/10 px-4 py-3 text-xs text-cream/35">
              Nothing extra on this trip. Add a toll, parking fee or permit and it lands on the
              customer&rsquo;s bill, the driver&rsquo;s payout, or both.
            </p>
          ) : (
            <ul className="space-y-2">
              {extras.map((e, i) => (
                <li key={i} className="flex flex-wrap items-center gap-2">
                  <Input
                    value={e.label}
                    onChange={(ev) => setExtra(i, { label: ev.target.value })}
                    placeholder="Toll · parking · permit"
                    aria-label={`Cost ${i + 1} description`}
                    className={cn(darkField, "h-11 min-w-40 flex-1")}
                  />
                  <Input
                    type="number"
                    min={0}
                    value={e.amount || ""}
                    onChange={(ev) => setExtra(i, { amount: Number(ev.target.value) })}
                    placeholder="₹0"
                    aria-label={`Cost ${i + 1} amount`}
                    className={cn(darkField, "h-11 w-28")}
                  />
                  <Select
                    value={e.billing}
                    onChange={(ev) =>
                      setExtra(i, { billing: ev.target.value as RideExtra["billing"] })
                    }
                    aria-label={`Cost ${i + 1} billing`}
                    className={cn(darkField, "h-11 w-56")}
                  >
                    {EXTRA_BILLING.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </Select>
                  <button
                    type="button"
                    onClick={() => setExtras((list) => list.filter((_, n) => n !== i))}
                    aria-label={`Remove cost ${i + 1}`}
                    className="rounded-lg border border-white/10 p-2.5 text-cream/50 transition-colors hover:border-red-500/40 hover:text-red-300"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6 rounded-xl border border-white/8 bg-white/[0.03] p-4">
          <Row label="Minimum fare" value={formatINR(preview.minimumFare)} />
          <Row
            label={`Extra km (${preview.extraKm} × ₹${booking.extraKmRate})`}
            value={formatINR(preview.extraCharge)}
          />
          {preview.extrasCustomer > 0 && (
            <Row label="Tolls, parking & other" value={formatINR(preview.extrasCustomer)} />
          )}
          <Row label="Customer total" value={formatINR(preview.customerTotal)} strong />
          <div className="my-2 border-t border-white/8" />
          <Row label="Collected" value={formatINR(preview.collected)} />
          <Row label="Balance to collect" value={formatINR(preview.balanceDue)} strong />
          <div className="my-2 border-t border-white/8" />
          {preview.extrasDriver > 0 && (
            <Row label="Reimbursed to driver" value={formatINR(preview.extrasDriver)} />
          )}
          <Row label="Driver payout" value={formatINR(driverTotal)} />
          <div className="flex justify-between gap-4 py-1.5 text-sm">
            <span className="text-cream/50">Profit</span>
            <span
              className={cn("font-bold tabular-nums", profit < 0 ? "text-red-300" : "text-gold-300")}
            >
              {formatINR(profit)}
            </span>
          </div>
          {!preview.closed && (
            <p className="mt-3 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
              Provisional — these stay minimums until the odometer reading goes in.
            </p>
          )}
        </div>

        <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 px-4 py-3">
          <input
            type="checkbox"
            checked={settled}
            onChange={(e) => setSettled(e.target.checked)}
            className="size-4 accent-gold-500"
          />
          <span className="text-sm font-semibold text-cream/80">
            {driverName.trim() || "Driver"} has been paid {formatINR(driverTotal)}
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
  const dates = useDateRange("month");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("closeout");
  const [editing, setEditing] = useState<BookingRecord | null>(null);
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
  const driverOptions = useMemo(() => knownDrivers(bookings), [bookings]);

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
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/8 text-[11px] uppercase tracking-wider text-cream/40">
                {[
                  "Trip", "Pickup", "Driver", "Km", "Customer total",
                  "Collected", "Balance", "Driver pay", "Profit", "Settlement",
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
                        <button
                          onClick={() => setEditing(b)}
                          className="whitespace-nowrap rounded-lg border border-amber-500/40 px-3 py-1.5 text-xs font-bold text-amber-200 transition-colors hover:bg-amber-500/10"
                        >
                          Close out
                        </button>
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
          drivers={driverOptions}
          onClose={() => setEditing(null)}
          onSaved={invalidate}
        />
      )}
    </>
  );
}
