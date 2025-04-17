"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  CalendarDays,
  MoreHorizontal,
  Plus,
  Trash2,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "@tanstack/react-router";

import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { useProjects, type Project } from "../providers/ProjectProvider";
import { useAuth } from "../providers/AuthProvider";
import { NavigationBar } from "../routes/__authenticated";
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

export function ProjectsPage() {
  const navigate = useNavigate(); // Initialize router for navigation
  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    checkAuthStatus,
  } = useAuth();
  const {
    projects,
    addProject,
    deleteProject,
    setSelectedProject,
    isLoading: projectsLoading,
    fetchProjects,
  } = useProjects();
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check authentication and refresh projects list when component mounts
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

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Verify authentication before proceeding
    if (!isAuthenticated || !user?.id) {
      const isAuth = await checkAuthStatus();
      if (!isAuth || !user?.id) {
        setError("Please login before creating a project.");
        setIsLoading(false);
        return;
      }
    }

    try {
      // Create project object to send to the backend
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

        // Refresh projects list after adding a new one
        fetchProjects();
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
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async (
    e: React.MouseEvent,
    projectId: number
  ) => {
    // Stop event propagation to prevent navigation when deleting
    e.stopPropagation();

    try {
      await client.api.projects[":id"].$delete({
        param: { id: projectId.toString() },
      });

      deleteProject(projectId);
      // Refresh projects list after deletion
      fetchProjects();
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    navigate({
      to: `/projects/${project.id}`,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:px-6">
      <NavigationBar />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Projects</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => fetchProjects()}
            disabled={projectsLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${projectsLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
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
                        setNewProject({ ...newProject, name: e.target.value })
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
                    disabled={isLoading || authLoading || !isAuthenticated}
                  >
                    {isLoading ? "Creating..." : "Create Project"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {projectsLoading ? (
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-600">
            No projects found
          </h3>
          <p className="text-gray-500 mt-2">
            Create your first project to get started.
          </p>
          <Button onClick={() => setIsDialogOpen(true)} className="mt-4">
            Create Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleProjectClick(project)}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{project.name}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => e.stopPropagation()} // Prevent card click when clicking menu
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={(e) =>
                          handleDeleteProject(e, Number(project.id))
                        }
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription className="line-clamp-2">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarDays className="mr-1 h-4 w-4" />
                  {project.createdAt &&
                    `Created ${format(new Date(project.createdAt), "MMM d, yyyy")}`}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-3 pt-0">
                <div className="w-full grid grid-cols-2 gap-2">
                  <div className="flex items-center justify-center rounded-md bg-muted p-1 text-xs">
                    <span className="font-medium">Tasks: </span>
                    <span className="ml-1">{project.taskCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-center rounded-md bg-muted p-1 text-xs">
                    <span className="font-medium">Status: </span>
                    <span className="ml-1">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-center text-sm text-blue-600 w-full">
                  <span>View Tasks</span>
                  <ArrowRight className="ml-1 h-3 w-3" />
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProjectsPage;
