"use client";

import { useEffect } from "react";

/** Keeps a failing admin screen inside the shell instead of blanking the panel. */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin panel error:", error);
  }, [error]);

  return (
    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8">
      <h1 className="font-display text-xl font-bold text-white">This screen failed to load</h1>
      <p className="mt-2 max-w-xl text-sm text-cream/70">
        {error.message || "An unexpected error occurred."}
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-cream/40">Reference: {error.digest}</p>
      )}
      <button
        onClick={reset}
        className="mt-6 rounded-full bg-gradient-gold px-6 py-2.5 text-sm font-bold text-ink shadow-glow transition-transform hover:-translate-y-0.5"
      >
        Retry
      </button>
    </div>
  );
}
