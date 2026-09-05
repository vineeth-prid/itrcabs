import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* Money and dates are rendered on the server and again in the browser during
   hydration, so their output has to be byte-identical in both. Intl's *symbols
   and month names* are not: the spacing after ₹ and the choice of "Sep" vs
   "Sept" both vary with the ICU build, and a host running a different Node
   than the browser's Chrome then throws React hydration error #418 — the
   intermittent "client-side exception" that only shows up once deployed.
   Intl's *numeric* output (grouping, zero padding) is stable, so we use only
   that and assemble the rest ourselves. */

const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

export function formatINR(amount: number): string {
  const n = Math.round(amount);
  return `${n < 0 ? "-" : ""}₹${inr.format(Math.abs(n))}`;
}

export function generateBookingCode(): string {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `ITR-${stamp}${rand}`;
}

export function maskPhone(phone: string): string {
  return phone.replace(/(\d{2})\d{6}(\d{2})/, "$1••••••$2");
}

/* ── Dates ───────────────────────────────────────────────────────────
   The business runs on IST. Servers usually run on UTC, so every date the
   admin sees is formatted in Asia/Kolkata explicitly — otherwise a trip
   booked at 9am IST reads as the previous day on a UTC host. */

const IST = "Asia/Kolkata";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const istFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: IST,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** The IST wall-clock parts of an instant, as zero-padded numeric strings. */
function istParts(value: string | Date) {
  const parts = istFormat.formatToParts(new Date(value));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
  };
}

export function formatDate(value: string | Date, withTime = false): string {
  const { year, month, day, hour, minute } = istParts(value);
  const date = `${Number(day)} ${MONTHS[Number(month) - 1]} ${year}`;
  return withTime ? `${date}, ${hour}:${minute}` : date;
}

/** YYYY-MM-DD for a date, in IST — the shape <input type="date"> expects. */
export function isoDate(value: string | Date = new Date()): string {
  const { year, month, day } = istParts(value);
  return `${year}-${month}-${day}`;
}

/** IST calendar day `n` days from today, as YYYY-MM-DD. */
export function isoDateOffset(days: number): string {
  return isoDate(new Date(Date.now() + days * 86_400_000));
}
