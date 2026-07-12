"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Sprout, HeartHandshake, CarFront, Building2, Plane, Satellite, Crown } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

const chapters = [
  {
    icon: Sprout,
    era: "1995",
    title: "Started with a vision",
    text: "ITR opens its doors in Kochi as a modest single venture — no fleet, no offices, just an uncompromising idea of what service should feel like.",
  },
  {
    icon: HeartHandshake,
    era: "Late 1990s",
    title: "Built on customer trust",
    text: "Word travels the Kerala way — family to family. Repeat customers become the entire growth strategy, and 'Service at Your Doorstep' becomes the company motto.",
  },
  {
    icon: CarFront,
    era: "2000s",
    title: "A professional fleet takes shape",
    text: "The first dedicated vehicles arrive — commercially licensed, fully insured, driven by verified professionals. The standards that define ITR Cabs today are written in this decade.",
  },
  {
    icon: Building2,
    era: "2010s",
    title: "Corporate transport, mastered",
    text: "As Infopark and SmartCity boom, ITR becomes the transport backbone for Kochi's workplaces — employee shuttles, route planning, night-shift safety protocols and credit billing that finance teams love.",
  },
  {
    icon: Plane,
    era: "2015 →",
    title: "Airports, tourism & beyond",
    text: "Flight-tracked airport transfers, holiday circuits to Munnar and the backwaters, wedding fleets and pilgrimage tours — the company grows into a complete travel house.",
  },
  {
    icon: Satellite,
    era: "2020s",
    title: "Technology in the driver's seat",
    text: "A GPS-enabled fleet with live trip visibility, digital trip records, online booking and professional operations tooling — modern technology wrapped around old-fashioned care.",
  },
  {
    icon: Crown,
    era: "Today",
    title: "Serving customers across Kerala",
    text: "From Kakkanad, Ernakulam, ITR Cabs serves families, enterprises and travellers across the state — a premium fleet from sedans to the Urbania, and a support desk that never sleeps.",
  },
];

export function AboutTimeline() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 65%"] });
  const spine = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section className="relative bg-white py-20 md:py-28" aria-label="The ITR journey">
      <div className="container-luxe max-w-3xl">
        <div ref={ref} className="relative pl-10 sm:pl-14">
          {/* Spine */}
          <div aria-hidden className="absolute bottom-4 left-[15px] top-2 w-0.5 bg-ink/8 sm:left-[23px]">
            <motion.div className="h-full w-full origin-top bg-gradient-gold" style={{ scaleY: spine }} />
          </div>

          <ol className="space-y-14">
            {chapters.map((c) => (
              <li key={c.title} className="relative">
                <Reveal y={28}>
                  <span className="absolute -left-10 top-1 flex size-8 items-center justify-center rounded-full border-2 border-gold-400 bg-white shadow-glow sm:-left-14 sm:size-12">
                    <c.icon className="size-4 text-gold-600 sm:size-5" aria-hidden />
                  </span>
                  <p className="font-serif text-xl italic text-gold-600">{c.era}</p>
                  <h3 className="mt-1 font-display text-2xl font-bold text-ink">{c.title}</h3>
                  <p className="mt-2.5 leading-relaxed text-smoke">{c.text}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
