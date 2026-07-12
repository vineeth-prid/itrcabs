import type { LucideIcon } from "lucide-react";
import {
  Plane,
  TrainFront,
  Briefcase,
  Users,
  Heart,
  Palmtree,
  Landmark,
  LineChart,
  Gem,
  Route,
} from "lucide-react";

export interface Service {
  slug: string;
  name: string;
  short: string;
  description: string;
  icon: LucideIcon;
  points: string[];
  seoTitle: string;
  seoDescription: string;
}

export const services: Service[] = [
  {
    slug: "airport-transfer",
    name: "Airport Transfer",
    short: "Flight-tracked pickups at Cochin International Airport, day or night.",
    description:
      "We monitor your flight, meet you at arrivals with a name board, and have you moving within minutes of landing. Fixed fares to and from Cochin International Airport (COK) — no surge, no waiting-time surprises, 24×7.",
    icon: Plane,
    points: [
      "Flight tracking — delayed flights never mean missed pickups",
      "Meet & greet with name board at arrivals",
      "Fixed all-inclusive airport fares",
      "24×7 operations, every day of the year",
    ],
    seoTitle: "Airport Taxi Kochi — COK Airport Pickup & Drop",
    seoDescription:
      "Reliable airport taxi in Kochi. Flight-tracked pickups and drops at Cochin International Airport (COK) with fixed fares, meet & greet and 24×7 availability. Book with ITR Cabs.",
  },
  {
    slug: "railway-pickup",
    name: "Railway Pickup",
    short: "On-time pickups at Ernakulam Junction, Town and Aluva stations.",
    description:
      "Train running late? We track it. Our drivers wait at the right exit of Ernakulam Junction (South), Ernakulam Town (North) and Aluva stations, help with luggage, and get you home or to your hotel comfortably.",
    icon: TrainFront,
    points: [
      "Live train-status tracking",
      "Pickup at all Ernakulam & Aluva stations",
      "Luggage assistance included",
      "Early-morning and late-night friendly",
    ],
    seoTitle: "Railway Station Taxi Ernakulam — Junction & Town Pickup",
    seoDescription:
      "Taxi pickup at Ernakulam Junction, Ernakulam Town and Aluva railway stations. Train-tracked, on-time cab service by ITR Cabs, Kakkanad.",
  },
  {
    slug: "corporate-cab",
    name: "Corporate Cab",
    short: "Dedicated cabs and monthly billing for Kochi's businesses.",
    description:
      "From Infopark and SmartCity to CSEZ, we run dedicated corporate cab programs — executive travel, client movement and event logistics with a single monthly invoice, trip-wise reports and a dedicated coordinator.",
    icon: Briefcase,
    points: [
      "Monthly consolidated billing with trip-wise reports",
      "Dedicated account coordinator",
      "Executive sedans to luxury SUVs",
      "Priority dispatch for corporate accounts",
    ],
    seoTitle: "Corporate Cab Service Kochi — Infopark, SmartCity, CSEZ",
    seoDescription:
      "Corporate cab service in Kochi for Infopark, SmartCity and CSEZ companies. Dedicated coordinators, monthly billing, GPS-tracked executive fleet. ITR Cabs.",
  },
  {
    slug: "employee-transportation",
    name: "Employee Transportation",
    short: "Shift-based staff transport with GPS tracking and route planning.",
    description:
      "Complete employee shuttle operations for IT parks and industrial units — roster-based route planning, night-shift safety protocols, backup vehicles and a 35-day credit billing cycle. This is the backbone of what we do.",
    icon: Users,
    points: [
      "Roster-based route planning & optimisation",
      "Night-shift safety protocols and escorts on request",
      "Backup vehicles to guarantee continuity",
      "35-day credit period with detailed trip invoices",
    ],
    seoTitle: "Employee Transportation Kerala — Staff Shuttle Service Kochi",
    seoDescription:
      "Professional employee transportation in Kerala. Shift-based staff shuttles for Infopark & CSEZ with GPS tracking, route planning, backup fleet and credit billing. ITR Cabs.",
  },
  {
    slug: "wedding-cars",
    name: "Wedding Cars",
    short: "Decorated luxury cars and guest logistics for the big day.",
    description:
      "Luxury SUVs and premium sedans for the couple, plus Urbania and tempo traveller fleets to move guests between venues — coordinated to the minute so the celebration never waits.",
    icon: Heart,
    points: [
      "Decorated cars for the couple",
      "Guest shuttle coordination between venues",
      "Chauffeurs in formals",
      "Multi-day wedding packages",
    ],
    seoTitle: "Wedding Car Rental Kochi — Luxury Cars & Guest Transport",
    seoDescription:
      "Wedding car rental in Kochi & Ernakulam. Decorated luxury SUVs, premium sedans, Urbania and tempo travellers for guest transport. ITR Cabs wedding fleet.",
  },
  {
    slug: "holiday-packages",
    name: "Holiday Packages",
    short: "Curated Kerala itineraries with car, driver and local knowledge.",
    description:
      "Munnar honeymoons, family backwater circuits, monsoon waterfall trails — complete road itineraries with a dedicated car and a driver-guide who knows where the good food and quiet viewpoints are.",
    icon: Palmtree,
    points: [
      "Curated multi-day itineraries",
      "One car, one driver for the whole trip",
      "Hotel & houseboat coordination",
      "Transparent per-day pricing",
    ],
    seoTitle: "Kerala Holiday Packages by Car — Munnar, Alleppey, Wayanad",
    seoDescription:
      "Kerala holiday packages with dedicated car and driver. Munnar, Alleppey, Thekkady, Wayanad circuits with transparent per-day pricing. Plan with ITR Cabs.",
  },
  {
    slug: "pilgrimage-tours",
    name: "Pilgrimage Tours",
    short: "Sabarimala, Guruvayur, Velankanni — journeys of faith, done right.",
    description:
      "Experienced drivers for Sabarimala season, Guruvayur darshan runs and multi-state pilgrim circuits. Early-hour starts, temple-town parking knowledge and patient, respectful service.",
    icon: Landmark,
    points: [
      "Sabarimala season expertise",
      "Guruvayur, Chottanikkara, Malayattoor circuits",
      "Group tempo traveller options",
      "Flexible darshan-time scheduling",
    ],
    seoTitle: "Pilgrimage Taxi Kerala — Sabarimala, Guruvayur Tours",
    seoDescription:
      "Pilgrimage taxi service in Kerala — Sabarimala, Guruvayur, Chottanikkara and multi-state circuits with experienced drivers and group vehicles. ITR Cabs.",
  },
  {
    slug: "business-travel",
    name: "Business Travel",
    short: "Multi-stop business days with a car on standby.",
    description:
      "Full-day and half-day disposal packages for executives — a premium car and professional chauffeur on standby for meetings across Kochi, with billing your accounts team will love.",
    icon: LineChart,
    points: [
      "Half-day & full-day disposal",
      "Wait-and-return at each stop",
      "GST invoices",
      "Discreet, professional chauffeurs",
    ],
    seoTitle: "Business Travel Cabs Kochi — Full Day Car at Disposal",
    seoDescription:
      "Business travel cabs in Kochi. Full-day executive car at disposal with professional chauffeur and GST billing. ITR Cabs corporate services.",
  },
  {
    slug: "luxury-rentals",
    name: "Luxury Rentals",
    short: "Premium SUVs and the Urbania fleet, chauffeur-driven.",
    description:
      "When the occasion demands more — luxury SUVs, premium Urbania vans and top-spec MPVs with chauffeurs trained for VIP movement, film crews and executive delegations.",
    icon: Gem,
    points: [
      "Fortuner, XUV700, Innova Hycross class",
      "Premium Urbania 14 & 18 seaters",
      "VIP & delegation experience",
      "Hourly, daily and weekly terms",
    ],
    seoTitle: "Luxury Cab Kerala — Premium SUV & Urbania Rental",
    seoDescription:
      "Luxury cab rental in Kerala. Chauffeur-driven premium SUVs and Force Urbania rentals for VIP travel, events and delegations. ITR Cabs.",
  },
  {
    slug: "outstation-trips",
    name: "Outstation Trips",
    short: "Anywhere in South India, one transparent fare.",
    description:
      "Munnar to Madurai, Wayanad to Bengaluru — one-way and round trips across Kerala, Tamil Nadu and Karnataka with clear per-kilometre pricing and drivers who do these routes weekly.",
    icon: Route,
    points: [
      "All-Kerala + South India coverage",
      "One-day and multi-day formats",
      "80–100 km included per day",
      "Night-halt and driver bata clarity upfront",
    ],
    seoTitle: "Outstation Taxi Kochi — Kerala & South India Trips",
    seoDescription:
      "Outstation taxi from Kochi to Munnar, Wayanad, Alleppey and across South India. Transparent km-based pricing, experienced drivers. Book ITR Cabs.",
  },
];

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
