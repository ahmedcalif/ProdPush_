import { createFileRoute, redirect } from "@tanstack/react-router";
import { Home } from "../components/Homepage";
import Dashboard from "../components/Dashboard";
import { useAuth } from "../providers/AuthProvider";
import "../index.css";

export const Route = createFileRoute("/")({
  component: RootComponent,
});

function RootComponent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Dashboard />;
  }

  return <Home />;
  ``;
}
