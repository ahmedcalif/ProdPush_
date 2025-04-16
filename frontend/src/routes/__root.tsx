import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { AuthProvider } from "../auth/AuthProvider";

interface RouterContext {}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  ),
});
