"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CalendarDays, CalendarRange, Users, ArrowLeft, ArrowRight,
  ShieldCheck, Loader2, Phone, CheckCircle2, Sparkles, Briefcase, Snowflake, Fuel,
} from "lucide-react";
import { ONE_DAY_INCLUDED_KM, fitsPassengers, type VehicleSpec } from "@/config/fleet";
import { computePricing, BOOKING_AMOUNT } from "@/lib/pricing";
import { formatINR, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Select, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { VehicleVisual } from "@/components/brand/vehicle-visual";
import { OtpInput } from "./otp-input";
import { siteConfig } from "@/config/site";

/* ────────────────────────────────────────────────────────── */

type TripType = "ONE_DAY" | "MULTI_DAY";
type StepId = "trip" | "vehicle" | "details" | "otp" | "pay";
const STEPS: { id: StepId; label: string }[] = [
  { id: "trip", label: "Trip" },
  { id: "vehicle", label: "Vehicle" },
  { id: "details", label: "Details" },
  { id: "otp", label: "Verify" },
  { id: "pay", label: "Reserve" },
];

const detailsSchema = z.object({
  pickup: z.string().min(3, "Where should we pick you up?"),
  destination: z.string().min(3, "Where are you headed?"),
  pickupDate: z.string().min(1, "Pick a date"),
  pickupTime: z.string().min(1, "Pick a time"),
  name: z.string().min(2, "Your name, please"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  email: z.string().email("That email doesn't look right").optional().or(z.literal("")),
});
type DetailsForm = z.infer<typeof detailsSchema>;

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const stepVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 48, filter: "blur(6px)" }),
  center: { opacity: 1, x: 0, filter: "blur(0px)" },
  exit: (dir: number) => ({ opacity: 0, x: dir * -48, filter: "blur(6px)" }),
};

