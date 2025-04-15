import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { createInsertSchema } from "drizzle-zod";
import { projects as projectsTable } from "../db/schema";

export const createProjectSchema = createInsertSchema(projectsTable);
export const updateProjectSchema = createProjectSchema.partial();

export const createProjectValidator = zValidator("json", createProjectSchema);
export const projectIdValidator = zValidator(
  "param",
  z.object({ id: z.coerce.number().min(0) })
);
export const updateProjectValidator = zValidator("json", updateProjectSchema);
