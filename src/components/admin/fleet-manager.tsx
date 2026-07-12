"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2 } from "lucide-react";
import { PageTitle, Panel } from "@/components/admin/ui";
import { VehicleIllustration } from "@/components/brand/vehicle-illustration";
import { formatINR, cn } from "@/lib/utils";
import type { Illustration } from "@/config/fleet";

interface AdminVehicle {
  slug: string;
  name: string;
  categoryLabel?: string;
  category: string;
  seats: number;
  luggage: number;
  basePrice: number;
  perDayPrice: number;
  extraKmRate: number;
  available: boolean;
  illustration: Illustration;
  examples: string;
}

async function fetchFleet(): Promise<{ vehicles: AdminVehicle[]; source: string }> {
  const res = await fetch("/api/admin/fleet");
  if (!res.ok) throw new Error("Failed to load fleet");
  return res.json();
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
      {dirty && invalid && (
        <p className="mt-1 text-[10px] font-semibold text-red-400">₹{min.toLocaleString("en-IN")}–{max.toLocaleString("en-IN")}</p>
      )}
      {error && <p className="mt-1 text-[10px] font-semibold text-red-400">{error}</p>}
    </div>
  );
}

export function FleetManager() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-fleet"], queryFn: fetchFleet });

  const patch = useMutation({
    mutationFn: async (payload: { slug: string } & Partial<AdminVehicle>) => {
      const res = await fetch("/api/admin/fleet", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error ?? "Update failed");
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-fleet"] }),
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
      />
      {isLoading ? (
        <Panel><p className="py-16 text-center text-sm text-cream/40">Loading fleet…</p></Panel>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {data?.vehicles.map((v) => (
            <Panel key={v.slug} className={cn("transition-opacity", !v.available && "opacity-55")}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-bold text-white">{v.name}</h2>
                  <p className="text-xs text-cream/40">{v.examples} · {v.seats} seats</p>
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
              <div className="px-6 py-2 opacity-90">
                <VehicleIllustration variant={v.illustration} />
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                <PriceField
                  label="Base ₹/day"
                  value={v.basePrice}
                  min={500}
                  max={100000}
                  onSave={async (n) => patch.mutateAsync({ slug: v.slug, basePrice: n })}
                />
                <PriceField
                  label="Multi ₹/day"
                  value={v.perDayPrice}
                  min={500}
                  max={100000}
                  onSave={async (n) => patch.mutateAsync({ slug: v.slug, perDayPrice: n })}
                />
                <PriceField
                  label="₹/extra km"
                  value={v.extraKmRate}
                  min={5}
                  max={200}
                  onSave={async (n) => patch.mutateAsync({ slug: v.slug, extraKmRate: n })}
                />
              </div>
              <p className="mt-3 text-[11px] text-cream/35">
                Live price shown to customers: <strong className="text-gold-300">{formatINR(v.basePrice)}</strong> one-day base
              </p>
            </Panel>
          ))}
        </div>
      )}
    </>
  );
}
