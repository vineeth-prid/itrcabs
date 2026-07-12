"use client";

import { useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, useMotionTemplate, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * 3D perspective tilt card with a cursor-tracking glow highlight.
 * Stripe-quality hover physics; inert on touch / reduced motion.
 */
export function TiltCard({
  children,
  className,
  maxTilt = 6,
  glow = true,
}: {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  glow?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const srx = useSpring(rx, { stiffness: 220, damping: 20 });
  const sry = useSpring(ry, { stiffness: 220, damping: 20 });

  const glowBg = useMotionTemplate`radial-gradient(420px circle at ${gx}% ${gy}%, rgba(247,181,36,0.14), transparent 65%)`;

  const onMove = useCallback(
    (e: React.PointerEvent) => {
      if (reduced || e.pointerType !== "mouse" || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      ry.set((px - 0.5) * 2 * maxTilt);
      rx.set(-(py - 0.5) * 2 * maxTilt);
      gx.set(px * 100);
      gy.set(py * 100);
    },
    [reduced, maxTilt, rx, ry, gx, gy]
  );

  const onLeave = useCallback(() => {
    rx.set(0);
    ry.set(0);
  }, [rx, ry]);

  return (
    <motion.div
      ref={ref}
      className={cn("group relative [transform-style:preserve-3d] will-change-transform", className)}
      style={{ rotateX: srx, rotateY: sry, perspective: 1000 }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      whileHover={reduced ? undefined : { y: -6 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {glow && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: glowBg }}
        />
      )}
      {children}
    </motion.div>
  );
}
