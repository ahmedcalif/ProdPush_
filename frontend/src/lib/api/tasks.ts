import { client } from "./client";
import type { KanbanTask } from "../../../../backend/src/zod/TasksZodTypes";
import {
  toKanbanTask,
  toDbTask,
} from "../../../../backend/src/zod/TasksZodTypes";

type ApiResponse<T> = T | { error: string };

interface CreateTaskData {
  title: string;
  description?: string;
  projectId: number;
  status?: "todo" | "in-progress" | "done";
  priority?: "low" | "medium" | "high";
  assignedTo?: string;
  dueDate?: Date | null;
}

// Interface for updating a task
interface UpdateTaskData {
  title?: string;
  description?: string;
  projectId?: number;
  status?: "todo" | "in-progress" | "done";
  priority?: "low" | "medium" | "high";
  assignedTo?: string;
  dueDate?: Date | null;
}

export const TaskApi = {
  async getAllTasks(): Promise<KanbanTask[]> {
    try {
      const response = await client.api.tasks.$get();

      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.status}`);
      }

      const tasks = await response.json();
      return tasks.map(toKanbanTask);
    } catch (error) {
      console.error("Error fetching all tasks:", error);
      throw error;
    }
  },

  /**
   */
  async getTasksByProject(projectId: number): Promise<KanbanTask[]> {
    try {
      const response = await client.api.tasks.project[":projectId"].$get({
        param: { projectId: projectId.toString() },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch project tasks: ${response.status}`);
      }

      const tasks = await response.json();
      return tasks.map(toKanbanTask);
    } catch (error) {
      console.error(`Error fetching tasks for project ${projectId}:`, error);
      throw error;
    }
  },

  /**
   * Fetch a single task by ID
   */
  async getTaskById(taskId: number): Promise<KanbanTask> {
    try {
      const response = await client.api.tasks[":id"].$get({
        param: { id: taskId.toString() },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch task: ${response.status}`);
      }

      const task = await response.json();
      return toKanbanTask(task);
    } catch (error) {
      console.error(`Error fetching task ${taskId}:`, error);
      throw error;
    }
  },

  /**
   * Create a new task
   */
  async createTask(taskData: CreateTaskData): Promise<KanbanTask> {
    try {
      const formattedData = {
        ...taskData,
      };

      const response = await client.api.tasks.create.$post({
        json: formattedData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Failed to create task: ${response.status}`
        );
      }

      const createdTask = await response.json();
      return toKanbanTask(createdTask);
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  },

  async updateTask(
    taskId: number,
    updateData: UpdateTaskData
  ): Promise<KanbanTask> {
    try {
      const formattedData = {
        ...updateData,
      };

      const response = await client.api.tasks[":id"].$put({
        param: { id: taskId.toString() },
        json: formattedData,
      });

      if (!response.ok) {
        throw new Error(`Failed to update task: ${response.status}`);
      }

      const updatedTask = await response.json();
      return toKanbanTask(updatedTask);
    } catch (error) {
      console.error(`Error updating task ${taskId}:`, error);
      throw error;
    }
  },

  async deleteTask(
    taskId: number
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await client.api.tasks[":id"].$delete({
        param: { id: taskId.toString() },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Failed to delete task: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`Error deleting task ${taskId}:`, error);
      throw error;
    }
  },
  async deleteProjectTasks(
    projectId: number
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await client.api.tasks.project[":projectId"].$delete({
        param: { projectId: projectId.toString() },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            `Failed to delete project tasks: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`Error deleting tasks for project ${projectId}:`, error);
      throw error;
    }
  },

  async updateTaskStatus(
    taskId: number,
    newStatus: string
  ): Promise<KanbanTask> {
    return this.updateTask(taskId, {
      status: newStatus as "todo" | "in-progress" | "done",
    });
  },
};
