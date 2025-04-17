import { ArrowRight, Trash2, MoreHorizontal } from "lucide-react";
import type { KanbanTask } from "../../../backend/src/zod/TasksZodTypes";
import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

interface TaskCardProps {
  task: KanbanTask;
  onMove?: (taskId: string, newStatus: string) => void;
  onDelete: (taskId: string) => void;
  nextStatus?: string;
  nextStatusLabel?: string;
}

export function TaskCard({
  task,
  onMove,
  onDelete,
  nextStatus,
  nextStatusLabel,
}: TaskCardProps) {
  const priorityColor = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  }[task.priority || "medium"];

  return (
    <div className="bg-white rounded-md shadow-sm p-3 border border-gray-200">
      <div className="flex justify-between items-start">
        <h4 className="font-medium text-gray-900">{task.title}</h4>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {nextStatus && onMove && (
              <DropdownMenuItem onClick={() => onMove(task.id, nextStatus)}>
                <ArrowRight className="mr-2 h-4 w-4" />
                {nextStatusLabel || "Move"}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => onDelete(task.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {task.description && (
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex justify-between items-center mt-3">
        <span className={`text-xs px-2 py-1 rounded ${priorityColor}`}>
          {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1) ||
            "Medium"}
        </span>

        {nextStatus && onMove && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => onMove(task.id, nextStatus)}
          >
            <ArrowRight className="h-3 w-3 mr-1" />
            {nextStatusLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

export default TaskCard;
