"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, RefreshCw, Search } from "lucide-react";
import type { BookingRecord } from "@/lib/booking-store";
import { formatINR, cn } from "@/lib/utils";
import { PageTitle, Panel, StatusBadge } from "@/components/admin/ui";
import { Input } from "@/components/ui/input";

const STATUSES = ["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;

async function fetchBookings(): Promise<BookingRecord[]> {
  const res = await fetch("/api/admin/bookings");
  if (!res.ok) throw new Error("Failed to load bookings");
  const json = await res.json();
  return json.bookings;
}

function exportCsv(rows: BookingRecord[]) {
  const header = [
    "Booking ID", "Status", "Name", "Phone", "Pickup", "Destination",
    "Date", "Time", "Trip", "Days", "Passengers", "Vehicle", "Estimate", "Included KM",
  ];
  const lines = rows.map((b) =>
    [
      b.bookingCode, b.status, b.name, b.phone, b.pickup, b.destination,
      b.pickupDate.split("T")[0], b.pickupTime, b.tripType, b.days,
      b.passengers, b.vehicleName, b.estimateTotal, b.includedKm,
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );
  const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `itr-bookings-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function BookingsManager() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<(typeof STATUSES)[number]>("ALL");
  const [query, setQuery] = useState("");

  const { data: bookings = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: fetchBookings,
  });

  const mutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: BookingRecord["status"] }) => {
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Update failed");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-bookings"] }),
  });

  const filtered = bookings.filter((b) => {
    if (filter !== "ALL" && b.status !== filter) return false;
    if (query) {
      const q = query.toLowerCase();
      return [b.bookingCode, b.name, b.phone, b.pickup, b.destination, b.vehicleName]
        .join(" ")
        .toLowerCase()
        .includes(q);
    }
    return true;
  });

  return (
    <>
      <PageTitle title="Bookings" sub={`${bookings.length} total · ${filtered.length} shown`}>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm font-bold text-cream/70 transition-colors hover:border-gold-500/40 hover:text-gold-300"
          >
            <RefreshCw className={cn("size-4", isFetching && "animate-spin")} aria-hidden /> Refresh
          </button>
          <button
            onClick={() => exportCsv(filtered)}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 rounded-full bg-gradient-gold px-5 py-2.5 text-sm font-bold text-ink shadow-glow transition-transform hover:-translate-y-0.5 disabled:opacity-40"
          >
            <Download className="size-4" aria-hidden /> Export CSV
          </button>
        </div>
      </PageTitle>

      <Panel className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-60 flex-1">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-cream/30" aria-hidden />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by ID, name, phone, route…"
            className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-white/30"
            aria-label="Search bookings"
          />
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              aria-pressed={filter === s}
              className={cn(
                "rounded-full px-4 py-2 text-xs font-bold tracking-wide transition-all",
                filter === s ? "bg-gradient-gold text-ink" : "bg-white/5 text-cream/50 hover:text-white"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </Panel>

      <Panel className="overflow-x-auto p-0">
        {isLoading ? (
          <p className="py-16 text-center text-sm text-cream/40">Loading bookings…</p>
        ) : filtered.length === 0 ? (
          <p className="py-16 text-center text-sm text-cream/40">No bookings match.</p>
        ) : (
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/8 text-[11px] uppercase tracking-wider text-cream/40">
                {["Booking", "Customer", "Route & pickup", "Vehicle", "Fare est.", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-4 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} className="border-b border-white/5 align-top transition-colors last:border-0 hover:bg-white/[0.02]">
                  <td className="px-5 py-4">
                    <p className="font-mono text-[13px] font-bold text-gold-300">{b.bookingCode}</p>
                    <p className="mt-0.5 text-xs text-cream/40">
                      {new Date(b.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-white">{b.name}</p>
                    <p className="text-xs text-cream/50">{b.phone}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-cream/80">{b.pickup} → {b.destination}</p>
                    <p className="text-xs text-cream/50">
                      {new Date(b.pickupDate).toLocaleDateString("en-IN")} · {b.pickupTime} ·{" "}
                      {b.tripType === "ONE_DAY" ? "1 day" : `${b.days} days`} · {b.passengers} pax
                    </p>
                  </td>
                  <td className="px-5 py-4 text-cream/80">{b.vehicleName}</td>
                  <td className="px-5 py-4 font-semibold text-white">{formatINR(b.estimateTotal)}</td>
                  <td className="px-5 py-4"><StatusBadge status={b.status} /></td>
                  <td className="px-5 py-4">
                    <select
                      value={b.status}
                      onChange={(e) => mutation.mutate({ id: b.id, status: e.target.value as BookingRecord["status"] })}
                      disabled={mutation.isPending}
                      aria-label={`Change status of ${b.bookingCode}`}
                      className="rounded-lg border border-white/10 bg-ink px-3 py-1.5 text-xs font-bold text-cream/80 focus:border-gold-500 focus:outline-none"
                    >
                      {["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </>
  );
}
