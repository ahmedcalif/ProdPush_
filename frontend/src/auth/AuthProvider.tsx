import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { client } from "../lib/api/client";
import { redirect } from "@tanstack/react-router";

// Define response types explicitly
type AuthResponse = {
  user?: {
    id: string;
    email: string;
    username: string | null;
  };
  authenticated: boolean;
  message?: string;
};

// User type
type User = {
  id: string;
  email: string;
  username: string | null;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  checkAuthStatus: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuthStatus = async () => {
    try {
      const clientResponse = await client.api.auth.me.$get();

      const responseData = clientResponse as unknown as AuthResponse;
      console.log("Response Data", responseData);

      if (responseData.authenticated === true && responseData.user) {
        setUser(responseData.user);
        setIsAuthenticated(true);
        return true;
      } else {
        setUser(null);
        setIsAuthenticated(false);
        return false;
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const logout = async () => {
    try {
      await client.api.auth.logout.$get();
      location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        logout,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
