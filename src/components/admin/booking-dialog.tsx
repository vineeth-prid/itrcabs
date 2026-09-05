"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import type { BookingRecord } from "@/lib/booking-store";
import type { VehicleSpec } from "@/config/fleet";
import { computePricing } from "@/lib/pricing";
import { formatINR, isoDate, isoDateOffset, cn } from "@/lib/utils";
import { Input, Select } from "@/components/ui/input";
import { Field, darkField as dark } from "@/components/admin/ui";

type AdminVehicle = VehicleSpec & { available: boolean };

const STATUSES = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;

/** Every field is held as a string — the form is the source of truth until submit. */
type Draft = Record<string, string>;

function toDraft(b?: BookingRecord): Draft {
  const tomorrow = isoDateOffset(1);
  return {
    name: b?.name ?? "",
    phone: b?.phone ?? "",
    email: b?.email ?? "",
    pickup: b?.pickup ?? "",
    destination: b?.destination ?? "",
    pickupDate: b ? isoDate(b.pickupDate) : tomorrow,
    pickupTime: b?.pickupTime ?? "09:00",
    tripType: b?.tripType ?? "ONE_DAY",
    days: String(b?.days ?? 1),
    passengers: String(b?.passengers ?? 4),
    vehicleSlug: b?.vehicleSlug ?? "",
    status: b?.status ?? "PENDING",
    estimateTotal: b ? String(b.estimateTotal) : "",
    bookingAmount: String(b?.bookingAmount ?? 199),
  };
}

export function BookingDialog({
  booking,
  onClose,
  onSaved,
}: {
  /** Undefined = create a new booking. */
  booking?: BookingRecord;
  onClose: () => void;
  onSaved: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<Draft>(() => toDraft(booking));
  const [fareTouched, setFareTouched] = useState(Boolean(booking));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: vehicles = [] } = useQuery<AdminVehicle[]>({
    queryKey: ["admin-fleet"],
    queryFn: async () => {
      const res = await fetch("/api/admin/fleet");
      if (!res.ok) throw new Error("Failed to load fleet");
      return (await res.json()).vehicles;
    },
  });

  useEffect(() => ref.current?.showModal(), []);

  const set = (k: string, v: string) => setDraft((d) => ({ ...d, [k]: v }));

  const vehicle = vehicles.find((v) => v.slug === draft.vehicleSlug);
  const days = draft.tripType === "ONE_DAY" ? 1 : Math.max(2, Number(draft.days) || 2);
  const suggested = vehicle
    ? computePricing(vehicle, draft.tripType as BookingRecord["tripType"], days)
    : null;

  /* Keep the fare in step with vehicle/trip changes until an admin types their own number. */
  useEffect(() => {
    if (!fareTouched && suggested) set("estimateTotal", String(suggested.estimateTotal));
  }, [fareTouched, suggested?.estimateTotal]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      ...(booking && { id: booking.id }),
      name: draft.name.trim(),
      phone: draft.phone.trim(),
      email: draft.email.trim(),
      pickup: draft.pickup.trim(),
      destination: draft.destination.trim(),
      pickupDate: draft.pickupDate,
      pickupTime: draft.pickupTime,
      tripType: draft.tripType,
      days,
      passengers: Number(draft.passengers),
      vehicleSlug: draft.vehicleSlug,
      status: draft.status,
      estimateTotal: Number(draft.estimateTotal),
      bookingAmount: Number(draft.bookingAmount),
    };
    try {
      const res = await fetch("/api/admin/bookings", {
        method: booking ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Save failed");
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current?.close()}
      className="m-auto w-[min(46rem,92vw)] rounded-2xl border border-white/10 bg-ink p-0 text-cream backdrop:bg-ink/80 backdrop:backdrop-blur-sm"
    >
      <form onSubmit={submit} className="max-h-[88vh] overflow-y-auto p-6 sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-white">
              {booking ? "Edit booking" : "New booking"}
            </h2>
            <p className="mt-1 text-sm text-cream/50">
              {booking ? booking.bookingCode : "Log a phone or walk-in booking"}
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
          <Field label="Customer name">
            <Input
              required
              minLength={2}
              value={draft.name}
              onChange={(e) => set("name", e.target.value)}
              className={dark}
            />
          </Field>
          <Field label="Phone" hint="10-digit mobile, starting 6-9">
            <Input
              required
              inputMode="numeric"
              pattern="[6-9][0-9]{9}"
              value={draft.phone}
              onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
              className={dark}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Email (optional)">
              <Input
                type="email"
                value={draft.email}
                onChange={(e) => set("email", e.target.value)}
                className={dark}
              />
            </Field>
          </div>

          <Field label="Pickup">
            <Input
              required
              minLength={3}
              value={draft.pickup}
              onChange={(e) => set("pickup", e.target.value)}
              className={dark}
            />
          </Field>
          <Field label="Destination">
            <Input
              required
              minLength={3}
              value={draft.destination}
              onChange={(e) => set("destination", e.target.value)}
              className={dark}
            />
          </Field>

          <Field label="Pickup date">
            <Input
              required
              type="date"
              value={draft.pickupDate}
              onChange={(e) => set("pickupDate", e.target.value)}
              className={dark}
            />
          </Field>
          <Field label="Pickup time">
            <Input
              required
              type="time"
              value={draft.pickupTime}
              onChange={(e) => set("pickupTime", e.target.value)}
              className={dark}
            />
          </Field>

          <Field label="Trip type">
            <Select
              value={draft.tripType}
              onChange={(e) => set("tripType", e.target.value)}
              className={dark}
            >
              <option value="ONE_DAY">One day</option>
              <option value="MULTI_DAY">Multi day</option>
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Days">
              <Input
                type="number"
                min={draft.tripType === "ONE_DAY" ? 1 : 2}
                max={30}
                disabled={draft.tripType === "ONE_DAY"}
                value={draft.tripType === "ONE_DAY" ? 1 : draft.days}
                onChange={(e) => set("days", e.target.value)}
                className={cn(dark, "disabled:opacity-40")}
              />
            </Field>
            <Field label="Passengers">
              <Input
                required
                type="number"
                min={1}
                max={26}
                value={draft.passengers}
                onChange={(e) => set("passengers", e.target.value)}
                className={dark}
              />
            </Field>
          </div>

          <Field label="Vehicle">
            <Select
              required
              value={draft.vehicleSlug}
              onChange={(e) => set("vehicleSlug", e.target.value)}
              className={dark}
            >
              <option value="" disabled>
                Select a vehicle
              </option>
              {vehicles.map((v) => (
                <option key={v.slug} value={v.slug}>
                  {v.name} - {v.seats} seats{v.available ? "" : " (unavailable)"}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Status">
            <Select
              value={draft.status}
              onChange={(e) => set("status", e.target.value)}
              className={dark}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Fare estimate"
            hint={
              suggested
                ? `Calculated: ${formatINR(suggested.estimateTotal)} · ${suggested.includedKm} km included`
                : "Pick a vehicle to see the calculated fare"
            }
          >
            <Input
              required
              type="number"
              min={0}
              value={draft.estimateTotal}
              onChange={(e) => {
                setFareTouched(true);
                set("estimateTotal", e.target.value);
              }}
              className={dark}
            />
          </Field>
          <Field label="Booking amount" hint="Deposit collected up front">
            <Input
              required
              type="number"
              min={0}
              value={draft.bookingAmount}
              onChange={(e) => set("bookingAmount", e.target.value)}
              className={dark}
            />
          </Field>
        </div>

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
            {booking ? "Save changes" : "Create booking"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
