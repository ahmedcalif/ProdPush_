import { createInsertSchema } from "drizzle-zod";
import { zValidator } from "@hono/zod-validator";
import { users } from "../db/schema";
import { z } from "zod";

export const userSelectSchema = createInsertSchema(users);
export const updateUserSchema = userSelectSchema.partial();
export const updateUserValidator = zValidator("json", updateUserSchema);
export const userIdValidator = zValidator(
  "param",
  z.object({ id: z.string().min(1) })
);
