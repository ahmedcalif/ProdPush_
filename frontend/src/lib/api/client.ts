import { hc } from "hono/client";
import { ApiRoutes } from "../../../../backend/src/index";
import { queryOptions } from "@tanstack/react-query";

interface User {
  id: string;
  email: string;
  username: string;
}

console.log(import.meta.env);
export const client = hc<ApiRoutes>(import.meta.env.VITE_DOMAIN!);

export async function getCurrentUser() {
  const res = await client.api.auth.me.$get();
  if (!res.ok) {
    throw new Error("server error");
  }

  const { user } = await res.json();
  return user as User;
}

export const userQueryOptions = queryOptions({
  queryKey: ["get-current-user"],
  queryFn: getCurrentUser,
  staleTime: Infinity,
});
