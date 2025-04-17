"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useProjects } from "../providers/ProjectProvider";
import type { KanbanTask } from "../../../backend/src/zod/TasksZodTypes";
import { TaskCard } from "./TaskCard";

export function TasksPanel() {
  const { selectedProject, tasks, setTasks, fetchTasksForProject } =
    useProjects();

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    columnId: "todo",
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTasksLoading, setIsTasksLoading] = useState(false);

  // Group tasks by status/column
  const todoTasks = tasks.filter((task) => task.columnId === "todo");
  const inProgressTasks = tasks.filter(
    (task) => task.columnId === "in-progress"
  );
  const doneTasks = tasks.filter((task) => task.columnId === "done");

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!selectedProject) {
      setError("No project selected");
      setIsLoading(false);
      return;
    }

    try {
      // Create the task using your API client
      const response = await fetch(`/api/tasks/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description,
          projectId: selectedProject.id,
          status: newTask.columnId,
          priority: newTask.priority,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      const createdTask = await response.json();

      // Add the task to the current tasks
      setTasks([
        ...tasks,
        {
          id: createdTask.id.toString(),
          title: createdTask.title,
          description: createdTask.description || "",
          projectId: createdTask.projectId,
          columnId: createdTask.status || "todo",
          priority: createdTask.priority || "medium",
          status: "",
          dueDate: null,
        },
      ]);

      setNewTask({
        title: "",
        description: "",
        priority: "medium",
        columnId: "todo",
      });
      setIsDialogOpen(false);

      // Refresh tasks from server
      if (selectedProject) {
        await fetchTasksForProject(selectedProject.id);
      }
    } catch (error) {
      console.error("Failed to create task:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveTask = async (taskId: string, newStatus: string) => {
    try {
      setIsTasksLoading(true);

      // Move the task using your API
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to move task");
      }

      // Update local state
      const updatedTasks = tasks.map((task) =>
        task.id === taskId ? { ...task, columnId: newStatus } : task
      );
      setTasks(updatedTasks);

      // Refresh tasks from server
      if (selectedProject) {
        await fetchTasksForProject(selectedProject.id);
      }
    } catch (error) {
      console.error(`Failed to move task ${taskId} to ${newStatus}:`, error);
      setError("Failed to move task.");
    } finally {
      setIsTasksLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      setIsTasksLoading(true);

      // Delete the task using your API
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      // Update local state
      setTasks(tasks.filter((task) => task.id !== taskId));

      // Refresh tasks from server
      if (selectedProject) {
        await fetchTasksForProject(selectedProject.id);
      }
    } catch (error) {
      console.error(`Failed to delete task ${taskId}:`, error);
      setError("Failed to delete task.");
    } finally {
      setIsTasksLoading(false);
    }
  };

  if (!selectedProject) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Select a project to manage its tasks</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Tasks</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreateTask}>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>
                  Add a new task to {selectedProject.name}
                </DialogDescription>
              </DialogHeader>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
                  {error}
                </div>
              )}

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Task Title</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) =>
                      setNewTask({ ...newTask, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    defaultValue={newTask.priority}
                    onValueChange={(value) =>
                      setNewTask({ ...newTask, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    defaultValue={newTask.columnId}
                    onValueChange={(value) =>
                      setNewTask({ ...newTask, columnId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Task"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isTasksLoading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* To Do Column */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium mb-3 text-gray-700 flex items-center">
              <span className="mr-2 h-2 w-2 rounded-full bg-blue-400"></span>
              To Do
              <span className="ml-2 text-xs text-gray-500">
                ({todoTasks.length})
              </span>
            </h3>
            <div className="space-y-3">
              {todoTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onMove={handleMoveTask}
                  onDelete={handleDeleteTask}
                  nextStatus="in-progress"
                  nextStatusLabel="Move to In Progress"
                />
              ))}
              {todoTasks.length === 0 && (
                <div className="text-sm text-gray-500 text-center py-3">
                  No tasks to do
                </div>
              )}
            </div>
          </div>

          {/* In Progress Column */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium mb-3 text-gray-700 flex items-center">
              <span className="mr-2 h-2 w-2 rounded-full bg-yellow-400"></span>
              In Progress
              <span className="ml-2 text-xs text-gray-500">
                ({inProgressTasks.length})
              </span>
            </h3>
            <div className="space-y-3">
              {inProgressTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onMove={handleMoveTask}
                  onDelete={handleDeleteTask}
                  nextStatus="done"
                  nextStatusLabel="Move to Done"
                />
              ))}
              {inProgressTasks.length === 0 && (
                <div className="text-sm text-gray-500 text-center py-3">
                  No tasks in progress
                </div>
              )}
            </div>
          </div>

          {/* Done Column */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium mb-3 text-gray-700 flex items-center">
              <span className="mr-2 h-2 w-2 rounded-full bg-green-400"></span>
              Done
              <span className="ml-2 text-xs text-gray-500">
                ({doneTasks.length})
              </span>
            </h3>
            <div className="space-y-3">
              {doneTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onMove={handleMoveTask}
                  onDelete={handleDeleteTask}
                />
              ))}
              {doneTasks.length === 0 && (
                <div className="text-sm text-gray-500 text-center py-3">
                  No completed tasks
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TasksPanel;
