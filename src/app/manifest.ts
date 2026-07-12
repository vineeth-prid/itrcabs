import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ITR Cabs — Premium Taxi Service Kerala",
    short_name: "ITR Cabs",
    description:
      "Premium cab booking in Kochi & across Kerala — airport transfers, tours, corporate transport.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf9f5",
    theme_color: "#f1940b",
    icons: [{ src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" }],
  };
}
