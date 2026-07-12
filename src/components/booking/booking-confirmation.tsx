"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2, Copy, Check, MessageCircle, Mail, Smartphone,
  MapPin, CalendarDays, Users, Route,
} from "lucide-react";
import confettiColors from "./confetti-colors";
import { formatINR, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { VehicleVisual } from "@/components/brand/vehicle-visual";
import type { Illustration } from "@/config/fleet";
import { siteConfig } from "@/config/site";

interface ConfirmationData {
  bookingCode: string;
  status: string;
  tripType: string;
  days: number;
  passengers: number;
  vehicleName: string;
  vehicleSlug: string;
  illustration: Illustration;
  pickup: string;
  destination: string;
  pickupDate: string;
  pickupTime: string;
  name: string;
  estimateTotal: number;
  bookingAmount: number;
  includedKm: number;
  extraKmRate: number;
}

function ConfettiBurst() {
  const pieces = Array.from({ length: 26 });
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-72 overflow-hidden">
      {pieces.map((_, i) => (
        <motion.span
          key={i}
          className="absolute top-0 block h-2.5 w-1.5 rounded-sm"
          style={{
            left: `${(i * 137) % 100}%`,
            backgroundColor: confettiColors[i % confettiColors.length],
          }}
          initial={{ y: -30, opacity: 1, rotate: 0 }}
          animate={{ y: 300, opacity: 0, rotate: (i % 2 ? 1 : -1) * 360 }}
          transition={{ duration: 2.2 + (i % 5) * 0.3, delay: 0.3 + (i % 7) * 0.12, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}

export function BookingConfirmation({ booking }: { booking: ConfirmationData }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const waText = encodeURIComponent(
    `Hi ITR Cabs! My booking ${booking.bookingCode} is confirmed — ${booking.pickup} to ${booking.destination} on ${new Date(booking.pickupDate).toLocaleDateString("en-IN")} at ${booking.pickupTime}.`
  );

  return (
    <div className="relative min-h-screen bg-cream pb-24 pt-32 md:pt-36">
      <ConfettiBurst />
      <div className="container-luxe max-w-3xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-[2rem] border hairline bg-white shadow-card-hover"
        >
          {/* Header */}
          <div className="relative bg-ink px-8 py-10 text-center text-cream">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.25, type: "spring", stiffness: 200, damping: 14 }}
              className="mx-auto flex size-16 items-center justify-center rounded-full bg-gradient-gold text-ink shadow-glow-lg"
            >
              <CheckCircle2 className="size-9" aria-hidden />
            </motion.span>
            <h1 className="mt-5 font-display text-3xl font-bold sm:text-4xl">
              You&rsquo;re booked, {booking.name.split(" ")[0]}!
            </h1>
            <p className="mt-2 text-cream/70">
              {booking.status === "CONFIRMED"
                ? "Payment received — your vehicle is reserved."
                : "Your booking is being confirmed."}
            </p>

            <button
              onClick={() => {
                navigator.clipboard.writeText(booking.bookingCode).then(() => setCopied(true));
              }}
              className="group mx-auto mt-6 flex items-center gap-3 rounded-2xl border border-gold-500/40 bg-gold-500/10 px-6 py-3 transition-colors hover:bg-gold-500/20"
              aria-label={`Copy booking ID ${booking.bookingCode}`}
            >
              <span className="font-mono text-xl font-bold tracking-[0.14em] text-gold-300">
                {booking.bookingCode}
              </span>
              {copied ? <Check className="size-4 text-gold-300" aria-hidden /> : <Copy className="size-4 text-gold-300/70 group-hover:text-gold-300" aria-hidden />}
            </button>
            <p className="mt-2 text-xs text-cream/50">{copied ? "Copied!" : "Tap to copy your booking ID"}</p>
          </div>

          {/* Vehicle strip */}
          <div className="border-b hairline bg-gradient-to-b from-sand to-white px-10 py-6">
            <div className="group mx-auto max-w-sm">
              <VehicleVisual
                slug={booking.vehicleSlug}
                illustration={booking.illustration}
                name={booking.vehicleName}
                priority
              />
            </div>
          </div>

          {/* Details */}
          <div className="grid gap-6 p-8 sm:grid-cols-2 sm:p-10">
            {[
              { icon: Route, label: "Route", value: `${booking.pickup} → ${booking.destination}` },
              {
                icon: CalendarDays,
                label: "Pickup",
                value: `${new Date(booking.pickupDate).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })} · ${booking.pickupTime}`,
              },
              { icon: Users, label: "Travellers", value: `${booking.passengers} · ${booking.vehicleName}` },
              {
                icon: MapPin,
                label: "Trip",
                value: booking.tripType === "ONE_DAY" ? `One day · ${booking.includedKm} km included` : `${booking.days} days · ${booking.includedKm} km included`,
              },
            ].map((d) => (
              <div key={d.label} className="flex gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
                  <d.icon className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-smoke">{d.label}</p>
                  <p className="mt-0.5 font-semibold text-ink">{d.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Fare summary */}
          <div className="mx-8 mb-8 rounded-2xl bg-cream p-6 sm:mx-10">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <p className="text-graphite">
                Paid now <strong className="ml-1 text-ink">{formatINR(booking.bookingAmount)}</strong>
              </p>
              <p className="text-graphite">
                Estimated fare <strong className="ml-1 text-ink">{formatINR(booking.estimateTotal)}</strong>
              </p>
              <p className="text-graphite">
                Extra km <strong className="ml-1 text-ink">₹{booking.extraKmRate}/km</strong>
              </p>
            </div>
            <p className="mt-3 text-xs text-smoke">
              Booking amount is adjusted in your final fare. Toll, parking and night charges (if any) at actuals.
            </p>
          </div>

          {/* Notification channels */}
          <div className="border-t hairline bg-white px-8 py-6 sm:px-10">
            <p className="text-center text-[12px] font-bold uppercase tracking-[0.18em] text-smoke">
              Confirmation sent to
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              {[
                { icon: Smartphone, label: "SMS" },
                { icon: Mail, label: "Email" },
                { icon: MessageCircle, label: "WhatsApp" },
              ].map((c, i) => (
                <motion.span
                  key={c.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.15 }}
                  className="inline-flex items-center gap-2 rounded-full border hairline bg-cream px-5 py-2 text-sm font-semibold text-graphite"
                >
                  <c.icon className="size-4 text-gold-600" aria-hidden /> {c.label}
                </motion.span>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href={`${siteConfig.social.whatsappLink.split("?")[0]}?text=${waText}`} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="min-w-52">
              <MessageCircle aria-hidden /> Chat with us
            </Button>
          </a>
          <Link href="/">
            <Button variant="outline" size="lg" className="min-w-52">Back to home</Button>
          </Link>
        </div>
        <p className={cn("mt-6 text-center text-sm text-smoke")}>
          Driver details arrive on WhatsApp a few hours before pickup. Questions?{" "}
          <a href={`tel:${siteConfig.phone}`} className="font-bold text-gold-700">{siteConfig.phoneDisplay}</a>
        </p>
      </div>
    </div>
  );
}
