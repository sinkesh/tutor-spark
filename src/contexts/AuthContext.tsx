import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { User, UserRole } from "@/types";
import { getStudentDetails } from "@/config/services";

interface AuthContextType {
  user: User | null;
  login: (userData: User) => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('access_token');

        if (userData && token) {
          const parsed = JSON.parse(userData) as User;
          setUser(parsed);

          if (!parsed.class && parsed.role === "student") {
            try {
              const details = await getStudentDetails(parsed.id);
              const cls = (details as any).student_details?.class_name || details.class_name || "";
              if (cls) {
                const updated: User = { ...parsed, class: cls };
                localStorage.setItem("user", JSON.stringify(updated));
                setUser(updated);
              }
            } catch (err) {
              console.error("Failed to refresh student class on startup:", err);
            }
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (userData: User) => {
    try {
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Failed to login. Please try again.');
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  };

  return (
    <AuthContext.Provider
      value={{ user, login, updateUser, logout, isAuthenticated: !!user, isLoading }}
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
