import type { Metadata } from "next";
import { pageOpenGraph } from "@/lib/seo";
import { PageHero } from "@/components/page-hero";
import { ContactSection } from "@/components/home/contact-section";
import { FaqSection } from "@/components/home/faq-section";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema, faqSchema, webPageSchema } from "@/lib/schema-org";

export const metadata: Metadata = {
  title: "Contact — Taxi Service in Kakkanad, Ernakulam | 8089 00 55 00",
  description:
    "Contact ITR Cabs, Kakkanad, Ernakulam. Call 8089 00 55 00 (24×7), WhatsApp us, or email itrgrp@gmail.com. Office on Infopark Kakkanad Road, Kochi, Kerala.",
  alternates: { canonical: "/contact" },
  openGraph: pageOpenGraph("/contact"),
};

export default function ContactPage() {
  return (
    <>
      <JsonLd
        schema={webPageSchema({
          path: "/contact",
          name: "Contact ITR Cabs",
          type: "ContactPage",
        })}
      />
      <JsonLd schema={breadcrumbSchema([{ name: "Home", href: "/" }, { name: "Contact", href: "/contact" }])} />
      <JsonLd schema={faqSchema()} />
      <PageHero
        eyebrow="Contact"
        title="We answer at 2 pm."
        accent="And at 2 am."
        description="A 24×7 dispatch desk in Kakkanad, Ernakulam — call, WhatsApp or walk in. Corporate proposals answered within one business day."
      />
      <ContactSection />
      <FaqSection limit={5} />
    </>
  );
}
