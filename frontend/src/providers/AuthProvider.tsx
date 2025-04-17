import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { client } from "../lib/api/client";

// Define response types explicitly
type AuthResponse =
  | {
      user: {
        id: string;
        email: string;
        username: string | null;
      };
      authenticated: true;
    }
  | {
      message: string;
      authenticated: false;
    };

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
      const responseData = (await clientResponse.json()) as AuthResponse;
      console.log("Response Data", responseData);

      if (responseData.authenticated === true) {
        if (
          responseData.user &&
          responseData.user.id &&
          responseData.user.email
        ) {
          const userData: User = {
            id: responseData.user.id,
            email: responseData.user.email,
            username: responseData.user.username || null,
          };
          setUser(userData);
          setIsAuthenticated(true);
          return true;
        }
      }

      setUser(null);
      setIsAuthenticated(false);
      return false;
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
    // Immediately invoke the checkAuthStatus function
    checkAuthStatus();

    // Optional: Set up a refresh interval if needed
    // const refreshInterval = setInterval(checkAuthStatus, 5 * 60 * 1000); // every 5 minutes
    // return () => clearInterval(refreshInterval);
  }, []);

  const logout = async () => {
    try {
      await client.api.auth.logout.$get();
      // Reset local auth state before redirecting
      setUser(null);
      setIsAuthenticated(false);
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
