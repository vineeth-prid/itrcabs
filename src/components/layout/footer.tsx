import Link from "next/link";
import { Phone, Mail, MapPin, Clock, ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { siteConfig } from "@/config/site";
import { services } from "@/config/services";
import { destinations } from "@/config/destinations";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink text-cream" aria-labelledby="footer-heading">
      {/* Golden horizon line */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
      {/* Glow */}
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-gold-500/10 blur-3xl" />

      <h2 id="footer-heading" className="sr-only">Footer</h2>

      {/* CTA band */}
      <div className="container-luxe border-b border-white/10 py-16 md:py-20">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <p className="font-serif text-2xl italic text-gold-300">Ready when you are.</p>
            <p className="mt-2 max-w-md font-display text-3xl font-bold leading-tight sm:text-4xl">
              Your next Kerala journey starts with one tap.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/book"
              className="inline-flex h-14 items-center justify-center rounded-full bg-gradient-gold px-10 font-display font-semibold text-ink shadow-glow transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow-lg"
            >
              Book a ride
            </Link>
            <a
              href={siteConfig.social.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-white/20 px-10 font-display font-semibold text-cream transition-all duration-300 hover:border-gold-400 hover:text-gold-300"
            >
              WhatsApp us <ArrowUpRight className="size-4" aria-hidden />
            </a>
          </div>
        </div>
      </div>

      {/* Link columns */}
      <div className="container-luxe grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo dark />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-cream/60">
            Kerala&rsquo;s premium cab & travel company — GPS-tracked fleet, verified
            chauffeurs and three decades of trust, from Kakkanad to every corner
            of God&rsquo;s Own Country.
          </p>
          <div className="mt-6 space-y-3 text-sm">
            <a href={`tel:${siteConfig.phone}`} className="flex items-center gap-3 text-cream/80 transition-colors hover:text-gold-300">
              <Phone className="size-4 text-gold-400" aria-hidden /> {siteConfig.phoneDisplay}
            </a>
            <a href={`mailto:${siteConfig.email}`} className="flex items-center gap-3 text-cream/80 transition-colors hover:text-gold-300">
              <Mail className="size-4 text-gold-400" aria-hidden /> {siteConfig.email}
            </a>
            <p className="flex items-start gap-3 text-cream/80">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold-400" aria-hidden />
              {siteConfig.address.street}, {siteConfig.address.locality},<br />
              {siteConfig.address.region} {siteConfig.address.postalCode}
            </p>
            <p className="flex items-center gap-3 text-cream/80">
              <Clock className="size-4 text-gold-400" aria-hidden /> {siteConfig.hours}
            </p>
          </div>
        </div>

        <nav aria-label="Services">
          <h3 className="font-display text-sm font-bold uppercase tracking-[0.18em] text-gold-400">Services</h3>
          <ul className="mt-5 space-y-2.5 text-sm">
            {services.slice(0, 8).map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="text-cream/70 transition-colors hover:text-gold-300">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Destinations">
          <h3 className="font-display text-sm font-bold uppercase tracking-[0.18em] text-gold-400">Destinations</h3>
          <ul className="mt-5 space-y-2.5 text-sm">
            {destinations.map((d) => (
              <li key={d.slug}>
                <Link href={`/destinations/${d.slug}`} className="text-cream/70 transition-colors hover:text-gold-300">
                  {d.name} taxi
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Company">
          <h3 className="font-display text-sm font-bold uppercase tracking-[0.18em] text-gold-400">Company</h3>
          <ul className="mt-5 space-y-2.5 text-sm">
            {[
              { href: "/about", label: "About ITR Cabs" },
              { href: "/fleet", label: "Our fleet" },
              { href: "/book", label: "Book online" },
              { href: "/contact", label: "Contact" },
              { href: "/admin/login", label: "Partner login" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-cream/70 transition-colors hover:text-gold-300">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-cream/50">Google rating</p>
            <p className="mt-1 font-display text-2xl font-bold text-gold-300">
              ★ {siteConfig.googleRating.value}
              <span className="ml-2 text-sm font-normal text-cream/60">
                {siteConfig.googleRating.count.toLocaleString("en-IN")}+ reviews
              </span>
            </p>
          </div>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <div className="container-luxe flex flex-col items-center justify-between gap-3 py-6 text-xs text-cream/50 sm:flex-row">
          <p>© {new Date().getFullYear()} {siteConfig.legalName}. All rights reserved.</p>
          <p>
            Taxi service in Kochi · Ernakulam · Kakkanad — serving all of Kerala, 24×7.
          </p>
        </div>
      </div>
    </footer>
  );
}
