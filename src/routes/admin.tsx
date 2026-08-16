import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "@/screens/AdminPage";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});
