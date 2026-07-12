import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import { siteConfig } from "@/config/site";
import { SectionHeading } from "@/components/section-heading";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

const channels = [
  {
    icon: Phone,
    title: "Call us",
    value: siteConfig.phoneDisplay,
    href: `tel:${siteConfig.phone}`,
    note: "24×7 dispatch desk",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    value: "Chat instantly",
    href: siteConfig.social.whatsappLink,
    note: "Fastest for quotes",
  },
  {
    icon: Mail,
    title: "Email",
    value: siteConfig.email,
    href: `mailto:${siteConfig.email}`,
    note: "Corporate & partnerships",
  },
  {
    icon: MapPin,
    title: "Visit",
    value: "Kakkanad, Ernakulam",
    href: "https://maps.google.com/?q=Infopark+Kakkanad+Road+Kochi",
    note: siteConfig.address.street,
  },
];

export function ContactSection() {
  return (
    <section className="relative bg-white py-24 md:py-32" aria-labelledby="contact-heading">
      <div className="container-luxe">
        <SectionHeading
          eyebrow="Contact"
          title="Talk to a human in"
          accent="Kakkanad."
          description={`${siteConfig.hours}. Real people, real answers — in English, Malayalam or Hindi.`}
        />

        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          <Stagger className="grid gap-4 sm:grid-cols-2" gap={0.08}>
            {channels.map((c) => (
              <StaggerItem key={c.title} className="h-full">
                <a
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="group flex h-full flex-col rounded-3xl border hairline bg-cream p-7 transition-all duration-500 ease-[var(--ease-luxe)] hover:-translate-y-1.5 hover:border-gold-400 hover:bg-white hover:shadow-glow"
                >
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-white text-gold-600 shadow-card transition-all duration-500 group-hover:bg-gradient-gold group-hover:text-ink">
                    <c.icon className="size-6" aria-hidden />
                  </span>
                  <h3 className="mt-5 text-[13px] font-semibold uppercase tracking-[0.16em] text-smoke">
                    {c.title}
                  </h3>
                  <p className="mt-1 font-display text-lg font-bold text-ink">{c.value}</p>
                  <p className="mt-1 text-sm text-smoke">{c.note}</p>
                </a>
              </StaggerItem>
            ))}
            <StaggerItem className="sm:col-span-2">
              <div className="flex items-center gap-3 rounded-3xl bg-ink p-6 text-cream">
                <Clock className="size-6 shrink-0 text-gold-400" aria-hidden />
                <p className="text-sm">
                  <strong className="font-display">Working hours:</strong> {siteConfig.hours} —
                  airport pickups, night shifts and dawn pilgrimages included.
                </p>
              </div>
            </StaggerItem>
          </Stagger>

          <Reveal delay={0.15} className="h-full min-h-[380px]">
            <div className="h-full overflow-hidden rounded-3xl border hairline shadow-card">
              <iframe
                title="ITR Cabs office location — Infopark Kakkanad Road, Kochi"
                src={`https://www.google.com/maps?q=${siteConfig.geo.lat},${siteConfig.geo.lng}&z=14&output=embed`}
                className="h-full w-full border-0 grayscale-[35%] transition-all duration-700 hover:grayscale-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
