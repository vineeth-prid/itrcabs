import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { LogoMark } from "@/components/brand/logo";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
        <LogoMark className="size-16 opacity-80" />
        <p className="mt-8 font-serif text-2xl italic text-gold-600">Wrong turn?</p>
        <h1 className="mt-2 font-display text-5xl font-bold tracking-tight text-ink">
          This road doesn&rsquo;t exist.
        </h1>
        <p className="mt-4 max-w-md text-smoke">
          The page you&rsquo;re looking for has moved or was never on our map. Let&rsquo;s
          get you back on route.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/"><Button size="lg">Back to home</Button></Link>
          <Link href="/book"><Button variant="outline" size="lg">Book a cab</Button></Link>
        </div>
      </main>
    </>
  );
}
