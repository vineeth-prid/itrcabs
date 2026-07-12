import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "gold",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: "gold" | "dark" | "outline" | "soft" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
        variant === "gold" && "bg-gradient-gold text-ink",
        variant === "dark" && "bg-ink text-cream",
        variant === "outline" && "border border-ink/15 text-graphite",
        variant === "soft" && "bg-gold-100 text-gold-800",
        className
      )}
      {...props}
    />
  );
}

export function Eyebrow({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.22em] text-gold-600",
        className
      )}
    >
      <span aria-hidden className="h-px w-8 bg-gradient-gold" />
      {children}
    </span>
  );
}
