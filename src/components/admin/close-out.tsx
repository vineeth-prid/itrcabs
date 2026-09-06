"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import type { BookingRecord } from "@/lib/booking-store";
import {
  computeRideFinance,
  driverRateCard,
  EXTRA_BILLING,
  type RideExtra,
} from "@/lib/pricing";
import { formatINR, formatDate, cn } from "@/lib/utils";
import { knownDrivers } from "@/lib/analytics";
import { PageTitle, Panel, Field, darkField } from "@/components/admin/ui";
import { Input, Select } from "@/components/ui/input";
import { useAdminBookings } from "@/components/admin/use-admin-bookings";
import { useAdminFleet } from "@/components/admin/use-admin-fleet";

/** Number input that keeps an empty box empty instead of forcing a 0 into it. */
function Money({
  value,
  onChange,
  suffix,
  ...rest
}: {
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <span className="relative block">
      <Input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(darkField, suffix && "pr-12")}
        {...rest}
      />
      {suffix && (
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-cream/35">
          {suffix}
        </span>
      )}
    </span>
  );
}

function Line({
  label,
  value,
  strong,
  tone,
}: {
  label: string;
  value: string;
  strong?: boolean;
  tone?: "good" | "warn" | "bad";
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <span className={cn("text-sm", strong ? "font-semibold text-cream/80" : "text-cream/50")}>
        {label}
      </span>
      <span
        className={cn(
          "tabular-nums",
          strong ? "font-display text-lg font-bold" : "text-sm text-cream/80",
          tone === "good" && "text-gold-300",
          tone === "warn" && "text-amber-300",
          tone === "bad" && "text-red-300",
          !tone && strong && "text-white"
        )}
      >
        {value}
      </span>
    </div>
  );
}

const rule = <div className="my-1 border-t border-white/8" />;

