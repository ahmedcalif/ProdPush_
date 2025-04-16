import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import projectRoute from "./routes/projects";
import { serveStatic } from "hono/bun";
import { authRouter } from "./routes/auth";

const app = new Hono();

app.use(logger());

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);
const apiRoutes = app
  .basePath(`/api/`)
  .route("/projects", projectRoute)
  .route("/auth", authRouter);

const port = process.env.PORT ? process.env.PORT : 3000;
console.log(`Server is running on http://localhost:${port}`);

export type ApiRoutes = typeof apiRoutes;

// Static Routes
app.get("*", serveStatic({ root: "../frontend/dist" }));
app.notFound((c) => c.html(Bun.file("../frontend/dist/index.html").text()));

export default {
  port,
  fetch: app.fetch,
};
