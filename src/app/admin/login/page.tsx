import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";
import { LogoMark } from "@/components/brand/logo";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-5">
      <div aria-hidden className="absolute inset-0 bg-dot-grid opacity-[0.07]" />
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[50rem] -translate-x-1/2 rounded-full bg-gold-500/15 blur-3xl" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <LogoMark className="mx-auto size-14" />
          <h1 className="mt-5 font-display text-3xl font-bold text-white">
            ITR <span className="text-gradient-gold">Command Centre</span>
          </h1>
          <p className="mt-2 text-sm text-cream/60">Operations dashboard — authorised staff only</p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
