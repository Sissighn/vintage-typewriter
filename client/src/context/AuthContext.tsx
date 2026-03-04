import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axiosInstance";

interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isGuest: boolean;
  login: (credentials: object) => Promise<void>;
  register: (data: object) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  continueAsGuest: () => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data);
        setIsGuest(false);
      })
      .catch((error) => {
        if (error.response?.status === 401) {
          setUser(null);
        } else {
          console.error("Auth check failed:", error);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials: object) => {
    const res = await api.post("/auth/login", credentials);
    setUser(res.data.user);
    setIsGuest(false);
  };

  const register = async (data: object) => {
    const res = await api.post("/auth/register", data);
    setUser(res.data.user);
    setIsGuest(false);
  };

  const loginWithGoogle = async (idToken: string) => {
    const res = await api.post("/auth/google", { idToken });
    setUser(res.data.user);
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    setUser(null);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout error", err);
    }
    setUser(null);
    setIsGuest(false);
    window.location.reload();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isGuest,
        login,
        register,
        loginWithGoogle,
        continueAsGuest,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
