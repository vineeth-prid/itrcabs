import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";

const stats = [
  { value: 30, suffix: "+", label: "Years of ITR trust", note: "Serving Kerala since 1995" },
  { value: 120000, suffix: "+", label: "Journeys completed", note: "City runs to grand tours" },
  { value: 60, suffix: "+", label: "Vehicles in fleet", note: "Sedan to 26-seat coach" },
  { value: 98, suffix: "%", label: "On-time pickups", note: "Tracked across every trip" },
];

export function StatsSection() {
  return (
    <section className="relative overflow-hidden border-y hairline bg-white py-20 md:py-24" aria-label="ITR Cabs by the numbers">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-[70rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-100/60 blur-3xl" />
      <div className="container-luxe relative">
        <dl className="grid gap-10 text-center sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.1} className="group">
              <div className="relative">
                <dd className="font-display text-5xl font-bold tracking-tight text-ink md:text-6xl">
                  <CountUp to={s.value} suffix={s.suffix} />
                </dd>
                <dt className="mt-2 font-display text-base font-bold text-graphite">{s.label}</dt>
                <p className="mt-1 text-sm text-smoke">{s.note}</p>
                <span aria-hidden className="mx-auto mt-4 block h-0.5 w-10 origin-center scale-x-100 rounded-full bg-gradient-gold transition-transform duration-500 group-hover:scale-x-[2.2]" />
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
