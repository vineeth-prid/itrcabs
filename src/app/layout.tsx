import type { Metadata } from "next";
import { Sora, Manrope, Instrument_Serif } from "next/font/google";
import { siteConfig } from "@/config/site";
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
    default: `${siteConfig.name} — Taxi Service in Kakkanad, Kochi & Ernakulam`,
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
    title: `${siteConfig.name} — Taxi Service in Kakkanad, Kochi & Ernakulam`,
    description: siteConfig.description,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: `${siteConfig.name} — chauffeur-driven taxi service in Kakkanad, Kochi` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — Taxi Service in Kakkanad & Kochi`,
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
      {/* Browser extensions inject attributes into body before React hydrates;
          without this that shows up in production as a hydration error. */}
      <body suppressHydrationWarning>
        {/* Business structured data lives on the public site layout, not here:
            emitting it from the root put a LocalBusiness on the admin panel
            too, which is not public content. */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
