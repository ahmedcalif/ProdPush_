"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { CalendarDays, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";

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

// Define an interface for the error data
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
  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    checkAuthStatus,
  } = useAuth();
  const { projects, addProject, deleteProject } = useProjects();
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // On component mount, check auth and log debug info
  useEffect(() => {
    if (isDialogOpen) {
      const updateDebugInfo = async () => {
        // Only check auth if we're not already authenticated
        if (!isAuthenticated) {
          await checkAuthStatus();
        }

        // Update debug info
        setDebugInfo({
          isAuthenticated,
          authLoading,
          userId: user?.id,
          hasUser: !!user,
        });
      };

      updateDebugInfo();
    }
  }, [isDialogOpen]); // Only dependency is dialog open state
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Force authentication check
      await checkAuthStatus();

      // Log debug info before project creation
      console.log("Debug before project creation:", {
        isAuthenticated,
        user,
        authLoading,
      });

      if (!isAuthenticated || !user?.id) {
        console.error("Authentication issue:", { isAuthenticated, user });
        setError("Authentication required. Please login again.");
        setIsLoading(false);
        return;
      }

      // Create a proper project object to send to the backend
      const response = await client.api.projects.create.$post({
        json: {
          name: newProject.name,
          description: newProject.description,
          ownerId: user.id,
        },
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const createdProject = await response.json();
        console.log("Created Project Response Data", createdProject);

        addProject(createdProject as unknown as Project);

        setNewProject({ name: "", description: "" });
        setIsDialogOpen(false);
      } else {
        // Cast the error response to our defined type
        const errorData = (await response.json()) as ErrorData;
        console.error("Error creating project:", errorData);

        // Display error message to user
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

  const handleDeleteProject = async (projectId: number) => {
    try {
      await client.api.projects[":id"].$delete({
        param: { id: projectId.toString() },
      });

      deleteProject(projectId);
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  // Manual auth check function for debugging
  const forceAuthCheck = async () => {
    try {
      const result = await checkAuthStatus();
      console.log("Auth check result:", result);
      console.log("User after auth check:", user);
      console.log("isAuthenticated after auth check:", isAuthenticated);

      setDebugInfo({
        authCheckResult: result,
        user,
        isAuthenticated,
        authLoading,
      });
    } catch (error) {
      console.error("Force auth check failed:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:px-6">
      <NavigationBar />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Projects</h1>
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

              {/* Debug information */}
              {debugInfo && (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded mt-2 mb-2 text-xs">
                  <strong>Debug Info:</strong>
                  <br />
                  Auth Status:{" "}
                  {isAuthenticated ? "Authenticated" : "Not Authenticated"}
                  <br />
                  Auth Loading: {authLoading ? "Yes" : "No"}
                  <br />
                  User ID: {user?.id || "None"}
                  <br />
                  Button disabled:{" "}
                  {isLoading || authLoading || !isAuthenticated ? "Yes" : "No"}
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

                {/* Debug button to check auth */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={forceAuthCheck}
                  className="mt-2"
                >
                  Check Auth Status
                </Button>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={isLoading || authLoading || !isAuthenticated}
                >
                  {isLoading ? "Creating..." : "Create Project"}
                  {isLoading || authLoading || !isAuthenticated
                    ? ` (Disabled: ${!isAuthenticated ? "Not authenticated" : authLoading ? "Auth loading" : "Creating"})`
                    : ""}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{project.name}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleDeleteProject(Number(project.id))}
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
            <CardFooter className="pt-0">
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
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ProjectsPage;
