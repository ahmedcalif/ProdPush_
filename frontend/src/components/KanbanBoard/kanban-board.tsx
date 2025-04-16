"use client";

import { useState } from "react";
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

import { Button } from "../../components/ui/button";
import { KanbanColumn } from "./kanban-column";
import { KanbanItem } from "./kanban-item";
import type { KanbanTask, KanbanColumn as ColumnType } from "../../lib/types";
import { useId } from "react";

// Sample data
const initialColumns: ColumnType[] = [
  {
    id: "todo",
    title: "To Do",
    color: "bg-slate-200",
  },
  {
    id: "in-progress",
    title: "In Progress",
    color: "bg-blue-200",
  },
  {
    id: "done",
    title: "Done",
    color: "bg-green-200",
  },
];

const initialTasks: KanbanTask[] = [
  {
    id: "task-1",
    columnId: "todo",
    title: "Research competitors",
    description:
      "Look at similar products and identify strengths and weaknesses",
    priority: "medium",
  },
  {
    id: "task-2",
    columnId: "todo",
    title: "Brainstorm new features",
    description: "Generate ideas for upcoming product releases",
    priority: "high",
  },
  {
    id: "task-3",
    columnId: "in-progress",
    title: "Design user interface",
    description: "Create wireframes and mockups for the new dashboard",
    priority: "high",
  },
  {
    id: "task-4",
    columnId: "in-progress",
    title: "Implement authentication",
    description: "Add login and registration functionality",
    priority: "medium",
  },
  {
    id: "task-5",
    columnId: "done",
    title: "Set up CI/CD pipeline",
    description: "Configure automated testing and deployment",
    priority: "low",
  },
];

export function KanbanBoard() {
  const [columns, setColumns] = useState<ColumnType[]>(initialColumns);
  const [tasks, setTasks] = useState<KanbanTask[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);
  const [activeColumn, setActiveColumn] = useState<ColumnType | null>(null);

  const columnsId = columns.map((col) => col.id);
  const idPrefix = useId();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // 3px
      },
    })
  );

  function createTask() {
    const newTask: KanbanTask = {
      id: `task-${idPrefix}-${tasks.length + 1}`,
      columnId: "todo",
      title: "New Task",
      description: "Click to edit this task",
      priority: "medium",
    };

    setTasks([...tasks, newTask]);
  }

  function deleteTask(id: string) {
    const newTasks = tasks.filter((task) => task.id !== id);
    setTasks(newTasks);
  }

  function updateTask(updatedTask: KanbanTask) {
    setTasks(
      tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
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

    // Handle column reordering
    if (active.data.current?.type === "Column") {
      setColumns((columns) => {
        const activeColumnIndex = columns.findIndex(
          (col) => col.id === activeId
        );
        const overColumnIndex = columns.findIndex((col) => col.id === overId);

        return arrayMove(columns, activeColumnIndex, overColumnIndex);
      });
    }
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    // Handle task dropping
    if (
      active.data.current?.type === "Task" &&
      over.data.current?.type === "Task"
    ) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        // If tasks are in different columns, update the column
        if (tasks[activeIndex].columnId !== tasks[overIndex].columnId) {
          tasks[activeIndex].columnId = tasks[overIndex].columnId;
          return arrayMove(tasks, activeIndex, overIndex);
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    // Handle dropping a task into a column
    if (
      active.data.current?.type === "Task" &&
      over.data.current?.type === "Column"
    ) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);

        tasks[activeIndex].columnId = overId.toString();

        return [...tasks];
      });
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
    >
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

        <Button
          variant="outline"
          className="flex items-center gap-1 h-12 shrink-0"
          onClick={createTask}
        >
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
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
    </DndContext>
  );
}
