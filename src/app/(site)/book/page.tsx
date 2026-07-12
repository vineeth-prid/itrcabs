import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingWizard } from "@/components/booking/booking-wizard";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/schema-org";

export const metadata: Metadata = {
  title: "Book a Cab Online — Kochi, Ernakulam & All Kerala",
  description:
    "Book a premium taxi online with ITR Cabs in under two minutes. Choose your trip, pick a vehicle, verify by OTP and reserve with just ₹199. Sedans to 26-seat coaches, all over Kerala.",
  alternates: { canonical: "/book" },
};

export default function BookPage() {
  return (
    <div className="bg-cream pb-24 pt-32 md:pt-36">
      <JsonLd
        schema={breadcrumbSchema([
          { name: "Home", href: "/" },
          { name: "Book a cab", href: "/book" },
        ])}
      />
      <div className="container-luxe">
        <header className="mb-12">
          <p className="text-[13px] font-semibold uppercase tracking-[0.22em] text-gold-600">
            Online booking
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Book your Kerala ride<span className="text-gradient-gold">.</span>
          </h1>
          <p className="mt-3 max-w-xl text-smoke">
            Two minutes, five steps, one small ₹199 reservation — and your
            chauffeur is confirmed.
          </p>
        </header>
        <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-white" />}>
          <BookingWizard />
        </Suspense>
      </div>
    </div>
  );
}
