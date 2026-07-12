"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Word-by-word text reveal — each word rises out of an overflow mask.
 * Renders real text (SEO-safe), animates presentation only.
 */
export function TextReveal({
  text,
  className,
  delay = 0,
  as: Tag = "h2",
  stagger = 0.045,
}: {
  text: string;
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  stagger?: number;
}) {
  const reduced = useReducedMotion();
  const words = text.split(" ");

  if (reduced) return <Tag className={className}>{text}</Tag>;

  return (
    <Tag className={className} aria-label={text}>
      {words.map((word, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
          <motion.span
            className="inline-block will-change-transform"
            initial={{ y: "110%", rotate: 4 }}
            whileInView={{ y: "0%", rotate: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.85, delay: delay + i * stagger, ease: EASE }}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/** Shimmering gold gradient sweep across text. */
export function ShimmerText({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "bg-[linear-gradient(110deg,#f7b524_30%,#fff3d1_50%,#f7b524_70%)] bg-[length:200%_100%] bg-clip-text text-transparent animate-shimmer",
        className
      )}
    >
      {children}
    </span>
  );
}