export function CloseOut({ code }: { code: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const { data: bookings = [], isLoading } = useAdminBookings();
  const { data: fleet, isLoading: fleetLoading } = useAdminFleet();

  const booking = bookings.find((b) => b.bookingCode === code || b.id === code);

  /* The form seeds its driver fields from the vehicle rate card, so it must
     not mount before that arrives — otherwise it captures a zero and keeps it. */
  if (isLoading || fleetLoading) {
    return <p className="py-20 text-center text-sm text-cream/40">Loading trip…</p>;
  }
  if (!booking) {
    return (
      <Panel className="border-red-500/30 bg-red-500/10">
        <p className="text-sm text-red-300">No trip found for {code}.</p>
        <Link
          href="/admin/payments"
          className="mt-4 inline-block rounded-full border border-white/15 px-5 py-2 text-sm font-bold text-cream/70 hover:text-white"
        >
          Back to settlements
        </Link>
      </Panel>
    );
  }

  return (
    <CloseOutForm
      key={booking.id}
      booking={booking}
      rates={fleet?.vehicles.find((v) => v.slug === booking.vehicleSlug)}
      drivers={knownDrivers(bookings)}
      onSaved={() => {
        qc.invalidateQueries({ queryKey: ["admin-bookings"] });
        router.push("/admin/payments");
      }}
    />
  );
}

function CloseOutForm({
  booking,
  rates,
  drivers,
  onSaved,
}: {
  booking: BookingRecord;
  rates: Parameters<typeof driverRateCard>[1];
  drivers: { name: string; vehicleNo: string }[];
  onSaved: () => void;
}) {
  const card = driverRateCard(booking, rates);

  /* Every fare field starts from the rate card and stays editable — a trip can
     be quoted on terms that are not on the card, and the payout has to follow
     what was actually agreed. */
  const [f, setF] = useState({
    driverName: booking.driverName ?? "",
    driverVehicleNo: booking.driverVehicleNo ?? "",
    actualKm: booking.actualKm?.toString() ?? "",
    includedKm: String(booking.includedKm),
    estimateTotal: String(booking.estimateTotal),
    extraKmRate: String(booking.extraKmRate),
    driverBaseFare: String(booking.driverBaseFare ?? card.base),
    driverKmRate: String(booking.driverKmRate ?? card.kmRate),
    collectedAmount: String(booking.collectedAmount ?? booking.bookingAmount),
    driverAdvance: String(booking.driverAdvance ?? 0),
  });
  const [extras, setExtras] = useState<RideExtra[]>(booking.extras ?? []);
  const [settled, setSettled] = useState(booking.driverSettled);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof f, v: string) => setF((d) => ({ ...d, [k]: v }));
  const num = (v: string) => (v.trim() === "" ? 0 : Number(v));

  const cleanExtras = useMemo(
    () => extras.filter((e) => e.label.trim() !== "" && Number(e.amount) > 0),
    [extras]
  );

  const km = f.actualKm.trim();
  const fin = computeRideFinance({
    ...booking,
    includedKm: num(f.includedKm),
    estimateTotal: num(f.estimateTotal),
    extraKmRate: num(f.extraKmRate),
    actualKm: km === "" ? null : Number(km),
    collectedAmount: num(f.collectedAmount),
    driverBaseFare: num(f.driverBaseFare),
    driverKmRate: num(f.driverKmRate),
    driverAdvance: num(f.driverAdvance),
    extras: cleanExtras,
  });

  const onDriverPicked = (value: string) => {
    const known = drivers.find((d) => d.name === value);
    setF((d) => ({
      ...d,
      driverName: value,
      driverVehicleNo:
        known?.vehicleNo && !d.driverVehicleNo ? known.vehicleNo : d.driverVehicleNo,
    }));
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
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: booking.id,
          driverName: f.driverName.trim() || null,
          driverVehicleNo: f.driverVehicleNo.trim() || null,
          actualKm: km === "" ? null : Number(km),
          includedKm: num(f.includedKm),
          estimateTotal: num(f.estimateTotal),
          extraKmRate: num(f.extraKmRate),
          driverBaseFare: num(f.driverBaseFare),
          driverKmRate: num(f.driverKmRate),
          driverAdvance: num(f.driverAdvance),
          collectedAmount: num(f.collectedAmount),
          extras: cleanExtras,
          driverSettled: settled,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? `Save failed (${res.status})`);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <PageTitle
        title="Close out trip"
        sub={`${booking.bookingCode} · ${booking.name} · ${booking.vehicleName} · ${formatDate(booking.pickupDate)}`}
      >
        <Link
          href="/admin/payments"
          className="flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm font-bold text-cream/70 transition-colors hover:border-gold-500/40 hover:text-gold-300"
        >
          <ArrowLeft className="size-4" aria-hidden /> Settlements
        </Link>
      </PageTitle>

      <Panel className="mb-5">
        <h2 className="mb-4 text-[10px] font-bold uppercase tracking-wider text-cream/40">
          The trip
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Field label="Driver" hint="Who ran this trip">
            <Input
              list="known-drivers"
              value={f.driverName}
              onChange={(e) => onDriverPicked(e.target.value)}
              placeholder="Driver name"
              className={darkField}
            />
          </Field>
          <Field label="Car number" hint="Registration on the trip sheet">
            <Input
              value={f.driverVehicleNo}
              onChange={(e) => set("driverVehicleNo", e.target.value.toUpperCase())}
              placeholder="KL 07 AB 1234"
              className={darkField}
            />
          </Field>
          <datalist id="known-drivers">
            {drivers.map((d) => (
              <option key={d.name} value={d.name} />
            ))}
          </datalist>
          <Field label="Total journey" hint="Odometer reading for the whole trip" >
            <Money
              value={f.actualKm}
              onChange={(v) => set("actualKm", v)}
              max={20000}
              placeholder="Not recorded"
              suffix="km"
            />
          </Field>
          <Field label="Included km" hint="Covered by both base fares">
            <Money value={f.includedKm} onChange={(v) => set("includedKm", v)} suffix="km" />
          </Field>
        </div>
        <p className="mt-4 text-sm text-cream/50">
          {fin.closed ? (
            <>
              <strong className="text-white">{fin.extraKm} km</strong> beyond the{" "}
              {fin.includedKm} km allowance.
            </>
          ) : (
            "Enter the odometer reading to price the trip — until then both sides are minimums."
          )}
        </p>
      </Panel>

      <Panel className="mb-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-cream/40">
            Tolls, parking &amp; other costs
          </h2>
          <button
            type="button"
            onClick={() => setExtras((l) => [...l, { label: "", amount: 0, billing: "both" }])}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-bold text-cream/70 transition-colors hover:border-gold-500/40 hover:text-gold-300"
          >
            <Plus className="size-3.5" aria-hidden /> Add cost
          </button>
        </div>
        {extras.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/10 px-4 py-3 text-xs text-cream/35">
            Nothing extra on this trip. A toll the driver paid should be billed to the customer
            and reimbursed to the driver — that is the default.
          </p>
        ) : (
          <ul className="space-y-2">
            {extras.map((e, i) => (
              <li key={i} className="flex flex-wrap items-center gap-2">
                <Input
                  value={e.label}
                  onChange={(ev) =>
                    setExtras((l) => l.map((x, n) => (n === i ? { ...x, label: ev.target.value } : x)))
                  }
                  placeholder="Toll · parking · permit"
                  aria-label={`Cost ${i + 1} description`}
                  className={cn(darkField, "h-11 min-w-40 flex-1")}
                />
                <Input
                  type="number"
                  min={0}
                  value={e.amount || ""}
                  onChange={(ev) =>
                    setExtras((l) =>
                      l.map((x, n) => (n === i ? { ...x, amount: Number(ev.target.value) } : x))
                    )
                  }
                  placeholder="₹0"
                  aria-label={`Cost ${i + 1} amount`}
                  className={cn(darkField, "h-11 w-28")}
                />
                <Select
                  value={e.billing}
                  onChange={(ev) =>
                    setExtras((l) =>
                      l.map((x, n) =>
                        n === i ? { ...x, billing: ev.target.value as RideExtra["billing"] } : x
                      )
                    )
                  }
                  aria-label={`Cost ${i + 1} billing`}
                  className={cn(darkField, "h-11 w-60")}
                >
                  {EXTRA_BILLING.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
                <button
                  type="button"
                  onClick={() => setExtras((l) => l.filter((_, n) => n !== i))}
                  aria-label={`Remove cost ${i + 1}`}
                  className="rounded-lg border border-white/10 p-2.5 text-cream/50 transition-colors hover:border-red-500/40 hover:text-red-300"
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {/* The two sides sit next to each other so the whole close-out fits on
          one screen — no scrolling between the numbers you are comparing. */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel>
          <h2 className="mb-4 font-display text-lg font-bold text-white">Customer bill</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Base fare" hint={`Covers ${fin.includedKm} km`}>
              <Money value={f.estimateTotal} onChange={(v) => set("estimateTotal", v)} suffix="₹" />
            </Field>
            <Field label="Extra km rate" hint="Charged beyond the allowance">
              <Money value={f.extraKmRate} onChange={(v) => set("extraKmRate", v)} suffix="₹/km" />
            </Field>
          </div>
          <div className="mt-5 rounded-xl bg-white/[0.03] px-4 py-2">
            <Line label={`Base fare (${fin.includedKm} km)`} value={formatINR(fin.minimumFare)} />
            <Line
              label={`Extra km — ${fin.extraKm} × ₹${num(f.extraKmRate)}`}
              value={formatINR(fin.extraCharge)}
            />
            {fin.extrasCustomer > 0 && (
              <Line label="Tolls & other costs" value={formatINR(fin.extrasCustomer)} />
            )}
            {rule}
            <Line label="Customer total" value={formatINR(fin.customerTotal)} strong />
          </div>
          <div className="mt-4">
            <Field label="Collected so far" hint="Advance or part payment taken">
              <Money
                value={f.collectedAmount}
                onChange={(v) => set("collectedAmount", v)}
                suffix="₹"
              />
            </Field>
          </div>
          <div className="mt-3 rounded-xl bg-white/[0.03] px-4 py-2">
            <Line
              label="Balance to collect"
              value={fin.closed ? formatINR(fin.balanceDue) : "—"}
              strong
              tone={fin.balanceDue > 0 ? "warn" : undefined}
            />
          </div>
        </Panel>

        <Panel>
          <h2 className="mb-4 font-display text-lg font-bold text-white">Driver payout</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Base fare" hint={`Rate card: ${formatINR(card.base)}`}>
              <Money
                value={f.driverBaseFare}
                onChange={(v) => set("driverBaseFare", v)}
                suffix="₹"
              />
            </Field>
            <Field label="Extra km rate" hint={`Rate card: ₹${card.kmRate}/km`}>
              <Money value={f.driverKmRate} onChange={(v) => set("driverKmRate", v)} suffix="₹/km" />
            </Field>
          </div>
          <div className="mt-5 rounded-xl bg-white/[0.03] px-4 py-2">
            <Line label={`Base fare (${fin.includedKm} km)`} value={formatINR(fin.driverBase)} />
            <Line
              label={`Extra km — ${fin.extraKm} × ₹${fin.driverKmRate}`}
              value={formatINR(fin.driverExtra)}
            />
            {fin.extrasDriver > 0 && (
              <Line label="Reimbursed costs" value={formatINR(fin.extrasDriver)} />
            )}
            {rule}
            <Line label="Driver total" value={formatINR(fin.driverTotal)} strong />
          </div>
          <div className="mt-4">
            <Field label="Advance paid" hint="Cash already handed to the driver">
              <Money value={f.driverAdvance} onChange={(v) => set("driverAdvance", v)} suffix="₹" />
            </Field>
          </div>
          <div className="mt-3 rounded-xl bg-white/[0.03] px-4 py-2">
            <Line label="To pay driver" value={formatINR(fin.driverDue)} strong tone="good" />
          </div>
        </Panel>
      </div>

      <Panel className="mt-5 flex flex-wrap items-center justify-between gap-5">
        <div className="flex flex-wrap items-center gap-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-cream/40">Profit</p>
            <p
              className={cn(
                "font-display text-2xl font-bold tabular-nums",
                !fin.closed ? "text-cream/40" : fin.profit < 0 ? "text-red-300" : "text-gold-300"
              )}
            >
              {fin.closed ? formatINR(fin.profit) : "—"}
              {fin.closed && (
                <span className="ml-2 text-sm font-normal text-cream/40">{fin.margin}%</span>
              )}
            </p>
          </div>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 px-4 py-3">
            <input
              type="checkbox"
              checked={settled}
              onChange={(e) => setSettled(e.target.checked)}
              className="size-4 accent-gold-500"
            />
            <span className="text-sm font-semibold text-cream/80">
              {f.driverName.trim() || "Driver"} has been paid {formatINR(fin.driverDue)}
            </span>
          </label>
        </div>

        <div className="flex gap-3">
          <Link
            href="/admin/payments"
            className="rounded-full border border-white/10 px-6 py-2.5 text-sm font-bold text-cream/70 transition-colors hover:border-white/25 hover:text-white"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-full bg-gradient-gold px-6 py-2.5 text-sm font-bold text-ink shadow-glow transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {saving && <Loader2 className="size-4 animate-spin" aria-hidden />}
            Save close-out
          </button>
        </div>
      </Panel>

      {error && (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </p>
      )}
    </form>
  );
}
