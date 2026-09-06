"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { ONE_DAY_INCLUDED_KM, MULTI_DAY_INCLUDED_KM } from "@/config/fleet";
import { formatINR, cn } from "@/lib/utils";
import { PageTitle, Panel, StatCard } from "@/components/admin/ui";
import { useAdminFleet } from "@/components/admin/use-admin-fleet";

/**
 * Reads the same live fleet the booking engine quotes from, so an edit in
 * Fleet shows up here immediately. It used to render the version-controlled
 * config, which meant it kept showing the shipped defaults after every edit.
 */
export function PricingTable() {
  const { data, isLoading, isFetching, error, refetch } = useAdminFleet();
  const vehicles = data?.vehicles ?? [];

  return (
    <>
      <PageTitle
        title="Pricing engine"
        sub="Minimum fares, the driver rate card, and the margin between them — editable in Fleet"
      >
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm font-bold text-cream/70 transition-colors hover:border-gold-500/40 hover:text-gold-300"
          >
            <RefreshCw className={cn("size-4", isFetching && "animate-spin")} aria-hidden /> Refresh
          </button>
          <Link
            href="/admin/fleet"
            className="rounded-full bg-gradient-gold px-6 py-2.5 text-sm font-bold text-ink shadow-glow transition-transform hover:-translate-y-0.5"
          >
            Edit rates
          </Link>
        </div>
      </PageTitle>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="One-day included KM"
          value={`${ONE_DAY_INCLUDED_KM} km`}
          hint="Covered by the one-day minimum"
          accent
        />
        <StatCard
          label="Multi-day included KM"
          value={`${MULTI_DAY_INCLUDED_KM} km/day`}
          hint="Covered by the per-day minimum"
        />
        <StatCard
          label="Billed after the trip"
          value="Extra km + costs"
          hint="Priced from the odometer and receipts at close-out"
        />
      </div>

      <Panel className="mt-6 overflow-x-auto p-0">
        {error ? (
          <p className="py-16 text-center text-sm text-red-300">
            {error instanceof Error ? error.message : "Could not load the rate card."}
          </p>
        ) : isLoading ? (
          <p className="py-16 text-center text-sm text-cream/40">Loading rate card…</p>
        ) : (
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/8 text-[11px] uppercase tracking-wider text-cream/40">
                {[
                  "Vehicle", "One-day minimum", "Driver gets", "Margin",
                  "Multi-day /day", "Driver gets", "Extra KM", "Driver gets", "Bata",
                ].map((h, i) => (
                  <th key={h + i} className="px-5 py-4 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr
                  key={v.slug}
                  className={cn(
                    "border-b border-white/5 last:border-0 hover:bg-white/[0.02]",
                    !v.available && "opacity-50"
                  )}
                >
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-white">{v.name}</p>
                    <p className="text-xs text-cream/40">
                      {v.categoryLabel}
                      {!v.available && " · unavailable"}
                    </p>
                  </td>
                  <td className="px-5 py-3.5 font-bold tabular-nums text-gold-300">
                    {formatINR(v.basePrice)}
                  </td>
                  <td className="px-5 py-3.5 tabular-nums text-cream/60">
                    {formatINR(v.driverBasePrice)}
                  </td>
                  <td
                    className={cn(
                      "px-5 py-3.5 font-semibold tabular-nums",
                      v.basePrice - v.driverBasePrice < 0 ? "text-red-300" : "text-white"
                    )}
                  >
                    {formatINR(v.basePrice - v.driverBasePrice)}
                  </td>
                  <td className="px-5 py-3.5 tabular-nums text-cream/80">
                    {formatINR(v.perDayPrice)}
                  </td>
                  <td className="px-5 py-3.5 tabular-nums text-cream/60">
                    {formatINR(v.driverPerDayPrice)}
                  </td>
                  <td className="px-5 py-3.5 tabular-nums text-cream/80">₹{v.extraKmRate}/km</td>
                  <td className="px-5 py-3.5 tabular-nums text-cream/60">
                    ₹{v.driverExtraKmRate}/km
                  </td>
                  <td className="px-5 py-3.5 tabular-nums text-cream/80">
                    {formatINR(v.driverBata)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      <Panel className="mt-6">
        <h2 className="font-display text-lg font-bold text-white">How a fare is built</h2>
        <ol className="mt-4 grid gap-3 text-sm text-cream/70 sm:grid-cols-2">
          <li className="rounded-xl bg-white/[0.03] p-4">
            <strong className="text-white">1. Minimum.</strong> The quote above, covering the
            included kilometres. This is the floor, not the price.
          </li>
          <li className="rounded-xl bg-white/[0.03] p-4">
            <strong className="text-white">2. Extra kilometres.</strong> Added at close-out from
            the odometer, at the per-km rate for that vehicle.
          </li>
          <li className="rounded-xl bg-white/[0.03] p-4">
            <strong className="text-white">3. Costs on the trip.</strong> Tolls, parking and
            permits, recorded per ride and billed to the customer, the driver, or both.
          </li>
          <li className="rounded-xl bg-white/[0.03] p-4">
            <strong className="text-white">4. Settlement.</strong> The driver is paid from their
            own rate card; what is left after that is the margin.
          </li>
        </ol>
      </Panel>
    </>
  );
}
