import { Star, Quote, PlayCircle } from "lucide-react";
import { testimonials, type Testimonial } from "@/config/testimonials";
import { siteConfig } from "@/config/site";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <figure className="w-[320px] shrink-0 rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-sm transition-colors duration-500 hover:border-gold-500/40 hover:bg-white/[0.09] sm:w-[380px]">
      <Quote className="size-6 text-gold-400" aria-hidden />
      <blockquote className="mt-3 text-[15px] leading-relaxed text-cream/85">
        &ldquo;{t.text}&rdquo;
      </blockquote>
      <figcaption className="mt-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex size-11 items-center justify-center rounded-full bg-gradient-gold font-display text-sm font-bold text-ink"
          >
            {t.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </span>
          <div>
            <p className="text-sm font-bold text-white">{t.name}</p>
            <p className="text-xs text-cream/60">{t.role} · {t.location}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="flex gap-0.5" aria-label={`${t.rating} out of 5 stars`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn("size-3.5", i < t.rating ? "fill-gold-400 text-gold-400" : "text-white/20")}
                aria-hidden
              />
            ))}
          </p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-cream/45">{t.trip}</p>
        </div>
      </figcaption>
    </figure>
  );
}

export function TestimonialsSection() {
  const rowA = testimonials.slice(0, 4);
  const rowB = testimonials.slice(4);

  return (
    <section className="relative overflow-hidden bg-ink py-24 md:py-32" aria-labelledby="testimonials-heading">
      <div aria-hidden className="pointer-events-none absolute -left-40 top-40 size-[28rem] rounded-full bg-gold-500/10 blur-3xl" />
      <div className="container-luxe">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <SectionHeading
            dark
            align="left"
            eyebrow="Testimonials"
            title="Kerala keeps"
            accent="riding with us."
            className="mb-0 md:mb-0"
          />
          <Reveal delay={0.15}>
            <a
              href="https://g.page/itrcabs"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-2xl border border-white/15 bg-white/5 px-6 py-4 transition-colors hover:border-gold-400/50"
            >
              <span className="font-display text-4xl font-bold text-white">{siteConfig.googleRating.value}</span>
              <span>
                <span className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-4 fill-gold-400 text-gold-400" aria-hidden />
                  ))}
                </span>
                <span className="mt-1 block text-xs text-cream/60">
                  Google rating · {siteConfig.googleRating.count.toLocaleString("en-IN")}+ reviews
                </span>
              </span>
            </a>
          </Reveal>
        </div>
      </div>

      {/* Auto-scrolling marquee rows, pause on hover */}
      <div className="mask-fade-x mt-14 space-y-5 overflow-hidden">
        <div className="flex w-max animate-marquee gap-5 hover:[animation-play-state:paused]">
          {[...rowA, ...rowA].map((t, i) => (
            <TestimonialCard key={`a-${i}`} t={t} />
          ))}
        </div>
        <div className="flex w-max animate-marquee-reverse gap-5 hover:[animation-play-state:paused]">
          {[...rowB, ...rowB].map((t, i) => (
            <TestimonialCard key={`b-${i}`} t={t} />
          ))}
        </div>
      </div>

      {/* Video testimonial strip */}
      <div className="container-luxe mt-14">
        <Reveal>
          <div className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-white/10 bg-gradient-to-r from-white/[0.06] to-transparent p-8 sm:flex-row">
            <div className="flex items-center gap-4">
              <span className="flex size-14 items-center justify-center rounded-full bg-gradient-gold text-ink shadow-glow">
                <PlayCircle className="size-7" aria-hidden />
              </span>
              <div>
                <h3 className="font-display text-lg font-bold text-white">Video stories from our guests</h3>
                <p className="text-sm text-cream/60">Real journeys, filmed by the families who took them.</p>
              </div>
            </div>
            <a
              href={siteConfig.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-gold-400/50 px-7 py-3 text-sm font-bold text-gold-300 transition-all duration-300 hover:bg-gold-400 hover:text-ink"
            >
              Watch on Instagram
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
