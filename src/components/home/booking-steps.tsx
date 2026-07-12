"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { CalendarCheck, CarFront, ShieldCheck, PartyPopper } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Stagger, StaggerItem, Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/motion/magnetic";

const steps = [
  {
    icon: CalendarCheck,
    title: "Tell us your trip",
    text: "One day or many, how many travellers, where and when. Twenty seconds, tops.",
  },
  {
    icon: CarFront,
    title: "Pick your vehicle",
    text: "Only cars that fit your group appear — with real prices and everything included, spelled out.",
  },
  {
    icon: ShieldCheck,
    title: "Verify & reserve",
    text: "OTP confirms your phone, ₹199 confirms your car. Fully adjusted against the final fare.",
  },
  {
    icon: PartyPopper,
    title: "We take it from here",
    text: "Booking ID lands on SMS, email and WhatsApp. Your chauffeur's details follow before pickup.",
  },
];

export function BookingSteps() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section className="relative bg-white py-24 md:py-32" aria-labelledby="steps-heading">
      <div className="container-luxe">
        <SectionHeading
          eyebrow="Booking"
          title="Four steps, two minutes,"
          accent="zero phone tag."
          description="Booking a premium cab should feel as premium as the ride. We rebuilt every step until it did."
        />

        <div ref={ref} className="relative">
          {/* Progress spine (desktop) */}
          <div aria-hidden className="absolute left-0 right-0 top-9 hidden h-0.5 bg-ink/8 lg:block">
            <motion.div
              className="h-full origin-left bg-gradient-gold"
              style={{ scaleX: lineScale }}
            />
          </div>

          <Stagger className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4" gap={0.14}>
            {steps.map((s, i) => (
              <StaggerItem key={s.title}>
                <div className="group relative">
                  <div className="relative z-10 flex size-[4.5rem] items-center justify-center rounded-2xl border-2 border-gold-400 bg-white shadow-card transition-all duration-500 group-hover:bg-gradient-gold group-hover:shadow-glow">
                    <s.icon className="size-8 text-gold-600 transition-colors duration-500 group-hover:text-ink" aria-hidden />
                    <span className="absolute -right-2.5 -top-2.5 flex size-7 items-center justify-center rounded-full bg-ink font-display text-[13px] font-bold text-gold-400">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-6 font-display text-lg font-bold text-ink">{s.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-smoke">{s.text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        <Reveal delay={0.2} className="mt-14 text-center">
          <Magnetic>
            <Link href="/book">
              <Button size="xl">Start booking</Button>
            </Link>
          </Magnetic>
        </Reveal>
      </div>
    </section>
  );
}
