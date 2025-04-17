import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { createInsertSchema } from "drizzle-zod";
import { tasks as tasksTable } from "../db/schema";

export const createTaskSchema = createInsertSchema(tasksTable);
export const updateTaskSchema = createTaskSchema.partial();

export const createTaskValidator = zValidator("json", createTaskSchema);
export const taskIdValidator = zValidator(
  "param",
  z.object({ id: z.coerce.number().min(0) })
);

export const projectIdValidator = zValidator(
  "param",
  z.object({ projectId: z.coerce.number().min(0) })
);
export const updateTaskValidator = zValidator("json", updateTaskSchema);

export interface KanbanTask {
  id: string;
  title: string;
  description: string;
  projectId: number;
  columnId: string;
  priority: string;
  assignedTo?: string | undefined; // Make sure assignedTo is included in the type
  dueDate: Date | null;
}
export const toKanbanTask = (dbTask: any): KanbanTask => {
  return {
    id: dbTask.id.toString(),
    title: dbTask.title,
    description: dbTask.description || "",
    projectId: dbTask.projectId,
    columnId: dbTask.status || "todo", // Map status to columnId
    priority: dbTask.priority || "medium",
    assignedTo: dbTask.assignedTo,
    dueDate: dbTask.dueDate ? new Date(dbTask.dueDate) : null,
  };
};

// Helper function to convert Kanban task back to DB format
export const toDbTask = (kanbanTask: Partial<KanbanTask>): any => {
  const dbTask: any = {
    ...kanbanTask,
  };

  // Map columnId back to status
  if (kanbanTask.columnId) {
    dbTask.status = kanbanTask.columnId;
    delete dbTask.columnId;
  }

  return dbTask;
};
