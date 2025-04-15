import { hc } from "hono/client";
import { ApiRoutes } from "../../../../backend/src/index";
// import { queryOptions } from "@tanstack/react-query";
// import type { User } from "@backend/src/db/schema/users";

console.log(import.meta.env);
export const client = hc<ApiRoutes>(import.meta.env.VITE_DOMAIN!);

// export async function getCurrentUser() {
//   const res = await client.api.v0.auth.me.$get();
//   if (!res.ok) {
//     throw new Error("server error");
//   }

//   const { user } = await res.json();
//   return user as User;
// }

// export const userQueryOptions = queryOptions({
//   queryKey: ["get-current-user"],
//   queryFn: getCurrentUser,
//   staleTime: Infinity,
// });
