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
export const updateTaskValidator = zValidator("json", updateTaskSchema);
