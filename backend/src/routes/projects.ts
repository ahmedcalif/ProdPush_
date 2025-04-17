import { Hono } from "hono";
import { projects } from "../db/schema";
import {
  createProjectValidator,
  updateProjectValidator,
  projectIdValidator,
} from "../zod/ProjectsZodTypes";
import { db } from "../db/client";
import { eq } from "drizzle-orm";

const projectRoute = new Hono()
  .get("/", async (c) => {
    try {
      const getAllProjects = await db.select().from(projects);
      if (!getAllProjects) {
        console.error("No Projects exists");
      }
      return c.json(getAllProjects);
    } catch (error) {
      console.error("Error getting all projects", error);
      return c.json({ error: "Failed to retrieve projects" }, 500);
    }
  })
  .get("/:id", projectIdValidator, async (c) => {
    try {
      const { id } = c.req.valid("param");
      const getProjectsById = await db
        .select()
        .from(projects)
        .where(eq(projects.id, id));
      if (!getProjectsById || getProjectsById.length === 0) {
        return c.json({ error: "No project with that id was found" }, 404);
      }
      return c.json(getProjectsById[0]);
    } catch (error) {
      console.error("Error fetching project", error);
      return c.json({ error: "Failed to retrieve project" }, 500);
    }
  })
  .post("/create", createProjectValidator, async (c) => {
    try {
      const data = c.req.valid("json");

      const newProject = await db.insert(projects).values(data).returning();

      if (!newProject) {
        throw new Error("db error creating a project");
      }
      return c.json(newProject[0]);
    } catch (error) {
      console.error("Error creating project", error);
    }
  })
  .put("/:id", projectIdValidator, updateProjectValidator, async (c) => {
    try {
      const { id } = c.req.valid("param");
      const updateData = c.req.valid("json");

      const existingProject = await db
        .select()
        .from(projects)
        .where(eq(projects.id, id));

      if (!existingProject || existingProject.length === 0) {
        return c.json({ error: "Project not found" }, 404);
      }

      const updatedProject = await db
        .update(projects)
        .set(updateData)
        .where(eq(projects.id, id))
        .returning();

      return c.json(updatedProject[0]);
    } catch (error) {
      console.error("Error updating project", error);
      return c.json({ error: "Failed to update project" }, 500);
    }
  })
  .delete("/:id", projectIdValidator, async (c) => {
    try {
      const id = Number(c.req.valid("param"));

      const existingProject = await db
        .select()
        .from(projects)
        .where(eq(projects.id, id));

      if (!existingProject || existingProject.length === 0) {
        return c.json({ error: "Project not found" }, 404);
      }

      await db.delete(projects).where(eq(projects.id, id));

      return c.json(
        { success: true, message: "Project deleted successfully" },
        200
      );
    } catch (error) {
      console.error("Error deleting project", error);
      return c.json({ error: "Failed to delete project" }, 500);
    }
  });

export default projectRoute;
