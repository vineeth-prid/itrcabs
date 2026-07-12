"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Clock, Route } from "lucide-react";
import { destinations } from "@/config/destinations";
import { SectionHeading } from "@/components/section-heading";
import { cn } from "@/lib/utils";

/**
 * Horizontal scroll-driven destination gallery — the section scrolls
 * vertically while the card rail glides sideways, cinema-style.
 */
export function DestinationsShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0.05, 0.95], ["4%", "-58%"]);

  return (
    <section className="relative overflow-hidden bg-ink py-24 text-cream md:py-32" aria-labelledby="destinations-heading">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-gold-500/60 to-transparent" />
      <div className="container-luxe">
        <SectionHeading
          dark
          align="left"
          eyebrow="Tour Packages"
          title="Eight journeys everyone"
          accent="should take once."
          description="Signature routes with dedicated cars, hill-trained drivers and itineraries polished over thousands of trips."
        />
      </div>

      <div ref={ref}>
        <motion.div
          className="flex gap-6 pl-5 will-change-transform sm:pl-12"
          style={reduced ? undefined : { x }}
        >
          {destinations.map((d, i) => (
            <Link
              key={d.slug}
              href={`/destinations/${d.slug}`}
              className="group w-[78vw] shrink-0 sm:w-[380px]"
            >
              <article
                className={cn(
                  "relative flex h-[440px] flex-col justify-end overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br p-7 transition-transform duration-500 ease-[var(--ease-luxe)] group-hover:-translate-y-2",
                  d.gradient
                )}
              >
                {/* Texture + glow */}
                <div aria-hidden className="absolute inset-0 bg-dot-grid opacity-15" />
                <div aria-hidden className="absolute -right-10 -top-10 size-44 rounded-full bg-white/10 blur-2xl transition-all duration-700 group-hover:bg-gold-400/25" />
                <span aria-hidden className="absolute right-6 top-6 text-5xl drop-shadow-lg transition-transform duration-500 group-hover:scale-125 group-hover:-rotate-6">
                  {d.emoji}
                </span>
                <span className="absolute left-7 top-6 font-serif text-lg italic text-white/60">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="relative">
                  <h3 className="font-display text-3xl font-bold text-white">{d.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/75">{d.blurb}</p>
                  <div className="mt-5 flex flex-wrap items-center gap-3 text-[12px] font-semibold text-white/85">
                    {d.distanceKm > 0 && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-black/25 px-3 py-1 backdrop-blur-sm">
                        <Route className="size-3.5" aria-hidden /> {d.distanceKm} km
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/25 px-3 py-1 backdrop-blur-sm">
                      <Clock className="size-3.5" aria-hidden /> {d.driveTime}
                    </span>
                  </div>
                  <span className="mt-6 inline-flex items-center gap-1.5 border-b border-gold-400/0 pb-0.5 text-sm font-bold text-gold-300 transition-all duration-300 group-hover:gap-3 group-hover:border-gold-400">
                    Plan this trip <ArrowUpRight className="size-4" aria-hidden />
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
