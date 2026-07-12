"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Login failed");
      router.push(params.get("next") ?? "/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setBusy(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      onSubmit={submit}
      className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 backdrop-blur-xl"
    >
      <div>
        <Label htmlFor="email" className="text-cream/80">Email</Label>
        <Input
          id="email"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@itrcabs.com"
          className="border-white/10 bg-white/10 text-white placeholder:text-white/30"
        />
      </div>
      <div className="mt-5">
        <Label htmlFor="password" className="text-cream/80">Password</Label>
        <Input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••••"
          className="border-white/10 bg-white/10 text-white placeholder:text-white/30"
        />
      </div>
      {error && <p role="alert" className="mt-4 text-sm font-semibold text-red-400">{error}</p>}
      <Button type="submit" size="lg" className="mt-7 w-full" disabled={busy}>
        {busy ? <Loader2 className="animate-spin" aria-hidden /> : <Lock aria-hidden />}
        Sign in
      </Button>
      <p className="mt-5 text-center text-xs text-cream/40">
        Demo access: admin@itrcabs.com · itrcabs@2026
      </p>
    </motion.form>
  );
}
