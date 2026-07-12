import { ShieldCheck, MapPin, Users, Star } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

const marks = [
  "Infopark companies", "SmartCity Kochi", "CSEZ units", "Kerala families",
  "Destination weddings", "NRI travellers", "Hotel partners", "Tour operators",
];

const proofs = [
  { icon: Star, text: "4.9★ Google rating" },
  { icon: ShieldCheck, text: "Verified chauffeurs" },
  { icon: MapPin, text: "GPS-tracked fleet" },
  { icon: Users, text: "30 years of service" },
];

export function TrustBar() {
  return (
    <section aria-label="Trusted by Kerala" className="relative border-b hairline bg-white py-10">
      <div className="container-luxe">
        <Reveal y={16} blur={false}>
          <p className="text-center text-[12px] font-semibold uppercase tracking-[0.28em] text-smoke">
            Trusted by Kerala&rsquo;s families & Kochi&rsquo;s leading workplaces
          </p>
        </Reveal>

        <div className="mask-fade-x mt-7 overflow-hidden" aria-hidden>
          <div className="flex w-max animate-marquee gap-6 hover:[animation-play-state:paused]">
            {[...marks, ...marks].map((m, i) => (
              <span
                key={i}
                className="whitespace-nowrap rounded-full border hairline bg-cream px-6 py-2.5 font-display text-sm font-semibold text-graphite"
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {proofs.map((p) => (
            <li key={p.text} className="flex items-center gap-2 text-sm font-semibold text-graphite">
              <p.icon className="size-4 text-gold-600" aria-hidden />
              {p.text}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
