"use client";

import { useEffect } from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";

/**
 * Catches render and data errors anywhere in the app. Without this a thrown
 * error in a client component blanks the page with no explanation; here the
 * visitor gets a way forward and the digest that identifies it in the logs.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-cream px-6 py-24">
      <div className="w-full max-w-lg text-center">
        <p className="text-[13px] font-semibold uppercase tracking-[0.22em] text-gold-600">
          Something went wrong
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          We hit a bump in the road<span className="text-gradient-gold">.</span>
        </h1>
        <p className="mt-3 text-smoke">
          The page didn&rsquo;t load properly. Try again — and if it keeps happening, call us on{" "}
          <a href={`tel:${siteConfig.phone}`} className="font-semibold text-ink underline">
            {siteConfig.phoneDisplay}
          </a>{" "}
          and we&rsquo;ll book you in directly.
        </p>
        {error.digest && (
          <p className="mt-4 font-mono text-xs text-smoke/70">Reference: {error.digest}</p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-full bg-gradient-gold px-6 py-3 text-sm font-bold text-ink shadow-glow transition-transform hover:-translate-y-0.5"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-full border border-ink/15 px-6 py-3 text-sm font-bold text-ink transition-colors hover:border-ink/35"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
