"use client";

import dynamicImport from "next/dynamic";

/* Rendered in the browser only. These screens fetch their data client-side, so
   the server has nothing to show but a spinner — and server-rendering a
   loading state React can't reproduce at hydration is what produced the
   intermittent "client-side exception" (React error #418) in production. */
const CustomersManager = dynamicImport(
  () => import("@/components/admin/customers-manager").then((m) => m.CustomersManager),
  {
    ssr: false,
    loading: () => (
      <p className="py-20 text-center text-sm text-cream/40">Loading customers…</p>
    ),
  }
);

export default function Page() {
  return <CustomersManager />;
}
