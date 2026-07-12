import { JourneyHero } from "@/components/home/hero/journey-hero";
import { TrustBar } from "@/components/home/trust-bar";
import { WhyItr } from "@/components/home/why-itr";
import { FleetShowcase } from "@/components/home/fleet-showcase";
import { DestinationsShowcase } from "@/components/home/destinations-showcase";
import { BusinessSection } from "@/components/home/business-section";
import { BookingSteps } from "@/components/home/booking-steps";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { CoverageMap } from "@/components/home/coverage-map";
import { StatsSection } from "@/components/home/stats-section";
import { FaqSection } from "@/components/home/faq-section";
import { ContactSection } from "@/components/home/contact-section";
import { JsonLd } from "@/components/seo/json-ld";
import { faqSchema, reviewSchema } from "@/lib/schema-org";

/* Fleet pricing/availability is admin-editable — render fresh so edits are live */
export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
      <JsonLd schema={faqSchema()} />
      <JsonLd schema={reviewSchema()} />
      <JourneyHero />
      <TrustBar />
      <WhyItr />
      <FleetShowcase />
      <DestinationsShowcase />
      <BusinessSection />
      <BookingSteps />
      <TestimonialsSection />
      <CoverageMap />
      <StatsSection />
      <FaqSection limit={6} />
      <ContactSection />
    </>
  );
}
