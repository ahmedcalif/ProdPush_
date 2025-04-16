"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import type { KanbanTask } from "../../lib/types";
import { TaskDialog } from "./task-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

interface KanbanItemProps {
  task: KanbanTask;
  deleteTask: (id: string) => void;
  updateTask: (task: KanbanTask) => void;
}

export function KanbanItem({ task, deleteTask, updateTask }: KanbanItemProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const priorityColors = {
    low: "bg-gray-100 hover:bg-gray-200 text-gray-800",
    medium: "bg-blue-100 hover:bg-blue-200 text-blue-800",
    high: "bg-red-100 hover:bg-red-200 text-red-800",
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-50 bg-gray-100 border border-dashed border-gray-300 rounded-md p-3 h-[120px]"
      ></div>
    );
  }

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        className="cursor-grab shadow-sm hover:shadow-md transition-shadow"
        {...attributes}
        {...listeners}
      >
        <CardHeader className="p-3 pb-0 flex flex-row items-start justify-between space-y-0">
          <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => deleteTask(task.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="p-3 pt-1">
          <CardDescription className="text-xs mt-1 line-clamp-2">
            {task.description}
          </CardDescription>
        </CardContent>
        <CardFooter className="p-3 pt-0 flex justify-between">
          <Badge
            variant="outline"
            className={
              priorityColors[task.priority as keyof typeof priorityColors]
            }
          >
            {task.priority}
          </Badge>
        </CardFooter>
      </Card>

      <TaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        task={task}
        updateTask={updateTask}
      />
    </>
  );
}
