"use client";

import { useEffect } from "react";

/** Last resort — catches errors thrown in the root layout itself. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Root layout error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#faf7f2",
          color: "#0b0b0c",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>ITR Cabs is temporarily unavailable</h1>
          <p style={{ marginTop: "0.75rem", color: "#6f6f76" }}>
            Please try again, or call us on 8089 00 55 00.
          </p>
          {error.digest && (
            <p style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "#9a9aa0" }}>
              Reference: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              padding: "0.75rem 1.5rem",
              borderRadius: "999px",
              border: "none",
              background: "#f7b524",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
