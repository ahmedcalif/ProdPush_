import { useAuth } from "../auth/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { userQueryOptions } from "../lib/api/client";
import { KanbanBoard } from "./KanbanBoard/kanban-board";
import { NavigationBar } from "../routes/__authenticated";

export default function Dashboard() {
  const { isLoading: authLoading, logout } = useAuth();
  const {
    data: user,
    isLoading: userLoading,
    isError,
  } = useQuery(userQueryOptions);

  const isLoading = authLoading || userLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p>Please wait while we retrieve your information.</p>
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">
            Authentication Required
          </h2>
          <p>Please log in to access the dashboard.</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => (window.location.href = "/")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  console.log("Authenticated user in Dashboard:", user);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <NavigationBar />

      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-700 border-b pb-4">
            Welcome, {user.username}
          </h2>

          <div className="kanban-container overflow-x-auto">
            <div className="min-h-[600px] w-full">
              <KanbanBoard />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
