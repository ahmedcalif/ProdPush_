import { createFileRoute } from "@tanstack/react-router";
import { SettingsForm } from "../../../components/settings-form";
import { Toaster } from "sonner";
import { NavigationBar } from "../../__authenticated";

export const Route = createFileRoute("/_authenticated/settings/")({
  component: SettingsPage,
});

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-10">
      <NavigationBar />
      <Toaster position="top-right" />

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>
        <SettingsForm />
      </div>
    </div>
  );
}
