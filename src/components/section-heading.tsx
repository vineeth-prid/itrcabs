import { cn } from "@/lib/utils";
import { Eyebrow } from "@/components/ui/badge";
import { TextReveal } from "@/components/motion/text-reveal";
import { Reveal } from "@/components/motion/reveal";

export function SectionHeading({
  eyebrow,
  title,
  accent,
  description,
  align = "center",
  dark = false,
  className,
}: {
  eyebrow: string;
  title: string;
  /** Word(s) rendered in italic serif gold — the luxury flourish. */
  accent?: string;
  description?: string;
  align?: "center" | "left";
  dark?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-14 max-w-3xl md:mb-20",
        align === "center" ? "mx-auto text-center" : "text-left",
        className
      )}
    >
      <Reveal duration={0.7} y={16}>
        <Eyebrow className={cn(align === "center" && "justify-center")}>{eyebrow}</Eyebrow>
      </Reveal>
      <TextReveal
        as="h2"
        text={title}
        className={cn(
          "mt-4 font-display text-4xl font-bold leading-[1.08] tracking-tight text-balance sm:text-5xl",
          dark ? "text-cream" : "text-ink"
        )}
      />
      {accent && (
        <Reveal delay={0.25} y={20} className="-mt-1">
          <span className="font-serif text-4xl italic leading-none text-gradient-gold sm:text-5xl">
            {accent}
          </span>
        </Reveal>
      )}
      {description && (
        <Reveal delay={0.2} y={24}>
          <p className={cn("mt-5 text-lg leading-relaxed", dark ? "text-cream/70" : "text-smoke")}>
            {description}
          </p>
        </Reveal>
      )}
    </div>
  );
}
