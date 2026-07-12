import type { Metadata } from "next";
import { Sora, Manrope, Instrument_Serif } from "next/font/google";
import { siteConfig } from "@/config/site";
import { organizationSchema, localBusinessSchema } from "@/lib/schema-org";
import { JsonLd } from "@/components/seo/json-ld";
import { Providers } from "@/components/providers";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Premium Taxi & Cab Service in Kochi, Ernakulam`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — Premium Taxi & Cab Service in Kochi, Ernakulam`,
    description: siteConfig.description,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: `${siteConfig.name} — Kerala's premium cab service` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — Premium Taxi & Cab Service in Kochi`,
    description: siteConfig.description,
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sora.variable} ${manrope.variable} ${instrumentSerif.variable}`}>
      <body>
        <JsonLd schema={organizationSchema()} />
        <JsonLd schema={localBusinessSchema()} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
