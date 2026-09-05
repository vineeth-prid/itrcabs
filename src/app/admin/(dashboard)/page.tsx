"use client";

import dynamicImport from "next/dynamic";

/* Rendered in the browser only. These screens fetch their data client-side, so
   the server has nothing to show but a spinner — and server-rendering a
   loading state React can't reproduce at hydration is what produced the
   intermittent "client-side exception" (React error #418) in production. */
const Dashboard = dynamicImport(
  () => import("@/components/admin/dashboard").then((m) => m.Dashboard),
  {
    ssr: false,
    loading: () => (
      <p className="py-20 text-center text-sm text-cream/40">Loading…</p>
    ),
  }
);

export default function Page() {
  return <Dashboard />;
}
