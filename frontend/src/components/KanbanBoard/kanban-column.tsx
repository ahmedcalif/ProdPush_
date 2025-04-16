"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SortableContext } from "@dnd-kit/sortable";

import { KanbanItem } from "./kanban-item";
import type { KanbanTask, KanbanColumn as ColumnType } from "../../lib/types";

interface KanbanColumnProps {
  column: ColumnType;
  tasks: KanbanTask[];
  deleteTask: (id: string) => void;
  updateTask: (task: KanbanTask) => void;
}

export function KanbanColumn({
  column,
  tasks,
  deleteTask,
  updateTask,
}: KanbanColumnProps) {
  const tasksIds = tasks.map((task) => task.id);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="w-72 h-[500px] rounded-lg border border-dashed border-gray-500 bg-gray-100/50 flex flex-col opacity-40"
      ></div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="w-72 h-fit max-h-[calc(100vh-10rem)] flex flex-col rounded-lg bg-gray-100/50 border"
    >
      <div
        {...attributes}
        {...listeners}
        className={`p-3 font-medium text-sm flex items-center justify-between rounded-t-lg ${column.color} cursor-grab`}
      >
        <div className="flex items-center gap-2">
          <span>{column.title}</span>
          <span className="bg-white/30 rounded-full px-2 py-0.5 text-xs">
            {tasks.length}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2 p-2 overflow-y-auto">
        <SortableContext items={tasksIds}>
          {tasks.map((task) => (
            <KanbanItem
              key={task.id}
              task={task}
              deleteTask={deleteTask}
              updateTask={updateTask}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
