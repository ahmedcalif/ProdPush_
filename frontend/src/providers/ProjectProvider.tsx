"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { KanbanTask } from "../lib/types";

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  taskCount?: number;
}

interface ProjectContextType {
  projects: Project[];
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  tasks: KanbanTask[];
  setTasks: (tasks: KanbanTask[]) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Sample projects data
const initialProjects: Project[] = [
  {
    id: "project-1",
    name: "Website Redesign",
    description: "Redesign the company website with new branding",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "project-2",
    name: "Mobile App Development",
    description: "Create a new mobile app for customer engagement",
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "project-3",
    name: "Marketing Campaign",
    description: "Q3 marketing campaign for product launch",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Sample tasks data
const initialTasks: KanbanTask[] = [
  {
    id: "task-1",
    columnId: "todo",
    title: "Research competitors",
    description:
      "Look at similar products and identify strengths and weaknesses",
    priority: "medium",
    projectId: "project-1",
  },
  {
    id: "task-2",
    columnId: "todo",
    title: "Brainstorm new features",
    description: "Generate ideas for upcoming product releases",
    priority: "high",
    projectId: "project-1",
  },
  {
    id: "task-3",
    columnId: "in-progress",
    title: "Design user interface",
    description: "Create wireframes and mockups for the new dashboard",
    priority: "high",
    projectId: "project-2",
  },
  {
    id: "task-4",
    columnId: "in-progress",
    title: "Implement authentication",
    description: "Add login and registration functionality",
    priority: "medium",
    projectId: "project-2",
  },
  {
    id: "task-5",
    columnId: "done",
    title: "Set up CI/CD pipeline",
    description: "Configure automated testing and deployment",
    priority: "low",
    projectId: "project-3",
  },
];

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<KanbanTask[]>(initialTasks);

  useEffect(() => {
    const projectsWithCounts = projects.map((project) => {
      const taskCount = tasks.filter(
        (task) => task.projectId === project.id
      ).length;
      return { ...project, taskCount };
    });

    setProjects(projectsWithCounts);
  }, [tasks]);

  const addProject = (project: Project) => {
    setProjects([...projects, project]);
  };

  const updateProject = (updatedProject: Project) => {
    setProjects(
      projects.map((project) =>
        project.id === updatedProject.id ? updatedProject : project
      )
    );
  };

  const deleteProject = (id: string) => {
    setProjects(projects.filter((project) => project.id !== id));
    // Also delete all tasks associated with this project
    setTasks(tasks.filter((task) => task.projectId !== id));
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        selectedProject,
        setSelectedProject,
        addProject,
        updateProject,
        deleteProject,
        tasks,
        setTasks,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
}
