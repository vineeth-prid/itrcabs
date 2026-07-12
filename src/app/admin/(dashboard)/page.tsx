import Link from "next/link";
import { listBookings } from "@/lib/booking-store";
import { hasDatabase } from "@/lib/prisma";
import { fleet } from "@/config/fleet";
import { formatINR } from "@/lib/utils";
import { PageTitle, Panel, StatCard, StatusBadge } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const bookings = await listBookings();
  const confirmed = bookings.filter((b) => b.status === "CONFIRMED");
  const pending = bookings.filter((b) => b.status === "PENDING");
  const collected = confirmed.length * 199;
  const pipeline = bookings
    .filter((b) => b.status === "CONFIRMED" || b.status === "PENDING")
    .reduce((sum, b) => sum + b.estimateTotal, 0);

  return (
    <>
      <PageTitle
        title="Overview"
        sub={
          hasDatabase
            ? "Live operations across the ITR fleet"
            : "Demo mode — connect DATABASE_URL for persistent data"
        }
      >
        <Link
          href="/admin/bookings"
          className="rounded-full bg-gradient-gold px-6 py-2.5 text-sm font-bold text-ink shadow-glow transition-transform hover:-translate-y-0.5"
        >
          Manage bookings
        </Link>
      </PageTitle>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total bookings" value={String(bookings.length)} hint="All time (session)" accent />
        <StatCard label="Awaiting confirmation" value={String(pending.length)} hint="Needs dispatch attention" />
        <StatCard label="Booking amounts collected" value={formatINR(collected)} hint="₹199 × confirmed bookings" />
        <StatCard label="Fare pipeline" value={formatINR(pipeline)} hint="Estimated fares, open bookings" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <Panel>
          <h2 className="mb-4 font-display text-lg font-bold text-white">Recent bookings</h2>
          {bookings.length === 0 ? (
            <p className="py-10 text-center text-sm text-cream/40">
              No bookings yet — they&rsquo;ll appear here the moment a customer reserves.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/8 text-[11px] uppercase tracking-wider text-cream/40">
                    <th className="pb-3 pr-4 font-semibold">Booking</th>
                    <th className="pb-3 pr-4 font-semibold">Route</th>
                    <th className="pb-3 pr-4 font-semibold">Pickup</th>
                    <th className="pb-3 pr-4 font-semibold">Fare est.</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.slice(0, 8).map((b) => (
                    <tr key={b.id} className="border-b border-white/5 last:border-0">
                      <td className="py-3 pr-4">
                        <p className="font-mono text-[13px] font-bold text-gold-300">{b.bookingCode}</p>
                        <p className="text-xs text-cream/40">{b.name}</p>
                      </td>
                      <td className="py-3 pr-4 text-cream/70">{b.pickup} → {b.destination}</td>
                      <td className="py-3 pr-4 text-cream/70">
                        {new Date(b.pickupDate).toLocaleDateString("en-IN")} · {b.pickupTime}
                      </td>
                      <td className="py-3 pr-4 font-semibold text-white">{formatINR(b.estimateTotal)}</td>
                      <td className="py-3"><StatusBadge status={b.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel>
          <h2 className="mb-4 font-display text-lg font-bold text-white">Fleet snapshot</h2>
          <ul className="space-y-3">
            {["SEDAN", "SUV", "MPV", "TEMPO_TRAVELLER", "URBANIA"].map((cat) => {
              const count = fleet.filter((v) => v.category === cat).length;
              const label = cat === "TEMPO_TRAVELLER" ? "Tempo Traveller" : cat.charAt(0) + cat.slice(1).toLowerCase();
              return (
                <li key={cat} className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3">
                  <span className="text-sm font-semibold text-cream/70">{label}</span>
                  <span className="font-display font-bold text-gold-300">{count} classes</span>
                </li>
              );
            })}
          </ul>
          <Link
            href="/admin/fleet"
            className="mt-5 block rounded-xl border border-white/10 py-2.5 text-center text-sm font-bold text-cream/70 transition-colors hover:border-gold-500/40 hover:text-gold-300"
          >
            Open fleet manager
          </Link>
        </Panel>
      </div>
    </>
  );
}
