import { createContext, type ReactNode, useContext, useState } from "react";
import { currentUsers } from "../data/mockData";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  signIn: (userId: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const signIn = (userId: string) => {
    const found = currentUsers.find((u) => u.id === userId) ?? null;
    setUser(found);
  };
  const signOut = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
