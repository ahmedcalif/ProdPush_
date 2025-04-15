import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import "../index.css";

export const Route = createRootRoute({
  component: () => (
    <div className="w-full h-full min-h-dvh bg-background-page-white">
      <Outlet />
      <TanStackRouterDevtools />
    </div>
  ),
});
