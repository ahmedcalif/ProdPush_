import { Hono } from "hono";
import { tasks } from "../db/schema";
import {
  createTaskValidator,
  updateTaskValidator,
  taskIdValidator,
} from "../zod/TasksZodTypes";
import { db } from "../db/client";
import { eq } from "drizzle-orm";

export const taskRouter = new Hono()
  .get("/:id", taskIdValidator, async (c) => {
    try {
      const { id } = c.req.valid("param");
      const getTasksById = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, id));
      if (!getTasksById || getTasksById.length === 0) {
        return c.json({ error: "No project with that id was found" }, 404);
      }
      return c.json(getTasksById[0]);
    } catch (error) {
      console.error("Error fetching project", error);
      return c.json({ error: "Failed to retrieve project" }, 500);
    }
  })
  .post("/create", createTaskValidator, async (c) => {
    try {
      const data = c.req.valid("json");
      const createTask = await db.insert(tasks).values(data);
      return c.json({ createTask });
    } catch (error) {}
  })
  .put("/:id", taskIdValidator, updateTaskValidator, async (c) => {
    const id = Number(c.req.param("id"));
    const updatedData = c.req.valid("json");
    const existingTask = await db.select().from(tasks).where(eq(tasks.id, id));

    if (!existingTask || existingTask.length === 0) {
      return c.json({ error: "Project not found" }, 404);
    }

    const updatedTask = await db
      .update(tasks)
      .set(updatedData)
      .where(eq(tasks.id, id))
      .returning();

    return c.json({ updatedTask });
  })
  .delete("/:id", taskIdValidator, async (c) => {
    try {
      const { id } = c.req.valid("param");

      const existingTask = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, id));

      if (!existingTask || existingTask.length === 0) {
        return c.json({ error: "Project not found" }, 404);
      }

      await db.delete(tasks).where(eq(tasks.id, id));

      return c.json(
        { success: true, message: "Task deleted successfully" },
        200
      );
    } catch (error) {
      console.error("Error deleting task", error);
      return c.json({ error: "Failed to delete task" }, 500);
    }
  });
