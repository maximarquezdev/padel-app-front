// context/AuthContext.tsx
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { clearToken, getToken, saveToken } from "../lib/auth";

type AuthContextType = {
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    (async () => {
      const t = await getToken();
      setToken(t);
      setLoading(false);
    })();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
    } catch (error) {
    } finally {
      setLoading(false);
    }
    // TODO: Llamá a tu API real:
    // const resp = await fetch(...); const { token } = await resp.json();
    // Simulación: si hay email/pass, “ok”
    if (!email || !password) throw new Error("Credenciales inválidas");
    const fakeToken = "jwt-123";
    await saveToken(fakeToken);
    setToken(fakeToken);
  };

  const signOut = async () => {
    await clearToken();
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
