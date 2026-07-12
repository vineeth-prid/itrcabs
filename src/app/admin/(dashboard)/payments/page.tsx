import { listBookings } from "@/lib/booking-store";
import { PageTitle, Panel, StatCard, StatusBadge } from "@/components/admin/ui";
import { formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const bookings = await listBookings();
  const paid = bookings.filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED");

  return (
    <>
      <PageTitle title="Payments" sub="₹199 booking amounts collected via Razorpay" />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Collected" value={formatINR(paid.length * 199)} hint={`${paid.length} successful payments`} accent />
        <StatCard label="Average booking value" value={paid.length ? formatINR(Math.round(paid.reduce((s, b) => s + b.estimateTotal, 0) / paid.length)) : "—"} hint="Estimated fare per booking" />
        <StatCard label="Gateway" value="Razorpay" hint="UPI · cards · netbanking" />
      </div>
      <Panel className="mt-6 overflow-x-auto p-0">
        {paid.length === 0 ? (
          <p className="py-16 text-center text-sm text-cream/40">Successful payments appear here.</p>
        ) : (
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/8 text-[11px] uppercase tracking-wider text-cream/40">
                {["Booking", "Payer", "Amount", "Fare estimate", "Status", "Date"].map((h) => (
                  <th key={h} className="px-5 py-4 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paid.map((b) => (
                <tr key={b.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  <td className="px-5 py-3.5 font-mono text-[13px] font-bold text-gold-300">{b.bookingCode}</td>
                  <td className="px-5 py-3.5 text-cream/80">{b.name}</td>
                  <td className="px-5 py-3.5 font-bold text-white">{formatINR(b.bookingAmount)}</td>
                  <td className="px-5 py-3.5 text-cream/70">{formatINR(b.estimateTotal)}</td>
                  <td className="px-5 py-3.5"><StatusBadge status="PAID" /></td>
                  <td className="px-5 py-3.5 text-cream/60">
                    {new Date(b.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
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
