"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { faqs } from "@/config/faqs";
import { SectionHeading } from "@/components/section-heading";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

export function FaqSection({ limit }: { limit?: number }) {
  const [open, setOpen] = useState<number | null>(0);
  const items = limit ? faqs.slice(0, limit) : faqs;

  return (
    <section className="bg-cream py-24 md:py-32" aria-labelledby="faq-heading">
      <div className="container-luxe max-w-4xl">
        <SectionHeading
          eyebrow="FAQs"
          title="Everything travellers"
          accent="ask us."
          description="Straight answers on pricing, coverage and how booking works — the same ones our phone team gives every day."
        />

        <Stagger className="space-y-3" gap={0.05}>
          {items.map((faq, i) => {
            const isOpen = open === i;
            return (
              <StaggerItem key={faq.question}>
                <div
                  className={cn(
                    "overflow-hidden rounded-2xl border bg-white transition-all duration-400",
                    isOpen ? "border-gold-400 shadow-glow" : "hairline shadow-card hover:border-gold-300"
                  )}
                >
                  <button
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    id={`faq-button-${i}`}
                  >
                    <span className="font-display text-[15px] font-bold text-ink sm:text-base">
                      {faq.question}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full transition-colors duration-300",
                        isOpen ? "bg-gradient-gold text-ink" : "bg-cream text-graphite"
                      )}
                    >
                      <Plus className="size-4" aria-hidden />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-panel-${i}`}
                        role="region"
                        aria-labelledby={`faq-button-${i}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <p className="px-6 pb-6 text-[15px] leading-relaxed text-smoke">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
