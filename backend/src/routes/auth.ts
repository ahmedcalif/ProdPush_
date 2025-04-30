import { db } from "../db/client";

import { users as usersTable } from "../db/schema";
import { zValidator } from "@hono/zod-validator";
import type { InferSelectModel } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { updateUserValidator } from "../zod/AuthZodTypes";
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
  })
  .post("/settings/update/:userId", getUser, updateUserValidator, async (c) => {
    try {
      const userId = c.req.param("userId");
      const updateData = c.req.valid("json");

      // Get authenticated user from context (set by your getUser middleware)
      const kindeUser = c.get("user");
      const dbUser = c.get("dbUser");

      // Authorization check - users can only update their own profile
      if (kindeUser.id !== userId) {
        return c.json(
          {
            success: false,
            message: "You can only update your own profile",
          },
          403
        );
      }

      // Check if user exists in the database
      if (!dbUser) {
        return c.json(
          {
            success: false,
            message: "User profile not found",
          },
          404
        );
      }

      // Filter out undefined values - only update what was provided
      const filteredUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined)
      );

      // If no fields to update, return early
      if (Object.keys(filteredUpdateData).length === 0) {
        return c.json(
          {
            success: false,
            message: "No valid fields to update",
          },
          400
        );
      }

      // Update user in database
      await db
        .update(usersTable)
        .set(filteredUpdateData)
        .where(eq(usersTable.id, userId));

      // Get updated user data
      const updatedUserResult = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, userId));

      const updatedUser = updatedUserResult[0];

      return c.json(
        {
          success: true,
          message: "User updated successfully",
          user: updatedUser,
        },
        200
      );
    } catch (error) {
      console.error("Error updating user:", error);
      return c.json(
        {
          success: false,
          message: "Failed to update user",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        500
      );
    }
  });
