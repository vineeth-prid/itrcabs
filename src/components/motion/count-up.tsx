"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

/**
 * Counts up to a number when it scrolls into view.
 *
 * The final value is what gets server-rendered, not a zero. This used to
 * output `0+` in the HTML and only reach the real figure once JavaScript ran,
 * so every crawler — and anyone with JS disabled — read "0+ journeys
 * completed". The animation is unchanged: the client resets the text to the
 * start value on mount and runs the same spring, so the number still ticks up
 * exactly as before.
 */
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

  const format = (v: number) => `${prefix}${Math.round(v).toLocaleString("en-IN")}${suffix}`;

  /* The wind-back to zero happens at the moment the count starts, not on
     mount. That matters: if the element never enters view — or the observer
     never fires, which is what was happening in production, leaving every
     stat reading "0+" permanently — the real number simply stays on screen
     instead of being replaced by a zero that nothing ever counts up from. */
  useEffect(() => {
    if (!inView || reduced) return;
    if (ref.current) ref.current.textContent = format(0);
    mv.set(to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, to, mv, reduced]);

  useEffect(() => {
    if (reduced) return;
    const unsub = spring.on("change", (v) => {
      if (ref.current) ref.current.textContent = format(v);
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spring, prefix, suffix, reduced]);

  return (
    <span ref={ref} className={className} suppressHydrationWarning>
      {prefix}
      {to.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}
