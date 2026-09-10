"use client";

import { useState } from "react";
import Image from "next/image";
import type { Illustration } from "@/config/fleet";
import { vehiclePhotos } from "@/config/media";
import { VehicleIllustration } from "./vehicle-illustration";
import { cn } from "@/lib/utils";

/**
 * Real photograph of the vehicle model where available, with the signature
 * vector illustration as an automatic fallback (missing entry or load error).
 */
export function VehicleVisual({
  slug,
  illustration,
  name,
  imageUrl,
  className,
  priority = false,
}: {
  slug: string;
  illustration: Illustration;
  name: string;
  /** Photo set in the admin panel, which wins over the bundled one. */
  imageUrl?: string;
  className?: string;
  priority?: boolean;
}) {
  const bundled = vehiclePhotos[slug];
  const custom = imageUrl?.trim();
  const [failed, setFailed] = useState(false);

  if ((!custom && !bundled) || failed) {
    return (
      <div className={cn("px-2", className)}>
        <VehicleIllustration variant={illustration} title={name} />
      </div>
    );
  }

  const shell = cn("relative aspect-[8/5] overflow-hidden rounded-2xl", className);
  const imgClass =
    "object-cover transition-transform duration-700 ease-[var(--ease-luxe)] group-hover:scale-[1.05]";

  /* An admin-pasted URL can point at any host, and next/image only serves hosts
     listed in next.config. So the bundled photos keep the optimiser and a
     custom one renders as a plain <img>, falling back to the illustration if
     the address turns out to be wrong. */
  if (custom) {
    return (
      <div className={shell}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={custom}
          alt={name}
          className={cn("absolute inset-0 size-full", imgClass)}
          onError={() => setFailed(true)}
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent" />
      </div>
    );
  }

  return (
    <div className={shell}>
      <Image
        src={bundled!.src}
        alt={bundled!.alt}
        fill
        sizes="(max-width: 640px) 90vw, (max-width: 1280px) 45vw, 380px"
        className={imgClass}
        priority={priority}
        onError={() => setFailed(true)}
      />
      {/* Soft grade so photos of different origins sit in one family */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent" />
    </div>
  );
}
