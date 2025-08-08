"use client";
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { AuthContextType, JWTData, User } from "../app/utils/types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const checkTokenValidity = useCallback((token: string) => {
    try {
      const decoded = jwtDecode<JWTData>(token);
      const now = Math.floor(Date.now() / 1000);
      return decoded.exp > now;
    } catch {
      return false;
    }
  }, []);

  const signIn = async (badge: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/Login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: badge }),
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok && data.accessToken) {
        setAccessToken(data.accessToken);
        setUser(data.user);
        router.push("/produto");
        return true;
      }
      return false;
    } catch (err) {
      console.error("Erro no login:", err);
      return false;
    }
  };

  const signOut = useCallback(async (): Promise<void> => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setAccessToken(null);
      setUser(null);
      window.location.reload();
    }
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me", {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else if (res.status === 401) {
          // Usuário não autenticado — normal ao abrir app sem login
          console.info("Usuário ainda não autenticado.");
          setUser(null);
        } else {
          console.warn("Erro inesperado ao buscar usuário:", res.status);
          setUser(null);
        }
      } catch (err) {
        console.error("Erro ao buscar usuário:", err);
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (!accessToken) return;

    const interval = setInterval(() => {
      const stillValid = checkTokenValidity(accessToken);
      if (!stillValid) {
        signOut();
      }
    }, 10000); // checa a cada 10 segundos

    return () => clearInterval(interval);
  }, [accessToken, signOut, checkTokenValidity]);

  const refreshToken = async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/refresh");

      // 💡 Se status 204 (sem conteúdo), não tente fazer .json()
      if (res.status === 204) {
        setUser(null);
        return false;
      }

      // 💡 Se Content-Type não for JSON, evite .json()
      const contentType = res.headers.get("content-type");
      if (!res.ok || !contentType?.includes("application/json")) {
        return false;
      }

      const data = await res.json();

      if (data.accessToken) {
        setAccessToken(data.accessToken);
        return true;
      }

      return false;
    } catch (err) {
      console.error("Erro ao buscar usuário:", err);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ accessToken, user, signIn, signOut, refreshToken }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
};
