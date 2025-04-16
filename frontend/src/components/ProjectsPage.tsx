"use client";

import type React from "react";

import { useState } from "react";
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

export function ProjectsPage() {
  const { user } = useAuth();
  const { projects, addProject, deleteProject } = useProjects();
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();

    const project: Project = {
      id: `project-${Date.now()}`,
      name: newProject.name,
      description: newProject.description,
      createdAt: new Date().toISOString(),
    };

    addProject(project);
    setNewProject({ name: "", description: "" });
    setIsDialogOpen(false);
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
                <Button type="submit">Create Project</Button>
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
                      onClick={() => deleteProject(project.id)}
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
                Created {format(new Date(project.createdAt), "MMM d, yyyy")}
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
