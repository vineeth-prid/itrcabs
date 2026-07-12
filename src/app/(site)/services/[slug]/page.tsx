import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Phone, ArrowRight } from "lucide-react";
import { services, getService } from "@/config/services";
import { getAvailableFleet } from "@/lib/fleet-store";
import { PageHero } from "@/components/page-hero";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { VehicleCard } from "@/components/fleet/vehicle-card";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema, serviceSchema } from "@/lib/schema-org";
import { siteConfig } from "@/config/site";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

/* Vehicle prices are admin-editable — refresh statically-generated pages every minute */
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return {
    title: service.seoTitle,
    description: service.seoDescription,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: { title: service.seoTitle, description: service.seoDescription },
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const available = await getAvailableFleet();
  const recommended = [
    ...new Map(
      [...available.filter((v) => v.popular), ...available].map((v) => [v.slug, v])
    ).values(),
  ].slice(0, 3);

  return (
    <>
      <JsonLd
        schema={breadcrumbSchema([
          { name: "Home", href: "/" },
          { name: "Services", href: "/services" },
          { name: service.name, href: `/services/${service.slug}` },
        ])}
      />
      <JsonLd schema={serviceSchema({ name: service.name, description: service.seoDescription, slug: service.slug })} />

      <PageHero eyebrow="Service" title={service.name} description={service.description}>
        <Reveal delay={0.35}>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/book">
              <Button size="lg" className="min-w-44">Book this service <ArrowRight aria-hidden /></Button>
            </Link>
            <a href={`tel:${siteConfig.phone}`}>
              <Button variant="glass" size="lg" className="min-w-44 border-white/25 text-white hover:bg-white/10">
                <Phone aria-hidden /> {siteConfig.phoneDisplay}
              </Button>
            </a>
          </div>
        </Reveal>
      </PageHero>

      <section className="bg-cream py-20 md:py-24">
        <div className="container-luxe max-w-4xl">
          <Reveal>
            <h2 className="font-display text-3xl font-bold text-ink">
              What&rsquo;s included<span className="text-gradient-gold">.</span>
            </h2>
          </Reveal>
          <Stagger className="mt-8 grid gap-4 sm:grid-cols-2" gap={0.08}>
            {service.points.map((p) => (
              <StaggerItem key={p}>
                <div className="flex items-start gap-3.5 rounded-2xl border hairline bg-white p-5 shadow-card">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-gold-600" aria-hidden />
                  <p className="font-semibold text-graphite">{p}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="border-t hairline bg-white py-20 md:py-24">
        <div className="container-luxe">
          <Reveal>
            <h2 className="mb-10 text-center font-display text-3xl font-bold text-ink">
              Recommended vehicles for this service
            </h2>
          </Reveal>
          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" gap={0.1}>
            {recommended.map((v) => (
              <StaggerItem key={v.slug} className="h-full">
                <VehicleCard vehicle={v} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}
