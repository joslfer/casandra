import { createFileRoute } from "@tanstack/react-router";
import { MarketPage } from "@/screens/MarketPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Casandra" },
      {
        name: "description",
        content:
          "Apuesta tokens con tus compañeros a si una pregunta entra o no entra en el examen. Probabilidades públicas.",
      },
      { property: "og:title", content: "Casandra" },
      {
        property: "og:description",
        content: "Apuesta tokens a si una pregunta entra o no entra en el examen.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MarketPage,
});
