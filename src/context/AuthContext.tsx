"use client";
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { AuthContextType, JWTData, User } from "../app/utils/types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

      const contentType = res.headers.get("content-type");

      if (!res.ok) {
        const error = contentType?.includes("application/json") ? await res.json() : await res.text();

        console.error("Erro na autenticação:", error);
        return false;
      }

      // garante que só faz .json() se for seguro
      const data = contentType?.includes("application/json") ? await res.json() : null;

      if (data?.accessToken) {
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

  // Busca os dados do usuário sempre que a página for renderizada
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);

      try {
        // Verifica se há um userToken nos cookies (pode ser lido pelo JavaScript)
        const userToken = document.cookie
          .split("; ")
          .find((row) => row.startsWith("userToken="))
          ?.split("=")[1];

        if (userToken && checkTokenValidity(userToken)) {
          // Decodifica o userToken para obter os dados do usuário
          const decoded = jwtDecode<JWTData>(userToken);
          setUser({
            name: decoded.name,
            image: decoded.image,
            username: decoded.username,
          });
          setAccessToken(userToken);
        } else {
          console.info("Usuário não autenticado ou token expirado.");
          setUser(null);
          setAccessToken(null);
        }
      } catch (err) {
        console.error("Erro ao verificar autenticação:", err);
        setUser(null);
        setAccessToken(null);
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, [checkTokenValidity]);

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

  // Não renderiza o conteúdo até que a verificação inicial seja concluída
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  return <AuthContext.Provider value={{ accessToken, user, signIn, signOut }}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
};
