"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { ArrowDown, MapPin, Phone, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/motion/magnetic";
import { siteConfig } from "@/config/site";
import { sceneMedia, type SceneMedia } from "@/config/media";
import { HeroCar } from "./hero-car";
import { SCENES, SceneKochi, AtmosphereLayer, type Atmosphere } from "./scenes";

/**
 * Photographic backdrop for a scene — real Kerala, cinematically graded so
 * the gold/ink luxury language survives. Falls back to the vector scene art
 * (rendered beneath) if the photo is missing or fails to load.
 */
function ScenePhotoLayer({
  media,
  atmosphere,
  priority,
}: {
  media?: SceneMedia;
  atmosphere: Atmosphere;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (!media || failed) return null;

  return (
    <div className="absolute inset-0" aria-hidden>
      {media.video ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={media.image}
          onError={() => setFailed(true)}
        >
          <source src={media.video} />
        </video>
      ) : media.image ? (
        <Image
          src={media.image}
          alt={media.alt}
          fill
          sizes="100vw"
          quality={82}
          priority={priority}
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : null}
      {/* Cinematic grade: depth at the edges, warmth in the light */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-black/35" />
      <div className="absolute inset-0 bg-gold-500/15 mix-blend-soft-light" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[#232227]" />
      {/* Keep the frame alive over the photograph */}
      <AtmosphereLayer type={atmosphere} />
    </div>
  );
}

const N = SCENES.length; // 7
const TRAVEL_START = 0.055;
const TRAVEL_END = 0.94;

/** Scroll progress at which scene i is centred in the viewport. */
const sceneCenter = (i: number) =>
  TRAVEL_START + ((TRAVEL_END - TRAVEL_START) * i) / (N - 1);

function SkyLayer({ progress, index }: { progress: MotionValue<number>; index: number }) {
  const c = sceneCenter(index);
  const opacity = useTransform(
    progress,
    index === 0
      ? [0, c, c + 0.085]
      : index === N - 1
        ? [c - 0.085, c, 1]
        : [c - 0.085, c, c + 0.085],
    index === 0 ? [1, 1, 0] : index === N - 1 ? [0, 1, 1] : [0, 1, 0]
  );
  const [top, bottom] = SCENES[index].sky;
  return (
    <motion.div
      aria-hidden
      className="absolute inset-0"
      style={{ opacity, background: `linear-gradient(to bottom, ${top}, ${bottom})` }}
    />
  );
}

function SceneCaption({ progress, index }: { progress: MotionValue<number>; index: number }) {
  const c = sceneCenter(index);
  const opacity = useTransform(progress, [c - 0.055, c - 0.02, c + 0.02, c + 0.055], [0, 1, 1, 0]);
  const y = useTransform(progress, [c - 0.055, c, c + 0.055], [28, 0, -28]);
  const scene = SCENES[index];
  return (
    <motion.div
      className="pointer-events-none absolute left-5 top-[16vh] sm:left-12 md:top-[20vh]"
      style={{ opacity, y }}
    >
      <p className="font-serif text-lg italic text-white/70">
        {String(index + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
      </p>
      <h3 className="mt-1 font-display text-4xl font-bold tracking-tight text-white drop-shadow-lg sm:text-6xl">
        {scene.name}
      </h3>
      <p className="mt-2 max-w-xs text-sm text-white/80 sm:text-base">{scene.caption}</p>
    </motion.div>
  );
}

function ProgressRail({ progress }: { progress: MotionValue<number> }) {
  return (
    <div className="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 flex-col items-end gap-4 lg:flex">
      {SCENES.map((s, i) => {
        const c = sceneCenter(i);
        return <RailDot key={s.name} progress={progress} center={c} label={s.name} />;
      })}
    </div>
  );
}

function RailDot({
  progress,
  center,
  label,
}: {
  progress: MotionValue<number>;
  center: number;
  label: string;
}) {
  const active = useTransform(progress, [center - 0.07, center, center + 0.07], [0.35, 1, 0.35]);
  const scale = useTransform(progress, [center - 0.07, center, center + 0.07], [1, 1.5, 1]);
  return (
    <motion.div className="flex items-center gap-2.5" style={{ opacity: active }}>
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
        {label}
      </span>
      <motion.span className="block size-2 rounded-full bg-gold-400" style={{ scale }} />
    </motion.div>
  );
}

export function JourneyHero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.5 });

  /* World strip translation — the journey itself */
  const worldX = useTransform(progress, [TRAVEL_START, TRAVEL_END], ["0vw", `-${(N - 1) * 100}vw`], {
    clamp: true,
  });
  /* Distant parallax layer moves slower; foreground haze faster */
  const farX = useTransform(progress, [TRAVEL_START, TRAVEL_END], ["0vw", `-${(N - 1) * 38}vw`], {
    clamp: true,
  });

  /* Car physics */
  const wheelRotate = useTransform(progress, [0, 1], [0, 360 * 34]);
  const bodyBob = useTransform(progress, (p) => Math.sin(p * Math.PI * 46) * 2.2);
  const carX = useTransform(
    progress,
    [0, TRAVEL_START, 0.88, 1],
    ["6vw", "10vw", "38vw", "44vw"]
  );
  const velocity = useVelocity(progress);
  const dustOpacity = useTransform(velocity, [0, 0.12], [0, 1], { clamp: true });
  const beamOpacity = useTransform(
    progress,
    [0, 0.1, 0.2, 0.68, 0.78, 1],
    [0.9, 0.9, 0.25, 0.25, 1, 1]
  );

  /* Road dashes scroll in sync with the world */
  const roadDashX = useTransform(progress, [TRAVEL_START, TRAVEL_END], ["0vw", `${(N - 1) * 100}vw`], {
    clamp: true,
  });

  /* Overlays */
  const introOpacity = useTransform(progress, [0, 0.045], [1, 0]);
  const introY = useTransform(progress, [0, 0.045], [0, -60]);
  const arrivalOpacity = useTransform(progress, [0.9, 0.965], [0, 1]);
  const arrivalY = useTransform(progress, [0.9, 0.965], [48, 0]);
  const arrivalPointer = useTransform(progress, (p) => (p > 0.93 ? "auto" : "none"));

  /* Static fallback for reduced motion */
  if (reduced) {
    return (
      <section className="relative flex min-h-screen items-center overflow-hidden bg-[linear-gradient(to_bottom,#1b2242,#3d4a7a)]">
        <div className="absolute inset-0"><SceneKochi /></div>
        <div className="container-luxe relative z-10 py-40 text-center">
          <HeroHeadline />
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative h-[680vh] bg-ink" aria-label="A scroll-driven drive through Kerala with ITR Cabs">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Sky crossfades */}
        {SCENES.map((_, i) => (
          <SkyLayer key={i} progress={progress} index={i} />
        ))}

        {/* Distant parallax haze — soft mountain band that drifts slower */}
        <motion.div
          aria-hidden
          className="absolute bottom-[30vh] left-0 h-[26vh] w-[400vw] opacity-25"
          style={{
            x: farX,
            background:
              "repeating-linear-gradient(to right, transparent 0 6vw, rgba(255,255,255,0.35) 6vw 18vw, transparent 18vw 30vw)",
            maskImage: "linear-gradient(to top, black, transparent)",
            WebkitMaskImage: "linear-gradient(to top, black, transparent)",
            filter: "blur(28px)",
          }}
        />

        {/* The world strip — 7 scenes side by side */}
        <motion.div
          className="absolute inset-y-0 left-0 flex will-change-transform"
          style={{ x: worldX, width: `${N * 100}vw` }}
        >
          {SCENES.map((scene, i) => {
            const Scene = scene.component;
            return (
              <div key={scene.name} className="relative h-full w-screen shrink-0">
                <Scene />
                <ScenePhotoLayer
                  media={sceneMedia[scene.slug]}
                  atmosphere={scene.atmosphere}
                  priority={i === 0}
                />
              </div>
            );
          })}
        </motion.div>

        {/* The road */}
        <div className="absolute bottom-0 left-0 right-0 h-[13vh] bg-[#232227]">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-[#3b3a40]" />
          <motion.div
            aria-hidden
            className="absolute inset-x-0 top-[46%] h-[5px]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to right, #f7b524 0 42px, transparent 42px 96px)",
              backgroundPositionX: roadDashX,
              opacity: 0.9,
            }}
          />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-transparent to-black/60" />
        </div>

        {/* The car */}
        <motion.div className="absolute bottom-[9vh] z-10" style={{ x: carX, left: 0 }}>
          <HeroCar
            wheelRotate={wheelRotate}
            bodyBob={bodyBob}
            beamOpacity={beamOpacity}
            dustOpacity={dustOpacity}
          />
        </motion.div>

        {/* Cinematic vignette */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.45))]" />

        {/* Intro headline */}
        <motion.div
          className="absolute inset-0 z-20 flex items-center justify-center"
          style={{ opacity: introOpacity, y: introY }}
        >
          <div className="container-luxe pb-[16vh] text-center">
            <HeroHeadline />
          </div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          className="absolute bottom-[16vh] left-1/2 z-20 -translate-x-1/2"
          style={{ opacity: introOpacity }}
        >
          <div className="flex flex-col items-center gap-2 text-white/80">
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em]">
              Scroll to drive
            </span>
            <span className="flex h-9 w-5 items-start justify-center rounded-full border border-white/40 p-1">
              <motion.span
                className="block h-2 w-1 rounded-full bg-gold-400"
                animate={{ y: [0, 12, 0], opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              />
            </span>
            <ArrowDown className="size-3.5 animate-bounce" aria-hidden />
          </div>
        </motion.div>

        {/* Scene captions + rail */}
        {SCENES.map((_, i) => (
          <SceneCaption key={i} progress={progress} index={i} />
        ))}
        <ProgressRail progress={progress} />

        {/* Arrival card */}
        <motion.div
          className="absolute inset-0 z-20 flex items-center justify-center px-5"
          style={{ opacity: arrivalOpacity, y: arrivalY, pointerEvents: arrivalPointer as unknown as "auto" }}
        >
          <div className="glass-dark w-full max-w-lg rounded-3xl border border-white/10 p-8 text-center shadow-2xl sm:p-10">
            <p className="font-serif text-xl italic text-gold-300">You have arrived.</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
              Every Kerala journey,
              <br />
              <span className="text-gradient-gold">driven this beautifully.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-white/70">
              GPS-tracked fleet, verified chauffeurs and transparent fares — from
              ₹2,200 a day. Reserve yours with just ₹199.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Magnetic>
                <Link href="/book">
                  <Button size="lg" className="min-w-44">
                    <MapPin aria-hidden /> Book your ride
                  </Button>
                </Link>
              </Magnetic>
              <a href={`tel:${siteConfig.phone}`}>
                <Button variant="glass" size="lg" className="min-w-44 text-white border-white/20 hover:bg-white/10">
                  <Phone aria-hidden /> {siteConfig.phoneDisplay}
                </Button>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function HeroHeadline() {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-white backdrop-blur-md"
      >
        <Star className="size-3.5 fill-gold-400 text-gold-400" aria-hidden />
        Rated {siteConfig.googleRating.value} · {siteConfig.googleRating.count.toLocaleString("en-IN")}+ Kerala journeys
      </motion.div>

      <h1 className="mx-auto max-w-4xl font-display text-5xl font-bold leading-[1.04] tracking-tight text-white sm:text-6xl md:text-7xl">
        {["Kerala,", "driven"].map((word, i) => (
          <span key={word} className="inline-block overflow-hidden pb-1 align-bottom">
            <motion.span
              className="inline-block"
              initial={{ y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1, delay: 0.3 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              {word}&nbsp;
            </motion.span>
          </span>
        ))}
        <span className="inline-block overflow-hidden pb-2 align-bottom">
          <motion.span
            className="inline-block font-serif italic text-gradient-gold"
            initial={{ y: "110%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 1, delay: 0.54, ease: [0.22, 1, 0.36, 1] }}
          >
            beautifully.
          </motion.span>
        </span>
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg"
      >
        Premium cabs, tour packages and corporate transport across God&rsquo;s Own
        Country — scroll, and let us drive you there.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
      >
        <Magnetic>
          <Link href="/book">
            <Button size="xl" className="min-w-48">Book a ride</Button>
          </Link>
        </Magnetic>
        <Link href="/fleet">
          <Button variant="glass" size="xl" className="min-w-48 border-white/25 text-white hover:bg-white/10">
            Explore the fleet
          </Button>
        </Link>
      </motion.div>
    </>
  );
}