export function BookingWizard() {
  const router = useRouter();
  const params = useSearchParams();

  const [step, setStep] = useState<StepId>("trip");
  const [dir, setDir] = useState(1);
  const [tripType, setTripType] = useState<TripType>("ONE_DAY");
  const [days, setDays] = useState(2);
  const [passengers, setPassengers] = useState(2);
  const [vehicleSlug, setVehicleSlug] = useState<string | null>(params.get("vehicle"));
  const [details, setDetails] = useState<DetailsForm | null>(null);
  const [otp, setOtp] = useState("");
  const [otpToken, setOtpToken] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* Live fleet — reflects admin pricing edits and availability instantly */
  const { data: liveFleet = [], isLoading: fleetLoading } = useQuery<
    (VehicleSpec & { available: boolean })[]
  >({
    queryKey: ["public-fleet"],
    queryFn: async () => {
      const res = await fetch("/api/fleet");
      if (!res.ok) throw new Error("Could not load vehicles");
      return (await res.json()).vehicles;
    },
  });

  const vehicle = vehicleSlug ? liveFleet.find((v) => v.slug === vehicleSlug) ?? null : null;
  const matches = useMemo(
    () => liveFleet.filter((v) => fitsPassengers(v, passengers)),
    [liveFleet, passengers]
  );
  const pricing = vehicle ? computePricing(vehicle, tripType, days) : null;

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  const go = useCallback((next: StepId) => {
    setError(null);
    setDir(STEPS.findIndex((s) => s.id === next) > STEPS.findIndex((s) => s.id === step) ? 1 : -1);
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  /* Resend cooldown ticker */
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  /* ── API actions ─────────────────────────────────────── */

  const sendOtp = useCallback(async (phone: string) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not send OTP");
      setCooldown(json.cooldown ?? 30);
      setDevCode(json.devCode ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send OTP");
      throw e;
    } finally {
      setBusy(false);
    }
  }, []);

  const verifyOtp = useCallback(async () => {
    if (!details) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: details.phone, code: otp }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Verification failed");
      setOtpToken(json.token);
      go("pay");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setBusy(false);
    }
  }, [details, otp, go]);

  const pay = useCallback(async () => {
    if (!details || !vehicleSlug || !otpToken) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripType,
          days: tripType === "MULTI_DAY" ? days : 1,
          passengers,
          vehicleSlug,
          ...details,
          otpToken,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not create booking");
      const { booking, payment } = json;

      const complete = async (paymentId: string, signature: string) => {
        const vres = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingId: booking.id,
            orderId: payment.orderId,
            paymentId,
            signature,
          }),
        });
        const vjson = await vres.json();
        if (!vres.ok) throw new Error(vjson.error ?? "Payment verification failed");
        router.push(`/booking/${booking.bookingCode}`);
      };

      if (payment.mode === "razorpay") {
        await loadRazorpay();
        const rzp = new window.Razorpay!({
          key: payment.keyId,
          amount: payment.amount,
          currency: payment.currency,
          name: "ITR Cabs",
          description: `Booking amount — ${booking.bookingCode}`,
          order_id: payment.orderId,
          prefill: { name: details.name, contact: `+91${details.phone}`, email: details.email || undefined },
          theme: { color: "#f1940b" },
          handler: (resp: { razorpay_payment_id: string; razorpay_signature: string }) => {
            complete(resp.razorpay_payment_id, resp.razorpay_signature).catch((e) =>
              setError(e instanceof Error ? e.message : "Payment verification failed")
            );
          },
          modal: { ondismiss: () => setBusy(false) },
        });
        rzp.open();
      } else {
        // Demo checkout — no gateway configured
        await new Promise((r) => setTimeout(r, 1200));
        await complete(`demo_pay_${Date.now()}`, "demo");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setBusy(false);
    }
  }, [details, vehicleSlug, otpToken, tripType, days, passengers, router]);

  /* ── Layout ──────────────────────────────────────────── */

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
      <div>
        {/* Step rail */}
        <ol className="mb-10 flex items-center gap-1.5 sm:gap-2" aria-label="Booking progress">
          {STEPS.map((s, i) => (
            <li key={s.id} className="flex flex-1 flex-col gap-1.5">
              <span
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  i < stepIndex ? "bg-gradient-gold" : i === stepIndex ? "bg-gradient-gold shadow-glow" : "bg-ink/8"
                )}
              />
              <span
                className={cn(
                  "text-[11px] font-bold uppercase tracking-wider",
                  i <= stepIndex ? "text-gold-700" : "text-smoke/60"
                )}
              >
                {s.label}
              </span>
            </li>
          ))}
        </ol>

        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* STEP 1 — Trip */}
            {step === "trip" && (
              <section aria-labelledby="step-trip">
                <h2 id="step-trip" className="font-display text-3xl font-bold text-ink">
                  What kind of trip is it?
                </h2>
                <p className="mt-2 text-smoke">This decides how many kilometres come included.</p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {(
                    [
                      { value: "ONE_DAY", icon: CalendarDays, title: "One Day Trip", text: `Out and back in a day · ${ONE_DAY_INCLUDED_KM} km included` },
                      { value: "MULTI_DAY", icon: CalendarRange, title: "Multiple Days", text: "Tours & round trips · 100 km included per day" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setTripType(opt.value)}
                      aria-pressed={tripType === opt.value}
                      className={cn(
                        "group rounded-3xl border-2 bg-white p-7 text-left transition-all duration-300",
                        tripType === opt.value
                          ? "border-gold-500 shadow-glow"
                          : "border-ink/8 hover:border-gold-300 hover:shadow-card"
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-12 items-center justify-center rounded-2xl transition-colors duration-300",
                          tripType === opt.value ? "bg-gradient-gold text-ink" : "bg-cream text-graphite"
                        )}
                      >
                        <opt.icon className="size-6" aria-hidden />
                      </span>
                      <span className="mt-4 block font-display text-lg font-bold text-ink">{opt.title}</span>
                      <span className="mt-1 block text-sm text-smoke">{opt.text}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <AnimatePresence>
                    {tripType === "MULTI_DAY" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <Label htmlFor="days">Number of days</Label>
                        <Select id="days" value={days} onChange={(e) => setDays(Number(e.target.value))}>
                          {Array.from({ length: 13 }, (_, i) => i + 2).map((d) => (
                            <option key={d} value={d}>{d} days</option>
                          ))}
                        </Select>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div>
                    <Label htmlFor="passengers">Passengers</Label>
                    <Select
                      id="passengers"
                      value={passengers}
                      onChange={(e) => {
                        setPassengers(Number(e.target.value));
                        setVehicleSlug(null);
                      }}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 16, 17, 18, 20, 24, 26].map((n) => (
                        <option key={n} value={n}>{n} {n === 1 ? "passenger" : "passengers"}</option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div className="mt-10 flex justify-end">
                  <Button size="lg" onClick={() => go("vehicle")}>
                    Choose vehicle <ArrowRight aria-hidden />
                  </Button>
                </div>
              </section>
            )}

            {/* STEP 2 — Vehicle */}
            {step === "vehicle" && (
              <section aria-labelledby="step-vehicle">
                <h2 id="step-vehicle" className="font-display text-3xl font-bold text-ink">
                  Vehicles for {passengers} {passengers === 1 ? "traveller" : "travellers"}
                </h2>
                <p className="mt-2 text-smoke">
                  Showing only vehicles that seat your group comfortably. Prices include {tripType === "ONE_DAY" ? `${ONE_DAY_INCLUDED_KM} km` : "100 km/day"}.
                </p>

                {fleetLoading && (
                  <div className="mt-8 grid gap-5 md:grid-cols-2" aria-hidden>
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="h-72 animate-pulse rounded-3xl bg-white" />
                    ))}
                  </div>
                )}
                {!fleetLoading && matches.length === 0 && (
                  <p className="mt-8 rounded-2xl border hairline bg-white p-8 text-center text-smoke">
                    No vehicles match this group size right now — call us on{" "}
                    <a className="font-bold text-gold-700" href={`tel:${siteConfig.phone}`}>
                      {siteConfig.phoneDisplay}
                    </a>{" "}
                    and we&rsquo;ll arrange something special.
                  </p>
                )}
                <div className="mt-8 grid gap-5 md:grid-cols-2">
                  {matches.map((v) => {
                    const p = computePricing(v, tripType, days);
                    const selected = vehicleSlug === v.slug;
                    return (
                      <button
                        key={v.slug}
                        onClick={() => setVehicleSlug(v.slug)}
                        aria-pressed={selected}
                        className={cn(
                          "group relative rounded-3xl border-2 bg-white p-6 text-left transition-all duration-300 hover:-translate-y-1",
                          selected ? "border-gold-500 shadow-glow" : "border-ink/8 hover:border-gold-300 hover:shadow-card-hover"
                        )}
                      >
                        {selected && (
                          <span className="absolute right-4 top-4 z-10 flex size-7 items-center justify-center rounded-full bg-gradient-gold text-ink">
                            <CheckCircle2 className="size-4" aria-hidden />
                          </span>
                        )}
                        {v.popular && <Badge className="absolute left-4 top-4 z-10">Most booked</Badge>}
                        <div className="pt-4">
                          <VehicleVisual slug={v.slug} illustration={v.illustration} name={v.name} />
                        </div>
                        <h3 className="mt-3 font-display text-lg font-bold text-ink">{v.name}</h3>
                        <p className="text-xs text-smoke">{v.examples}</p>
                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] font-semibold text-graphite">
                          <span className="inline-flex items-center gap-1"><Users className="size-3.5 text-gold-600" aria-hidden />{v.seats} seats</span>
                          <span className="inline-flex items-center gap-1"><Briefcase className="size-3.5 text-gold-600" aria-hidden />{v.luggage} bags</span>
                          <span className="inline-flex items-center gap-1"><Snowflake className="size-3.5 text-gold-600" aria-hidden />{v.ac ? "AC" : "Non-AC"}</span>
                          <span className="inline-flex items-center gap-1"><Fuel className="size-3.5 text-gold-600" aria-hidden />{v.fuel}</span>
                        </div>
                        <div className="mt-4 flex items-end justify-between border-t hairline pt-4">
                          <div>
                            <p className="font-display text-xl font-bold text-ink">{formatINR(p.estimateTotal)}</p>
                            <p className="text-[11px] text-smoke">
                              {tripType === "ONE_DAY" ? "per day" : `for ${p.days} days`} · ₹{v.extraKmRate}/extra km
                            </p>
                          </div>
                          <span className={cn(
                            "rounded-full px-4 py-1.5 text-xs font-bold transition-colors",
                            selected ? "bg-gradient-gold text-ink" : "bg-cream text-graphite group-hover:bg-gold-100"
                          )}>
                            {selected ? "Selected" : "Select"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-10 flex justify-between">
                  <Button variant="ghost" size="lg" onClick={() => go("trip")}>
                    <ArrowLeft aria-hidden /> Back
                  </Button>
                  <Button size="lg" disabled={!vehicle} onClick={() => go("details")}>
                    Continue <ArrowRight aria-hidden />
                  </Button>
                </div>
              </section>
            )}

            {/* STEP 3 — Details */}
            {step === "details" && (
              <DetailsStep
                defaults={details ?? undefined}
                onBack={() => go("vehicle")}
                busy={busy}
                onSubmit={async (values) => {
                  setDetails(values);
                  try {
                    await sendOtp(values.phone);
                    setOtp("");
                    go("otp");
                  } catch {
                    /* error already surfaced */
                  }
                }}
              />
            )}

            {/* STEP 4 — OTP */}
            {step === "otp" && details && (
              <section aria-labelledby="step-otp" className="mx-auto max-w-md text-center">
                <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-gold-100">
                  <Phone className="size-7 text-gold-700" aria-hidden />
                </span>
                <h2 id="step-otp" className="mt-6 font-display text-3xl font-bold text-ink">
                  Verify your number
                </h2>
                <p className="mt-2 text-smoke">
                  We sent a 6-digit code to <strong className="text-ink">+91 {details.phone}</strong>
                </p>
                {devCode && (
                  <p className="mx-auto mt-3 w-fit rounded-full bg-gold-100 px-4 py-1.5 text-xs font-bold text-gold-800">
                    Demo mode — your code is {devCode}
                  </p>
                )}

                <div className="mt-8">
                  <OtpInput value={otp} onChange={setOtp} disabled={busy} error={Boolean(error)} />
                </div>
                {error && <p role="alert" className="mt-4 text-sm font-semibold text-red-600">{error}</p>}

                <Button
                  size="lg"
                  className="mt-8 w-full"
                  disabled={otp.length !== 6 || busy}
                  onClick={verifyOtp}
                >
                  {busy ? <Loader2 className="animate-spin" aria-hidden /> : <ShieldCheck aria-hidden />}
                  Verify & continue
                </Button>

                <div className="mt-5 flex items-center justify-between text-sm">
                  <button className="font-semibold text-graphite underline-offset-4 hover:underline" onClick={() => go("details")}>
                    Change number
                  </button>
                  <button
                    className="font-semibold text-gold-700 underline-offset-4 hover:underline disabled:opacity-40 disabled:no-underline"
                    disabled={cooldown > 0 || busy}
                    onClick={() => sendOtp(details.phone).catch(() => {})}
                  >
                    {cooldown > 0 ? `Resend in 0:${String(cooldown).padStart(2, "0")}` : "Resend code"}
                  </button>
                </div>
              </section>
            )}

            {/* STEP 5 — Pay */}
            {step === "pay" && details && vehicle && pricing && (
              <section aria-labelledby="step-pay" className="mx-auto max-w-lg">
                <div className="rounded-3xl border-2 border-gold-400/60 bg-white p-8 shadow-glow">
                  <div className="flex items-center gap-3">
                    <Sparkles className="size-6 text-gold-600" aria-hidden />
                    <h2 id="step-pay" className="font-display text-2xl font-bold text-ink">
                      Reserve for {formatINR(BOOKING_AMOUNT)}
                    </h2>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-smoke">
                    A small booking amount locks in your {vehicle.name} — fully adjusted
                    against your final fare of {formatINR(pricing.estimateTotal)}.
                  </p>

                  <dl className="mt-6 space-y-2.5 rounded-2xl bg-cream p-5 text-sm">
                    {[
                      ["Trip", tripType === "ONE_DAY" ? "One day" : `${pricing.days} days`],
                      ["Vehicle", vehicle.name],
                      ["Estimated fare", formatINR(pricing.estimateTotal)],
                      ["Included distance", `${pricing.includedKm} km`],
                      ["Pay now", formatINR(BOOKING_AMOUNT)],
                      ["Balance to driver", formatINR(Math.max(0, pricing.estimateTotal - BOOKING_AMOUNT))],
                    ].map(([k, v], i, arr) => (
                      <div key={k} className={cn("flex justify-between", i === arr.length - 2 && "border-t hairline pt-2.5 font-bold text-ink")}>
                        <dt className="text-graphite">{k}</dt>
                        <dd className="font-semibold text-ink">{v}</dd>
                      </div>
                    ))}
                  </dl>

                  {error && <p role="alert" className="mt-4 text-sm font-semibold text-red-600">{error}</p>}

                  <Button size="xl" className="mt-6 w-full" disabled={busy} onClick={pay}>
                    {busy ? <Loader2 className="animate-spin" aria-hidden /> : <ShieldCheck aria-hidden />}
                    Pay {formatINR(BOOKING_AMOUNT)} securely
                  </Button>
                  <p className="mt-3 text-center text-xs text-smoke">
                    Powered by Razorpay · UPI, cards & netbanking · Refundable up to 24h before pickup
                  </p>
                </div>
                <div className="mt-6 text-center">
                  <button className="text-sm font-semibold text-graphite underline-offset-4 hover:underline" onClick={() => go("details")}>
                    ← Edit trip details
                  </button>
                </div>
              </section>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Summary sidebar */}
      <aside className="hidden lg:block" aria-label="Booking summary">
        <div className="sticky top-28 rounded-3xl border hairline bg-white p-7 shadow-card">
          <h3 className="font-display text-sm font-bold uppercase tracking-[0.18em] text-smoke">
            Your journey
          </h3>
          <dl className="mt-5 space-y-4 text-sm">
            <SummaryRow label="Trip type" value={tripType === "ONE_DAY" ? "One day trip" : `Multi-day · ${days} days`} />
            <SummaryRow label="Passengers" value={`${passengers}`} />
            <SummaryRow label="Vehicle" value={vehicle?.name ?? "—"} />
            {details && <SummaryRow label="Route" value={`${details.pickup} → ${details.destination}`} />}
            {details && <SummaryRow label="Pickup" value={`${details.pickupDate} · ${details.pickupTime}`} />}
          </dl>
          {pricing && (
            <div className="mt-6 rounded-2xl bg-ink p-5 text-cream">
              <p className="text-xs uppercase tracking-wider text-cream/60">Estimated fare</p>
              <p className="mt-1 font-display text-3xl font-bold text-gold-400">
                {formatINR(pricing.estimateTotal)}
              </p>
              <ul className="mt-3 space-y-1 text-xs text-cream/70">
                {pricing.notes.map((n) => <li key={n}>· {n}</li>)}
              </ul>
            </div>
          )}
          <p className="mt-5 flex items-center gap-2 text-xs text-smoke">
            <ShieldCheck className="size-4 text-gold-600" aria-hidden />
            Free cancellation up to 24 hours before pickup
          </p>
          <p className="mt-2 text-xs text-smoke">
            Need help? <a className="font-bold text-gold-700" href={`tel:${siteConfig.phone}`}>{siteConfig.phoneDisplay}</a>
          </p>
        </div>
      </aside>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-smoke">{label}</dt>
      <dd className="text-right font-semibold text-ink">{value}</dd>
    </div>
  );
}

function DetailsStep({
  defaults,
  onSubmit,
  onBack,
  busy,
}: {
  defaults?: DetailsForm;
  onSubmit: (values: DetailsForm) => void;
  onBack: () => void;
  busy: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DetailsForm>({
    resolver: zodResolver(detailsSchema),
    defaultValues: defaults,
  });

  const today = new Date().toISOString().split("T")[0];

  return (
    <section aria-labelledby="step-details">
      <h2 id="step-details" className="font-display text-3xl font-bold text-ink">
        Where are we taking you?
      </h2>
      <p className="mt-2 text-smoke">Your driver&rsquo;s details arrive on WhatsApp before pickup.</p>

      <form className="mt-8 grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <Label htmlFor="pickup">Pickup location</Label>
          <Input id="pickup" placeholder="e.g. Infopark, Kakkanad" {...register("pickup")} aria-invalid={!!errors.pickup} />
          {errors.pickup && <FieldError msg={errors.pickup.message} />}
        </div>
        <div>
          <Label htmlFor="destination">Destination</Label>
          <Input id="destination" placeholder="e.g. Munnar" {...register("destination")} aria-invalid={!!errors.destination} />
          {errors.destination && <FieldError msg={errors.destination.message} />}
        </div>
        <div>
          <Label htmlFor="pickupDate">Date</Label>
          <Input id="pickupDate" type="date" min={today} {...register("pickupDate")} aria-invalid={!!errors.pickupDate} />
          {errors.pickupDate && <FieldError msg={errors.pickupDate.message} />}
        </div>
        <div>
          <Label htmlFor="pickupTime">Time</Label>
          <Input id="pickupTime" type="time" {...register("pickupTime")} aria-invalid={!!errors.pickupTime} />
          {errors.pickupTime && <FieldError msg={errors.pickupTime.message} />}
        </div>
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" placeholder="Your name" autoComplete="name" {...register("name")} aria-invalid={!!errors.name} />
          {errors.name && <FieldError msg={errors.name.message} />}
        </div>
        <div>
          <Label htmlFor="phone">Mobile number</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-semibold text-graphite">+91</span>
            <Input id="phone" type="tel" inputMode="numeric" maxLength={10} className="pl-13" placeholder="10-digit number" autoComplete="tel-national" {...register("phone")} aria-invalid={!!errors.phone} />
          </div>
          {errors.phone && <FieldError msg={errors.phone.message} />}
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="email">Email <span className="font-normal text-smoke">(optional — for your confirmation)</span></Label>
          <Input id="email" type="email" placeholder="you@example.com" autoComplete="email" {...register("email")} aria-invalid={!!errors.email} />
          {errors.email && <FieldError msg={errors.email.message} />}
        </div>

        <div className="mt-4 flex justify-between sm:col-span-2">
          <Button type="button" variant="ghost" size="lg" onClick={onBack}>
            <ArrowLeft aria-hidden /> Back
          </Button>
          <Button type="submit" size="lg" disabled={busy}>
            {busy ? <Loader2 className="animate-spin" aria-hidden /> : null}
            Verify phone <ArrowRight aria-hidden />
          </Button>
        </div>
      </form>
    </section>
  );
}

function FieldError({ msg }: { msg?: string }) {
  return <p role="alert" className="mt-1.5 text-[13px] font-semibold text-red-600">{msg}</p>;
}

function loadRazorpay(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load payment gateway"));
    document.body.appendChild(script);
  });
}
