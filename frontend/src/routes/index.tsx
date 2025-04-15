import { createFileRoute } from "@tanstack/react-router";
import { Home } from "../components/Homepage";

export const Route = createFileRoute("/")({
  component: Home,
});
