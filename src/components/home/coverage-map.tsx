"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

interface Pin {
  name: string;
  x: number;
  y: number;
  note: string;
  hub?: boolean;
}

const pins: Pin[] = [
  { name: "Kannur", x: 96, y: 108, note: "North Malabar pickups & drops" },
  { name: "Wayanad", x: 152, y: 148, note: "Hill packages & resort transfers" },
  { name: "Kozhikode", x: 108, y: 182, note: "City & airport connections" },
  { name: "Thrissur", x: 138, y: 300, note: "Cultural circuit & pooram season" },
  { name: "Kochi", x: 128, y: 372, note: "Our home hub — 24×7 dispatch", hub: true },
  { name: "Munnar", x: 196, y: 362, note: "Tea country specialists" },
  { name: "Alleppey", x: 132, y: 434, note: "Backwater & houseboat transfers" },
  { name: "Trivandrum", x: 172, y: 566, note: "Capital city & Kovalam runs" },
];

/** Stylised Kerala silhouette — recognisable coastal sweep, vector-light. */
const KERALA_PATH =
  "M86 44 C104 30 128 34 138 52 C150 74 142 96 156 112 C174 132 196 138 204 162 C212 186 200 208 208 232 C218 262 244 276 246 308 C248 338 228 352 232 380 C236 410 256 428 250 458 C244 490 216 500 208 528 C200 554 204 584 186 602 C170 618 146 616 136 596 C124 572 134 548 122 524 C108 496 88 484 82 454 C76 424 92 404 86 376 C80 346 62 330 60 300 C58 270 74 252 72 224 C70 194 54 176 58 148 C62 118 80 108 82 82 C83 68 80 56 86 44 Z";

export function CoverageMap() {
  const [active, setActive] = useState<Pin>(pins[4]);

  return (
    <section className="relative overflow-hidden bg-cream py-24 md:py-32" aria-labelledby="coverage-heading">
      <div className="container-luxe">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Coverage"
              title="One fleet, every corner of"
              accent="God's Own Country."
              description="Dispatch from Kakkanad, coverage everywhere — from Kasaragod's beaches to Kovalam's cliffs, plus outstation routes into Tamil Nadu and Karnataka."
              className="mb-10 md:mb-10"
            />

            <Stagger className="grid grid-cols-2 gap-3" gap={0.06}>
              {pins.map((p) => (
                <StaggerItem key={p.name}>
                  <button
                    onMouseEnter={() => setActive(p)}
                    onFocus={() => setActive(p)}
                    onClick={() => setActive(p)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-2xl border px-4 py-3 text-left transition-all duration-300",
                      active.name === p.name
                        ? "border-gold-400 bg-white shadow-glow"
                        : "hairline bg-white/60 hover:border-gold-300 hover:bg-white"
                    )}
                    aria-pressed={active.name === p.name}
                  >
                    <MapPin
                      className={cn("size-4 shrink-0", active.name === p.name ? "text-gold-600" : "text-smoke")}
                      aria-hidden
                    />
                    <span>
                      <span className="block text-sm font-bold text-ink">{p.name}</span>
                      {p.hub && <span className="block text-[11px] font-semibold text-gold-600">HQ · Kakkanad</span>}
                    </span>
                  </button>
                </StaggerItem>
              ))}
            </Stagger>

            <Reveal delay={0.2}>
              <p className="mt-6 flex items-center gap-2 rounded-2xl bg-gold-100 px-5 py-3.5 text-sm font-semibold text-gold-900">
                <Navigation className="size-4 shrink-0" aria-hidden />
                {active.name}: {active.note}
              </p>
            </Reveal>
          </div>

          {/* The animated map */}
          <Reveal delay={0.1} className="mx-auto w-full max-w-md">
            <div className="relative rounded-[2.5rem] border hairline bg-white p-8 shadow-card">
              <div aria-hidden className="absolute inset-0 rounded-[2.5rem] bg-dot-grid opacity-60" />
              <svg viewBox="0 0 300 640" className="relative w-full" role="img" aria-label="Map of Kerala showing ITR Cabs coverage across major cities">
                <defs>
                  <linearGradient id="map-fill" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#173226" />
                    <stop offset="1" stopColor="#0b0b0c" />
                  </linearGradient>
                </defs>
                <motion.path
                  d={KERALA_PATH}
                  fill="url(#map-fill)"
                  stroke="#f7b524"
                  strokeWidth="2"
                  initial={{ pathLength: 0, fillOpacity: 0 }}
                  whileInView={{ pathLength: 1, fillOpacity: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ pathLength: { duration: 2.2, ease: "easeInOut" }, fillOpacity: { duration: 1, delay: 1.4 } }}
                />
                {/* Route lines from hub */}
                {pins.filter((p) => !p.hub).map((p, i) => (
                  <motion.line
                    key={p.name}
                    x1={128}
                    y1={372}
                    x2={p.x}
                    y2={p.y}
                    stroke="#f7b524"
                    strokeWidth="1.2"
                    strokeDasharray="4 5"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 0.55 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 1.6 + i * 0.12, ease: "easeOut" }}
                  />
                ))}
                {/* Pins */}
                {pins.map((p, i) => (
                  <motion.g
                    key={p.name}
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.7 + i * 0.1, type: "spring", stiffness: 300, damping: 16 }}
                    style={{ transformBox: "fill-box", transformOrigin: "center" }}
                  >
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={p.hub ? 11 : 7}
                      fill={active.name === p.name ? "#f7b524" : p.hub ? "#f7b524" : "#faf9f5"}
                      stroke="#f7b524"
                      strokeWidth="2"
                      className="cursor-pointer"
                      onMouseEnter={() => setActive(p)}
                    />
                    {(p.hub || active.name === p.name) && (
                      <circle cx={p.x} cy={p.y} r={p.hub ? 11 : 7} fill="none" stroke="#f7b524" strokeWidth="2" opacity="0.6">
                        <animate attributeName="r" values={`${p.hub ? 11 : 7};${p.hub ? 26 : 20}`} dur="1.8s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.6;0" dur="1.8s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <text
                      x={p.x + (p.x > 180 ? -14 : 14)}
                      y={p.y + 4}
                      textAnchor={p.x > 180 ? "end" : "start"}
                      fontSize="13"
                      fontWeight="700"
                      fill={active.name === p.name ? "#b14c09" : "#2a2a2e"}
                      className="pointer-events-none select-none"
                      style={{ fontFamily: "var(--font-sora)" }}
                    >
                      {p.name}
                    </text>
                  </motion.g>
                ))}
              </svg>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
