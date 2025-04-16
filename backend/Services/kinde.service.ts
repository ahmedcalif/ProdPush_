import {
  createKindeServerClient,
  GrantType,
  type SessionManager,
  type UserType,
} from "@kinde-oss/kinde-typescript-sdk";
import type { Context } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import * as dotenv from "dotenv";
import { db } from "../src/db/client";
import { users as usersTable } from "../src/db/schema";
import { eq, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
dotenv.config();

export const kindeClient = createKindeServerClient(
  GrantType.AUTHORIZATION_CODE,
  {
    authDomain: process.env.KINDE_DOMAIN as string,
    clientId: process.env.KINDE_CLIENT_ID as string,
    clientSecret: process.env.KINDE_CLIENT_SECRET as string,
    redirectURL: process.env.KINDE_REDIRECT_URI as string,
    logoutRedirectURL: process.env.KINDE_LOGOUT_URI as string,
  }
);

export const sessionManager = (c: Context): SessionManager => ({
  async getSessionItem(key: string) {
    const result = getCookie(c, key);
    return result;
  },
  async setSessionItem(key: string, value: unknown) {
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
    } as const;
    if (typeof value === "string") {
      setCookie(c, key, value, cookieOptions);
    } else {
      setCookie(c, key, JSON.stringify(value), cookieOptions);
    }
  },
  async removeSessionItem(key: string) {
    deleteCookie(c, key);
  },
  async destroySession() {
    ["id_token", "access_token", "user", "refresh_token"].forEach((key) => {
      deleteCookie(c, key);
    });
  },
});

type Env = {
  Variables: {
    user: UserType;
    dbUser: InferSelectModel<typeof usersTable>;
  };
};

/**
 * Execute a function and return its result.
 * If the function throws an error, return the error.
 */
async function getMe<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    throw error;
  }
}

export const getUser = createMiddleware<Env>(async (c, next) => {
  try {
    const manager = sessionManager(c);
    const isAuthenticated = await kindeClient.isAuthenticated(manager);
    if (!isAuthenticated) {
      throw new Error("Not authenticated");
    }

    const kindeUser = await kindeClient.getUserProfile(manager);

    let userQueryResult;
    try {
      userQueryResult = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, kindeUser.id));
    } catch (error) {
      throw error;
    }

    c.set("user", kindeUser);
    console.log(userQueryResult, "user queyr len");

    if (userQueryResult.length === 0) {
      console.log(kindeUser.email);
      try {
        await db.insert(usersTable).values({
          id: kindeUser.id,
          email: kindeUser.email ? kindeUser.email : "",
          username: kindeUser.given_name ? kindeUser.given_name : "",
        } as InferInsertModel<typeof usersTable>);
      } catch (error) {
        console.log("1st query err");
        throw error;
      }

      let secondQueryResult;
      try {
        secondQueryResult = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.id, kindeUser.id));
      } catch (error) {
        console.log("2nd query err");
        throw error;
      }

      console.log("got here?");
      c.set("dbUser", secondQueryResult[0]);
    } else {
      console.log("setting from query");
      c.set("dbUser", userQueryResult[0]);
    }

    await next();
  } catch (e) {
    console.error("Error in getUser middleware:", e);
    await next();
  }
});
