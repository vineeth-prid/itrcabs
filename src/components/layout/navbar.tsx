"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X, Phone } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/motion/magnetic";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/fleet", label: "Fleet" },
  { href: "/services", label: "Services" },
  { href: "/destinations", label: "Destinations" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 48));

  useEffect(() => setOpen(false), [pathname]);

  /* Home hero is dark → light text until scrolled. Inner pages start light. */
  const onDarkHero = pathname === "/" && !scrolled;

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled ? "glass border-b hairline shadow-[0_1px_24px_rgba(11,11,12,0.06)]" : "bg-transparent"
      )}
    >
      <nav className="container-luxe flex h-[var(--header-h)] items-center justify-between" aria-label="Main">
        <Link href="/" aria-label="ITR Cabs — home" className="shrink-0">
          <Logo dark={onDarkHero} />
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "group relative px-4 py-2 text-[14px] font-semibold transition-colors duration-300",
                    onDarkHero ? "text-white/85 hover:text-white" : "text-graphite hover:text-ink",
                    active && (onDarkHero ? "text-white" : "text-ink")
                  )}
                >
                  {link.label}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-4 -bottom-0.5 h-[2px] origin-left scale-x-0 rounded-full bg-gradient-gold transition-transform duration-400 ease-[var(--ease-luxe)] group-hover:scale-x-100",
                      active && "scale-x-100"
                    )}
                  />
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-3">
          <a
            href={`tel:${siteConfig.phone}`}
            className={cn(
              "hidden items-center gap-2 text-sm font-bold md:flex transition-colors duration-300",
              onDarkHero ? "text-white" : "text-ink"
            )}
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-gradient-gold text-ink shadow-glow">
              <Phone className="size-4" aria-hidden />
            </span>
            {siteConfig.phoneDisplay}
          </a>
          <Magnetic strength={0.25}>
            <Link href="/book" className="hidden sm:block">
              <Button size="md">Book Now</Button>
            </Link>
          </Magnetic>
          <button
            className={cn(
              "flex size-11 items-center justify-center rounded-full lg:hidden",
              onDarkHero ? "text-white" : "text-ink"
            )}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="glass overflow-hidden border-b hairline lg:hidden"
          >
            <ul className="container-luxe flex flex-col gap-1 py-4">
              {links.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.4 }}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "block rounded-xl px-4 py-3 font-display text-lg font-semibold text-ink hover:bg-gold-50",
                      pathname === link.href && "bg-gold-50 text-gold-700"
                    )}
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
              <li className="mt-2 px-4 pb-2">
                <Link href="/book">
                  <Button className="w-full" size="lg">Book Now</Button>
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
