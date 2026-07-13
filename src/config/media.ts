/**
 * Real photography for the site — every entry is optional and hot-swappable.
 *
 * Scene backdrops hotlink Unsplash (hotlinking via images.unsplash.com is
 * permitted and CDN-backed); vehicle photos hotlink Wikimedia Commons. To use
 * your own photography or videos, drop files into `public/media/...` and
 * change the URLs here — nothing else to touch. Wherever a photo is missing
 * or fails to load, the site gracefully falls back to the signature vector
 * illustrations, so a broken URL can never break the design.
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
      "https://images.unsplash.com/photo-1590123732197-e7079d2ceb89?q=80&w=1920&auto=format&fit=crop",
    alt: "Chinese fishing nets silhouetted against a pastel sunset at Fort Kochi",
  },
  backwaters: {
    image:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1920&auto=format&fit=crop",
    alt: "A traditional houseboat drifting through palm-lined Alleppey backwaters",
  },
  munnar: {
    image:
      "https://images.unsplash.com/photo-1719831738921-972e0ec76337?q=80&w=1920&auto=format&fit=crop",
    alt: "Mist rolling over the peaks above Munnar's rolling tea gardens",
  },
  athirappilly: {
    image:
      "https://images.unsplash.com/photo-1713717857192-080dbbcba744?q=80&w=1920&auto=format&fit=crop",
    // Live footage of the falls (1.4 MB looping webm; the image above is the poster)
    video:
      "https://upload.wikimedia.org/wikipedia/commons/transcoded/9/97/Athirappilly_Waterfalls_video_03.webm/Athirappilly_Waterfalls_video_03.webm.720p.vp9.webm",
    alt: "Athirappilly Falls thundering through the rainforest",
  },
  beach: {
    image:
      "https://images.unsplash.com/photo-1621338316942-d447981536a5?q=80&w=1920&auto=format&fit=crop",
    alt: "Kovalam lighthouse rising over palms and surf on the Kerala coast",
  },
  hairpins: {
    image:
      "https://images.unsplash.com/photo-1580289869586-3baf90956ccc?q=80&w=1920&h=1080&auto=format&fit=crop",
    alt: "A misty forest road curving through the Western Ghats",
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
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Suzuki_Dzire_II_1.2_GLX_Hybrid_Arctic_White_Pearl.jpg/1280px-Suzuki_Dzire_II_1.2_GLX_Hybrid_Arctic_White_Pearl.jpg",
    alt: "Maruti Suzuki Dzire premium sedan in pearl white",
  },
  "compact-suv": {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/2022_Maruti_Suzuki_Brezza_ZXi%2B_%28India%29_front_view_04.png/1280px-2022_Maruti_Suzuki_Brezza_ZXi%2B_%28India%29_front_view_04.png",
    alt: "Maruti Suzuki Brezza compact SUV by the sea",
  },
  "classic-suv": {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/2024_Hyundai_Creta_1.5_MPi_SX%28O%29_%28India%29_front_view.png/1280px-2024_Hyundai_Creta_1.5_MPi_SX%28O%29_%28India%29_front_view.png",
    alt: "Hyundai Creta SUV in white",
  },
  "luxury-suv": {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Toyota_Fortuner_GUN166_Legender_2.8_Q_4x2_Gray_Metallic_01.jpg/1280px-Toyota_Fortuner_GUN166_Legender_2.8_Q_4x2_Gray_Metallic_01.jpg",
    alt: "Toyota Fortuner Legender luxury SUV in metallic grey",
  },
  ertiga: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/2022_Suzuki_Ertiga_GX_Hybrid.jpg/1280px-2022_Suzuki_Ertiga_GX_Hybrid.jpg",
    alt: "Maruti Suzuki Ertiga MPV in white",
  },
  carens: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Kia_Carens_2024_Model_2.jpg/1280px-Kia_Carens_2024_Model_2.jpg",
    alt: "Kia Carens MPV in a showroom",
  },
  "innova-crysta": {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Toyota_Innova_Crysta_2.4_Z_front_right.jpg/1280px-Toyota_Innova_Crysta_2.4_Z_front_right.jpg",
    alt: "Toyota Innova Crysta in white",
  },
  /* No classy tempo-traveller or Urbania photography on Commons yet — the
     signature illustrations are shown until you add your own fleet photos. */
  "tempo-traveller-12": undefined,
  "tempo-traveller-17": undefined,
  "tempo-traveller-26": undefined,
  "urbania-14": undefined,
  "urbania-18": undefined,
};
