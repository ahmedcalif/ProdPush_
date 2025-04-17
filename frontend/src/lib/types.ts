// src/lib/types.ts

// This is the frontend Task interface
export interface KanbanTask {
  id: string;
  title: string;
  description: string;
  projectId: number;
  columnId: string; // In frontend UI we use columnId
  status: string; // But backend expects status
  priority: string;
  assignedTo?: string | undefined;
  dueDate: Date | null;
}

export interface KanbanColumn {
  id: string;
  title: string;
  color: string;
}

// Type for data coming from backend
export interface BackendTask {
  id: number;
  title: string;
  description: string | null;
  projectId: number;
  status: string | null;
  priority: string | null;
  assignedTo: string | null;
  dueDate: string | null;
  createdAt: string;
}

// Helper function to convert backend task to frontend task
export function normalizeTask(
  task: BackendTask | Partial<KanbanTask>
): KanbanTask {
  // Create a normalized task object
  return {
    id: (typeof task.id === "number" ? task.id.toString() : task.id) || "",
    title: task.title || "",
    description: task.description || "",
    projectId: task.projectId || 0,
    // Map status from backend to columnId for frontend
    columnId: (task as KanbanTask).columnId || task.status || "todo",
    // Ensure status is always set (frontend needs both)
    status: task.status || (task as KanbanTask).columnId || "todo",
    priority: task.priority || "medium",
    assignedTo: task.assignedTo!,
    dueDate: task.dueDate
      ? typeof task.dueDate === "string"
        ? new Date(task.dueDate)
        : task.dueDate
      : null,
  };
}

// Helper function to prepare task for API requests
export function prepareTaskForApi(task: KanbanTask): any {
  return {
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.columnId, // Use columnId as status for the backend
    projectId: task.projectId,
    assignedTo: task.assignedTo,
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
  };
}
