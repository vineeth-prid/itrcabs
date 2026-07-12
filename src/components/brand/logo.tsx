import { cn } from "@/lib/utils";

/**
 * ITR Cabs mark — flowing golden road ribbon with a wheel,
 * redrawn as a crisp vector from the brand identity.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden className={cn("size-9", className)}>
      <defs>
        <linearGradient id="itr-gold" x1="8" y1="44" x2="40" y2="4" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#d56e06" />
          <stop offset="0.5" stopColor="#f1940b" />
          <stop offset="1" stopColor="#fbd267" />
        </linearGradient>
      </defs>
      {/* Flowing road ribbon */}
      <path
        d="M14 46c-4-7-5-13-1.5-19C16 21.5 23 18 27.5 13.5 31 10 32 6.5 30.5 2c6 2.5 9.5 7 9 12.5-.4 5.2-4.6 9-10 12.5-5.8 3.7-9.6 6.6-11 10.5-1 2.8-.6 5.6 1.5 8.5z"
        fill="url(#itr-gold)"
      />
      {/* Centre line */}
      <path
        d="M18.5 43c-1.8-4.4-.9-8.4 3.2-12.2 3.6-3.4 8.2-6 11.2-9.6 2.6-3.1 3.4-6.6 2.2-10.6"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeDasharray="4 3.4"
        fill="none"
      />
      {/* Wheel */}
      <circle cx="33.5" cy="14.5" r="7.5" fill="url(#itr-gold)" stroke="#fff" strokeWidth="1.6" />
      <circle cx="33.5" cy="14.5" r="2" fill="#fff" />
      {[0, 72, 144, 216, 288].map((deg) => (
        <line
          key={deg}
          x1="33.5"
          y1="14.5"
          x2={33.5 + 5.6 * Math.cos((deg - 90) * (Math.PI / 180))}
          y2={14.5 + 5.6 * Math.sin((deg - 90) * (Math.PI / 180))}
          stroke="#fff"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

export function Logo({ className, dark = false }: { className?: string; dark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span
        className={cn(
          "font-display text-[1.35rem] font-bold tracking-tight leading-none",
          dark ? "text-cream" : "text-ink"
        )}
      >
        ITR{" "}
        <span className="text-gradient-gold">Cabs</span>
      </span>
    </span>
  );
}
