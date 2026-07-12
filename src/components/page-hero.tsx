import { Eyebrow } from "@/components/ui/badge";
import { TextReveal } from "@/components/motion/text-reveal";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

/** Shared dark inner-page hero with golden horizon and dot texture. */
export function PageHero({
  eyebrow,
  title,
  accent,
  description,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("relative overflow-hidden bg-ink pb-20 pt-36 text-cream md:pb-28 md:pt-44", className)}>
      <div aria-hidden className="absolute inset-0 bg-dot-grid opacity-[0.07]" />
      <div aria-hidden className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[50rem] -translate-x-1/2 rounded-full bg-gold-500/15 blur-3xl" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold-500/70 to-transparent" />
      <div className="container-luxe relative">
        <Reveal y={14} duration={0.7}>
          <Eyebrow>{eyebrow}</Eyebrow>
        </Reveal>
        <TextReveal
          as="h1"
          text={title}
          className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.06] tracking-tight sm:text-5xl md:text-6xl"
        />
        {accent && (
          <Reveal delay={0.3} y={18}>
            <span className="font-serif text-4xl italic text-gradient-gold sm:text-5xl md:text-6xl">{accent}</span>
          </Reveal>
        )}
        {description && (
          <Reveal delay={0.25}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-cream/70">{description}</p>
          </Reveal>
        )}
        {children}
      </div>
    </header>
  );
}
