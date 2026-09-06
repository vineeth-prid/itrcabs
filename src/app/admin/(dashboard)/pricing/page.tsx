"use client";

import dynamicImport from "next/dynamic";

/* Client-only, like the other data screens: it reads the live fleet, so the
   server has nothing to render but a spinner. */
const PricingTable = dynamicImport(
  () => import("@/components/admin/pricing-table").then((m) => m.PricingTable),
  {
    ssr: false,
    loading: () => (
      <p className="py-20 text-center text-sm text-cream/40">Loading pricing…</p>
    ),
  }
);

export default function Page() {
  return <PricingTable />;
}
