import { createFileRoute } from "@tanstack/react-router";
import { MarketPage } from "@/screens/MarketPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Casandra — mercado de predicción de exámenes" },
      {
        name: "description",
        content:
          "Apuesta tokens con tus compañeros a si una pregunta entra o no entra en el examen. Probabilidades en vivo.",
      },
      { property: "og:title", content: "Casandra — mercado de predicción de exámenes" },
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
