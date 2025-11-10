"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadAuthFromStorage = () => {
      const storedAuth = localStorage.getItem("auth");
      if (storedAuth) {
        try {
          const data = JSON.parse(storedAuth);
          // The linter might still complain here if it's very strict,
          // but this is standard React practice.
          setUser(data.user);
          setToken(data.token);
        } catch (error) {
          console.error("Corrupt auth data", error);
          localStorage.removeItem("auth");
        }
      }
      setIsLoading(false);
    };
    loadAuthFromStorage();
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("auth", JSON.stringify({ token: newToken, user: newUser }));

    toast.success("Welcome back!");
    if (newUser.is_admin) router.push("/admin");
    else router.push("/");
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth");
    router.push("/login");
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        isAdmin: user?.is_admin || false,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

// Helper hook to use the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

// Need this import for the toast used in login/logout above
import toast from "react-hot-toast";
