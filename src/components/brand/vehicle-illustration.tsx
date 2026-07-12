import type { Illustration } from "@/config/fleet";
import { cn } from "@/lib/utils";

/**
 * Signature duotone fleet illustrations — ink bodies, gold detailing,
 * consistent side profile across the whole range. Vector, zero payload.
 */

function Wheel({ cx, cy, r = 17 }: { cx: number; cy: number; r?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#0a0a0c" />
      <circle cx={cx} cy={cy} r={r * 0.55} fill="#1c1c20" stroke="#f7b524" strokeWidth="1.4" />
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <line
          key={deg}
          x1={cx}
          y1={cy}
          x2={cx + r * 0.48 * Math.cos((deg * Math.PI) / 180)}
          y2={cy + r * 0.48 * Math.sin((deg * Math.PI) / 180)}
          stroke="#b9b9c0"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      ))}
      <circle cx={cx} cy={cy} r={2.2} fill="#f7b524" />
    </g>
  );
}

const defs = (
  <defs>
    <linearGradient id="vi-body" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#2f2f34" />
      <stop offset="0.5" stopColor="#17171a" />
      <stop offset="1" stopColor="#0b0b0c" />
    </linearGradient>
    <linearGradient id="vi-glass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#b7dcea" />
      <stop offset="1" stopColor="#4a6a7c" />
    </linearGradient>
  </defs>
);

function Sedan() {
  return (
    <g>
      <path d="M20 92c-5-1-7-4-7-9 0-7 3-11 9-13l24-5c9-8 21-14 36-17 20-3 43-3 61 1 13 3 23 8 30 14l45 6c15 2 23 6 25 14 1 5-1 8-5 9z" fill="url(#vi-body)" />
      <path d="M88 48c12-8 27-13 43-14 18-1 36 2 48 8 6 3 9 6 12 9l-27 4H97z" fill="url(#vi-body)" />
      <path d="M100 50c9-7 21-11 34-12l4 15-41 1z" fill="url(#vi-glass)" />
      <path d="M143 38c14 0 27 3 37 8 3 2 5 3 6 5l-40 1z" fill="url(#vi-glass)" />
      <path d="M16 80c55-6 180-6 260 2" stroke="#f7b524" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M262 74c6 1 9 3 10 6l-11 2z" fill="#ffe9a8" />
      <Wheel cx={78} cy={95} />
      <Wheel cx={226} cy={95} />
    </g>
  );
}

function Suv({ luxury = false }: { luxury?: boolean }) {
  return (
    <g>
      <path d="M18 94c-5-1-7-4-7-10 0-8 3-13 10-14l16-3 12-26c3-6 8-9 15-10 30-4 62-4 92 0 8 1 13 4 17 10l14 24 42 5c12 2 18 6 19 13 1 6-2 10-7 11z" fill="url(#vi-body)" />
      <path d="M62 62l10-22c2-4 5-6 9-7l24-2 2 31zM113 30l52 1c6 1 10 3 12 7l10 21-72 2z" fill="url(#vi-glass)" />
      <path d="M14 82c60-7 195-7 276 3" stroke="#f7b524" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      {luxury && <rect x="120" y="66" width="60" height="4" rx="2" fill="#f7b524" opacity="0.85" />}
      <path d="M270 76c6 1 10 3 11 7l-12 2z" fill="#ffe9a8" />
      <Wheel cx={82} cy={97} r={19} />
      <Wheel cx={222} cy={97} r={19} />
    </g>
  );
}

function Mpv() {
  return (
    <g>
      <path d="M20 94c-5-1-8-4-8-10 0-8 4-12 10-14l14-4c4-14 10-24 20-30 8-5 18-7 32-7h60c14 0 24 4 32 12l18 20 36 5c11 2 17 6 18 13 1 6-2 10-7 11z" fill="url(#vi-body)" />
      <path d="M60 62c3-11 8-19 15-24 4-3 9-4 15-4l8 1 2 28zM110 34h52c9 1 15 4 20 10l13 16-84 2z" fill="url(#vi-glass)" />
      <path d="M15 82c62-7 198-7 278 3" stroke="#f7b524" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path d="M272 76c6 1 10 3 11 7l-12 2z" fill="#ffe9a8" />
      <Wheel cx={84} cy={97} r={18} />
      <Wheel cx={224} cy={97} r={18} />
    </g>
  );
}

function Tempo() {
  return (
    <g>
      <path d="M18 96c-5-1-8-5-8-11V44c0-10 6-16 16-17 44-5 118-5 178-1 12 1 22 5 30 13l30 4c14 2 22 7 24 15v27c0 6-3 10-8 11z" fill="url(#vi-body)" />
      {[36, 76, 116, 156, 196].map((wx) => (
        <rect key={wx} x={wx} y={38} width={30} height={22} rx={4} fill="url(#vi-glass)" />
      ))}
      <path d="M236 40c8 2 14 6 18 12l8 12-30 1z" fill="url(#vi-glass)" />
      <path d="M12 78c66-6 204-6 286 3" stroke="#f7b524" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path d="M280 80c6 1 9 3 10 6l-11 2z" fill="#ffe9a8" />
      <Wheel cx={74} cy={99} r={17} />
      <Wheel cx={230} cy={99} r={17} />
    </g>
  );
}

function Urbania() {
  return (
    <g>
      <path d="M16 96c-4-1-7-5-7-10V50q0-18 20-22c48-8 122-8 180-2 14 2 26 8 34 18l16 20c8 2 12 6 13 12v9c0 6-3 10-8 11z" fill="url(#vi-body)" />
      <path d="M30 42q60-9 150-6l4 26-158 2z" fill="url(#vi-glass)" />
      <path d="M192 38c12 2 22 7 28 15l10 14-40 1z" fill="url(#vi-glass)" />
      <path d="M30 52v22M70 46v30M110 44v32M150 44v32" stroke="#0b0b0c" strokeWidth="3" opacity="0.5" />
      <path d="M11 80c68-7 208-7 288 3" stroke="#f7b524" strokeWidth="2.8" strokeLinecap="round" fill="none" />
      <rect x="24" y="84" width="120" height="4" rx="2" fill="#f7b524" opacity="0.6" />
      <path d="M282 78c6 1 10 3 11 7l-12 2z" fill="#ffe9a8" />
      <Wheel cx={76} cy={99} r={18} />
      <Wheel cx={232} cy={99} r={18} />
    </g>
  );
}

export function VehicleIllustration({
  variant,
  className,
  title,
}: {
  variant: Illustration;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 310 120"
      className={cn("w-full", className)}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={!title}
    >
      {defs}
      <ellipse cx="155" cy="112" rx="140" ry="6" fill="rgba(11,11,12,0.12)" />
      {variant === "sedan" && <Sedan />}
      {variant === "suv" && <Suv />}
      {variant === "suv-luxury" && <Suv luxury />}
      {variant === "mpv" && <Mpv />}
      {variant === "tempo" && <Tempo />}
      {variant === "urbania" && <Urbania />}
    </svg>
  );
}
