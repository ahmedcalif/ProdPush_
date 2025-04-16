import { createFileRoute } from "@tanstack/react-router";
import ProjectsPage from "../../../components/ProjectsPage";

export const Route = createFileRoute("/_authenticated/projects/")({
  component: ProjectsPage,
});
