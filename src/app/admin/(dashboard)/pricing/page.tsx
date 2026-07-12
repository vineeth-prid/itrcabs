import { ONE_DAY_INCLUDED_KM, MULTI_DAY_INCLUDED_KM, fleet } from "@/config/fleet";
import { BOOKING_AMOUNT } from "@/lib/pricing";
import { PageTitle, Panel, StatCard } from "@/components/admin/ui";
import { formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function AdminPricingPage() {
  return (
    <>
      <PageTitle
        title="Pricing engine"
        sub="Global rules applied to every quote — per-vehicle rates live in Fleet"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="One-day included KM" value={`${ONE_DAY_INCLUDED_KM} km`} hint="Per one-day booking" accent />
        <StatCard label="Multi-day included KM" value={`${MULTI_DAY_INCLUDED_KM} km/day`} hint="Carries over within trip" />
        <StatCard label="Booking amount" value={formatINR(BOOKING_AMOUNT)} hint="Collected online at reservation" />
        <StatCard label="Extras" value="At actuals" hint="Toll · parking · night charges" />
      </div>

      <Panel className="mt-6 overflow-x-auto p-0">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/8 text-[11px] uppercase tracking-wider text-cream/40">
              {["Vehicle", "Category", "One-day base", "Multi-day /day", "Extra KM", "Driver bata"].map((h) => (
                <th key={h} className="px-5 py-4 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fleet.map((v) => (
              <tr key={v.slug} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                <td className="px-5 py-3.5 font-semibold text-white">{v.name}</td>
                <td className="px-5 py-3.5 text-cream/60">{v.categoryLabel}</td>
                <td className="px-5 py-3.5 font-bold text-gold-300">{formatINR(v.basePrice)}</td>
                <td className="px-5 py-3.5 text-cream/80">{formatINR(v.perDayPrice)}</td>
                <td className="px-5 py-3.5 text-cream/80">₹{v.extraKmRate}/km</td>
                <td className="px-5 py-3.5 text-cream/80">{formatINR(v.driverBata)}/day</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <Panel className="mt-6">
        <h2 className="font-display text-lg font-bold text-white">Season & surcharge rules</h2>
        <ul className="mt-4 grid gap-3 text-sm text-cream/70 sm:grid-cols-2">
          <li className="rounded-xl bg-white/[0.03] p-4">Night charge: <strong className="text-white">10%</strong> on trips running 10 pm – 6 am</li>
          <li className="rounded-xl bg-white/[0.03] p-4">Holiday charge: <strong className="text-white">10%</strong> on notified festival dates</li>
          <li className="rounded-xl bg-white/[0.03] p-4">Season pricing: configurable windows (Onam, Christmas, summer)</li>
          <li className="rounded-xl bg-white/[0.03] p-4">Corporate accounts: contract rates override the public card</li>
        </ul>
        <p className="mt-4 text-xs text-cream/35">
          Rule values are stored in PricingConfig / SeasonPricing tables and editable once a database is connected.
        </p>
      </Panel>
    </>
  );
}
