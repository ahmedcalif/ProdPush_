"use client";
import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast, Toaster } from "sonner";
import { Button } from "../components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Loader2, LogOut } from "lucide-react";
import { client } from "../lib/api/client";

const fetchUserProfile = async () => {
  const res = await client.api.auth.me.$get();
  if (res.ok) {
    const data = await res.json();
    return data.user;
  }
  throw new Error("Failed to fetch user profile");
};

const updateUserProfile = async (
  userId: string,
  userData: ProfileFormValues
) => {
  const res = await client.api.auth.settings.update[userId].$post({
    json: userData,
  });

  if (!res.ok) {
    throw new Error("Failed to update profile");
  }

  const data = await res.json();
  return data;
};

const logoutUser = async () => {
  const res = await client.api.auth.logout.$get();

  if (!res.ok) {
    throw new Error("Failed to logout");
  }

  const data = await res.json();
  return data;
};

const profileFormSchema = z.object({
  username: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(30, {
      message: "Name must not be longer than 30 characters.",
    }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function SettingsForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "",
      email: "",
    },
    values: userData
      ? {
          username: userData.username || "",
          email: userData.email || "",
        }
      : undefined,
  });

  const { mutate: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: (data: ProfileFormValues) =>
      updateUserProfile(userData?.id, data),
    onSuccess: () => {
      toast.success("Profile updated", {
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: () => {
      toast.error("Error", {
        description: "Failed to update your profile. Please try again.",
      });
    },
  });

  function onSubmit(data: ProfileFormValues) {
    updateProfile(data);
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await logoutUser();
      if (response.redirectUrl) {
        window.location.href = response.redirectUrl;
      } else {
        router.navigate({ to: "/login" });
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to log out. Please try again.",
      });
      setIsLoggingOut(false);
    }
  };

  if (isLoadingUser) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Update your personal information and how others see you on the
            platform.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder={userData?.username} {...field} />
                    </FormControl>
                    <FormDescription>
                      This is your public display name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder={userData?.email} {...field} />
                    </FormControl>
                    <FormDescription>
                      Your email address is used for notifications and sign-in.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <Button
                variant="outline"
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging out...
                  </>
                ) : (
                  <>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </>
                )}
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
