import { ShieldCheck, Satellite, Clock3, ReceiptText, Award, HeartHandshake } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Satellite,
    title: "GPS on every journey",
    text: "Every vehicle streams live location. Share your trip with family, or watch your employees' shuttles move in real time.",
    span: "lg:col-span-2",
    tone: "dark" as const,
  },
  {
    icon: ShieldCheck,
    title: "Verified chauffeurs",
    text: "Police-verified, commercially licensed and trained on Kerala's hill routes. Your driver's details arrive before pickup.",
  },
  {
    icon: ReceiptText,
    title: "Transparent billing",
    text: "Fares agreed before you ride. Toll, parking and extra kilometres itemised — never surprises.",
  },
  {
    icon: Clock3,
    title: "On time, 24×7",
    text: "Flight-tracked airport runs, dawn temple starts and midnight drops. Punctuality is the product.",
  },
  {
    icon: Award,
    title: "Immaculate fleet",
    text: "Preventive maintenance, documented inspections and detailing between trips — step into a car that feels new.",
    span: "lg:col-span-2",
    tone: "gold" as const,
  },
  {
    icon: HeartHandshake,
    title: "Kerala-hearted service",
    text: "A responsive support team in Kakkanad that treats every guest like family — the ITR way since 1995.",
  },
];

export function WhyItr() {
  return (
    <section className="relative overflow-hidden bg-cream py-24 md:py-32" aria-labelledby="why-itr">
      <div aria-hidden className="pointer-events-none absolute -right-40 top-20 size-[32rem] rounded-full bg-gold-200/40 blur-3xl" />
      <div className="container-luxe relative">
        <SectionHeading
          eyebrow="Why ITR"
          title="A cab company that behaves like a"
          accent="luxury brand."
          description="We built ITR Cabs on the discipline of corporate transport and the warmth of Kerala hospitality — then polished every detail."
        />

        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" gap={0.09}>
          {features.map((f) => (
            <StaggerItem key={f.title} className={cn("h-full", f.span)}>
              <TiltCard className="h-full rounded-3xl" maxTilt={4}>
                <div
                  className={cn(
                    "flex h-full flex-col rounded-3xl border p-8 shadow-card transition-shadow duration-500 group-hover:shadow-card-hover",
                    f.tone === "dark"
                      ? "border-white/10 bg-ink text-cream"
                      : f.tone === "gold"
                        ? "border-gold-300 bg-gradient-gold text-ink"
                        : "hairline bg-white"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-12 items-center justify-center rounded-2xl",
                      f.tone === "dark"
                        ? "bg-gold-500/15 text-gold-400"
                        : f.tone === "gold"
                          ? "bg-ink text-gold-400"
                          : "bg-gold-100 text-gold-700"
                    )}
                  >
                    <f.icon className="size-6" aria-hidden />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-bold">{f.title}</h3>
                  <p
                    className={cn(
                      "mt-2.5 text-[15px] leading-relaxed",
                      f.tone === "dark" ? "text-cream/70" : f.tone === "gold" ? "text-ink/80" : "text-smoke"
                    )}
                  >
                    {f.text}
                  </p>
                </div>
              </TiltCard>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
