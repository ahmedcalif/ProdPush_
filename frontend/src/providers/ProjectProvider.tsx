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
import type { KanbanTask, BackendTask } from "../lib/types";
import { normalizeTask } from "../lib/types";
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
  setTasks: (
    tasks: KanbanTask[] | ((prev: KanbanTask[]) => KanbanTask[])
  ) => void;
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

  // Use refs to prevent duplicate API calls
  const isLoadingProjectsRef = useRef(false);
  const isLoadingTasksRef = useRef(false);
  const lastFetchedProjectId = useRef<number | null>(null);

  // Memoize fetchProjects to prevent infinite loops
  const fetchProjects = useCallback(async () => {
    // Skip if already loading or not authenticated
    if (isLoadingProjectsRef.current || !isAuthenticated || !user) {
      return;
    }

    try {
      isLoadingProjectsRef.current = true;
      setIsLoading(true);

      const response = await client.api.projects.$get();

      if (response.ok) {
        const projectsData = await response.json();

        // Only update state if data has changed
        setProjects((current) => {
          // Check if data is different before updating
          if (JSON.stringify(current) !== JSON.stringify(projectsData)) {
            return projectsData;
          }
          return current;
        });
      } else {
        console.error("Failed to fetch projects:", response.status);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      isLoadingProjectsRef.current = false;
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  // Memoize fetchTasksForProject to prevent infinite loops
  const fetchTasksForProject = useCallback(
    async (projectId: number) => {
      // Skip if already loading this project's tasks, not authenticated, or no project ID
      if (
        isLoadingTasksRef.current ||
        !isAuthenticated ||
        !user ||
        !projectId ||
        lastFetchedProjectId.current === projectId
      ) {
        return;
      }

      try {
        isLoadingTasksRef.current = true;
        setIsLoading(true);
        lastFetchedProjectId.current = projectId;

        // If we don't have the selected project in state yet, find it in projects array
        if (!selectedProject || selectedProject.id !== projectId) {
          const projectToSelect = projects.find((p) => p.id === projectId);
          if (projectToSelect) {
            setSelectedProject(projectToSelect);
          }
        }

        const response = await client.api.tasks.project[":projectId"].$get({
          param: { projectId: projectId.toString() },
        });

        if (response.ok) {
          const taskData = await response.json();

          // Map and normalize tasks to ensure type compatibility
          const normalizedTasks: KanbanTask[] = taskData.map(
            (task: BackendTask) => normalizeTask(task)
          );

          setTasks(normalizedTasks);

          // Update project with task count only if needed
          setProjects((currentProjects) => {
            return currentProjects.map((project) => {
              if (
                project.id === projectId &&
                project.taskCount !== normalizedTasks.length
              ) {
                return { ...project, taskCount: normalizedTasks.length };
              }
              return project;
            });
          });
        } else {
          console.error("Failed to fetch tasks:", response.status);
        }
      } catch (error) {
        console.error(`Error fetching tasks for project ${projectId}:`, error);
      } finally {
        isLoadingTasksRef.current = false;
        setIsLoading(false);
      }
    },
    [isAuthenticated, user, projects, selectedProject]
  );

  // Initial load of projects when authentication changes
  useEffect(() => {
    if (isAuthenticated && !isLoadingProjectsRef.current) {
      fetchProjects();
    }
  }, [isAuthenticated, fetchProjects]);

  // Reset lastFetchedProjectId when selectedProject changes
  useEffect(() => {
    if (!selectedProject) {
      lastFetchedProjectId.current = null;
    }
  }, [selectedProject]);

  const addProject = useCallback((project: Project) => {
    setProjects((current) => [...current, project]);
  }, []);

  const updateProject = useCallback(
    (updatedProject: Project) => {
      setProjects((current) =>
        current.map((project) =>
          project.id === updatedProject.id ? updatedProject : project
        )
      );

      // Also update selectedProject if it's the one being updated
      if (selectedProject?.id === updatedProject.id) {
        setSelectedProject(updatedProject);
      }
    },
    [selectedProject]
  );

  const deleteProject = useCallback(
    async (id: number) => {
      try {
        await client.api.projects[":id"].$delete({
          param: { id: id.toString() },
        });

        setProjects((current) =>
          current.filter((project) => project.id !== id)
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

  // Create a modified setTasks function that ensures type compatibility
  const setTasksWithTypeCompatibility = useCallback(
    (taskDataOrFn: KanbanTask[] | ((prev: KanbanTask[]) => KanbanTask[])) => {
      if (typeof taskDataOrFn === "function") {
        setTasks((prevTasks) => {
          const updatedTasks = taskDataOrFn(prevTasks);
          // Ensure all tasks are normalized
          return updatedTasks.map((task) => normalizeTask(task));
        });
      } else {
        // If it's an array, normalize each task
        setTasks(taskDataOrFn.map((task) => normalizeTask(task)));
      }
    },
    []
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
        setTasks: setTasksWithTypeCompatibility,
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
