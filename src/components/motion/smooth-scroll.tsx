"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Smooth scrolling for the marketing site only.
 *
 * Lenis takes over the scroll of the whole document and runs a rAF loop for as
 * long as it is mounted. That is the right feel for the landing pages, and the
 * wrong one for the admin panel — it fought long data tables and scrollable
 * dialogs, and burned a frame callback on every screen. Mounting it here rather
 * than in the root layout keeps it on the pages that want it.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      anchors: true,
    });
    // Expose for debugging/integrations (lenis ships its own window typing)
    const w = window as unknown as { lenis?: Lenis };
    w.lenis = lenis;
    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      w.lenis = undefined;
    };
  }, []);

  return null;
}
