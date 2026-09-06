"use client";

import { use } from "react";
import dynamicImport from "next/dynamic";

const CloseOut = dynamicImport(
  () => import("@/components/admin/close-out").then((m) => m.CloseOut),
  {
    ssr: false,
    loading: () => <p className="py-20 text-center text-sm text-cream/40">Loading trip…</p>,
  }
);

export default function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  return <CloseOut code={code} />;
}
