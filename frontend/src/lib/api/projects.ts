import { client } from "./client";
import {
  createProjectSchema,
  updateProjectSchema,
} from "../../../../backend/src/zod/ProjectsZodTypes";
import { z } from "zod";

export async function getProjects() {
  const result = await client.api.projects.$get();
  if (!result.ok) {
    console.error("Result was not ok", result.status);
    return new Error("Result was not ok");
  }
  const data = result.json();
  return data;
}

export async function getProjectById(id: string) {
  const result = await client.api.projects[":id"].$get({
    param: { id },
  });
  if (!result.ok) {
    console.error("result was not ok", result.status);
    throw new Error("result was not ok");
  }
  const data = result.json();
  return data;
}

export async function createProject(data: z.infer<typeof createProjectSchema>) {
  const result = await client.api.projects.create.$post({
    json: data,
  });

  if (!result.ok) {
    console.error("Failed to create project", result.status);
    throw new Error(`Failed to create project: ${result.status}`);
  }

  const responseData = result.json();
  return responseData;
}

export async function updateProject(
  id: string,
  data: z.infer<typeof updateProjectSchema>
) {
  const result = await client.api.projects[":id"].$put({
    param: { id },
    json: data,
  });

  if (!result.ok) {
    console.error("Failed to update project", result.status);
    throw new Error(`Failed to update project: ${result.status}`);
  }

  const responseData = result.json();
  return responseData;
}

export async function deleteProject(id: string) {
  const result = await client.api.projects[":id"].$delete({
    param: { id },
  });

  if (!result.ok) {
    console.error("Failed to delete project", result.status);
    throw new Error(`Failed to delete project: ${result.status}`);
  }

  const responseData = result.json();
  return responseData;
}
