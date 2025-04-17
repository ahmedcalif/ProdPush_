import { Hono } from "hono";
import { tasks, projects } from "../db/schema";
import {
  createTaskValidator,
  updateTaskValidator,
  taskIdValidator,
} from "../zod/TasksZodTypes";
import { db } from "../db/client";
import { eq, and } from "drizzle-orm";

export const taskRouter = new Hono()
  .get("/", async (c) => {
    try {
      const allTasks = await db.select().from(tasks);
      return c.json(allTasks);
    } catch (error) {
      console.error("Error fetching all tasks", error);
      return c.json({ error: "Failed to retrieve tasks" }, 500);
    }
  })

  .get("/project/:projectId", async (c) => {
    try {
      const projectId = Number(c.req.param("projectId"));

      const projectExists = await db
        .select()
        .from(projects)
        .where(eq(projects.id, projectId));

      if (!projectExists || projectExists.length === 0) {
        return c.json({ error: "Project not found" }, 404);
      }

      const projectTasks = await db
        .select()
        .from(tasks)
        .where(eq(tasks.projectId, projectId));

      return c.json(projectTasks);
    } catch (error) {
      console.error("Error fetching tasks for project", error);
      return c.json({ error: "Failed to retrieve project tasks" }, 500);
    }
  })

  .get("/:id", taskIdValidator, async (c) => {
    try {
      const { id } = c.req.valid("param");

      const getTasksById = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, id));

      if (!getTasksById || getTasksById.length === 0) {
        return c.json({ error: "No task with that id was found" }, 404);
      }

      return c.json(getTasksById[0]);
    } catch (error) {
      console.error("Error fetching task", error);
      return c.json({ error: "Failed to retrieve task" }, 500);
    }
  })

  .post("/create", createTaskValidator, async (c) => {
    try {
      const data = c.req.valid("json");

      const projectExists = await db
        .select()
        .from(projects)
        .where(eq(projects.id, data.projectId));

      if (!projectExists || projectExists.length === 0) {
        return c.json({ error: "Cannot create task: Project not found" }, 404);
      }

      const result = await db.insert(tasks).values(data).returning();

      if (!result || result.length === 0) {
        return c.json({ error: "Failed to create task" }, 500);
      }

      return c.json(result[0], 201);
    } catch (error) {
      console.error("Error creating task", error);
      return c.json({ error: "Failed to create task" }, 500);
    }
  })

  .put("/:id", taskIdValidator, updateTaskValidator, async (c) => {
    try {
      const id = Number(c.req.param("id"));
      const updatedData = c.req.valid("json");
      const existingTask = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, id));

      if (!existingTask || existingTask.length === 0) {
        return c.json({ error: "Task not found" }, 404);
      }

      if (updatedData.projectId) {
        const projectExists = await db
          .select()
          .from(projects)
          .where(eq(projects.id, updatedData.projectId));

        if (!projectExists || projectExists.length === 0) {
          return c.json(
            { error: "Cannot update task: Project not found" },
            404
          );
        }
      }

      const updatedTask = await db
        .update(tasks)
        .set(updatedData)
        .where(eq(tasks.id, id))
        .returning();

      return c.json(updatedTask[0]);
    } catch (error) {
      console.error("Error updating task", error);
      return c.json({ error: "Failed to update task" }, 500);
    }
  })

  .delete("/:id", taskIdValidator, async (c) => {
    try {
      const { id } = c.req.valid("param");

      const existingTask = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, id));

      if (!existingTask || existingTask.length === 0) {
        return c.json({ error: "Task not found" }, 404);
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
  })

  .delete("/project/:projectId", async (c) => {
    try {
      const projectId = Number(c.req.param("projectId"));

      const projectExists = await db
        .select()
        .from(projects)
        .where(eq(projects.id, projectId));

      if (!projectExists || projectExists.length === 0) {
        return c.json({ error: "Project not found" }, 404);
      }

      await db.delete(tasks).where(eq(tasks.projectId, projectId));

      return c.json(
        {
          success: true,
          message: "All tasks for this project deleted successfully",
        },
        200
      );
    } catch (error) {
      console.error("Error deleting project tasks", error);
      return c.json({ error: "Failed to delete project tasks" }, 500);
    }
  });
