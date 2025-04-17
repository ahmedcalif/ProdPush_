import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { CalendarDays, ArrowLeft, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";

import { Button } from "../../../components/ui/button";
import { TasksPanel } from "../../../components/TaskPanel";
import { useProjects } from "../../../providers/ProjectProvider";
import { NavigationBar } from "../../__authenticated";

export const Route = createFileRoute("/_authenticated/projects/$id")({
  component: ProjectDetailPage,
});

function ProjectDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const projectId = id ? parseInt(id) : null;

  const {
    projects,
    setSelectedProject,
    selectedProject,
    deleteProject,
    isLoading,
  } = useProjects();

  useEffect(() => {
    if (projectId && projects.length > 0) {
      const project = projects.find((p) => p.id === projectId);

      if (project && (!selectedProject || selectedProject.id !== projectId)) {
        setSelectedProject(project);
      } else if (!project) {
        navigate({ to: "/projects" });
      }
    }
  }, [projectId, projects, selectedProject, setSelectedProject, navigate]);

  const handleDeleteProject = async () => {
    if (!selectedProject) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedProject.name}? This will also delete all tasks associated with this project.`
    );

    if (confirmDelete) {
      await deleteProject(selectedProject.id);
      navigate({ to: "/projects" });
    }
  };

  const handleBackToProjects = () => {
    navigate({ to: "/projects" });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-6">
        <NavigationBar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!selectedProject) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-6">
        <NavigationBar />
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Project not found</h2>
          <p className="text-gray-500 mb-4">
            The project you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={handleBackToProjects}>Back to Projects</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:px-6">
      <NavigationBar />

      <div className="mb-6">
        <Button variant="ghost" className="mb-4" onClick={handleBackToProjects}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{selectedProject.name}</h1>
            {selectedProject.description && (
              <p className="text-gray-500 mt-2">
                {selectedProject.description}
              </p>
            )}
            <div className="flex items-center text-sm text-muted-foreground mt-4">
              <CalendarDays className="mr-1 h-4 w-4" />
              {selectedProject.createdAt &&
                `Created ${format(new Date(selectedProject.createdAt), "MMM d, yyyy")}`}
            </div>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Project
            </Button>
            <Button variant="destructive" onClick={handleDeleteProject}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Project
            </Button>
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <TasksPanel />
      </div>
    </div>
  );
}
