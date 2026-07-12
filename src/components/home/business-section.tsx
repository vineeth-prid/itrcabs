import Link from "next/link";
import { Briefcase, Plane, Users, ArrowRight, CheckCircle2 } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Reveal, Stagger, StaggerItem, MaskReveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";

const pillars = [
  {
    icon: Plane,
    title: "Airport Transfers",
    href: "/services/airport-transfer",
    text: "Flight-tracked pickups at COK with meet & greet, fixed fares and 24×7 dispatch. Landing at 2 am is our specialty.",
    points: ["Flight tracking", "Name-board meet & greet", "Fixed all-inclusive fares"],
  },
  {
    icon: Briefcase,
    title: "Corporate Cab",
    href: "/services/corporate-cab",
    text: "Executive movement for Infopark, SmartCity and CSEZ — one coordinator, one monthly invoice, zero friction.",
    points: ["Dedicated coordinator", "Monthly consolidated billing", "Priority dispatch"],
  },
  {
    icon: Users,
    title: "Employee Transportation",
    href: "/services/employee-transportation",
    text: "Shift-based staff shuttles with roster planning, night-safety protocols, backup vehicles and a 35-day credit cycle.",
    points: ["Route optimisation", "Backup fleet guarantee", "Trip-wise invoicing"],
  },
];

export function BusinessSection() {
  return (
    <section className="relative overflow-hidden bg-cream py-24 md:py-32" aria-labelledby="business-heading">
      <div className="container-luxe">
        <div className="grid items-start gap-14 lg:grid-cols-[1fr_1.4fr]">
          <div className="lg:sticky lg:top-28">
            <SectionHeading
              align="left"
              eyebrow="For Business"
              title="The transport partner behind"
              accent="Kochi's workday."
              description="Before we polished tourism, we perfected corporate transport. GPS-visible operations, disciplined drivers and billing your finance team will actually enjoy."
              className="mb-8 md:mb-8"
            />
            <Reveal delay={0.2}>
              <Link href="/contact?subject=corporate">
                <Button size="lg">
                  Request a corporate proposal <ArrowRight aria-hidden />
                </Button>
              </Link>
            </Reveal>
            <Reveal delay={0.3}>
              <p className="mt-6 text-sm text-smoke">
                Serving IT parks & enterprises across Ernakulam · 35-day credit billing · Backup fleet SLA
              </p>
            </Reveal>
          </div>

          <Stagger className="space-y-5" gap={0.12}>
            {pillars.map((p) => (
              <StaggerItem key={p.title}>
                <MaskReveal>
                  <Link
                    href={p.href}
                    className="group flex flex-col gap-5 rounded-3xl border hairline bg-white p-7 shadow-card transition-all duration-500 ease-[var(--ease-luxe)] hover:-translate-y-1.5 hover:shadow-card-hover sm:flex-row sm:items-start sm:p-8"
                  >
                    <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-ink text-gold-400 transition-all duration-500 group-hover:bg-gradient-gold group-hover:text-ink group-hover:shadow-glow">
                      <p.icon className="size-7" aria-hidden />
                    </span>
                    <div className="flex-1">
                      <h3 className="flex items-center justify-between font-display text-xl font-bold text-ink">
                        {p.title}
                        <ArrowRight className="size-5 -translate-x-2 text-gold-600 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" aria-hidden />
                      </h3>
                      <p className="mt-2 text-[15px] leading-relaxed text-smoke">{p.text}</p>
                      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5">
                        {p.points.map((pt) => (
                          <li key={pt} className="flex items-center gap-1.5 text-[13px] font-semibold text-graphite">
                            <CheckCircle2 className="size-3.5 text-gold-600" aria-hidden /> {pt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Link>
                </MaskReveal>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
