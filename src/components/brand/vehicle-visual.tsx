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
  className,
  priority = false,
}: {
  slug: string;
  illustration: Illustration;
  name: string;
  className?: string;
  priority?: boolean;
}) {
  const photo = vehiclePhotos[slug];
  const [failed, setFailed] = useState(false);

  if (!photo || failed) {
    return (
      <div className={cn("px-2", className)}>
        <VehicleIllustration variant={illustration} title={name} />
      </div>
    );
  }

  return (
    <div className={cn("relative aspect-[8/5] overflow-hidden rounded-2xl", className)}>
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes="(max-width: 640px) 90vw, (max-width: 1280px) 45vw, 380px"
        className="object-cover transition-transform duration-700 ease-[var(--ease-luxe)] group-hover:scale-[1.05]"
        priority={priority}
        onError={() => setFailed(true)}
      />
      {/* Soft grade so photos of different origins sit in one family */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent" />
    </div>
  );
}
