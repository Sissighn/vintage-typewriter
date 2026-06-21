import { createContext } from "react";

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
}

export interface AuthContextValue {
  user: User | null;
  isGuest: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  continueAsGuest: () => void;
  migrateGuestNotes: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
