"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { api } from "@/services/api";

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("jwtToken");
    if (storedToken) {
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem("jwtToken", newToken);
  };

  const logout = () => {
    api.logout();
    setToken(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
