import { useContext, createContext } from "react";
import { User } from "../types/data";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const useAuth = () => useContext(AuthContext);

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  logout: () => {},
  refreshUser: async () => {},
});
