import {
  createFileRoute,
  Outlet,
  redirect,
  Link,
} from "@tanstack/react-router";
import { useAuth } from "../auth/AuthProvider";
import { ReactNode, useEffect } from "react";

export const Route = createFileRoute("/__authenticated")({
  loader: async ({ context }) => {
    return {};
  },

  beforeLoad: async ({ context }) => {},

  component: AuthenticatedLayout,
});

function NavigationBar() {
  return (
    <div className="py-4 flex flex-row justify-center">
      <nav className="bg-foreground-white px-8 py-4 w-fit rounded-[20px]">
        <ul className="flex flex-row">
          <li>
            <Link
              to="/dashboard"
              className="[&.active]:text-foreground-nav-active text-foreground-nav-inactive text-lg"
            >
              Dashboard
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

function AuthenticatedLayout() {
  const { user, isLoading, isAuthenticated, checkAuthStatus } = useAuth();

  useEffect(() => {
    const verifyAuth = async () => {
      const isAuth = await checkAuthStatus();
      if (!isAuth) {
        throw redirect({
          to: "/",
        });
      }
    };

    verifyAuth();
  }, [checkAuthStatus]);

  if (isLoading) {
    return <AuthenticatedLoadingState />;
  }

  if (!isAuthenticated || !user) {
    throw redirect({
      to: "/",
    });
  }

  return (
    <div className="authenticated-layout">
      <NavigationBar />

      <Outlet />
    </div>
  );
}

function AuthenticatedLoadingState() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">
          Verifying authentication...
        </p>
      </div>
    </div>
  );
}
