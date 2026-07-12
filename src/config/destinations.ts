export interface Destination {
  slug: string;
  name: string;
  title: string;
  distanceKm: number;
  driveTime: string;
  bestSeason: string;
  blurb: string;
  description: string;
  highlights: string[];
  idealVehicles: string[];
  emoji: string;
  gradient: string;
}

export const destinations: Destination[] = [
  {
    slug: "munnar",
    name: "Munnar",
    title: "Kochi to Munnar Taxi — Tea Country in a Day",
    distanceKm: 130,
    driveTime: "3.5–4 hrs",
    bestSeason: "September – May",
    blurb: "Rolling tea estates, misty mornings and Eravikulam's clouded peaks.",
    description:
      "The climb from Kochi to Munnar is one of India's great drives — spice plantations giving way to endless tea gardens at 1,600 metres. Our hill-certified drivers take the Neriamangalam route with stops at Cheeyappara and Valara waterfalls, so the journey is as memorable as the destination.",
    highlights: ["Tea Museum & Kolukkumalai", "Eravikulam National Park", "Mattupetty Dam & Echo Point", "Top Station viewpoint"],
    idealVehicles: ["classic-suv", "innova-crysta", "urbania-14"],
    emoji: "🍃",
    gradient: "from-emerald-800 to-teal-600",
  },
  {
    slug: "alleppey",
    name: "Alleppey",
    title: "Kochi to Alleppey Taxi — Backwater Country",
    distanceKm: 55,
    driveTime: "1.5 hrs",
    bestSeason: "November – February",
    blurb: "Houseboats drifting through palm-lined canals — Kerala's postcard.",
    description:
      "An easy morning drive from Kochi delivers you to the Venice of the East. We coordinate with houseboat operators for jetty-side drop-offs, and our drivers know the quiet canal-side routes past Kumarakom and Pathiramanal.",
    highlights: ["Houseboat cruises", "Alleppey Beach & lighthouse", "Marari Beach", "Punnamada backwaters"],
    idealVehicles: ["premium-sedan", "ertiga", "innova-crysta"],
    emoji: "🛶",
    gradient: "from-cyan-800 to-emerald-600",
  },
  {
    slug: "wayanad",
    name: "Wayanad",
    title: "Wayanad Taxi Package — Forests, Caves & Coffee",
    distanceKm: 250,
    driveTime: "6 hrs",
    bestSeason: "October – May",
    blurb: "Edakkal caves, Banasura's shores and coffee-scented hill air.",
    description:
      "Wayanad rewards the long drive north — ancient petroglyphs at Edakkal, India's largest earthen dam at Banasura Sagar, and bamboo forests around Muthanga. Best done as a two-to-three-day package with our multi-day rates.",
    highlights: ["Edakkal Caves", "Banasura Sagar Dam", "Chembra Peak", "Muthanga Wildlife Sanctuary"],
    idealVehicles: ["classic-suv", "innova-crysta", "tempo-traveller-12"],
    emoji: "🏞️",
    gradient: "from-green-900 to-lime-700",
  },
  {
    slug: "thekkady",
    name: "Thekkady",
    title: "Kochi to Thekkady Taxi — Periyar Wildlife Country",
    distanceKm: 160,
    driveTime: "4.5 hrs",
    bestSeason: "September – June",
    blurb: "Spice gardens, bamboo rafting and elephants at Periyar's lake.",
    description:
      "The road to Thekkady winds through cardamom country to Kerala's most famous wildlife reserve. Combine the Periyar lake cruise with spice plantation walks and a Kathakali evening — our drivers handle timings so you never miss a boat.",
    highlights: ["Periyar Lake cruise", "Spice plantation tours", "Elephant junction", "Kadathanadan Kalari show"],
    idealVehicles: ["classic-suv", "innova-crysta", "urbania-14"],
    emoji: "🐘",
    gradient: "from-amber-900 to-orange-700",
  },
  {
    slug: "kochi",
    name: "Kochi",
    title: "Kochi City Taxi — Heritage & Harbour",
    distanceKm: 0,
    driveTime: "Full day",
    bestSeason: "All year",
    blurb: "Chinese nets, colonial lanes and Kerala's most cosmopolitan food scene.",
    description:
      "Our home city, done properly: sunrise at the Chinese fishing nets, Mattancherry's spice bazaars, the Dutch Palace and Jew Town, then sunset at Marine Drive. A full-day city package with a driver who grew up on these streets.",
    highlights: ["Fort Kochi & Chinese nets", "Mattancherry Palace", "Marine Drive", "Lulu Mall & Kochi Metro"],
    idealVehicles: ["premium-sedan", "compact-suv", "ertiga"],
    emoji: "⚓",
    gradient: "from-sky-800 to-indigo-600",
  },
  {
    slug: "vagamon",
    name: "Vagamon",
    title: "Kochi to Vagamon Taxi — Meadows in the Mist",
    distanceKm: 100,
    driveTime: "3 hrs",
    bestSeason: "September – May",
    blurb: "Pine forests, paragliding meadows and monastery-quiet hills.",
    description:
      "Quieter than Munnar and closer to Kochi, Vagamon's rolling meadows and pine plantations make a perfect weekend escape. The final climb through rubber and cardamom estates is a driver's favourite.",
    highlights: ["Vagamon meadows", "Pine forest", "Paragliding point", "Kurisumala"],
    idealVehicles: ["compact-suv", "classic-suv", "ertiga"],
    emoji: "🪂",
    gradient: "from-teal-800 to-green-600",
  },
  {
    slug: "athirappilly",
    name: "Athirappilly",
    title: "Kochi to Athirappilly Taxi — Kerala's Niagara",
    distanceKm: 70,
    driveTime: "2 hrs",
    bestSeason: "June – January",
    blurb: "The thunder of Kerala's biggest waterfall, framed by rainforest.",
    description:
      "Just two hours from Kochi, the Chalakudy river plunges 25 metres in a spectacle best seen right after the monsoon. Pair it with Vazhachal falls and the jungle drive towards Malakkappara for a full cinematic day.",
    highlights: ["Athirappilly Falls", "Vazhachal Falls", "Charpa Falls", "Jungle safari drive"],
    idealVehicles: ["premium-sedan", "compact-suv", "innova-crysta"],
    emoji: "💦",
    gradient: "from-slate-800 to-cyan-700",
  },
  {
    slug: "kumarakom",
    name: "Kumarakom",
    title: "Kochi to Kumarakom Taxi — Lakeside Luxury",
    distanceKm: 50,
    driveTime: "1.5 hrs",
    bestSeason: "November – March",
    blurb: "Vembanad's luxury resorts and a bird sanctuary at the water's edge.",
    description:
      "Kerala's luxury-resort capital sits on Vembanad Lake, a short scenic drive from Kochi. We handle resort transfers, sunset cruise timings and early-morning bird sanctuary runs with equal ease.",
    highlights: ["Kumarakom Bird Sanctuary", "Vembanad Lake cruises", "Luxury lake resorts", "Village backwater canoeing"],
    idealVehicles: ["premium-sedan", "luxury-suv", "innova-crysta"],
    emoji: "🦩",
    gradient: "from-blue-900 to-teal-600",
  },
];

export function getDestination(slug: string): Destination | undefined {
  return destinations.find((d) => d.slug === slug);
}
