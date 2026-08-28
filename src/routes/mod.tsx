import { createFileRoute } from "@tanstack/react-router";
import { ModPage } from "@/screens/ModPage"; // O ajusta la ruta si ModPage está en otra carpeta

export const Route = createFileRoute("/mod")({
  component: ModPage,
});