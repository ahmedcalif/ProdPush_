"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type { KanbanTask } from "../lib/types";
import { client } from "../lib/api/client";
import { useAuth } from "./AuthProvider";

export interface Project {
  id: number;
  name: string | null;
  description: string | null;
  createdAt: string;
  taskCount?: number;
}

interface ProjectContextType {
  projects: Project[];
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  deleteProject: (id: number) => void;
  tasks: KanbanTask[];
  setTasks: (tasks: KanbanTask[]) => void;
  isLoading: boolean;
  fetchProjects: () => Promise<void>;
  fetchTasksForProject: (projectId: number) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Refs to track ongoing operations
  const isLoadingProjectsRef = useRef(false);
  const isLoadingTasksRef = useRef(false);
  const previousTaskCountRef = useRef<Record<number, number>>({});

  // Memoize fetch functions to prevent recreating them on every render
  const fetchProjects = useCallback(async () => {
    // Prevent concurrent requests
    if (isLoadingProjectsRef.current) {
      return;
    }

    if (!isAuthenticated || !user) {
      setProjects([]);
      setIsLoading(false);
      return;
    }

    try {
      isLoadingProjectsRef.current = true;
      setIsLoading(true);
      const response = await client.api.projects.$get();

      if (response.ok) {
        const projectsData = await response.json();
        setProjects(projectsData);
      } else {
        console.error("Failed to fetch projects:", response.status);
        setProjects([]);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      setProjects([]);
    } finally {
      setIsLoading(false);
      isLoadingProjectsRef.current = false;
    }
  }, [isAuthenticated, user]);

  const fetchTasksForProject = useCallback(
    async (projectId: number) => {
      // Prevent concurrent requests
      if (isLoadingTasksRef.current) {
        return;
      }

      if (!isAuthenticated || !user || !projectId) {
        setTasks([]);
        return;
      }

      try {
        isLoadingTasksRef.current = true;
        setIsLoading(true);
        const response = await client.api.tasks.project[":projectId"].$get({
          param: { projectId: projectId.toString() },
        });

        if (response.ok) {
          const taskData = await response.json();

          const mappedTasks: KanbanTask[] = taskData.map((task: any) => ({
            id: task.id.toString(),
            title: task.title,
            description: task.description || "",
            projectId: task.projectId,
            columnId: task.status || "todo",
            priority: task.priority || "medium",
            assignedTo: task.assignedTo,
            dueDate: task.dueDate ? new Date(task.dueDate) : null,
          }));

          setTasks(mappedTasks);

          // Update the task count directly instead of triggering another state update
          setProjects((prevProjects) =>
            prevProjects.map((project) =>
              project.id === projectId
                ? { ...project, taskCount: mappedTasks.length }
                : project
            )
          );

          // Update our reference for this project's task count
          previousTaskCountRef.current[projectId] = mappedTasks.length;
        } else {
          console.error("Failed to fetch tasks:", response.status);
          setTasks([]);
        }
      } catch (error) {
        console.error(`Error fetching tasks for project ${projectId}:`, error);
        setTasks([]);
      } finally {
        setIsLoading(false);
        isLoadingTasksRef.current = false;
      }
    },
    [isAuthenticated, user]
  );

  // Fetch projects once when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
    }
  }, [isAuthenticated, fetchProjects]);

  // Fetch tasks when selected project changes
  useEffect(() => {
    if (selectedProject?.id) {
      fetchTasksForProject(selectedProject.id);
    } else {
      setTasks([]);
    }
  }, [selectedProject, fetchTasksForProject]);

  // Remove the third useEffect that was causing loops
  // We now handle task count updates directly in fetchTasksForProject

  const addProject = useCallback((project: Project) => {
    setProjects((prevProjects) => [...prevProjects, project]);
  }, []);

  const updateProject = useCallback((updatedProject: Project) => {
    setProjects((prevProjects) =>
      prevProjects.map((project) =>
        project.id === updatedProject.id ? updatedProject : project
      )
    );
  }, []);

  const deleteProject = useCallback(
    async (id: number) => {
      try {
        await client.api.projects[":id"].$delete({
          param: { id: id.toString() },
        });

        setProjects((prevProjects) =>
          prevProjects.filter((project) => project.id !== id)
        );

        if (selectedProject?.id === id) {
          setSelectedProject(null);
          setTasks([]);
        }
      } catch (error) {
        console.error(`Error deleting project ${id}:`, error);
      }
    },
    [selectedProject]
  );

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
        isLoading,
        fetchProjects,
        fetchTasksForProject,
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
