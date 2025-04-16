import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "../../auth/AuthProvider";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

export function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:px-6">
      <h1 className="text-3xl font-bold mb-6">Welcome to Your Dashboard</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          Hello, {user?.username || "there"}!
        </h2>
        <p className="text-gray-600">
          This is your personal dashboard where you can manage all your tasks
          and projects.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-3">Recent Activity</h3>
          <div className="text-gray-600">
            <p>No recent activities yet.</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-3">Quick Stats</h3>
          <div className="text-gray-600">
            <p>No stats available yet.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
