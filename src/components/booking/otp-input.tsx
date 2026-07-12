"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

export function OtpInput({
  value,
  onChange,
  disabled,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  error?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

  const setDigit = (i: number, d: string) => {
    const next = digits.slice();
    next[i] = d;
    onChange(next.join(""));
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3" role="group" aria-label="6-digit verification code">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          pattern="\d"
          maxLength={1}
          disabled={disabled}
          value={d}
          aria-label={`Digit ${i + 1}`}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "");
            if (raw.length > 1) {
              // Pasted a whole code
              onChange(raw.slice(0, 6));
              refs.current[Math.min(raw.length, 5)]?.focus();
              return;
            }
            setDigit(i, raw);
            if (raw && i < 5) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !digits[i] && i > 0) {
              refs.current[i - 1]?.focus();
              setDigit(i - 1, "");
            }
            if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
            if (e.key === "ArrowRight" && i < 5) refs.current[i + 1]?.focus();
          }}
          onPaste={(e) => {
            e.preventDefault();
            const raw = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
            if (raw) {
              onChange(raw);
              refs.current[Math.min(raw.length, 5)]?.focus();
            }
          }}
          className={cn(
            "size-12 rounded-xl border-2 bg-white text-center font-display text-xl font-bold text-ink transition-all duration-200 focus:outline-none sm:size-14",
            error
              ? "border-red-400 focus:border-red-500"
              : "border-ink/10 focus:border-gold-500 focus:shadow-[0_0_0_4px_rgba(247,181,36,0.18)]",
            d && !error && "border-gold-400 bg-gold-50"
          )}
        />
      ))}
    </div>
  );
}
