"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, ImageOff, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { categories, type Illustration } from "@/config/fleet";
import { VehicleIllustration } from "@/components/brand/vehicle-illustration";
import { formatINR, cn } from "@/lib/utils";
import { PageTitle, Panel, Field, darkField } from "@/components/admin/ui";
import { Input, Select } from "@/components/ui/input";
import { useAdminFleet, type AdminVehicle } from "@/components/admin/use-admin-fleet";

const ILLUSTRATIONS: Illustration[] = ["sedan", "suv", "suv-luxury", "mpv", "tempo", "urbania"];

async function callFleet(method: "POST" | "PATCH" | "DELETE", body: Record<string, unknown>) {
  const res = await fetch("/api/admin/fleet", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? `Request failed (${res.status})`);
  return json;
}

/** The vehicle's photo, falling back to the vector illustration. */
function VehicleThumb({ v }: { v: AdminVehicle }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [v.imageUrl]);

  if (!v.imageUrl || failed) {
    return (
      <div className="px-6 py-2 opacity-90">
        <VehicleIllustration variant={v.illustration} />
      </div>
    );
  }
  return (
    <div className="relative my-2 aspect-[8/5] overflow-hidden rounded-xl bg-white/5">
      {/* A remote URL an admin pasted can point anywhere, so this stays a plain
          <img>: next/image would need every host allow-listed in the config. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={v.imageUrl}
        alt={v.name}
        onError={() => setFailed(true)}
        className="size-full object-cover"
      />
    </div>
  );
}

function PriceField({
  label,
  value,
  min,
  max,
  onSave,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onSave: (v: number) => Promise<void>;
}) {
  const [draft, setDraft] = useState(String(value));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  /* Keep the field in sync when the server value changes (refetch after save) */
  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const num = Number(draft);
  const dirty = draft !== "" && num !== value;
  const invalid = draft === "" || Number.isNaN(num) || num < min || num > max;

  const save = async () => {
    if (!dirty || invalid || saving) return;
    setSaving(true);
    setError(null);
    try {
      await onSave(num);
      setSaved(true);
      setTimeout(() => setSaved(false), 1600);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <label className="block">
        <span className="text-[10px] font-bold uppercase tracking-wider text-cream/40">{label}</span>
        <span className="relative mt-1 block">
          <input
            type="number"
            inputMode="numeric"
            value={draft}
            min={min}
            max={max}
            onChange={(e) => {
              setDraft(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && save()}
            onBlur={() => {
              if (draft === "") setDraft(String(value));
            }}
            aria-label={label}
            aria-invalid={dirty && invalid}
            className={cn(
              "w-full rounded-lg border bg-ink py-2 pl-3 pr-9 text-sm font-bold text-white transition-colors focus:outline-none",
              "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
              dirty && invalid
                ? "border-red-500/60 focus:border-red-400"
                : "border-white/10 focus:border-gold-500"
            )}
          />
          {/* Save affordance overlays inside the field — never squeezes the value */}
          {(dirty || saving || saved) && (
            <button
              onClick={save}
              disabled={saving || invalid}
              className={cn(
                "absolute right-1 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md transition-colors",
                saved
                  ? "bg-emerald-500 text-white"
                  : invalid
                    ? "bg-white/10 text-white/30"
                    : "bg-gradient-gold text-ink"
              )}
              aria-label={`Save ${label}`}
              title={invalid ? `Enter ${min}–${max}` : `Save ${label}`}
            >
              {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
            </button>
          )}
        </span>
      </label>
      {error && <p className="mt-1 text-[10px] font-semibold text-red-400">{error}</p>}
      {dirty && invalid && (
        <p className="mt-1 text-[10px] font-semibold text-red-400">
          ₹{min.toLocaleString("en-IN")}–{max.toLocaleString("en-IN")}
        </p>
      )}
    </div>
  );
}

/** Add a vehicle, or edit the details and photo of one that exists. */
function VehicleDialog({
  vehicle,
  onClose,
  onSaved,
}: {
  /** Undefined = add a new vehicle. */
  vehicle?: AdminVehicle;
  onClose: () => void;
  onSaved: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const editing = Boolean(vehicle);
  const [f, setF] = useState({
    name: vehicle?.name ?? "",
    category: vehicle?.category ?? "SEDAN",
    seats: String(vehicle?.seats ?? 4),
    luggage: String(vehicle?.luggage ?? 2),
    examples: vehicle?.examples ?? "",
    illustration: vehicle?.illustration ?? "sedan",
    imageUrl: vehicle?.imageUrl ?? "",
    basePrice: String(vehicle?.basePrice ?? 2500),
    perDayPrice: String(vehicle?.perDayPrice ?? 3000),
    extraKmRate: String(vehicle?.extraKmRate ?? 15),
    driverBata: String(vehicle?.driverBata ?? 400),
    driverBasePrice: String(vehicle?.driverBasePrice ?? 2200),
    driverPerDayPrice: String(vehicle?.driverPerDayPrice ?? 2650),
    driverExtraKmRate: String(vehicle?.driverExtraKmRate ?? 13),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  const set = (k: keyof typeof f, v: string) => setF((d) => ({ ...d, [k]: v }));
  const n = (v: string) => Number(v || 0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        /* Category and illustration are structural — changing them on a live
           vehicle would rewrite how it appears on the public site mid-booking,
           so an existing vehicle edits its details and photo only. */
        await callFleet("PATCH", {
          slug: vehicle!.slug,
          name: f.name.trim(),
          seats: n(f.seats),
          luggage: n(f.luggage),
          examples: f.examples.trim(),
          imageUrl: f.imageUrl.trim(),
        });
      } else {
        await callFleet("POST", {
          name: f.name.trim(),
          category: f.category,
          seats: n(f.seats),
          luggage: n(f.luggage),
          examples: f.examples.trim(),
          illustration: f.illustration,
          imageUrl: f.imageUrl.trim(),
          basePrice: n(f.basePrice),
          perDayPrice: n(f.perDayPrice),
          extraKmRate: n(f.extraKmRate),
          driverBata: n(f.driverBata),
          driverBasePrice: n(f.driverBasePrice),
          driverPerDayPrice: n(f.driverPerDayPrice),
          driverExtraKmRate: n(f.driverExtraKmRate),
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      setSaving(false);
    }
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current?.close()}
      className="m-auto w-[min(42rem,92vw)] rounded-2xl border border-white/10 bg-ink p-0 text-cream backdrop:bg-ink/80 backdrop:backdrop-blur-sm"
    >
      <form onSubmit={submit} className="max-h-[88vh] overflow-y-auto p-6 sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-white">
              {editing ? "Edit vehicle" : "Add a vehicle"}
            </h2>
            <p className="mt-1 text-sm text-cream/50">
              {editing
                ? "Rates stay on the card behind — this is the details and photo"
                : "It goes live on the booking engine straight away"}
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
          <Field label="Name">
            <Input
              required
              minLength={2}
              value={f.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Toyota Innova Crysta"
              className={darkField}
            />
          </Field>
          <Field label="Example models" hint="Shown under the name">
            <Input
              value={f.examples}
              onChange={(e) => set("examples", e.target.value)}
              placeholder="Crysta · Hycross"
              className={darkField}
            />
          </Field>
          <Field label="Seats">
            <Input
              required
              type="number"
              min={1}
              max={60}
              value={f.seats}
              onChange={(e) => set("seats", e.target.value)}
              className={darkField}
            />
          </Field>
          <Field label="Luggage" hint="Bags it takes">
            <Input
              required
              type="number"
              min={0}
              max={60}
              value={f.luggage}
              onChange={(e) => set("luggage", e.target.value)}
              className={darkField}
            />
          </Field>

          {!editing && (
            <>
              <Field label="Category">
                <Select
                  value={f.category}
                  onChange={(e) => set("category", e.target.value)}
                  className={darkField}
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Illustration" hint="Used when there is no photo">
                <Select
                  value={f.illustration}
                  onChange={(e) => set("illustration", e.target.value)}
                  className={darkField}
                >
                  {ILLUSTRATIONS.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </Select>
              </Field>
            </>
          )}

          <div className="sm:col-span-2">
            <Field
              label="Photo URL"
              hint="Paste a link to the image. Leave empty to use the illustration."
            >
              <Input
                type="url"
                value={f.imageUrl}
                onChange={(e) => set("imageUrl", e.target.value)}
                placeholder="https://…/innova.jpg"
                className={darkField}
              />
            </Field>
            {f.imageUrl.trim() !== "" && (
              <div className="mt-3 aspect-[8/5] w-56 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={f.imageUrl}
                  alt="Preview"
                  className="size-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          {!editing && (
            <>
              <div className="mt-2 sm:col-span-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-cream/40">
                  What the customer pays
                </p>
              </div>
              <Field label="One-day minimum">
                <Input
                  required
                  type="number"
                  min={0}
                  value={f.basePrice}
                  onChange={(e) => set("basePrice", e.target.value)}
                  className={darkField}
                />
              </Field>
              <Field label="Multi-day per day">
                <Input
                  required
                  type="number"
                  min={0}
                  value={f.perDayPrice}
                  onChange={(e) => set("perDayPrice", e.target.value)}
                  className={darkField}
                />
              </Field>
              <Field label="Extra km rate">
                <Input
                  required
                  type="number"
                  min={0}
                  value={f.extraKmRate}
                  onChange={(e) => set("extraKmRate", e.target.value)}
                  className={darkField}
                />
              </Field>
              <Field label="Driver bata" hint="Per day on multi-day trips">
                <Input
                  required
                  type="number"
                  min={0}
                  value={f.driverBata}
                  onChange={(e) => set("driverBata", e.target.value)}
                  className={darkField}
                />
              </Field>

              <div className="mt-2 sm:col-span-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-cream/40">
                  What the driver is paid
                </p>
              </div>
              <Field label="One-day base">
                <Input
                  required
                  type="number"
                  min={0}
                  value={f.driverBasePrice}
                  onChange={(e) => set("driverBasePrice", e.target.value)}
                  className={darkField}
                />
              </Field>
              <Field label="Multi-day per day">
                <Input
                  required
                  type="number"
                  min={0}
                  value={f.driverPerDayPrice}
                  onChange={(e) => set("driverPerDayPrice", e.target.value)}
                  className={darkField}
                />
              </Field>
              <Field label="Extra km rate">
                <Input
                  required
                  type="number"
                  min={0}
                  value={f.driverExtraKmRate}
                  onChange={(e) => set("driverExtraKmRate", e.target.value)}
                  className={darkField}
                />
              </Field>
              <div className="self-end pb-1 text-xs text-cream/40">
                Margin{" "}
                <strong
                  className={cn(
                    n(f.basePrice) - n(f.driverBasePrice) < 0 ? "text-red-300" : "text-gold-300"
                  )}
                >
                  {formatINR(n(f.basePrice) - n(f.driverBasePrice))}
                </strong>{" "}
                per one-day trip
              </div>
            </>
          )}
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
            {editing ? "Save changes" : "Add vehicle"}
          </button>
        </div>
      </form>
    </dialog>
  );
}

export function FleetManager() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useAdminFleet();
  const vehicles = data?.vehicles ?? [];
  /* null = closed, undefined = add, a vehicle = edit */
  const [dialog, setDialog] = useState<AdminVehicle | undefined | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-fleet"] });

  const patch = useMutation({
    mutationFn: (payload: { slug: string } & Partial<AdminVehicle>) => callFleet("PATCH", payload),
    onSuccess: invalidate,
    onError: (e: Error) => setActionError(e.message),
  });

  const remove = useMutation({
    mutationFn: (slug: string) => callFleet("DELETE", { slug }),
    onSuccess: invalidate,
    onError: (e: Error) => setActionError(e.message),
  });

  return (
    <>
      <PageTitle
        title="Fleet"
        sub={
          data?.source === "database"
            ? "Editing live database records"
            : "Demo mode — edits persist for this server session"
        }
      >
        <button
          onClick={() => setDialog(undefined)}
          className="flex items-center gap-2 rounded-full bg-gradient-gold px-6 py-2.5 text-sm font-bold text-ink shadow-glow transition-transform hover:-translate-y-0.5"
        >
          <Plus className="size-4" aria-hidden /> Add vehicle
        </button>
      </PageTitle>

      {actionError && (
        <p
          role="alert"
          className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {actionError}
        </p>
      )}

      {error ? (
        <Panel className="border-red-500/30 bg-red-500/10">
          <p className="py-10 text-center text-sm text-red-300">
            {error instanceof Error ? error.message : "Could not load the fleet."}
          </p>
        </Panel>
      ) : isLoading ? (
        <Panel>
          <p className="py-16 text-center text-sm text-cream/40">Loading fleet…</p>
        </Panel>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {vehicles.map((v) => {
            const margin = v.basePrice - v.driverBasePrice;
            return (
              <Panel key={v.slug} className={cn("transition-opacity", !v.available && "opacity-55")}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-lg font-bold text-white">{v.name}</h2>
                    <p className="truncate text-xs text-cream/40">
                      {v.examples || v.categoryLabel} · {v.seats} seats
                      {!v.imageUrl && (
                        <span className="ml-1 inline-flex items-center gap-1 text-cream/30">
                          <ImageOff className="size-3" aria-hidden /> no photo
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    role="switch"
                    aria-checked={v.available}
                    aria-label={`${v.name} availability`}
                    onClick={() => patch.mutate({ slug: v.slug, available: !v.available })}
                    className={cn(
                      "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                      v.available ? "bg-gradient-gold" : "bg-white/15"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 size-5 rounded-full bg-white shadow transition-all",
                        v.available ? "left-[22px]" : "left-0.5"
                      )}
                    />
                  </button>
                </div>

                <VehicleThumb v={v} />

                <div className="mb-3 flex gap-2">
                  <button
                    onClick={() => setDialog(v)}
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-bold text-cream/70 transition-colors hover:border-gold-500/40 hover:text-gold-300"
                  >
                    <Pencil className="size-3.5" aria-hidden /> Details &amp; photo
                  </button>
                  {v.custom && (
                    <button
                      onClick={() => {
                        setActionError(null);
                        if (confirm(`Remove ${v.name} from the fleet?`)) remove.mutate(v.slug);
                      }}
                      disabled={remove.isPending}
                      className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-bold text-cream/50 transition-colors hover:border-red-500/40 hover:text-red-300 disabled:opacity-40"
                    >
                      <Trash2 className="size-3.5" aria-hidden /> Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <PriceField
                    label="Base ₹/day"
                    value={v.basePrice}
                    min={0}
                    max={100000}
                    onSave={async (n) => patch.mutateAsync({ slug: v.slug, basePrice: n })}
                  />
                  <PriceField
                    label="Multi ₹/day"
                    value={v.perDayPrice}
                    min={0}
                    max={100000}
                    onSave={async (n) => patch.mutateAsync({ slug: v.slug, perDayPrice: n })}
                  />
                  <PriceField
                    label="₹/extra km"
                    value={v.extraKmRate}
                    min={0}
                    max={500}
                    onSave={async (n) => patch.mutateAsync({ slug: v.slug, extraKmRate: n })}
                  />
                </div>
                <p className="mb-2 mt-4 text-[10px] font-bold uppercase tracking-wider text-cream/35">
                  Driver rate card — what we pay
                </p>
                <div className="grid grid-cols-3 gap-2.5">
                  <PriceField
                    label="Base ₹/day"
                    value={v.driverBasePrice}
                    min={0}
                    max={100000}
                    onSave={async (n) => patch.mutateAsync({ slug: v.slug, driverBasePrice: n })}
                  />
                  <PriceField
                    label="Multi ₹/day"
                    value={v.driverPerDayPrice}
                    min={0}
                    max={100000}
                    onSave={async (n) => patch.mutateAsync({ slug: v.slug, driverPerDayPrice: n })}
                  />
                  <PriceField
                    label="₹/extra km"
                    value={v.driverExtraKmRate}
                    min={0}
                    max={500}
                    onSave={async (n) => patch.mutateAsync({ slug: v.slug, driverExtraKmRate: n })}
                  />
                </div>
                <p className="mt-3 text-[11px] text-cream/35">
                  One-day margin:{" "}
                  <strong className={cn(margin < 0 ? "text-red-300" : "text-gold-300")}>
                    {formatINR(margin)}
                  </strong>{" "}
                  per trip · <strong className="text-cream/60">
                    ₹{v.extraKmRate - v.driverExtraKmRate}
                  </strong>{" "}
                  per extra km
                </p>
              </Panel>
            );
          })}
        </div>
      )}

      {dialog !== null && (
        <VehicleDialog
          key={dialog?.slug ?? "new"}
          vehicle={dialog}
          onClose={() => setDialog(null)}
          onSaved={invalidate}
        />
      )}
    </>
  );
}
