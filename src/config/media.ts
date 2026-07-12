/**
 * Real photography for the site — every entry is optional and hot-swappable.
 *
 * Defaults hotlink Wikimedia Commons (hotlinking is permitted and their CDN
 * is stable). To use your own photography or videos, drop files into
 * `public/media/...` and change the URLs here — nothing else to touch.
 * Wherever a photo is missing or fails to load, the site gracefully falls
 * back to the signature vector illustrations, so a broken URL can never
 * break the design.
 */

export interface SceneMedia {
  /** Photographic backdrop for the hero scene. */
  image?: string;
  /** Optional looping ambient video (mp4/webm) — used instead of the image when set. */
  video?: string;
  alt: string;
}

export const sceneMedia: Record<string, SceneMedia | undefined> = {
  kochi: {
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Kochi_Skyline.jpg/1920px-Kochi_Skyline.jpg",
    alt: "Kochi city skyline across the Marine Drive waterfront",
  },
  backwaters: {
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Houseboat_on_Alleppey_backwaters_%28Kerala%2C_India_2023%29_%2852704577484%29.jpg/1920px-Houseboat_on_Alleppey_backwaters_%28Kerala%2C_India_2023%29_%2852704577484%29.jpg",
    alt: "A traditional houseboat drifting on the Alleppey backwaters",
  },
  munnar: {
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/1_aerial_view_of_Munnar_Tea_Gardens_Kerala_India_2016.jpg/1920px-1_aerial_view_of_Munnar_Tea_Gardens_Kerala_India_2016.jpg",
    alt: "Aerial view of the rolling tea gardens of Munnar",
  },
  athirappilly: {
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Athirappilly_Falls_2025_June.jpg/1920px-Athirappilly_Falls_2025_June.jpg",
    // Live footage of the falls (1.4 MB looping webm; the image above is the poster)
    video:
      "https://upload.wikimedia.org/wikipedia/commons/transcoded/9/97/Athirappilly_Waterfalls_video_03.webm/Athirappilly_Waterfalls_video_03.webm.720p.vp9.webm",
    alt: "Athirappilly Falls thundering through the rainforest",
  },
  beach: {
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Kovalam_beach_trivandrum_kerala.jpg/1920px-Kovalam_beach_trivandrum_kerala.jpg",
    alt: "Kovalam beach and lighthouse at golden hour",
  },
  hairpins: {
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Wayanad_hairpin_curves.jpg/1920px-Wayanad_hairpin_curves.jpg",
    alt: "Hairpin bends climbing the Wayanad ghats",
  },
  /* The arrival finale stays illustrated — lamplit gate, stars and fireflies. */
  arrival: undefined,
};

export interface VehiclePhoto {
  src: string;
  alt: string;
}

export const vehiclePhotos: Record<string, VehiclePhoto | undefined> = {
  "premium-sedan": {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Suzuki_Dzire_1.2_GL%2B_2024.jpg/1280px-Suzuki_Dzire_1.2_GL%2B_2024.jpg",
    alt: "Maruti Suzuki Dzire premium sedan",
  },
  "compact-suv": {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Maruti_Suzuki_Brezza_-_front.jpg/1280px-Maruti_Suzuki_Brezza_-_front.jpg",
    alt: "Maruti Suzuki Brezza compact SUV",
  },
  "classic-suv": {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/2022_Hyundai_Creta_1.6_Plus.jpg/1280px-2022_Hyundai_Creta_1.6_Plus.jpg",
    alt: "Hyundai Creta SUV",
  },
  "luxury-suv": {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Toyota_Fortuner_4x4_Legender_%28LTD%29_2-Tone_White_Pearl-Black.jpg/1280px-Toyota_Fortuner_4x4_Legender_%28LTD%29_2-Tone_White_Pearl-Black.jpg",
    alt: "Toyota Fortuner Legender luxury SUV",
  },
  ertiga: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/2022_Maruti_Suzuki_Ertiga_LXi.jpg/1280px-2022_Maruti_Suzuki_Ertiga_LXi.jpg",
    alt: "Maruti Suzuki Ertiga MPV",
  },
  carens: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Kia_Carens_2024_Model.jpg/1280px-Kia_Carens_2024_Model.jpg",
    alt: "Kia Carens MPV",
  },
  "innova-crysta": {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Toyota_Innova_Crysta_2.4_Z_side.jpg/1280px-Toyota_Innova_Crysta_2.4_Z_side.jpg",
    alt: "Toyota Innova Crysta",
  },
  "tempo-traveller-12": {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Force_Traveller%2C_Leh-Manali_Highway.jpg/1280px-Force_Traveller%2C_Leh-Manali_Highway.jpg",
    alt: "Force Traveller tempo traveller",
  },
  "tempo-traveller-17": {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Force_Traveller%2C_Leh-Manali_Highway.jpg/1280px-Force_Traveller%2C_Leh-Manali_Highway.jpg",
    alt: "Force Traveller tempo traveller",
  },
  "tempo-traveller-26": {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Force_Motors_-_Traveller_26_-_Agra_2014-05-14_4222.JPG/1280px-Force_Motors_-_Traveller_26_-_Agra_2014-05-14_4222.JPG",
    alt: "Force Traveller 26-seat coach",
  },
  /* No quality Urbania photography on Commons yet — the signature illustration
     is shown until you add your own photo of the fleet here. */
  "urbania-14": undefined,
  "urbania-18": undefined,
};
