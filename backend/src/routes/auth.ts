import { db } from "../db/client";

import { users as usersTable } from "../db/schema";
import { zValidator } from "@hono/zod-validator";
import type { InferSelectModel } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import {
  getUser,
  kindeClient,
  sessionManager,
} from "../../Services/kinde.service";

export const authRouter = new Hono()
  .get("/login", async (c) => {
    try {
      const loginURL = await kindeClient.login(sessionManager(c));

      if (!loginURL) {
        throw new Error("Login URI not found");
      }

      return c.json({ redirectUrl: loginURL });
    } catch (error) {
      console.error("Error Logging In", error);
      return c.json(
        {
          error: "Failed to generate login URL",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        500
      );
    }
  })

  .get("/register", async (c) => {
    try {
      const registerURL = await kindeClient.register(sessionManager(c));

      if (!registerURL) {
        throw new Error("Register URI not found");
      }

      return c.json({ redirectUrl: registerURL });
    } catch (error) {
      console.error("Error Registering user", error);
      return c.json(
        {
          error: "Failed to generate registration URL",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        500
      );
    }
  })

  .get("/callback", async (c) => {
    try {
      const url = new URL(c.req.url);
      await kindeClient.handleRedirectToApp(sessionManager(c), url);
      return c.redirect("/dashboard");
    } catch (error) {
      console.error("Error handling callback:", error);
      return c.redirect("/AuthPage?error=authentication_failed");
    }
  })
  .get("/logout", async (c) => {
    try {
      const logoutUrl = await kindeClient.logout(sessionManager(c));
      await sessionManager(c).destroySession();

      return c.json({ redirectUrl: logoutUrl });
    } catch (error) {
      console.error("Logout error:", error);
      return c.json(
        {
          error: "Failed to generate logout URL",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        500
      );
    }
  })
  .get("/me", getUser, async (c) => {
    const user = c.get("dbUser");
    if (!user) {
      return c.json(
        {
          user: undefined,
          message: "No authenticated user found",
          authenticated: false,
        },
        401
      );
    }

    return c.json(
      {
        user,
        authenticated: true,
      } as { user: InferSelectModel<typeof usersTable>; authenticated: true },
      200
    );
  });
