"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import { Plus } from "lucide-react";

import { Button } from "../ui/button";
import { KanbanColumn } from "./kanban-column";
import { KanbanItem } from "./kanban-item";
import { AddTaskDialog } from "./task-dialog";
import {
  type KanbanTask,
  type KanbanColumn as ColumnType,
  type BackendTask,
  normalizeTask,
  prepareTaskForApi,
} from "../../lib/types";
import { useProjects } from "../../providers/ProjectProvider";
import { client } from "../../lib/api/client";

// Define the columns configuration
const columnConfig: ColumnType[] = [
  {
    id: "todo",
    title: "To Do",
    color: "bg-slate-200",
  },
  {
    id: "in_progress",
    title: "In Progress",
    color: "bg-blue-200",
  },
  {
    id: "done",
    title: "Done",
    color: "bg-green-200",
  },
];

interface KanbanBoardProps {
  projectId?: number;
}

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const { tasks, setTasks, selectedProject, fetchTasksForProject, isLoading } =
    useProjects();

  const [columns] = useState<ColumnType[]>(columnConfig);
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);
  const [activeColumn, setActiveColumn] = useState<ColumnType | null>(null);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [isSavingTask, setIsSavingTask] = useState(false);

  const columnsId = columns.map((col) => col.id);

  // Fetch tasks when the component mounts or projectId changes
  useEffect(() => {
    if (projectId) {
      fetchTasksForProject(projectId);
    }
  }, [projectId, fetchTasksForProject]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // 3px
      },
    })
  );

  async function createTask(taskData: {
    title: string;
    description?: string;
    priority: string;
    dueDate?: Date | null;
  }) {
    if (!selectedProject) return;

    setIsSavingTask(true);

    try {
      const response = await client.api.tasks.create.$post({
        json: {
          title: taskData.title,
          description: taskData.description || "",
          priority: taskData.priority,
          status: "todo",
          projectId: selectedProject.id,
        },
      });

      if (response.ok) {
        const newTask = await response.json();

        const mappedTask = normalizeTask(newTask as BackendTask);

        setTasks([...tasks, mappedTask]);
        setIsAddTaskDialogOpen(false);
      } else {
        console.error("Failed to create task:", await response.text());
      }
    } catch (error) {
      console.error("Error creating task:", error);
    } finally {
      setIsSavingTask(false);
    }
  }

  async function deleteTask(id: string) {
    try {
      const response = await client.api.tasks[":id"].$delete({
        param: { id },
      });

      if (response.ok) {
        // Remove the task from the local state
        setTasks(tasks.filter((task) => task.id !== id));
      } else {
        console.error("Failed to delete task:", await response.text());
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  }

  async function updateTask(updatedTask: KanbanTask) {
    try {
      const response = await client.api.tasks[":id"].$put({
        param: { id: updatedTask.id },
        json: {
          id: updatedTask.id,
          ...prepareTaskForApi(updatedTask),
        },
      });

      if (response.ok) {
        setTasks(
          tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
        );
      } else {
        console.error("Failed to update task:", await response.text());
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  }

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
      return;
    }

    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    setActiveColumn(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    if (
      active.data.current?.type === "Task" &&
      over.data.current?.type === "Task"
    ) {
      const updatedTasks = [...tasks];
      const activeIndex = updatedTasks.findIndex((t) => t.id === activeId);
      const overIndex = updatedTasks.findIndex((t) => t.id === overId);

      if (
        updatedTasks[activeIndex].columnId !== updatedTasks[overIndex].columnId
      ) {
        const taskToUpdate = {
          ...updatedTasks[activeIndex],
          columnId: updatedTasks[overIndex].columnId,
          status: updatedTasks[overIndex].columnId,
        };

        const updatedTask = normalizeTask(taskToUpdate);

        updatedTasks[activeIndex] = updatedTask;

        updateTask(updatedTask);

        setTasks(arrayMove(updatedTasks, activeIndex, overIndex));
      } else {
        setTasks(arrayMove(updatedTasks, activeIndex, overIndex));
      }
    }

    if (
      active.data.current?.type === "Task" &&
      over.data.current?.type === "Column"
    ) {
      const updatedTasks = [...tasks];
      const activeIndex = updatedTasks.findIndex((t) => t.id === activeId);
      const columnId = overId.toString();

      const taskToUpdate = {
        ...updatedTasks[activeIndex],
        columnId: columnId,
        status: columnId,
      };

      const updatedTask = normalizeTask(taskToUpdate);

      updatedTasks[activeIndex] = updatedTask;

      updateTask(updatedTask);

      setTasks(updatedTasks);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!selectedProject) {
    return (
      <div className="flex justify-center items-center h-full bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Select a project to view tasks</p>
          <Button variant="outline" disabled>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
    >
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-medium">Task Board</h3>
        <Button
          onClick={() => setIsAddTaskDialogOpen(true)}
          disabled={!selectedProject}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      <div className="flex gap-4 items-start overflow-x-auto pb-4">
        <SortableContext items={columnsId}>
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={tasks.filter((task) => task.columnId === column.id)}
              deleteTask={deleteTask}
              updateTask={updateTask}
            />
          ))}
        </SortableContext>
      </div>

      {typeof document !== "undefined" &&
        createPortal(
          <DragOverlay>
            {activeTask && (
              <KanbanItem
                task={activeTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
              />
            )}
            {activeColumn && (
              <KanbanColumn
                column={activeColumn}
                tasks={tasks.filter(
                  (task) => task.columnId === activeColumn.id
                )}
                deleteTask={deleteTask}
                updateTask={updateTask}
              />
            )}
          </DragOverlay>,
          document.body
        )}

      <AddTaskDialog
        open={isAddTaskDialogOpen}
        onOpenChange={setIsAddTaskDialogOpen}
        onSubmit={createTask}
        isLoading={isSavingTask}
        task={null}
      />
    </DndContext>
  );
}
