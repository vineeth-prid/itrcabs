"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, X } from "lucide-react";
import type { BookingRecord } from "@/lib/booking-store";
import { formatINR } from "@/lib/utils";
import { PageTitle, Panel, StatCard, Field, darkField } from "@/components/admin/ui";
import { Input } from "@/components/ui/input";

interface Customer {
  name: string;
  phone: string;
  email?: string;
  trips: number;
  value: number;
  last: string;
}

/** Customers are derived from bookings — one row per phone number. */
function rollUp(bookings: BookingRecord[]): Customer[] {
  const byPhone = new Map<string, Customer>();
  for (const b of bookings) {
    const entry =
      byPhone.get(b.phone) ??
      { name: b.name, phone: b.phone, email: b.email, trips: 0, value: 0, last: b.createdAt };
    entry.name = b.createdAt >= entry.last ? b.name : entry.name;
    entry.email = b.email ?? entry.email;
    entry.trips += 1;
    entry.value += b.estimateTotal;
    if (b.createdAt > entry.last) entry.last = b.createdAt;
    byPhone.set(b.phone, entry);
  }
  return [...byPhone.values()].sort((a, b) => b.value - a.value);
}

function CustomerDialog({
  customer,
  onClose,
  onSaved,
}: {
  customer: Customer;
  onClose: () => void;
  onSaved: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState(customer.name);
  const [phone, setPhone] = useState(customer.phone);
  const [email, setEmail] = useState(customer.email ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => ref.current?.showModal(), []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/customers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: customer.phone,
          name: name.trim(),
          newPhone: phone.trim(),
          email: email.trim(),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Save failed");
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current?.close()}
      className="m-auto w-[min(30rem,92vw)] rounded-2xl border border-white/10 bg-ink p-0 text-cream backdrop:bg-ink/80 backdrop:backdrop-blur-sm"
    >
      <form onSubmit={submit} className="p-6 sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-white">Edit customer</h2>
            <p className="mt-1 text-sm text-cream/50">
              Applies to all {customer.trips} booking{customer.trips === 1 ? "" : "s"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            aria-label="Close"
            className="rounded-full p-2 text-cream/50 transition-colors hover:bg-white/5 hover:text-white"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <div className="grid gap-4">
          <Field label="Name">
            <Input
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={darkField}
            />
          </Field>
          <Field label="Phone" hint="10-digit mobile, starting 6-9">
            <Input
              required
              inputMode="numeric"
              pattern="[6-9][0-9]{9}"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              className={darkField}
            />
          </Field>
          <Field label="Email (optional)">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={darkField}
            />
          </Field>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            {error}
          </p>
        )}

        <div className="mt-7 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => ref.current?.close()}
            className="rounded-full border border-white/10 px-6 py-2.5 text-sm font-bold text-cream/70 transition-colors hover:border-white/25 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-full bg-gradient-gold px-6 py-2.5 text-sm font-bold text-ink shadow-glow transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {saving && <Loader2 className="size-4 animate-spin" aria-hidden />}
            Save changes
          </button>
        </div>
      </form>
    </dialog>
  );
}

export function CustomersManager() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Customer | null>(null);

  const { data: bookings = [], isLoading } = useQuery<BookingRecord[]>({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/bookings");
      if (!res.ok) throw new Error("Failed to load customers");
      return (await res.json()).bookings;
    },
  });

  const customers = rollUp(bookings);

  return (
    <>
      <PageTitle title="Customers" sub="Every guest who has booked with ITR Cabs" />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Unique customers" value={String(customers.length)} accent />
        <StatCard
          label="Repeat customers"
          value={String(customers.filter((c) => c.trips > 1).length)}
        />
        <StatCard
          label="Lifetime pipeline"
          value={formatINR(customers.reduce((s, c) => s + c.value, 0))}
        />
      </div>
      <Panel className="mt-6 overflow-x-auto p-0">
        {isLoading ? (
          <p className="py-16 text-center text-sm text-cream/40">Loading customers…</p>
        ) : customers.length === 0 ? (
          <p className="py-16 text-center text-sm text-cream/40">
            Customers appear here after their first booking.
          </p>
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/8 text-[11px] uppercase tracking-wider text-cream/40">
                {["Customer", "Phone", "Trips", "Estimated value", "Last booking", ""].map((h, i) => (
                  <th key={h || i} className="px-5 py-4 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.phone} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-white">{c.name}</p>
                    {c.email && <p className="text-xs text-cream/40">{c.email}</p>}
                  </td>
                  <td className="px-5 py-3.5 text-cream/70">{c.phone}</td>
                  <td className="px-5 py-3.5 font-bold text-gold-300">{c.trips}</td>
                  <td className="px-5 py-3.5 text-cream/80">{formatINR(c.value)}</td>
                  <td className="px-5 py-3.5 text-cream/60">
                    {new Date(c.last).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => setEditing(c)}
                      aria-label={`Edit ${c.name}`}
                      className="rounded-lg border border-white/10 p-2 text-cream/60 transition-colors hover:border-gold-500/40 hover:text-gold-300"
                    >
                      <Pencil className="size-3.5" aria-hidden />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      {editing && (
        <CustomerDialog
          key={editing.phone}
          customer={editing}
          onClose={() => setEditing(null)}
          onSaved={() => qc.invalidateQueries({ queryKey: ["admin-bookings"] })}
        />
      )}
    </>
  );
}
