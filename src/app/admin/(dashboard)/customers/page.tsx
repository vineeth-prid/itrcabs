import { listBookings } from "@/lib/booking-store";
import { PageTitle, Panel, StatCard } from "@/components/admin/ui";
import { formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const bookings = await listBookings();
  const byPhone = new Map<string, { name: string; phone: string; email?: string; trips: number; value: number; last: string }>();
  for (const b of bookings) {
    const entry = byPhone.get(b.phone) ?? { name: b.name, phone: b.phone, email: b.email, trips: 0, value: 0, last: b.createdAt };
    entry.trips += 1;
    entry.value += b.estimateTotal;
    if (b.createdAt > entry.last) entry.last = b.createdAt;
    byPhone.set(b.phone, entry);
  }
  const customers = [...byPhone.values()].sort((a, b) => b.value - a.value);

  return (
    <>
      <PageTitle title="Customers" sub="Every guest who has booked with ITR Cabs" />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Unique customers" value={String(customers.length)} accent />
        <StatCard label="Repeat customers" value={String(customers.filter((c) => c.trips > 1).length)} />
        <StatCard
          label="Lifetime pipeline"
          value={formatINR(customers.reduce((s, c) => s + c.value, 0))}
        />
      </div>
      <Panel className="mt-6 overflow-x-auto p-0">
        {customers.length === 0 ? (
          <p className="py-16 text-center text-sm text-cream/40">Customers appear here after their first booking.</p>
        ) : (
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/8 text-[11px] uppercase tracking-wider text-cream/40">
                {["Customer", "Phone", "Trips", "Estimated value", "Last booking"].map((h) => (
                  <th key={h} className="px-5 py-4 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.phone} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-white">{c.name}</p>
                    {c.email && <p className="text-xs text-cream/40">{c.email}</p>}
                  </td>
                  <td className="px-5 py-3.5 text-cream/70">{c.phone}</td>
                  <td className="px-5 py-3.5 font-bold text-gold-300">{c.trips}</td>
                  <td className="px-5 py-3.5 text-cream/80">{formatINR(c.value)}</td>
                  <td className="px-5 py-3.5 text-cream/60">
                    {new Date(c.last).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </>
  );
}
