import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/screens/ProfilePage";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});