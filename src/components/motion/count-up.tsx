"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

export function CountUp({
  to,
  prefix = "",
  suffix = "",
  className,
  duration = 2,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: duration * 1000, bounce: 0 });

  useEffect(() => {
    if (inView) mv.set(to);
  }, [inView, to, mv]);

  useEffect(() => {
    const format = (v: number) =>
      `${prefix}${Math.round(v).toLocaleString("en-IN")}${suffix}`;
    if (reduced) {
      if (ref.current) ref.current.textContent = format(to);
      return;
    }
    const unsub = spring.on("change", (v) => {
      if (ref.current) ref.current.textContent = format(v);
    });
    return unsub;
  }, [spring, prefix, suffix, reduced, to]);

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  );
}
