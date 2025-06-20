// context/AuthContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  username: string;
  email: string;
};

interface AuthContextType {
  token: string | null;
  user: User | null;
  hydrated: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const fetchUser = async () => {
    if (token) {
      try {
        const u = await apiFetch("/auth/user/", { method: "GET" }, token);
        setUser(u);
      } catch {
        // Obsłuż błąd, np. wyloguj jeśli token nieważny
        setUser(null);
      }
    }
  };

  // 1) Na start: wczytaj token, jeśli jest – fetchnij usera
  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) {
      setToken(t);
      apiFetch("/auth/user/", { method: "GET" }, t)
        .then((u) => setUser(u))
        .catch(() => {
          localStorage.removeItem("token");
        })
        .finally(() => setHydrated(true));
    } else {
      setHydrated(true);
    }
  }, []);

  // 2) logowanie – zapis tokenu + fetch usera + redirect
  const login = async (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    try {
      const u = await apiFetch("/auth/user/", { method: "GET" }, newToken);
      setUser(u);
      router.push("/transactions");
    } catch {
      // coś poszło nie tak
    }
  };

  // 3) wylogowanie
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{ token, user, hydrated, login, logout, fetchUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
