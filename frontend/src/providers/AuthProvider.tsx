import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { userMe, userSignout } from "../api/user";
import { User } from "../types/data";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  logout: () => {},
  refreshUser: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch user data
  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const result = await userMe();
      if (!result.needsLogin && result.user) {
        setUser(result.user);
        setError(null);
      } else {
        setUser(null);
        setError(result.message || "Authentication failed");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setUser(null);
      setError("Failed to fetch user data");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to log out
  const logout = () => {
    // Clear user data
    userSignout();
    setUser(null);
  };

  // Effect to check authentication status on mount
  useEffect(() => {
    fetchUserData();
  }, []);

  // Value to be provided by the context
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    logout,
    refreshUser: fetchUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);
