"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, CalendarCheck2, CarFront, IndianRupee, Users2,
  CreditCard, PanelsTopLeft, BarChart3, Settings, LogOut, Menu, X,
} from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck2 },
  { href: "/admin/fleet", label: "Fleet", icon: CarFront },
  { href: "/admin/pricing", label: "Pricing", icon: IndianRupee },
  { href: "/admin/customers", label: "Customers", icon: Users2 },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/cms", label: "CMS", icon: PanelsTopLeft },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({ children, adminName }: { children: React.ReactNode; adminName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link href="/admin" className="flex items-center gap-2.5 px-6 py-6">
        <LogoMark className="size-9" />
        <span className="font-display text-lg font-bold text-white">
          ITR <span className="text-gradient-gold">Admin</span>
        </span>
      </Link>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3" aria-label="Admin">
        {nav.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200",
                active
                  ? "bg-gradient-gold text-ink shadow-glow"
                  : "text-cream/60 hover:bg-white/5 hover:text-white"
              )}
              aria-current={active ? "page" : undefined}
            >
              <item.icon className="size-4.5" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-4">
        <p className="px-2 pb-3 text-xs text-cream/50">
          Signed in as <strong className="text-cream/80">{adminName}</strong>
        </p>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-cream/60 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut className="size-4.5" aria-hidden /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0e0e11]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/8 bg-ink lg:block">
        {sidebar}
      </aside>

      {/* Mobile header + drawer */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-white/8 bg-ink px-4 py-3 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <LogoMark className="size-8" />
          <span className="font-display font-bold text-white">ITR Admin</span>
        </Link>
        <button
          className="flex size-10 items-center justify-center rounded-lg text-white"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} aria-hidden />
          <aside className="absolute inset-y-0 left-0 w-72 bg-ink">{sidebar}</aside>
        </div>
      )}

      <main className="min-h-screen p-5 sm:p-8 lg:ml-64 lg:p-10">{children}</main>
    </div>
  );
}
