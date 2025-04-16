import { Button } from "./ui/button";
import { client } from "../lib/api/client";
import { ButtonHTMLAttributes, ReactNode, MouseEvent } from "react";

type AuthButtonProps = {
  children?: ReactNode;
  size?: "default" | "sm" | "lg" | "icon";
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "size">;

type SuccessResponse = {
  redirectUrl: string;
};

type ErrorResponse = {
  error: string;
  message: string;
};

type ApiResponse = SuccessResponse | ErrorResponse;

function isSuccessResponse(response: ApiResponse): response is SuccessResponse {
  return "redirectUrl" in response;
}

export function LoginButton({
  children,
  size = "default",
  variant = "default",
  className,
  onClick: externalOnClick,
  ...props
}: AuthButtonProps) {
  const handleLogin = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log("Login button clicked");

    if (externalOnClick) {
      externalOnClick(e);
    }

    try {
      console.log("Making API call to /api/auth/login using Hono RPC");
      const response = await client.api.auth.login.$get({
        fetch: { parseResponse: false },
      });

      console.log("Raw response:", response);

      const data = (await response.json()) as ApiResponse;
      console.log("Response data:", data);

      if (isSuccessResponse(data)) {
        console.log("Redirecting to:", data.redirectUrl);
        window.location.href = data.redirectUrl;
      } else {
        console.error("Error response received:", data.error, data.message);
        alert(`Login failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Error logging in:", error);
      alert("Login failed. See console for details.");
    }
  };

  return (
    <Button
      onClick={handleLogin}
      size={size}
      variant={variant}
      className={className}
      type="button"
      {...props}
    >
      {children || "Login"}
    </Button>
  );
}

export function RegisterButton({
  children,
  size = "default",
  variant = "default",
  className,
  onClick: externalOnClick,
  ...props
}: AuthButtonProps) {
  const handleRegister = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log("Register button clicked");

    if (externalOnClick) {
      externalOnClick(e);
    }

    try {
      console.log("Making API call to /api/auth/register using Hono RPC");
      const response = await client.api.auth.register.$get({
        fetch: { parseResponse: false },
      });

      console.log("Raw response:", response);

      const data = (await response.json()) as ApiResponse;
      console.log("Response data:", data);

      if (isSuccessResponse(data)) {
        console.log("Redirecting to:", data.redirectUrl);
        window.location.href = data.redirectUrl;
      } else {
        console.error("Error response received:", data.error, data.message);
        alert(`Registration failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Error registering:", error);
      alert("Registration failed. See console for details.");
    }
  };

  return (
    <Button
      onClick={handleRegister}
      size={size}
      variant={variant}
      className={className}
      type="button"
      {...props}
    >
      {children || "Register"}
    </Button>
  );
}
