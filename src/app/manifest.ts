import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ESPACE GBA",
    short_name: "ESPACE GBA",
    description:
      "Site officiel du Groupement Bruche Ackerland : histoire, jeunes, actus, partenaires et boutique.",
    start_url: "/",
    display: "standalone",
    background_color: "#020202",
    theme_color: "#020202",
    lang: "fr",
    icons: [
      {
        src: "/gba-logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
