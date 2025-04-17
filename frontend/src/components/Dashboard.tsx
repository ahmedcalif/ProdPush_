import { useState, useEffect } from "react";
import { useAuth } from "../providers/AuthProvider";
import { useProjects, type Project } from "../providers/ProjectProvider";
import { useQuery } from "@tanstack/react-query";
import { userQueryOptions } from "../lib/api/client";
import { KanbanBoard } from "./KanbanBoard/kanban-board";
import { NavigationBar } from "../routes/__authenticated";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { RefreshCw, Plus } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { client } from "../lib/api/client";

interface ErrorData {
  success: boolean;
  error?: {
    issues?: Array<{
      path: string[];
      message: string;
      code: string;
    }>;
    name?: string;
  };
}

export default function Dashboard() {
  const {
    isLoading: authLoading,
    logout,
    user,
    isAuthenticated,
    checkAuthStatus,
  } = useAuth();

  const {
    projects,
    selectedProject,
    setSelectedProject,
    isLoading: projectsLoading,
    fetchProjects,
    addProject,
    tasks,
  } = useProjects();

  const {
    data: userData,
    isLoading: userLoading,
    isError,
  } = useQuery(userQueryOptions);

  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const isLoading = authLoading || userLoading || projectsLoading;

  // Fetch projects when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
    }
  }, [isAuthenticated, fetchProjects]);

  // Check authentication when dialog opens
  useEffect(() => {
    if (isDialogOpen && !isAuthenticated) {
      checkAuthStatus();
    }
  }, [isDialogOpen, isAuthenticated, checkAuthStatus]);

  const handleProjectChange = (projectId: string) => {
    const project = projects.find((p) => p.id === Number(projectId));
    if (project) {
      setSelectedProject(project);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsCreating(true);

    // Verify authentication before proceeding
    if (!isAuthenticated || !user?.id) {
      const isAuth = await checkAuthStatus();
      if (!isAuth || !user?.id) {
        setError("Please login before creating a project.");
        setIsCreating(false);
        return;
      }
    }

    try {
      // Create project using client
      const response = await client.api.projects.create.$post({
        json: {
          name: newProject.name,
          description: newProject.description,
          ownerId: user.id,
        },
      });

      if (response.ok) {
        const createdProject = await response.json();
        addProject(createdProject as unknown as Project);
        setNewProject({ name: "", description: "" });
        setIsDialogOpen(false);

        // Set the newly created project as selected
        setSelectedProject(createdProject as unknown as Project);
      } else {
        // Handle error response
        const errorData = (await response.json()) as ErrorData;

        if (errorData.error && errorData.error.issues) {
          // Handle Zod validation errors
          const issues = errorData.error.issues;
          const errorMessages = issues
            .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
            .join(", ");
          setError(`Validation error: ${errorMessages}`);
        } else {
          setError("Failed to create project. Please try again.");
        }
      }
    } catch (error) {
      console.error("Failed to create project:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-500" />
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p>Please wait while we retrieve your information.</p>
        </div>
      </div>
    );
  }

  if (isError || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">
            Authentication Required
          </h2>
          <p>Please log in to access the dashboard.</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => (window.location.href = "/")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <NavigationBar />
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h2 className="text-xl font-semibold text-gray-700">
              Welcome, {userData?.username || user?.username || "User"}
            </h2>

            <div className="flex items-center space-x-4">
              <div className="w-64">
                <Select
                  onValueChange={handleProjectChange}
                  value={selectedProject?.id?.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem
                        key={project.id}
                        value={project.id.toString()}
                      >
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleCreateProject}>
                    <DialogHeader>
                      <DialogTitle>Create New Project</DialogTitle>
                      <DialogDescription>
                        Add a new project to organize your tasks.
                      </DialogDescription>
                    </DialogHeader>

                    {error && (
                      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
                        {error}
                      </div>
                    )}

                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Project Name</Label>
                        <Input
                          id="name"
                          value={newProject.name}
                          onChange={(e) =>
                            setNewProject({
                              ...newProject,
                              name: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newProject.description}
                          onChange={(e) =>
                            setNewProject({
                              ...newProject,
                              description: e.target.value,
                            })
                          }
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="submit"
                        disabled={isCreating || authLoading || !isAuthenticated}
                      >
                        {isCreating ? "Creating..." : "Create Project"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              <Button
                variant="outline"
                onClick={() => fetchProjects()}
                disabled={projectsLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${projectsLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>

          {selectedProject ? (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">
                  Project: {selectedProject.name}
                </h3>
                <Badge className="px-2 py-0.5 text-xs">
                  {tasks.length} Tasks
                </Badge>
              </div>
              {selectedProject.description && (
                <p className="text-gray-500 mb-4">
                  {selectedProject.description}
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8 mb-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-600">
                No project selected
              </h3>
              <p className="text-gray-500 mt-2">
                Please select a project from the dropdown or create a new one.
              </p>
            </div>
          )}

          <div className="kanban-container overflow-x-auto">
            <div className="min-h-[600px] w-full">
              <KanbanBoard projectId={selectedProject?.id} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
