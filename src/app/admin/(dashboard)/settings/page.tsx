import { PageTitle, Panel } from "@/components/admin/ui";
import { hasDatabase } from "@/lib/prisma";
import { razorpayConfigured } from "@/lib/razorpay";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm font-bold", ok ? "text-emerald-300" : "text-amber-300")}>
      <span className={cn("size-2.5 rounded-full", ok ? "bg-emerald-400" : "bg-amber-400 animate-pulse")} />
      {ok ? "Connected" : "Not configured"}
    </span>
  );
}

export default function AdminSettingsPage() {
  const otpProvider = process.env.OTP_PROVIDER ?? "console";

  return (
    <>
      <PageTitle title="Settings" sub="Integrations & environment health" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Panel>
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-white">PostgreSQL database</h2>
            <StatusDot ok={hasDatabase} />
          </div>
          <p className="mt-2 text-sm text-cream/50">
            {hasDatabase
              ? "Bookings, fleet and customers persist to Postgres via Prisma."
              : "Set DATABASE_URL, then run `npm run db:push && npm run db:seed`."}
          </p>
        </Panel>
        <Panel>
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-white">Razorpay payments</h2>
            <StatusDot ok={razorpayConfigured} />
          </div>
          <p className="mt-2 text-sm text-cream/50">
            {razorpayConfigured
              ? "Live checkout enabled with signature + webhook verification."
              : "Set RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET to enable live checkout (demo checkout active)."}
          </p>
        </Panel>
        <Panel>
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-white">OTP provider</h2>
            <StatusDot ok={otpProvider !== "console"} />
          </div>
          <p className="mt-2 text-sm text-cream/50">
            Active provider: <strong className="text-gold-300">{otpProvider}</strong>
            {otpProvider === "console" && " — codes are shown on screen for demo. Switch to msg91 or twilio for SMS."}
          </p>
        </Panel>
        <Panel>
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-white">Business profile</h2>
            <StatusDot ok />
          </div>
          <dl className="mt-3 space-y-1.5 text-sm text-cream/60">
            <div className="flex justify-between"><dt>Phone</dt><dd className="text-cream/90">{siteConfig.phoneDisplay}</dd></div>
            <div className="flex justify-between"><dt>Email</dt><dd className="text-cream/90">{siteConfig.email}</dd></div>
            <div className="flex justify-between"><dt>Address</dt><dd className="text-cream/90">{siteConfig.address.locality}, {siteConfig.address.region}</dd></div>
            <div className="flex justify-between"><dt>Booking amount</dt><dd className="text-cream/90">₹{siteConfig.bookingAmount}</dd></div>
          </dl>
        </Panel>
      </div>
    </>
  );
}
