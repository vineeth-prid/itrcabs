"use client";

import { motion, type MotionValue } from "framer-motion";

/**
 * The ITR luxury sedan — side view, ink body with gold signature line.
 * Wheels spin from scroll progress; body bobs on its suspension;
 * headlight beam and dust particles react to the journey.
 */
export function HeroCar({
  wheelRotate,
  bodyBob,
  beamOpacity,
  dustOpacity,
}: {
  wheelRotate: MotionValue<number>;
  bodyBob: MotionValue<number>;
  beamOpacity: MotionValue<number>;
  dustOpacity: MotionValue<number>;
}) {
  const wheelStyle = {
    rotate: wheelRotate,
    transformBox: "fill-box" as const,
    transformOrigin: "center" as const,
  };

  return (
    <svg
      viewBox="0 0 340 120"
      className="w-[240px] sm:w-[300px] md:w-[340px] drop-shadow-[0_18px_18px_rgba(0,0,0,0.35)]"
      aria-hidden
    >
      <defs>
        <linearGradient id="car-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2d2d31" />
          <stop offset="0.45" stopColor="#141416" />
          <stop offset="1" stopColor="#0b0b0c" />
        </linearGradient>
        <linearGradient id="car-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9fd6e8" stopOpacity="0.95" />
          <stop offset="1" stopColor="#3a5a6b" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffe9a8" stopOpacity="0.85" />
          <stop offset="1" stopColor="#ffe9a8" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="dust" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#d8cbb2" stopOpacity="0.7" />
          <stop offset="1" stopColor="#d8cbb2" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="170" cy="108" rx="130" ry="8" fill="rgba(0,0,0,0.35)" />

      {/* Headlight beam */}
      <motion.polygon
        points="306,72 340,58 340,92 306,84"
        fill="url(#beam)"
        style={{ opacity: beamOpacity }}
      />

      {/* Dust puffs behind the car */}
      <motion.g style={{ opacity: dustOpacity }}>
        {[0, 1, 2].map((i) => (
          <circle key={i} r={7 + i * 4} fill="url(#dust)">
            <animate
              attributeName="cx"
              values={`${34 - i * 10};${8 - i * 12}`}
              dur={`${0.9 + i * 0.25}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="cy"
              values={`${100 - i * 2};${88 - i * 5}`}
              dur={`${0.9 + i * 0.25}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.8;0"
              dur={`${0.9 + i * 0.25}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </motion.g>

      {/* Body — bobs on suspension */}
      <motion.g style={{ y: bodyBob }}>
        {/* Lower body */}
        <path
          d="M28 88c-4-1-6-4-6-9 0-8 3-13 10-15l26-6c10-8 24-16 40-19 22-4 48-4 68 1 14 3 26 9 34 16l50 7c17 2 26 7 28 16 1 5-1 8-6 9l-14 1H46z"
          fill="url(#car-body)"
        />
        {/* Cabin */}
        <path
          d="M98 39c14-9 30-14 48-15 20-1 40 2 54 9 6 3 10 6 13 10l-30 4H108z"
          fill="url(#car-body)"
        />
        {/* Windows */}
        <path d="M112 41c10-8 24-12 38-13l4 16-46 1z" fill="url(#car-glass)" />
        <path d="M160 28c16 0 30 3 42 9 3 2 5 3 7 6l-45 1z" fill="url(#car-glass)" />
        {/* Gold signature line */}
        <path
          d="M24 74c60-6 200-6 288 2"
          stroke="#f7b524"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />
        {/* Door seams */}
        <path d="M158 46v36M212 48v34" stroke="#000" strokeOpacity="0.5" strokeWidth="1.2" />
        {/* Door handles */}
        <rect x="166" y="56" width="14" height="3" rx="1.5" fill="#f7b524" opacity="0.9" />
        <rect x="220" y="57" width="14" height="3" rx="1.5" fill="#f7b524" opacity="0.9" />
        {/* Headlight + taillight */}
        <path d="M296 68c6 1 10 3 11 7l-12 2z" fill="#ffe9a8" />
        <path d="M25 76c-2 1-3 3-2 6l8-1z" fill="#ff5a4e" />
        {/* ITR plate */}
        <rect x="252" y="80" width="30" height="9" rx="2" fill="#f7b524" />
        <text x="267" y="87" textAnchor="middle" fontSize="7" fontWeight="700" fill="#0b0b0c" fontFamily="sans-serif">
          ITR
        </text>
      </motion.g>

      {/* Wheels */}
      {[86, 252].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="92" r="21" fill="#08080a" />
          <circle cx={cx} cy="92" r="20" fill="#101013" stroke="#26262a" strokeWidth="2" />
          <motion.g style={wheelStyle}>
            <circle cx={cx} cy="92" r="11.5" fill="#1b1b1f" stroke="#f7b524" strokeWidth="1.6" />
            {[0, 72, 144, 216, 288].map((deg) => (
              <line
                key={deg}
                x1={cx}
                y1="92"
                x2={cx + 10 * Math.cos((deg * Math.PI) / 180)}
                y2={92 + 10 * Math.sin((deg * Math.PI) / 180)}
                stroke="#c7c7cc"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ))}
            <circle cx={cx} cy="92" r="3" fill="#f7b524" />
          </motion.g>
        </g>
      ))}
    </svg>
  );
}
