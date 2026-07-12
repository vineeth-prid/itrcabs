export type VehicleCategory = "SEDAN" | "SUV" | "MPV" | "TEMPO_TRAVELLER" | "URBANIA";
export type Illustration = "sedan" | "suv" | "suv-luxury" | "mpv" | "tempo" | "urbania";

export interface VehicleSpec {
  slug: string;
  name: string;
  category: VehicleCategory;
  categoryLabel: string;
  tagline: string;
  description: string;
  seats: number;
  luggage: number;
  ac: boolean;
  fuel: "Petrol" | "Diesel";
  /** One-day trip base fare — includes 80 km */
  basePrice: number;
  /** Per-day fare for multi-day trips — includes 100 km/day */
  perDayPrice: number;
  extraKmRate: number;
  driverBata: number;
  illustration: Illustration;
  features: string[];
  examples: string;
  popular?: boolean;
}

export const ONE_DAY_INCLUDED_KM = 80;
export const MULTI_DAY_INCLUDED_KM = 100;

export const fleet: VehicleSpec[] = [
  {
    slug: "premium-sedan",
    name: "Premium Sedan",
    category: "SEDAN",
    categoryLabel: "Sedan",
    tagline: "The everyday executive",
    description:
      "Immaculate, chauffeur-driven sedans for airport runs, business meetings and city travel across Kochi and Ernakulam. Quiet cabins, generous boot space and drivers who know every shortcut in the city.",
    seats: 4,
    luggage: 2,
    ac: true,
    fuel: "Diesel",
    basePrice: 2200,
    perDayPrice: 2600,
    extraKmRate: 13,
    driverBata: 400,
    illustration: "sedan",
    features: ["Chauffeur driven", "GPS tracked", "Phone charger", "Bottled water"],
    examples: "Dzire · Aura · Etios",
    popular: true,
  },
  {
    slug: "compact-suv",
    name: "Compact SUV",
    category: "SUV",
    categoryLabel: "SUV",
    tagline: "City agility, hill-road confidence",
    description:
      "High ground clearance and a commanding view — ideal for small families heading to Munnar or Vagamon without stepping up to a full-size SUV.",
    seats: 4,
    luggage: 3,
    ac: true,
    fuel: "Diesel",
    basePrice: 2800,
    perDayPrice: 3200,
    extraKmRate: 15,
    driverBata: 400,
    illustration: "suv",
    features: ["Hill-experienced drivers", "GPS tracked", "Roof rails", "Charging ports"],
    examples: "Brezza · Nexon · Venue",
  },
  {
    slug: "classic-suv",
    name: "Classic SUV",
    category: "SUV",
    categoryLabel: "SUV",
    tagline: "The Kerala roads all-rounder",
    description:
      "Mid-size SUVs with spacious second rows and smooth highway manners. The most requested category for family outstation trips.",
    seats: 4,
    luggage: 4,
    ac: true,
    fuel: "Diesel",
    basePrice: 3200,
    perDayPrice: 3800,
    extraKmRate: 17,
    driverBata: 500,
    illustration: "suv",
    features: ["Spacious 2nd row", "GPS tracked", "Sunroof (select cars)", "Premium interiors"],
    examples: "Creta · Seltos · Grand Vitara",
    popular: true,
  },
  {
    slug: "luxury-suv",
    name: "Luxury SUV",
    category: "SUV",
    categoryLabel: "SUV",
    tagline: "Arrive like it matters",
    description:
      "Full-size luxury SUVs for weddings, VIP movement and clients who expect the best. Captain-grade comfort, commanding presence.",
    seats: 6,
    luggage: 4,
    ac: true,
    fuel: "Diesel",
    basePrice: 5500,
    perDayPrice: 6500,
    extraKmRate: 26,
    driverBata: 600,
    illustration: "suv-luxury",
    features: ["Ventilated leather seats", "Chauffeur in formals", "Privacy glass", "WiFi on request"],
    examples: "Fortuner · XUV700 · Hycross",
  },
  {
    slug: "ertiga",
    name: "Maruti Ertiga",
    category: "MPV",
    categoryLabel: "MPV",
    tagline: "Six seats, effortless value",
    description:
      "Kerala's favourite family mover. Three comfortable rows, easy boarding and honest economy for group city trips and short tours.",
    seats: 6,
    luggage: 3,
    ac: true,
    fuel: "Petrol",
    basePrice: 2800,
    perDayPrice: 3300,
    extraKmRate: 15,
    driverBata: 400,
    illustration: "mpv",
    features: ["3 rows", "GPS tracked", "Flexible luggage", "Charging ports"],
    examples: "Ertiga VXi / ZXi",
    popular: true,
  },
  {
    slug: "carens",
    name: "Kia Carens",
    category: "MPV",
    categoryLabel: "MPV",
    tagline: "The modern family lounge",
    description:
      "A step up in refinement — one-touch second row, rear AC vents for all three rows and a cabin that keeps everyone happy on long drives.",
    seats: 6,
    luggage: 3,
    ac: true,
    fuel: "Diesel",
    basePrice: 3000,
    perDayPrice: 3600,
    extraKmRate: 16,
    driverBata: 450,
    illustration: "mpv",
    features: ["Rear AC all rows", "One-touch seats", "GPS tracked", "Premium cabin"],
    examples: "Carens Premium / Luxury",
  },
  {
    slug: "innova-crysta",
    name: "Toyota Innova Crysta",
    category: "MPV",
    categoryLabel: "MPV",
    tagline: "The gold standard of Kerala touring",
    description:
      "The definitive long-distance tourer. Captain seats, legendary reliability and ride comfort that turns a six-hour drive into a pleasure.",
    seats: 7,
    luggage: 4,
    ac: true,
    fuel: "Diesel",
    basePrice: 3800,
    perDayPrice: 4500,
    extraKmRate: 19,
    driverBata: 500,
    illustration: "mpv",
    features: ["Captain seats (select)", "GPS tracked", "Ample luggage", "Tour-experienced drivers"],
    examples: "Innova Crysta GX / ZX",
    popular: true,
  },
  {
    slug: "tempo-traveller-12",
    name: "Tempo Traveller 12",
    category: "TEMPO_TRAVELLER",
    categoryLabel: "Tempo Traveller",
    tagline: "The group-trip classic",
    description:
      "Push-back seats, wide windows and space for the whole crew. Perfect for family functions, pilgrimages and office day-outs.",
    seats: 12,
    luggage: 10,
    ac: true,
    fuel: "Diesel",
    basePrice: 5500,
    perDayPrice: 6500,
    extraKmRate: 24,
    driverBata: 600,
    illustration: "tempo",
    features: ["Push-back seats", "Icebox", "Music system", "GPS tracked"],
    examples: "Force Traveller 3350",
  },
  {
    slug: "tempo-traveller-17",
    name: "Tempo Traveller 17",
    category: "TEMPO_TRAVELLER",
    categoryLabel: "Tempo Traveller",
    tagline: "More seats, same comfort",
    description:
      "The 17-seater sweet spot for larger groups — wedding parties, corporate offsites and extended-family tours across Kerala.",
    seats: 17,
    luggage: 14,
    ac: true,
    fuel: "Diesel",
    basePrice: 6500,
    perDayPrice: 7800,
    extraKmRate: 28,
    driverBata: 700,
    illustration: "tempo",
    features: ["Push-back seats", "LED cabin lights", "Music system", "GPS tracked"],
    examples: "Force Traveller 4020",
  },
  {
    slug: "tempo-traveller-26",
    name: "Tempo Traveller 26",
    category: "TEMPO_TRAVELLER",
    categoryLabel: "Tempo Traveller",
    tagline: "Move the whole celebration",
    description:
      "Our largest coach-style traveller. Twenty-six seats for weddings, church and temple pilgrimages, school tours and corporate events.",
    seats: 26,
    luggage: 20,
    ac: true,
    fuel: "Diesel",
    basePrice: 9000,
    perDayPrice: 10500,
    extraKmRate: 36,
    driverBata: 800,
    illustration: "tempo",
    features: ["Coach seating", "PA system", "Large boot", "GPS tracked"],
    examples: "Mini coach class",
  },
  {
    slug: "urbania-14",
    name: "Premium Urbania 14",
    category: "URBANIA",
    categoryLabel: "Urbania",
    tagline: "Business class on wheels",
    description:
      "The Force Urbania redefines group luxury — monocoque build, whisper-quiet cabin, individual AC vents and USB at every seat. The choice for premium tours and executive movement.",
    seats: 14,
    luggage: 12,
    ac: true,
    fuel: "Diesel",
    basePrice: 9500,
    perDayPrice: 11000,
    extraKmRate: 38,
    driverBata: 800,
    illustration: "urbania",
    features: ["Monocoque comfort", "USB every seat", "Individual AC vents", "Captain-grade seats"],
    examples: "Force Urbania",
    popular: true,
  },
  {
    slug: "urbania-18",
    name: "Premium Urbania 18",
    category: "URBANIA",
    categoryLabel: "Urbania",
    tagline: "Luxury, scaled up",
    description:
      "All the refinement of the Urbania with four more seats. Ideal for premium group tours, corporate delegations and destination weddings.",
    seats: 18,
    luggage: 15,
    ac: true,
    fuel: "Diesel",
    basePrice: 11000,
    perDayPrice: 12800,
    extraKmRate: 42,
    driverBata: 900,
    illustration: "urbania",
    features: ["Reclining seats", "USB every seat", "Ambient lighting", "GPS tracked"],
    examples: "Force Urbania LWB",
  },
];

export const categories: { value: VehicleCategory; label: string }[] = [
  { value: "SEDAN", label: "Sedan" },
  { value: "SUV", label: "SUV" },
  { value: "MPV", label: "MPV" },
  { value: "TEMPO_TRAVELLER", label: "Tempo Traveller" },
  { value: "URBANIA", label: "Urbania" },
];

/**
 * Passenger-fit rule: a vehicle must seat the whole group, and it shouldn't
 * be absurdly oversized — a couple isn't offered a 17-seat Traveller, but can
 * still choose a 6–7 seat luxury SUV or Innova. Headroom scales with group
 * size so 18 travellers still see the 26-seat coach.
 */
export function fitsPassengers(v: Pick<VehicleSpec, "seats">, passengers: number): boolean {
  if (v.seats < passengers) return false;
  if (v.seats <= 7) return true; // cars, SUVs & MPVs suit any small group
  const headroom = Math.max(6, Math.ceil(passengers * 0.5));
  return v.seats - passengers <= headroom;
}

export function vehiclesForPassengers(passengers: number): VehicleSpec[] {
  return fleet.filter((v) => fitsPassengers(v, passengers));
}

export function getVehicle(slug: string): VehicleSpec | undefined {
  return fleet.find((v) => v.slug === slug);
}
