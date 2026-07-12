import { listBookings } from "@/lib/booking-store";
import { fleet } from "@/config/fleet";
import { PageTitle, Panel, StatCard } from "@/components/admin/ui";
import { formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const bookings = await listBookings();

  const byVehicle = fleet
    .map((v) => ({
      name: v.name,
      count: bookings.filter((b) => b.vehicleSlug === v.slug).length,
      value: bookings.filter((b) => b.vehicleSlug === v.slug).reduce((s, b) => s + b.estimateTotal, 0),
    }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count);
  const max = Math.max(1, ...byVehicle.map((r) => r.count));

  const routes = new Map<string, number>();
  for (const b of bookings) {
    const key = `${b.pickup} → ${b.destination}`;
    routes.set(key, (routes.get(key) ?? 0) + 1);
  }
  const topRoutes = [...routes.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);

  const conversion = bookings.length
    ? Math.round((bookings.filter((b) => b.status !== "CANCELLED").length / bookings.length) * 100)
    : 0;

  return (
    <>
      <PageTitle title="Analytics" sub="Demand, vehicle mix and route intelligence" />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Bookings" value={String(bookings.length)} accent />
        <StatCard label="Retention (non-cancelled)" value={`${conversion}%`} />
        <StatCard label="Pipeline value" value={formatINR(bookings.reduce((s, b) => s + b.estimateTotal, 0))} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel>
          <h2 className="mb-5 font-display text-lg font-bold text-white">Bookings by vehicle</h2>
          {byVehicle.length === 0 ? (
            <p className="py-10 text-center text-sm text-cream/40">Charts light up with your first bookings.</p>
          ) : (
            <ul className="space-y-4">
              {byVehicle.map((r) => (
                <li key={r.name}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="font-semibold text-cream/80">{r.name}</span>
                    <span className="text-cream/50">{r.count} · {formatINR(r.value)}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-white/8">
                    <div
                      className="h-full rounded-full bg-gradient-gold"
                      style={{ width: `${(r.count / max) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel>
          <h2 className="mb-5 font-display text-lg font-bold text-white">Top routes</h2>
          {topRoutes.length === 0 ? (
            <p className="py-10 text-center text-sm text-cream/40">Popular routes surface here.</p>
          ) : (
            <ol className="space-y-3">
              {topRoutes.map(([route, count], i) => (
                <li key={route} className="flex items-center gap-4 rounded-xl bg-white/[0.03] px-4 py-3">
                  <span className="font-display text-lg font-bold text-gold-300">{String(i + 1).padStart(2, "0")}</span>
                  <span className="flex-1 text-sm font-semibold text-cream/80">{route}</span>
                  <span className="text-sm text-cream/50">{count} trip{count > 1 ? "s" : ""}</span>
                </li>
              ))}
            </ol>
          )}
        </Panel>
      </div>
    </>
  );
}
